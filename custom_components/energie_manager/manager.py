# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 1bfeddfb00842cea75a63e51993200085da0c6972c2b688e690a1ecaf5421bb4
"""Zentrale Logik: Zustand, Zwischenspeicher und Langzeitwerte aus dem Recorder."""

from __future__ import annotations

import asyncio
import logging
import re
from collections.abc import Callable
from datetime import date, datetime, timedelta
from functools import partial
from time import monotonic
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.util import dt as dt_util

from . import calc
from .const import (
    ALLOWED_DOMAINS,
    CACHE_SECONDS,
    CONF_MAX_HISTORY_MONTHS,
    CONF_UPDATE_CHECK,
    DEFAULT_MAX_HISTORY_MONTHS,
    DEFAULT_UPDATE_CHECK,
    ENERGY_SLOTS,
    FIRST_CHECK_DELAY_SECONDS,
    MAX_ENTITIES,
    PV_MAX,
    RELEASES_URL,
    UPDATE_INTERVAL_HOURS,
    VERSION,
)
from .update_check import async_fetch_latest

_LOGGER = logging.getLogger(__name__)

_SLOT_RE = re.compile(r"^[a-z0-9_]{1,40}$")
_SITE_RE = re.compile(r"^[A-Za-z0-9_\-]{1,64}$")
_UNITS = {"energy": "kWh", "power": "kW"}


class EnergieManagerError(Exception):
    """Fehler mit Code für die WebSocket-Antwort."""

    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code


