# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 172b511ffb035438ba27668e83d2086de6e7515417c49e86b3178f49f2b05601
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
        "experimental": manager.experimental_snapshot(),
    }
