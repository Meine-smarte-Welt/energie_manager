# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): c15d017d806d802347e4f92ad76eddb2fa7f7fb382aafff862ce5d5ce3e34531
"""Einrichtung, Optionen und Neu-Konfigurieren."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    BooleanSelector,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
)

from .const import (
    CONF_MAX_HISTORY_MONTHS,
    CONF_UPDATE_CHECK,
    DEFAULT_MAX_HISTORY_MONTHS,
    DEFAULT_UPDATE_CHECK,
    DOMAIN,
    MAX_HISTORY_MONTHS,
    MIN_HISTORY_MONTHS,
    NAME,
    VERSION,
)

_UPDATE_TEXT = {
    "available": {
        "de": "Neue Version {latest} verfügbar. Aktualisiere über HACS und starte Home Assistant neu.",
        "en": "New version {latest} available. Update via HACS and restart Home Assistant.",
        "nl": "Nieuwe versie {latest} beschikbaar. Werk bij via HACS en herstart Home Assistant.",
    },
    "current": {
        "de": "Du nutzt die neueste Version.",
        "en": "You are on the latest version.",
        "nl": "Je gebruikt de nieuwste versie.",
    },
    "unknown": {
        "de": "Der Versionsstand auf GitHub ist noch nicht bekannt.",
        "en": "The version on GitHub is not known yet.",
        "nl": "De versie op GitHub is nog niet bekend.",
    },
    "failed": {
        "de": "Prüfung der Version auf GitHub nicht möglich.",
        "en": "Checking the version on GitHub is not possible.",
        "nl": "Controle van de versie op GitHub is niet mogelijk.",
    },
}


def _schema(defaults: dict[str, Any]) -> vol.Schema:
    return vol.Schema(
        {
            vol.Required(
                CONF_UPDATE_CHECK,
                default=defaults.get(CONF_UPDATE_CHECK, DEFAULT_UPDATE_CHECK),
            ): BooleanSelector(),
            vol.Required(
                CONF_MAX_HISTORY_MONTHS,
                default=defaults.get(CONF_MAX_HISTORY_MONTHS, DEFAULT_MAX_HISTORY_MONTHS),
            ): NumberSelector(
                NumberSelectorConfig(
                    min=MIN_HISTORY_MONTHS,
                    max=MAX_HISTORY_MONTHS,
                    step=1,
                    mode=NumberSelectorMode.BOX,
                )
            ),
        }
    )


def _clean(user_input: dict[str, Any]) -> dict[str, Any]:
    return {
        CONF_UPDATE_CHECK: bool(user_input.get(CONF_UPDATE_CHECK, DEFAULT_UPDATE_CHECK)),
        CONF_MAX_HISTORY_MONTHS: int(
            user_input.get(CONF_MAX_HISTORY_MONTHS, DEFAULT_MAX_HISTORY_MONTHS)
        ),
    }


class EnergieManagerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Einrichtung: einmalig, ohne Zugangsdaten."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        if user_input is not None:
            await self.async_set_unique_id(DOMAIN)
            self._abort_if_unique_id_configured()
            return self.async_create_entry(
                title=NAME, data={}, options=_clean(user_input)
            )
        return self.async_show_form(step_id="user", data_schema=_schema({}))

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        if user_input is not None:
            return self.async_update_reload_and_abort(
                entry, options=_clean(user_input)
            )
        return self.async_show_form(
            step_id="reconfigure", data_schema=_schema(dict(entry.options))
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: Any) -> EnergieManagerOptionsFlow:
        return EnergieManagerOptionsFlow()


class EnergieManagerOptionsFlow(OptionsFlow):
    """Optionen mit Versionsanzeige."""

    def _update_info(self) -> str:
        language = (self.hass.config.language or "en")[:2]
        language = language if language in ("de", "en", "nl") else "en"
        manager = getattr(self.config_entry, "runtime_data", None)
        app = getattr(manager, "app", None) or {}
        if app.get("check_failed"):
            key = "failed"
        elif app.get("update_available"):
            key = "available"
        elif app.get("latest_version"):
            key = "current"
        else:
            key = "unknown"
        return _UPDATE_TEXT[key][language].format(latest=app.get("latest_version") or "")

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=_clean(user_input))
        return self.async_show_form(
            step_id="init",
            data_schema=_schema(dict(self.config_entry.options)),
            description_placeholders={
                "version": VERSION,
                "update_info": self._update_info(),
            },
        )
