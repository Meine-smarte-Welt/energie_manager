# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 9eb1fd17acef4abfa96dbb4c3aa0149c8926248d30015a30ea9d4e33937edd51
"""Energie Manager: Dashboard-Karte für Energiefluss, PV-Prognose und Verlauf."""

from __future__ import annotations

import logging
from pathlib import Path

import voluptuous as vol
from homeassistant.components.http import StaticPathConfig
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.typing import ConfigType

from . import websocket_api
from .const import CARD_FILE, CARD_URL, DOMAIN, VERSION
from .manager import EnergieConfigEntry, EnergieManager

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.SENSOR]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

_SERVICE_SCHEMA = vol.Schema({vol.Optional("entry_id"): cv.string})
_STATE_KEY = f"{DOMAIN}_state"


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """WebSocket-Befehle und Services einmalig anmelden."""
    websocket_api.async_register(hass)

    def _managers(call: ServiceCall) -> list[EnergieManager]:
        wanted = call.data.get("entry_id")
        return [
            entry.runtime_data
            for entry in hass.config_entries.async_entries(DOMAIN)
            if getattr(entry, "runtime_data", None) is not None
            and (not wanted or entry.entry_id == wanted)
        ]

    async def _check_update(call: ServiceCall) -> None:
        for manager in _managers(call):
            await manager.async_check_update()

    async def _clear_cache(call: ServiceCall) -> None:
        for manager in _managers(call):
            manager.clear_cache()

    hass.services.async_register(DOMAIN, "check_update", _check_update, _SERVICE_SCHEMA)
    hass.services.async_register(DOMAIN, "clear_cache", _clear_cache, _SERVICE_SCHEMA)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: EnergieConfigEntry) -> bool:
    manager = EnergieManager(hass, entry)
    entry.runtime_data = manager

    await _async_register_static_path(hass)
    async_at_started(hass, _async_register_lovelace_resource)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_reload_on_options))
    await manager.async_start()
    return True


async def async_unload_entry(hass: HomeAssistant, entry: EnergieConfigEntry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        entry.runtime_data.async_stop()
    return unloaded


async def _async_reload_on_options(hass: HomeAssistant, entry: EnergieConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def _async_register_static_path(hass: HomeAssistant) -> None:
    """Die Karten-Datei unter /energie_manager_files/ bereitstellen (nur einmal)."""
    state = hass.data.setdefault(_STATE_KEY, {})
    if state.get("static"):
        return
    path = Path(__file__).parent / "www" / CARD_FILE
    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL, str(path), False)]
    )
    state["static"] = True


async def _async_register_lovelace_resource(hass: HomeAssistant) -> None:
    """Karte als Lovelace-Ressource eintragen oder die Versionsnummer aktualisieren.

    Im YAML-Modus geht das nicht automatisch: dann bleibt es bei einem Hinweis im Log.
    """
    lovelace = hass.data.get("lovelace")
    resources = getattr(lovelace, "resources", None)
    mode = getattr(lovelace, "resource_mode", None) or getattr(lovelace, "mode", None)
    if resources is None or mode != "storage" or not hasattr(resources, "async_create_item"):
        _LOGGER.info(
            "Lovelace läuft im YAML-Modus: Trage die Ressource manuell ein: "
            "url: %s?v=%s, type: module",
            CARD_URL,
            VERSION,
        )
        return
    try:
        if not getattr(resources, "loaded", True):
            await resources.async_load()
        url = f"{CARD_URL}?v={VERSION}"
        for item in resources.async_items():
            if str(item.get("url", "")).split("?")[0] == CARD_URL:
                if item.get("url") != url:
                    await resources.async_update_item(
                        item["id"], {"res_type": "module", "url": url}
                    )
                return
        await resources.async_create_item({"res_type": "module", "url": url})
    except Exception:  # noqa: BLE001 - die Karte läuft auch ohne automatischen Eintrag
        _LOGGER.warning(
            "Die Lovelace-Ressource konnte nicht automatisch eingetragen werden. "
            "Trage %s?v=%s als Modul manuell ein.",
            CARD_URL,
            VERSION,
            exc_info=True,
        )
