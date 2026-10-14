# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 5803f6a00d086dcb1caa5a0f28498b2023e878a5f77eb67ce50ecc8b2af6e741
"""Abfrage der neuesten Version auf GitHub."""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .calc import is_newer, parse_version
from .const import (
    API_LATEST_URL,
    API_TAGS_URL,
    HTTP_TIMEOUT_SECONDS,
    RELEASES_URL,
    VERSION,
)

_LOGGER = logging.getLogger(__name__)

_HEADERS = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "energie_manager-update-check",
}


def safe_release_url(url: Any) -> str:
    """Nur Links auf github.com anzeigen, sonst die feste Releases-Seite."""
    if isinstance(url, str) and url.startswith("https://github.com/"):
        return url
    return RELEASES_URL


async def _get_json(hass: HomeAssistant, url: str) -> tuple[int, Any]:
    session = async_get_clientsession(hass)
    timeout = aiohttp.ClientTimeout(total=HTTP_TIMEOUT_SECONDS)
    async with session.get(url, headers=_HEADERS, timeout=timeout) as response:
        if response.status != 200:
            return response.status, None
        return response.status, await response.json()


async def async_fetch_latest(hass: HomeAssistant) -> dict[str, Any]:
    """Neueste Version holen: zuerst Release, ersatzweise das höchste Tag.

    Gibt immer ein Wörterbuch mit latest_version, release_url, update_available,
    checked_at und check_failed zurück (wirft nie).
    """
    latest: str | None = None
    release_url = RELEASES_URL
    failed = False
    try:
        status, payload = await _get_json(hass, API_LATEST_URL)
        if status == 200 and isinstance(payload, dict) and payload.get("tag_name"):
            latest = str(payload["tag_name"]).lstrip("vV")
            release_url = safe_release_url(payload.get("html_url"))
        elif status == 404:
            status, tags = await _get_json(hass, API_TAGS_URL)
            if status == 200 and isinstance(tags, list):
                names = [
                    str(tag.get("name", "")).lstrip("vV")
                    for tag in tags
                    if isinstance(tag, dict) and parse_version(tag.get("name"))
                ]
                if names:
                    latest = max(names, key=parse_version)
            elif status != 200:
                failed = True
        else:
            failed = True
    except (aiohttp.ClientError, TimeoutError, ValueError) as err:
        _LOGGER.debug("Update-Prüfung nicht möglich: %s", err)
        failed = True

    return {
        "latest_version": latest,
        "release_url": release_url,
        "update_available": bool(latest) and is_newer(latest, VERSION),
        "checked_at": datetime.now(UTC).isoformat(),
        "check_failed": failed,
    }
