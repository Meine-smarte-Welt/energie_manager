# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 186fbddd1fea5641511ebf03b136a8939c165a57667768245ca5bfe5f54a3e93
"""Diagnose-Sensor mit der installierten Version."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, NAME, VERSION
from .manager import EnergieConfigEntry, EnergieManager


async def async_setup_entry(
    hass: HomeAssistant,
    entry: EnergieConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    async_add_entities([EnergieManagerVersionSensor(entry.runtime_data, entry.entry_id)])


class EnergieManagerVersionSensor(SensorEntity):
    """Installierte Version; Attribute zeigen den Stand auf GitHub."""

    _attr_has_entity_name = True
    _attr_translation_key = "version"
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_should_poll = False

    def __init__(self, manager: EnergieManager, entry_id: str) -> None:
        self._manager = manager
        self._attr_unique_id = f"{entry_id}_version"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry_id)},
            name=NAME,
            manufacturer="Meine smarte Welt",
            model="Dashboard-Karte",
            sw_version=VERSION,
        )

    @property
    def native_value(self) -> str:
        return VERSION

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        app = self._manager.app
        return {
            "latest_version": app.get("latest_version"),
            "update_available": app.get("update_available"),
            "release_url": app.get("release_url"),
            "checked_at": app.get("checked_at"),
            "check_failed": app.get("check_failed"),
        }

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self._manager.async_add_listener(self._handle_update))

    @callback
    def _handle_update(self) -> None:
        self.async_write_ha_state()
