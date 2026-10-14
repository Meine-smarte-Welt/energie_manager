# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 915f1d86fe3e1bd2e7364f5e347cdaf1f4e46961287f6de82ae13b7c8374ddca
"""WebSocket-Schnittstelle für die Karte (Lesen für alle, Schreiben nur Administratoren)."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv

from .const import ACTIONS, CATEGORIES, DOMAIN, MAX_ENTITIES
from .manager import EnergieConfigEntry, EnergieManager, EnergieManagerError

_SLOT = vol.Match(r"^[a-z0-9_]{1,40}$")
_SITE = vol.Match(r"^[A-Za-z0-9_\-]{1,64}$")


def _manager(hass: HomeAssistant, entry_id: str | None) -> EnergieManager | None:
    entries: list[EnergieConfigEntry] = hass.config_entries.async_entries(DOMAIN)
    for entry in entries:
        if entry_id and entry.entry_id != entry_id:
            continue
        manager = getattr(entry, "runtime_data", None)
        if manager is not None:
            return manager
    return None


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/info",
        vol.Optional("entry_id"): str,
    }
)
@websocket_api.async_response
async def ws_info(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Version, Update-Stand und Recorder-Status."""
    manager = _manager(hass, msg.get("entry_id"))
    if manager is None:
        connection.send_error(msg["id"], "not_found", "Kein Energie-Manager-Eintrag.")
        return
    connection.send_result(msg["id"], manager.info())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/category",
        vol.Required("category"): vol.In(CATEGORIES),
        vol.Required("entities"): vol.All(
            {_SLOT: cv.entity_id}, vol.Length(max=MAX_ENTITIES)
        ),
        vol.Optional("months", default=6): vol.All(int, vol.Range(min=1, max=60)),
        vol.Optional("sites", default={}): {vol.Match(r"^[1-4]$"): _SITE},
        vol.Optional("entry_id"): str,
    }
)
@websocket_api.async_response
async def ws_category(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Daten einer Kategorie laden – nur auf Anforderung der Karte."""
    manager = _manager(hass, msg.get("entry_id"))
    if manager is None:
        connection.send_error(msg["id"], "not_found", "Kein Energie-Manager-Eintrag.")
        return
    try:
        result = await manager.async_category(
            msg["category"], msg["entities"], msg["months"], msg["sites"]
        )
    except EnergieManagerError as err:
        connection.send_error(msg["id"], err.code, str(err))
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/action",
        vol.Required("action"): vol.In(ACTIONS),
        vol.Optional("entry_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_action(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Schreibende Aktionen (nur Administratoren)."""
    manager = _manager(hass, msg.get("entry_id"))
    if manager is None:
        connection.send_error(msg["id"], "not_found", "Kein Energie-Manager-Eintrag.")
        return
    if msg["action"] == "check_update":
        await manager.async_check_update()
    elif msg["action"] == "clear_cache":
        manager.clear_cache()
    connection.send_result(msg["id"], manager.info())


@callback
def async_register(hass: HomeAssistant) -> None:
    """Alle Befehle anmelden."""
    websocket_api.async_register_command(hass, ws_info)
    websocket_api.async_register_command(hass, ws_category)
    websocket_api.async_register_command(hass, ws_action)
