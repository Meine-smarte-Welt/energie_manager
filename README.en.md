🇩🇪 [Deutsch](README.md) · 🇬🇧 English · [🇳🇱 Nederlands](README.nl.md)

# Energy Manager for Home Assistant

A dashboard card for energy flow, PV generation compared with the Solcast forecast, battery, electricity price and monthly history. You pick all sensors in the graphical card editor, no YAML needed.

> **Version 0.0.1 – first release.** The card and the calculation logic are tested with simulated data, **not** on a real installation and not with real Solcast data. See [Known limitations](#known-limitations). Feedback is very welcome.

## Features

- **Energy flow** in the style of Power Flow Card Plus: PV, grid, home, battery and up to three individual consumers with animated lines.
- **PV generation:** comparison of the Solcast forecast with the actual generation, for each orientation separately (up to 4 arrays) and in total. Hourly curve, "forecast so far" and deviation in percent.
- **Battery:** state of charge, power, content in kWh, estimated time until full or empty, charged and discharged today.
- **Electricity price:** current price, price level, lowest/average/highest price, cost per hour when importing, revenue per hour when exporting. Works with any price sensor (for example Tibber, aWATTar, Nord Pool).
- **History:** monthly values over 3 to 36 months for PV, import, export, usage, self-sufficiency and self-consumption from Home Assistant's long-term statistics.
- **Loads fast:** the card first shows only the energy flow from live values. The data of a category is loaded only when you open its tab.
- Every category can be switched on and off in the editor. Three languages (German, English, Dutch). Version display with update notice.

## Requirements

- Home Assistant 2025.6 or newer
- Recorder (default) for daily values, the PV hourly curve and the monthly history
- Optional: Solcast PV Forecast ([BJReplay/ha-solcast-solar](https://github.com/BJReplay/ha-solcast-solar)) for the forecast

## Installation

**HACS (recommended)**

1. HACS → three-dot menu → *Custom repositories*
2. Enter `https://github.com/meine-smarte-welt/energie_manager`, category *Integration*
3. Install "Energie Manager" and restart Home Assistant

**Manual**

1. Copy the folder `custom_components/energie_manager` to your `config/custom_components/`
2. Restart Home Assistant

## Setup

1. *Settings → Devices & services → Add integration → Energie Manager*
2. Confirm the options (update check, maximum months in the history)
3. The card is added as a Lovelace resource automatically. In YAML mode add it yourself: URL `/energie_manager_files/energie-manager-card.js?v=0.0.1`, type *JavaScript module*.
4. Edit dashboard → *Add card* → "Energie Manager" → pick sensors in the editor
5. After an update reload the browser once (Ctrl+F5)

## The card

All keys are available in the editor. Example (shortened, complete in [`examples/dashboard_karte.yaml`](examples/dashboard_karte.yaml)):

```yaml
type: custom:energie-manager-card
title: Energy
default_tab: flow
history_months: 12
grid_power: sensor.grid_power           # import positive, export negative
battery_power: sensor.battery_power     # discharging positive
battery_soc: sensor.battery_soc
battery_capacity: 10
pv_count: 2
pv1_name: South
pv1_power: sensor.pv_south_power
pv1_energy_today: sensor.pv_south_energy_today
pv1_forecast: sensor.solcast_pv_forecast_forecast_today
pv2_name: West
pv2_power: sensor.pv_west_power
pv2_energy_today: sensor.pv_west_energy_today
pv2_forecast: sensor.solcast_pv_forecast_forecast_today
pv2_forecast_site: 1234_5678_9012_3456
energy_pv: sensor.pv_total_energy
energy_import: sensor.grid_import_energy
energy_export: sensor.grid_export_energy
price_current: sensor.electricity_price
```

**Categories (tabs):** `flow` (energy flow), `pv`, `battery`, `price`, `history`, `bridge` (cog: settings and version). Each has a switch `show_<category>`; `default_tab` sets the start tab. At least one category always stays visible.

**Important keys**

| Group | Keys | Meaning |
|---|---|---|
| Energy flow | `grid_power`, `grid_invert` | Grid power (import positive); invert the sign |
| | `grid_import_power`, `grid_export_power` | Alternative with two separate sensors |
| | `home_power`, `pv_power` | Optional, otherwise calculated or the sum of the arrays |
| | `battery_power`, `battery_invert`, `battery_soc`, `battery_capacity` | Battery (discharging positive), state of charge, capacity in kWh |
| | `consumer1_name` … `consumer3_power` | Up to three individual consumers |
| PV | `pv_count` | Number of arrays (1 to 4), for example one per orientation |
| | `pvN_name`, `pvN_power`, `pvN_energy_today` | Name, power, energy today (resets daily) |
| | `pvN_forecast`, `pvN_forecast_tomorrow`, `pvN_forecast_now` | Solcast: forecast today, tomorrow, power now |
| | `pvN_forecast_site` | Optional: Solcast site ID if Solcast breaks the arrays down as attributes (hyphens as underscores) |
| Meters | `energy_pv`, `energy_import`, `energy_export`, `energy_home`, `energy_battery_charge`, `energy_battery_discharge` | Energy meters in kWh with state_class `total_increasing` for daily values and history |
| Price | `price_current`, `price_min`, `price_avg`, `price_max`, `price_level`, `feed_in_tariff`, `feed_in_tariff_fixed` | Price sensors, feed-in tariff (sensor or fixed value in €/kWh) |
| Appearance | `title`, `show_title`, `zoom`, `show_stats`, `history_months`, `flow_threshold`, `read_only` | Title, zoom in %, key figures, months, animation threshold in W, read-only |

Power is read in W, kW or MW, energy in Wh, kWh or MWh. `read_only` hides all controls that change anything.

## Colors

All colors can be set per card (editor section "Farben" or `color_*`). Empty means theme default. Allowed are hex, `rgb()`, `hsl()` and `var(--…)`; anything invalid is discarded.

| Key | Meaning |
|---|---|
| `color_tab_active` | Active tab |
| `color_success` / `color_warning` / `color_error` / `color_info` | green, orange, red, blue (fixed meaning) |
| `color_row_icon` | Row icons of all categories |
| `color_icon_<category>` | Icon color of one category (`flow`, `pv`, `battery`, `price`, `history`, `bridge`) |
| `color_live_banner` | "Loading …" banner |
| `color_pv`, `color_grid_import`, `color_grid_export`, `color_battery`, `color_home`, `color_forecast` | Colors in the energy flow and the charts |

## Services

| Service | Effect |
|---|---|
| `energie_manager.check_update` | Asks GitHub for the latest version right away |
| `energie_manager.clear_cache` | Clears the cache of the long-term values |

Both have the optional field `entry_id`.

## Events

Version 0.0.1 does not send any events.

## Sensors

| Sensor | Meaning |
|---|---|
| Version sensor (diagnostic), for example `sensor.energie_manager_installed_version` (the entity ID depends on the language at setup) | Installed version; attributes: `latest_version`, `update_available`, `release_url`, `checked_at`, `check_failed` |

The card reads the measured values (power, energy, price) directly from your sensors. The integration does not create sensors for them.

## Version display and update notice

The version is shown in three places: *cog → App-Version* in the card, at the top of the card editor and in the integration's options dialog. The integration asks `api.github.com/repos/meine-smarte-welt/energie_manager/releases/latest` at startup and every 12 hours afterwards (falling back to the highest tag). When a new version exists, the accordion, the notice and the "↑" at the cog turn orange. If card and integration have different versions (old browser cache), a notice appears too. If GitHub is unreachable, it says "Check not possible" and the card keeps working. The check can be switched off in the options.

## Settings

*Devices & services → Energie Manager → Configure*

| Option | Meaning |
|---|---|
| Check GitHub for new versions | On/off |
| Maximum months for the history | 6 to 60, limits the card's requests |

*Reconfigure* in the entry's three-dot menu opens the same fields.

## Security

- Writing actions (update check, clear cache) are possible for administrators only; inputs are validated in the backend.
- The long-term query accepts only sensors from `sensor`, `input_number` and `number`, at most 40 per request.
- All texts in the card are escaped, color values go through an allowlist.
- The only outgoing network connection is the version query to GitHub (can be switched off). No data about you is transmitted.
- Two-click confirmation when clearing the cache.

## Known limitations

- **Not tested on real hardware:** version 0.0.1 has not been tested on a real installation. Tested are the calculation logic and the card with simulated data, and importing the modules against Home Assistant 2026.2.3. Not verified are the card editor in the real Home Assistant frontend, the automatic Lovelace entry and the recorder queries with real data.
- **Solcast:** the data format (`detailedForecast`, `detailedHourly`, attributes per site) follows the ha-solcast-solar documentation and has not been checked against a real installation.
- **Tibber:** the developer does not use Tibber. The price feature works with any sensor but shows current values only, no price curve.
- **History:** needs sensors with a `state_class` (`total_increasing` for meters, `measurement` for power). Sensors without long-term statistics are named in the card. Monthly values exist for the total meters, not per orientation.
- **Daily energy per array** (`pvN_energy_today`) must return to zero every day. A meter that never resets gives wrong daily values. Without this sensor the card calculates the energy from the power statistics (5-minute averages) and shows it as an approximation.
- "Forecast so far" counts only completed Solcast periods (30 minutes).
- No filter, no search and no events; they do not fit an energy card.

## Troubleshooting

| Problem | Solution |
|---|---|
| Card not in the picker | Reload the browser (Ctrl+F5); in YAML mode add the resource manually |
| Banner "integration does not respond" | Set up the integration and restart Home Assistant |
| "No long-term statistics for …" | Give the sensor a `state_class` (for example via a template or utility meter helper) |
| PV forecast curve empty | The forecast sensor lacks the attribute `detailedForecast`; with per-site breakdown set `pvN_forecast_site` |
| Sign is reversed | Turn on `grid_invert` or `battery_invert` |
| Errors in the log | Check the log for `custom_components.energie_manager` |

## File integrity

Every `.py`, `.js` and `.yaml` carries a SHA-256 hash of the content from line 2 on in its first line. Verify: `tail -n +2 file.py | sha256sum`. For JSON files (no comments) the hashes of the complete file are listed in the German [README.md](README.md#datei-integrität).

## License

[MIT](LICENSE)
