# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 6725be410287e5d815913c0cc48a22c5b778b8113894de80d620245d95c7bfad
"""Automatische Zuordnung der Sensoren des Kostal Managers (experimentell).

Gefunden wird über das Entitätsregister, nicht über Namen der Entity-IDs (diese hängen
von der Sprache ab). Der Kostal Manager liefert eigene berechnete Sensoren; Netz-,
Speicher- und Stringwerte stammen aus der offiziellen Kostal-Integration, die der
Kostal Manager bereits zugeordnet hat. Es werden nur leere Felder der Karte gefüllt.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er

from .const import (
    KM_CONF_KOSTAL_ENTRY,
    KM_CONF_STRINGS,
    KM_DEFAULT_STRINGS,
    KOSTAL_MANAGER_DOMAIN,
    PV_MAX,
)

SOURCE_KOSTAL_MANAGER = "kostal_manager"
SOURCE_KOSTAL = "kostal_plenticore"

_NORM_RE = re.compile(r"[^a-z0-9]+")

# Eigene Sensoren des Kostal Managers (translation_key) -> Schlüssel der Karte
KM_SENSOR_SLOTS: dict[str, str] = {
    "derived_solar_power_strings": "pv_power",
    "derived_solar_energy_total": "energy_pv",
    "ksem_power": "grid_power",  # Bezug positiv, Einspeisung negativ
    "ksem_energy_import": "energy_import",
    "ksem_energy_export": "energy_export",
}

# Sensoren der offiziellen Kostal-Integration (normalisierter Name) -> Schlüssel der Karte
KOSTAL_SLOTS: dict[str, str] = {
    "grid_power": "grid_power",
    "home_power": "home_power",
    "battery_power": "battery_power",
    "battery_soc": "battery_soc",
    "home_consumption_total": "energy_home",
    "battery_discharge_total": "energy_battery_discharge",
}


def normalize(text: str | None) -> str:
    """Klein, nur a-z0-9 und Unterstrich (wie im Kostal Manager)."""
    return _NORM_RE.sub("_", (text or "").lower()).strip("_")


@dataclass
class Candidate:
    """Eine Entität aus dem Register, auf das Nötige reduziert."""

    entity_id: str
    names: list[str]
    translation_key: str | None = None
    unique_id: str | None = None
    disabled: bool = False


@dataclass
class Detection:
    """Ergebnis der Erkennung."""

    kostal_manager: bool = False
    slots: dict[str, dict[str, str]] = field(default_factory=dict)
    pv_count: int | None = None

    def as_dict(self) -> dict[str, Any]:
        return {
            "kostal_manager": self.kostal_manager,
            "slots": self.slots,
            "pv_count": self.pv_count,
        }


def _candidate_names(entry: er.RegistryEntry, dev_reg: dr.DeviceRegistry) -> list[str]:
    names: list[str] = []
    for raw in (entry.name, entry.original_name):
        if raw:
            names.append(normalize(raw))
    object_id = entry.entity_id.split(".", 1)[1]
    names.append(object_id)
    if entry.device_id:
        device = dev_reg.async_get(entry.device_id)
        if device:
            dname = normalize(device.name_by_user or device.name)
            if dname and object_id.startswith(dname + "_"):
                names.append(object_id[len(dname) + 1 :])
    return list(dict.fromkeys(n for n in names if n))


def _to_candidates(
    entries: list[er.RegistryEntry], dev_reg: dr.DeviceRegistry
) -> list[Candidate]:
    return [
        Candidate(
            entity_id=e.entity_id,
            names=_candidate_names(e, dev_reg),
            translation_key=e.translation_key,
            unique_id=e.unique_id,
            disabled=e.disabled_by is not None,
        )
        for e in entries
        if e.entity_id.startswith("sensor.")
    ]


def _keep_best(found: dict[str, Candidate], key: str, cand: Candidate) -> None:
    current = found.get(key)
    if current is None or (current.disabled and not cand.disabled):
        found[key] = cand


def parse_strings(raw: Any) -> list[int]:
    """Gewählte PV-Strings des Kostal Managers (1 bis 3), sortiert und ohne Dubletten."""
    if not isinstance(raw, (list, tuple, set)):
        raw = KM_DEFAULT_STRINGS
    out: set[int] = set()
    for item in raw:
        try:
            value = int(item)
        except (TypeError, ValueError):
            continue
        if value in (1, 2, 3):
            out.add(value)
    return sorted(out) or sorted(KM_DEFAULT_STRINGS)


def build_detection(
    km_candidates: list[Candidate],
    kostal_candidates: list[Candidate],
    strings: list[int],
    entry_id: str = "",
) -> Detection:
    """Reine Funktion: ordnet Kandidaten den Schlüsseln der Karte zu."""
    result = Detection(kostal_manager=True)

    # 1. Eigene Sensoren des Kostal Managers
    km_found: dict[str, Candidate] = {}
    for cand in km_candidates:
        key = cand.translation_key
        if not key and cand.unique_id:
            prefix = f"{entry_id}_" if entry_id else ""
            key = cand.unique_id[len(prefix):] if prefix and cand.unique_id.startswith(prefix) else None
        if key in KM_SENSOR_SLOTS:
            _keep_best(km_found, key, cand)

    # 2. Sensoren der offiziellen Kostal-Integration
    kp_found: dict[str, Candidate] = {}
    wanted = set(KOSTAL_SLOTS) | {f"dc{n}_power" for n in (1, 2, 3)} | {
        f"energy_pv{n}_day" for n in (1, 2, 3)
    }
    for cand in kostal_candidates:
        for name in cand.names:
            if name in wanted:
                _keep_best(kp_found, name, cand)
                break

    def put(slot: str, cand: Candidate, source: str, key: str) -> None:
        if cand.disabled:
            return
        result.slots[slot] = {"entity_id": cand.entity_id, "source": source, "key": key}

    # Reihenfolge = Rangfolge: zuerst Kostal-Integration, dann der Kostal Manager überschreibt
    for name, slot in KOSTAL_SLOTS.items():
        if name in kp_found:
            put(slot, kp_found[name], SOURCE_KOSTAL, name)
    for key, slot in KM_SENSOR_SLOTS.items():
        if key in km_found and not km_found[key].disabled:
            put(slot, km_found[key], SOURCE_KOSTAL_MANAGER, key)

    # 3. Die im Kostal Manager gewählten Strings werden die PV-Anlagen 1, 2, 3
    for index, string in enumerate(strings[:PV_MAX], start=1):
        power = kp_found.get(f"dc{string}_power")
        energy = kp_found.get(f"energy_pv{string}_day")
        if power:
            put(f"pv{index}_power", power, SOURCE_KOSTAL, f"dc{string}_power")
        if energy:
            put(f"pv{index}_energy_today", energy, SOURCE_KOSTAL, f"energy_pv{string}_day")
    present = [
        i
        for i in range(1, min(len(strings), PV_MAX) + 1)
        if f"pv{i}_power" in result.slots or f"pv{i}_energy_today" in result.slots
    ]
    result.pv_count = max(present) if present else None
    return result


def detect(hass: HomeAssistant) -> Detection:
    """Erkennung gegen das Entitätsregister (nur im Event-Loop aufrufen)."""
    entries = [
        e
        for e in hass.config_entries.async_entries(KOSTAL_MANAGER_DOMAIN)
        if getattr(e, "state", None) is not None and e.state.value == "loaded"
    ]
    if not entries:
        return Detection(kostal_manager=False)
    entry = entries[0]
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    options = entry.options if KM_CONF_STRINGS in entry.options else entry.data
    strings = parse_strings(options.get(KM_CONF_STRINGS, KM_DEFAULT_STRINGS))
    km_candidates = _to_candidates(er.async_entries_for_config_entry(ent_reg, entry.entry_id), dev_reg)
    kostal_entry_id = entry.options.get(KM_CONF_KOSTAL_ENTRY) or entry.data.get(KM_CONF_KOSTAL_ENTRY)
    kostal_candidates = (
        _to_candidates(er.async_entries_for_config_entry(ent_reg, kostal_entry_id), dev_reg)
        if kostal_entry_id
        else []
    )
    return build_detection(km_candidates, kostal_candidates, strings, entry.entry_id)
