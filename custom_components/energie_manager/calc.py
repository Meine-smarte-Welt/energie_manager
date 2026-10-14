# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 47faf1015664849235e393511d6e92ed2fcf5db7a003157ef1a46250c56b87e4
"""Reine Rechenfunktionen ohne Home-Assistant-Abhängigkeit (einzeln testbar)."""

from __future__ import annotations

import math
import re
from datetime import date, datetime, tzinfo
from typing import Any

HOURS = 24
DETAILED_PERIOD_HOURS = 0.5
HOURLY_PERIOD_HOURS = 1.0
STATS_BUCKET_HOURS = 5 / 60  # Kurzzeit-Statistik des Recorders: 5 Minuten

_VERSION_RE = re.compile(r"^[vV]?(\d+(?:\.\d+)*)")


def to_float(value: Any) -> float | None:
    """Zahl lesen; alles Ungültige (None, Text, NaN, unendlich) ergibt None."""
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(number) or math.isinf(number):
        return None
    return number


def parse_version(text: Any) -> tuple[int, ...]:
    """'v1.2.3-beta' -> (1, 2, 3); Ungültiges ergibt ()."""
    match = _VERSION_RE.match(str(text or "").strip())
    if not match:
        return ()
    return tuple(int(part) for part in match.group(1).split("."))


def is_newer(latest: Any, current: Any) -> bool:
    """True, wenn latest eine höhere Version als current ist."""
    left, right = parse_version(latest), parse_version(current)
    if not left or not right:
        return False
    size = max(len(left), len(right))
    left += (0,) * (size - len(left))
    right += (0,) * (size - len(right))
    return left > right


def to_datetime(value: Any, tz: tzinfo) -> datetime | None:
    """datetime, Zeitstempel oder ISO-Text in die Zeitzone tz umrechnen."""
    if isinstance(value, datetime):
        moment = value
    elif isinstance(value, (int, float)) and not isinstance(value, bool):
        moment = datetime.fromtimestamp(float(value), tz)
    elif isinstance(value, str):
        try:
            moment = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    else:
        return None
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=tz)
    return moment.astimezone(tz)


def _empty_day() -> list[float | None]:
    return [None] * HOURS


def _mean_per_hour(sums: list[float], counts: list[int]) -> list[float | None]:
    return [
        round(sums[hour] / counts[hour], 4) if counts[hour] else None
        for hour in range(HOURS)
    ]


def hourly_from_forecast(
    detailed: Any, tz: tzinfo, day: date
) -> list[float | None]:
    """Solcast-Liste (period_start, pv_estimate in kW) -> 24 Stunden-Mittelwerte in kW."""
    sums, counts = [0.0] * HOURS, [0] * HOURS
    if not isinstance(detailed, list):
        return _empty_day()
    for item in detailed:
        if not isinstance(item, dict):
            continue
        start = to_datetime(item.get("period_start"), tz)
        value = to_float(item.get("pv_estimate"))
        if start is None or value is None or start.date() != day:
            continue
        sums[start.hour] += value
        counts[start.hour] += 1
    return _mean_per_hour(sums, counts)


def forecast_kwh(
    detailed: Any,
    tz: tzinfo,
    day: date,
    period_hours: float,
    until: datetime | None = None,
) -> float | None:
    """Prognostizierte Energie in kWh für den Tag; mit until nur fertige Zeiträume bis dahin."""
    if not isinstance(detailed, list):
        return None
    total, found = 0.0, False
    for item in detailed:
        if not isinstance(item, dict):
            continue
        start = to_datetime(item.get("period_start"), tz)
        value = to_float(item.get("pv_estimate"))
        if start is None or value is None or start.date() != day:
            continue
        if until is not None:
            end_seconds = start.timestamp() + period_hours * 3600
            if end_seconds > until.timestamp():
                continue
        total += value * period_hours
        found = True
    if until is not None and not found:
        return 0.0 if any(isinstance(i, dict) for i in detailed) else None
    return round(total, 3) if found else None