class EnergieManager:
    """Hält Versionsstand und berechnet die Daten der Karten-Kategorien."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self.app: dict[str, Any] = {
            "version": VERSION,
            "latest_version": None,
            "release_url": RELEASES_URL,
            "update_available": False,
            "checked_at": None,
            "check_failed": False,
        }
        self._listeners: list[Callable[[], None]] = []
        self._cache: dict[tuple, tuple[float, dict[str, Any]]] = {}
        self._lock = asyncio.Lock()
        self._unsubs: list[CALLBACK_TYPE] = []

    # ---------- Optionen ----------

    @property
    def update_check_enabled(self) -> bool:
        return bool(self.entry.options.get(CONF_UPDATE_CHECK, DEFAULT_UPDATE_CHECK))

    @property
    def max_history_months(self) -> int:
        value = calc.to_float(
            self.entry.options.get(CONF_MAX_HISTORY_MONTHS, DEFAULT_MAX_HISTORY_MONTHS)
        )
        return int(value) if value else DEFAULT_MAX_HISTORY_MONTHS

    @property
    def recorder_available(self) -> bool:
        return "recorder" in self.hass.config.components

    # ---------- Lebenszyklus ----------

    async def async_start(self) -> None:
        """Update-Prüfung planen: kurz nach dem Start, danach alle 12 Stunden."""
        if not self.update_check_enabled:
            return

        async def _first(_now: datetime) -> None:
            await self.async_check_update()

        async def _periodic(_now: datetime) -> None:
            await self.async_check_update()

        self._unsubs.append(
            async_call_later(self.hass, FIRST_CHECK_DELAY_SECONDS, _first)
        )
        self._unsubs.append(
            async_track_time_interval(
                self.hass, _periodic, timedelta(hours=UPDATE_INTERVAL_HOURS)
            )
        )

    @callback
    def async_stop(self) -> None:
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        self._listeners.clear()

    # ---------- Listener (für den Versions-Sensor) ----------

    @callback
    def async_add_listener(self, update: Callable[[], None]) -> CALLBACK_TYPE:
        self._listeners.append(update)

        @callback
        def _remove() -> None:
            if update in self._listeners:
                self._listeners.remove(update)

        return _remove

    @callback
    def _notify(self) -> None:
        for listener in list(self._listeners):
            listener()

    # ---------- Version ----------

    async def async_check_update(self) -> dict[str, Any]:
        result = await async_fetch_latest(self.hass)
        self.app.update(result)
        self._notify()
        return self.app

    def info(self) -> dict[str, Any]:
        return {**self.app, "recorder": self.recorder_available}

    @callback
    def clear_cache(self) -> None:
        self._cache.clear()

    # ---------- Kategorien ----------

    async def async_category(
        self,
        category: str,
        entities: dict[str, str],
        months: int = 6,
        sites: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        """Daten einer Kategorie berechnen (mit kurzem Zwischenspeicher)."""
        clean, ignored = self._clean_entities(entities)
        months = max(1, min(int(months), self.max_history_months))
        clean_sites = {
            str(key): value.replace("-", "_")
            for key, value in (sites or {}).items()
            if key in {str(i) for i in range(1, PV_MAX + 1)}
            and _SITE_RE.match(value or "")
        }
        key = (
            category,
            tuple(sorted(clean.items())),
            months if category == "history" else 0,
            tuple(sorted(clean_sites.items())),
        )
        async with self._lock:
            cached = self._cache.get(key)
            if cached and monotonic() - cached[0] < CACHE_SECONDS:
                return cached[1]
            if not self.recorder_available:
                raise EnergieManagerError(
                    "recorder_unavailable", "Der Recorder ist nicht geladen."
                )
            if category == "today":
                result = await self._compute_today(clean)
            elif category == "history":
                result = await self._compute_history(clean, months)
            elif category == "pv":
                result = await self._compute_pv(clean, clean_sites)
            else:
                raise EnergieManagerError("unknown_category", category)
            result["ignored"] = ignored
            result["generated"] = dt_util.now().isoformat()
            self._cache[key] = (monotonic(), result)
            return result

    def _clean_entities(self, entities: dict[str, str]) -> tuple[dict[str, str], list[str]]:
        clean: dict[str, str] = {}
        ignored: list[str] = []
        for slot, entity_id in list(entities.items())[:MAX_ENTITIES]:
            domain = str(entity_id).split(".", 1)[0]
            if not _SLOT_RE.match(str(slot)) or domain not in ALLOWED_DOMAINS:
                ignored.append(str(slot))
                continue
            clean[str(slot)] = str(entity_id)
        return clean, ignored

    async def _stats(
        self,
        start: datetime,
        end: datetime | None,
        statistic_ids: set[str],
        period: str,
        types: set[str],
    ) -> dict[str, list[dict[str, Any]]]:
        """Langzeitstatistik im Executor des Recorders lesen."""
        if not statistic_ids:
            return {}
        try:
            from homeassistant.components.recorder import get_instance
            from homeassistant.components.recorder.statistics import (
                statistics_during_period,
            )

            instance = get_instance(self.hass)
            return await instance.async_add_executor_job(
                partial(
                    statistics_during_period,
                    self.hass,
                    start,
                    end,
                    statistic_ids,
                    period,
                    _UNITS,
                    types,
                )
            )
        except (KeyError, ImportError) as err:
            raise EnergieManagerError(
                "recorder_unavailable", f"Recorder nicht nutzbar: {err}"
            ) from err

    def _energy_ids(self, clean: dict[str, str]) -> dict[str, str]:
        """Kurzname -> Entity-ID der gewählten Energie-Zähler."""
        return {short: clean[slot] for slot, short in ENERGY_SLOTS.items() if slot in clean}

    async def _compute_today(self, clean: dict[str, str]) -> dict[str, Any]:
        ids = self._energy_ids(clean)
        start = dt_util.start_of_local_day()
        rows = await self._stats(start, None, set(ids.values()), "5minute", {"change"})
        today = {short: calc.sum_change(rows.get(eid)) for short, eid in ids.items()}
        missing = sorted(eid for eid in ids.values() if not rows.get(eid))
        return {
            "today": today,
            "derived": calc.derive(today),
            "missing": missing,
        }

    async def _compute_history(self, clean: dict[str, str], months: int) -> dict[str, Any]:
        ids = self._energy_ids(clean)
        tz = dt_util.get_default_time_zone()
        today: date = dt_util.now().date()
        keys = calc.month_range(today, months)
        first_year, first_month = (int(part) for part in keys[0].split("-"))
        start = dt_util.start_of_local_day(date(first_year, first_month, 1))
        rows = await self._stats(start, None, set(ids.values()), "month", {"change"})
        per_slot = {
            short: calc.monthly_changes(rows.get(eid), tz) for short, eid in ids.items()
        }
        result_rows = []
        for key in keys:
            values = {short: per_slot[short].get(key) for short in ids}
            entry: dict[str, Any] = {"month": key, **values}
            entry.update(calc.derive(values))
            result_rows.append(entry)
        missing = sorted(eid for eid in ids.values() if not rows.get(eid))
        return {"months": result_rows, "missing": missing}

    async def _compute_pv(
        self, clean: dict[str, str], sites: dict[str, str]
    ) -> dict[str, Any]:
        tz = dt_util.get_default_time_zone()
        now = dt_util.now()
        day = now.date()
        start = dt_util.start_of_local_day()
        power_ids = {
            index: clean[f"pv{index}_power"]
            for index in range(1, PV_MAX + 1)
            if f"pv{index}_power" in clean
        }
        rows = await self._stats(
            start, None, set(power_ids.values()), "5minute", {"mean"}
        )
        arrays: dict[str, Any] = {}
        indexes = sorted(
            {i for i in range(1, PV_MAX + 1) if f"pv{i}_power" in clean or f"pv{i}_forecast" in clean}
        )
        for index in indexes:
            actual_rows = rows.get(power_ids.get(index, ""), [])
            actual = calc.hourly_from_stats(actual_rows, tz, day)
            forecast, f_total, f_now, has_attr = self._forecast(
                clean.get(f"pv{index}_forecast"), sites.get(str(index)), tz, day, now
            )
            arrays[str(index)] = {
                "actual": actual,
                "forecast": forecast,
                "actual_kwh": calc.integrate_mean(actual_rows),
                "forecast_kwh": f_total,
                "forecast_kwh_now": f_now,
                "has_forecast_data": has_attr,
                "has_power_stats": bool(actual_rows),
            }
        total_actual_kwh = calc.sum_optional([a["actual_kwh"] for a in arrays.values()])
        total_forecast_kwh = calc.sum_optional([a["forecast_kwh"] for a in arrays.values()])
        total_forecast_now = calc.sum_optional([a["forecast_kwh_now"] for a in arrays.values()])
        total = {
            "actual": calc.sum_series([a["actual"] for a in arrays.values()]),
            "forecast": calc.sum_series([a["forecast"] for a in arrays.values()]),
            "actual_kwh": total_actual_kwh,
            "forecast_kwh": total_forecast_kwh,
            "forecast_kwh_now": total_forecast_now,
            "deviation_pct": calc.deviation_pct(total_actual_kwh, total_forecast_now),
        }
        for array in arrays.values():
            array["deviation_pct"] = calc.deviation_pct(
                array["actual_kwh"], array["forecast_kwh_now"]
            )
        missing = sorted(eid for eid in power_ids.values() if not rows.get(eid))
        return {
            "arrays": arrays,
            "total": total,
            "hour_now": now.hour,
            "missing": missing,
        }

    def _forecast(
        self,
        entity_id: str | None,
        site: str | None,
        tz: Any,
        day: date,
        now: datetime,
    ) -> tuple[list[float | None], float | None, float | None, bool]:
        """Stundenwerte und Summen aus den Detail-Attributen des Solcast-Sensors."""
        empty: list[float | None] = [None] * calc.HOURS
        if not entity_id:
            return empty, None, None, False
        state = self.hass.states.get(entity_id)
        if state is None:
            return empty, None, None, False
        suffix = f"_{site}" if site else ""
        for attribute, period_hours in (
            (f"detailedForecast{suffix}", calc.DETAILED_PERIOD_HOURS),
            (f"detailedHourly{suffix}", calc.HOURLY_PERIOD_HOURS),
        ):
            detailed = state.attributes.get(attribute)
            if isinstance(detailed, list) and detailed:
                return (
                    calc.hourly_from_forecast(detailed, tz, day),
                    calc.forecast_kwh(detailed, tz, day, period_hours),
                    calc.forecast_kwh(detailed, tz, day, period_hours, until=now),
                    True,
                )
        return empty, None, None, False


type EnergieConfigEntry = ConfigEntry[EnergieManager]
