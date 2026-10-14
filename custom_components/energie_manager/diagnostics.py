# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): d138671223acb323556aeb54c1e053585e778eea67f3152e7bb814db5da6d93c
"""Diagnose-Download (enthält keine Namen, IDs oder Adressen)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from .const import VERSION
from .manager import EnergieConfigEntry


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: EnergieConfigEntry
) -> dict[str, Any]:
    manager = entry.runtime_data
    return {
        "version": VERSION,
        "options": dict(entry.options),
        "app": dict(manager.app),
        "recorder_available": manager.recorder_available,
        "max_history_months": manager.max_history_months,
    }