def hourly_from_stats(
    rows: Any, tz: tzinfo, day: date, key: str = "mean"
) -> list[float | None]:
    """Statistik-Zeilen (start, mean) -> 24 Stunden-Mittelwerte."""
    sums, counts = [0.0] * HOURS, [0] * HOURS
    if not rows:
        return _empty_day()
    for row in rows:
        start = to_datetime(row.get("start"), tz)
        value = to_float(row.get(key))
        if start is None or value is None or start.date() != day:
            continue
        sums[start.hour] += value
        counts[start.hour] += 1
    return _mean_per_hour(sums, counts)


def integrate_mean(rows: Any, bucket_hours: float = STATS_BUCKET_HOURS) -> float | None:
    """Mittlere Leistung (kW) je Zeitraum -> Energie in kWh."""
    if not rows:
        return None
    values = [to_float(row.get("mean")) for row in rows]
    values = [value for value in values if value is not None]
    if not values:
        return None
    return round(sum(values) * bucket_hours, 3)


def sum_change(rows: Any) -> float | None:
    """Summe der Änderungen (Energie-Zähler) oder None, wenn nichts vorliegt."""
    if not rows:
        return None
    values = [to_float(row.get("change")) for row in rows]
    values = [value for value in values if value is not None]
    if not values:
        return None
    return round(sum(values), 3)


def month_key(start: Any, tz: tzinfo) -> str | None:
    moment = to_datetime(start, tz)
    return f"{moment.year:04d}-{moment.month:02d}" if moment else None


def monthly_changes(rows: Any, tz: tzinfo) -> dict[str, float]:
    """Monatsstatistik (period=month) -> {'2026-05': kWh}."""
    result: dict[str, float] = {}
    for row in rows or []:
        key = month_key(row.get("start"), tz)
        value = to_float(row.get("change"))
        if key is None or value is None:
            continue
        result[key] = round(result.get(key, 0.0) + value, 3)
    return result


def month_range(today: date, months: int) -> list[str]:
    """Die letzten `months` Monate bis einschließlich heute, älteste zuerst."""
    keys: list[str] = []
    year, month = today.year, today.month
    for _ in range(months):
        keys.append(f"{year:04d}-{month:02d}")
        month -= 1
        if month == 0:
            month, year = 12, year - 1
    return list(reversed(keys))


def derive(values: dict[str, float | None]) -> dict[str, Any]:
    """Verbrauch, Autarkie und Eigenverbrauch aus Energiebilanz ableiten.

    Erwartet die Schlüssel pv, import, export, home, charge, discharge (kWh).
    """
    pv, grid_in, grid_out = values.get("pv"), values.get("import"), values.get("export")
    charge = values.get("charge") or 0.0
    discharge = values.get("discharge") or 0.0
    home = values.get("home")
    home_calculated = False
    if home is None and None not in (pv, grid_in, grid_out):
        home = max(0.0, grid_in + pv - grid_out + discharge - charge)
        home_calculated = True
    autarky = None
    if home is not None and home > 0 and grid_in is not None:
        autarky = round(max(0.0, min(100.0, (1 - min(grid_in, home) / home) * 100)), 1)
    self_consumption = None
    if pv is not None and pv > 0 and grid_out is not None:
        self_consumption = round(max(0.0, min(100.0, (1 - grid_out / pv) * 100)), 1)
    return {
        "home": None if home is None else round(home, 3),
        "home_calculated": home_calculated,
        "autarky": autarky,
        "self_consumption": self_consumption,
    }


def sum_series(series: list[list[float | None]]) -> list[float | None]:
    """Mehrere 24-Stunden-Reihen addieren; eine Stunde ist leer, wenn alle leer sind."""
    result: list[float | None] = []
    for hour in range(HOURS):
        parts = [s[hour] for s in series if s and s[hour] is not None]
        result.append(round(sum(parts), 4) if parts else None)
    return result


def sum_optional(values: list[float | None]) -> float | None:
    parts = [value for value in values if value is not None]
    return round(sum(parts), 3) if parts else None


def deviation_pct(actual: float | None, forecast: float | None) -> float | None:
    """Abweichung der tatsächlichen Erzeugung von der Prognose in Prozent."""
    if actual is None or forecast is None or forecast <= 0:
        return None
    return round((actual - forecast) / forecast * 100, 1)
