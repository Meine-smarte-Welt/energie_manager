# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 0804f4e7d70be6a637d694b57484934a7348a767eb09226da0a26e66ad1fb41a
"""Konstanten des Energie Managers."""

from __future__ import annotations

DOMAIN = "energie_manager"
NAME = "Energie Manager"
VERSION = "0.0.1"

GITHUB_OWNER = "meine-smarte-welt"
GITHUB_REPO = "energie_manager"
GITHUB_URL = f"https://github.com/{GITHUB_OWNER}/{GITHUB_REPO}"
RELEASES_URL = f"{GITHUB_URL}/releases"
API_LATEST_URL = f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/releases/latest"
API_TAGS_URL = f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/tags"

CARD_FILE = "energie-manager-card.js"
CARD_URL = f"/{DOMAIN}_files/{CARD_FILE}"

# Optionen der Integration
CONF_UPDATE_CHECK = "update_check"
CONF_MAX_HISTORY_MONTHS = "max_history_months"
DEFAULT_UPDATE_CHECK = True
DEFAULT_MAX_HISTORY_MONTHS = 24
MIN_HISTORY_MONTHS = 6
MAX_HISTORY_MONTHS = 60

UPDATE_INTERVAL_HOURS = 12
FIRST_CHECK_DELAY_SECONDS = 30
HTTP_TIMEOUT_SECONDS = 10
CACHE_SECONDS = 60

# Kategorien, deren Daten die Karte erst beim Öffnen nachlädt
CATEGORIES = ("today", "pv", "history")
ACTIONS = ("check_update", "clear_cache")

# Sensoren, die für Auswertungen gelesen werden dürfen
ALLOWED_DOMAINS = ("sensor", "input_number", "number")
MAX_ENTITIES = 40
PV_MAX = 4

# Energie-Zähler: Schlüssel der Karte -> Kurzname in den Ergebnissen
ENERGY_SLOTS = {
    "energy_pv": "pv",
    "energy_import": "import",
    "energy_export": "export",
    "energy_home": "home",
    "energy_battery_charge": "charge",
    "energy_battery_discharge": "discharge",
}
