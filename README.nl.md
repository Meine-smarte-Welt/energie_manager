🇩🇪 [Deutsch](README.md) · [🇬🇧 English](README.en.md) · 🇳🇱 Nederlands

# Energie Manager voor Home Assistant

Een dashboardkaart voor energiestroom, PV-opwekking vergeleken met de Solcast-prognose, batterij, stroomprijs en maandverloop. Alle sensoren kies je in de grafische kaarteditor, zonder YAML.

> **Versie 0.0.1 – eerste release.** De kaart en de rekenlogica zijn getest met gesimuleerde gegevens, **niet** op een echte installatie en niet met echte Solcast-gegevens. Zie [Bekende beperkingen](#bekende-beperkingen). Feedback is zeer welkom.

## Functies

- **Energiestroom** in de stijl van Power Flow Card Plus: PV, net, huis, batterij en tot drie afzonderlijke verbruikers met geanimeerde lijnen.
- **PV-opwekking:** vergelijking van de Solcast-prognose met de werkelijke opwekking, per windrichting apart (tot 4 installaties) en totaal. Uurverloop, "prognose tot nu" en afwijking in procenten.
- **Batterij:** laadstand, vermogen, inhoud in kWh, geschatte tijd tot vol of leeg, vandaag geladen en ontladen.
- **Stroomprijs:** huidige prijs, prijsniveau, laagste/gemiddelde/hoogste prijs, kosten per uur bij afname, opbrengst per uur bij teruglevering. Werkt met elke prijssensor (bijvoorbeeld Tibber, aWATTar, Nord Pool).
- **Verloop:** maandwaarden over 3 tot 36 maanden voor PV, afname, teruglevering, verbruik, zelfvoorziening en eigen verbruik uit de langetermijnstatistieken van Home Assistant.
- **Snel geladen:** de kaart toont eerst alleen de energiestroom uit live waarden. De gegevens van een categorie worden pas geladen als je het tabblad opent.
- Elke categorie is in de editor apart aan en uit te zetten. Drie talen (Duits, Engels, Nederlands). Versieweergave met updatemelding.

## Vereisten

- Home Assistant 2025.6 of nieuwer
- Recorder (standaard) voor daggegevens, het PV-uurverloop en het maandverloop
- Optioneel: Solcast PV Forecast ([BJReplay/ha-solcast-solar](https://github.com/BJReplay/ha-solcast-solar)) voor de prognose

## Installatie

**HACS (aanbevolen)**

1. HACS → menu met drie puntjes → *Aangepaste repositories*
2. Voer `https://github.com/meine-smarte-welt/energie_manager` in, categorie *Integratie*
3. "Energie Manager" installeren en Home Assistant herstarten

**Handmatig**

1. Kopieer de map `custom_components/energie_manager` naar je `config/custom_components/`
2. Herstart Home Assistant

## Instellen

1. *Instellingen → Apparaten & diensten → Integratie toevoegen → Energie Manager*
2. Bevestig de opties (updatecontrole, maximaal aantal maanden in het verloop)
3. De kaart wordt automatisch als Lovelace-resource toegevoegd. In YAML-modus voeg je haar zelf toe: URL `/energie_manager_files/energie-manager-card.js?v=0.0.1`, type *JavaScript-module*.
4. Dashboard bewerken → *Kaart toevoegen* → "Energie Manager" → sensoren in de editor kiezen
5. Laad de browser na een update één keer opnieuw (Ctrl+F5)

## De kaart

Alle sleutels zijn beschikbaar in de editor. Voorbeeld (ingekort, volledig in [`examples/dashboard_karte.yaml`](examples/dashboard_karte.yaml)):

```yaml
type: custom:energie-manager-card
title: Energie
default_tab: flow
history_months: 12
grid_power: sensor.net_vermogen         # afname positief, teruglevering negatief
battery_power: sensor.batterij_vermogen # ontladen positief
battery_soc: sensor.batterij_laadstand
battery_capacity: 10
pv_count: 2
pv1_name: Zuid
pv1_power: sensor.pv_zuid_vermogen
pv1_energy_today: sensor.pv_zuid_energie_vandaag
pv1_forecast: sensor.solcast_pv_forecast_forecast_today
pv2_name: West
pv2_power: sensor.pv_west_vermogen
pv2_energy_today: sensor.pv_west_energie_vandaag
pv2_forecast: sensor.solcast_pv_forecast_forecast_today
pv2_forecast_site: 1234_5678_9012_3456
energy_pv: sensor.pv_totaal_energie
energy_import: sensor.net_afname_energie
energy_export: sensor.net_teruglevering_energie
price_current: sensor.stroomprijs
```

**Categorieën (tabbladen):** `flow` (energiestroom), `pv`, `battery`, `price`, `history`, `bridge` (tandwiel: instellingen en versie). Elk heeft een schakelaar `show_<categorie>`; `default_tab` bepaalt het starttabblad. Minstens één categorie blijft altijd zichtbaar.

**Belangrijke sleutels**

| Groep | Sleutels | Betekenis |
|---|---|---|
| Energiestroom | `grid_power`, `grid_invert` | Netvermogen (afname positief); teken omkeren |
| | `grid_import_power`, `grid_export_power` | Alternatief met twee aparte sensoren |
| | `home_power`, `pv_power` | Optioneel, anders berekend of som van de installaties |
| | `battery_power`, `battery_invert`, `battery_soc`, `battery_capacity` | Batterij (ontladen positief), laadstand, capaciteit in kWh |
| | `consumer1_name` … `consumer3_power` | Tot drie afzonderlijke verbruikers |
| PV | `pv_count` | Aantal installaties (1 tot 4), bijvoorbeeld per windrichting |
| | `pvN_name`, `pvN_power`, `pvN_energy_today` | Naam, vermogen, energie vandaag (reset dagelijks) |
| | `pvN_forecast`, `pvN_forecast_tomorrow`, `pvN_forecast_now` | Solcast: prognose vandaag, morgen, vermogen nu |
| | `pvN_forecast_site` | Optioneel: Solcast-site-ID als Solcast de installaties als attributen uitsplitst (koppeltekens als underscore) |
| Meters | `energy_pv`, `energy_import`, `energy_export`, `energy_home`, `energy_battery_charge`, `energy_battery_discharge` | Energiemeters in kWh met state_class `total_increasing` voor daggegevens en verloop |
| Prijs | `price_current`, `price_min`, `price_avg`, `price_max`, `price_level`, `feed_in_tariff`, `feed_in_tariff_fixed` | Prijssensoren, terugleververgoeding (sensor of vaste waarde in €/kWh) |
| Weergave | `title`, `show_title`, `zoom`, `show_stats`, `history_months`, `flow_threshold`, `read_only` | Titel, zoom in %, kerncijfers, maanden, drempel van de animatie in W, alleen-lezen |

Vermogen wordt gelezen in W, kW of MW, energie in Wh, kWh of MWh. `read_only` verbergt alle bedieningselementen die iets wijzigen.

## Kleuren

Alle kleuren zijn per kaart in te stellen (editorgedeelte "Farben" of `color_*`). Leeg betekent themastandaard. Toegestaan zijn hex, `rgb()`, `hsl()` en `var(--…)`; ongeldige waarden worden genegeerd.

| Sleutel | Betekenis |
|---|---|
| `color_tab_active` | Actief tabblad |
| `color_success` / `color_warning` / `color_error` / `color_info` | groen, oranje, rood, blauw (vaste betekenis) |
| `color_row_icon` | Rijpictogrammen van alle categorieën |
| `color_icon_<categorie>` | Pictogramkleur van één categorie (`flow`, `pv`, `battery`, `price`, `history`, `bridge`) |
| `color_live_banner` | Banner "Laden …" |
| `color_pv`, `color_grid_import`, `color_grid_export`, `color_battery`, `color_home`, `color_forecast` | Kleuren in de energiestroom en de grafieken |

## Services

| Service | Effect |
|---|---|
| `energie_manager.check_update` | Vraagt direct aan GitHub naar de nieuwste versie |
| `energie_manager.clear_cache` | Leegt de cache van de langetermijnwaarden |

Beide hebben het optionele veld `entry_id`.

## Gebeurtenissen

Versie 0.0.1 verstuurt geen gebeurtenissen.

## Sensoren

| Sensor | Betekenis |
|---|---|
| Versiesensor (diagnose), bijvoorbeeld `sensor.energie_manager_geinstalleerde_versie` (de entiteits-ID hangt af van de taal bij het instellen) | Geïnstalleerde versie; attributen: `latest_version`, `update_available`, `release_url`, `checked_at`, `check_failed` |

De kaart leest de meetwaarden (vermogen, energie, prijs) rechtstreeks uit je sensoren. De integratie maakt hiervoor geen eigen sensoren aan.

## Versieweergave en updatemelding

De versie staat op drie plaatsen: *tandwiel → App-versie* in de kaart, bovenaan de kaarteditor en in het optiesdialoog van de integratie. De integratie vraagt bij het opstarten en daarna elke 12 uur `api.github.com/repos/meine-smarte-welt/energie_manager/releases/latest` op (anders de hoogste tag). Bij een nieuwe versie worden accordeon, melding en de "↑" bij het tandwiel oranje. Hebben kaart en integratie verschillende versies (oude browsercache), dan verschijnt ook een melding. Is GitHub niet bereikbaar, dan staat er "Controle niet mogelijk" en werkt de kaart gewoon door. De controle is uit te zetten in de opties.

## Instellingen

*Apparaten & diensten → Energie Manager → Configureren*

| Optie | Betekenis |
|---|---|
| Op GitHub naar nieuwe versies zoeken | Aan/uit |
| Maximaal aantal maanden voor het verloop | 6 tot 60, beperkt de verzoeken van de kaart |

*Opnieuw configureren* in het menu met drie puntjes van de invoer opent dezelfde velden.

## Veiligheid

- Schrijvende acties (updatecontrole, cache legen) zijn alleen mogelijk voor beheerders; invoer wordt in de backend gecontroleerd.
- De langetermijnvraag accepteert alleen sensoren uit `sensor`, `input_number` en `number`, maximaal 40 per verzoek.
- Alle teksten in de kaart worden geëscaped, kleurwaarden lopen via een allowlist.
- De enige uitgaande netwerkverbinding is de versievraag aan GitHub (uit te zetten). Er worden geen gegevens van jou verzonden.
- Bevestiging met twee klikken bij het legen van de cache.

## Bekende beperkingen

- **Niet getest op echte hardware:** versie 0.0.1 is niet getest op een echte installatie. Getest zijn de rekenlogica en de kaart met gesimuleerde gegevens, en het importeren van de modules tegen Home Assistant 2026.2.3. Niet gecontroleerd zijn de kaarteditor in de echte Home Assistant-frontend, de automatische Lovelace-invoer en de recorderverzoeken met echte gegevens.
- **Solcast:** het gegevensformaat (`detailedForecast`, `detailedHourly`, attributen per site) volgt de documentatie van ha-solcast-solar en is niet getoetst aan een echte installatie.
- **Tibber:** de ontwikkelaar gebruikt Tibber niet. De prijsfunctie werkt met elke sensor, maar toont alleen huidige waarden, geen prijsverloop.
- **Verloop:** vereist sensoren met een `state_class` (`total_increasing` voor meters, `measurement` voor vermogen). Sensoren zonder langetermijnstatistieken worden in de kaart genoemd. Maandwaarden bestaan voor de totaalmeters, niet per windrichting.
- **Dagenergie per installatie** (`pvN_energy_today`) moet elke dag naar nul terugkeren. Een meter die nooit reset geeft verkeerde daggegevens. Zonder deze sensor berekent de kaart de energie uit de vermogensstatistiek (5-minutengemiddelden) en toont die als benadering.
- "Prognose tot nu" telt alleen afgeronde Solcast-perioden (30 minuten).
- Geen filter, geen zoekfunctie en geen gebeurtenissen; die passen niet bij een energiekaart.

## Probleemoplossing

| Probleem | Oplossing |
|---|---|
| Kaart niet in de keuzelijst | Laad de browser opnieuw (Ctrl+F5); in YAML-modus de resource handmatig toevoegen |
| Banner "integratie reageert niet" | Integratie instellen en Home Assistant herstarten |
| "Geen langetermijnstatistieken voor …" | Geef de sensor een `state_class` (bijvoorbeeld via een template- of utility-meter-helper) |
| PV-prognosecurve leeg | De prognosesensor mist het attribuut `detailedForecast`; bij uitsplitsing per site `pvN_forecast_site` instellen |
| Teken omgekeerd | Zet `grid_invert` of `battery_invert` aan |
| Fouten in het log | Controleer het log op `custom_components.energie_manager` |

## Bestandsintegriteit

Elke `.py`, `.js` en `.yaml` heeft op de eerste regel een SHA-256-hash van de inhoud vanaf regel 2. Controleren: `tail -n +2 bestand.py | sha256sum`. Voor JSON-bestanden (zonder commentaar) staan de hashes van het hele bestand in de Duitse [README.md](README.md#datei-integrität).

## Licentie

[MIT](LICENSE)
