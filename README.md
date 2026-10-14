🇩🇪 Deutsch · [🇬🇧 English](README.en.md) · [🇳🇱 Nederlands](README.nl.md)

# Energie Manager für Home Assistant

Eine Dashboard-Karte für Energiefluss, PV-Erzeugung mit Solcast-Vergleich, Speicher, Strompreis und Monatsverlauf. Alle Sensoren wählst du im grafischen Karten-Editor aus, ohne YAML.

> **Version 0.0.1 – erste Veröffentlichung.** Die Karte und die Rechenlogik sind mit simulierten Daten getestet, **nicht** an einer echten Anlage und nicht mit echten Solcast-Daten. Siehe [Bekannte Einschränkungen](#bekannte-einschränkungen). Rückmeldungen sind ausdrücklich erwünscht.

## Funktionsumfang

- **Energiefluss** im Stil der Power Flow Card Plus: PV, Netz, Haus, Speicher und bis zu drei einzelne Verbraucher mit animierten Linien.
- **PV-Erzeugung:** Vergleich der Solcast-Prognose mit der tatsächlichen Erzeugung, für jede Himmelsrichtung einzeln (bis zu 4 Anlagen) und gesamt. Stundenverlauf, „Prognose bis jetzt“ und Abweichung in Prozent.
- **Speicher:** Ladestand, Leistung, Inhalt in kWh, geschätzte Zeit bis voll oder leer, geladen und entladen heute.
- **Strompreis:** aktueller Preis, Preisstufe, niedrigster/durchschnittlicher/höchster Preis, Kosten pro Stunde beim Netzbezug, Erlös pro Stunde bei Einspeisung. Funktioniert mit jedem Preissensor (zum Beispiel Tibber, aWATTar, Nord Pool).
- **Verlauf:** Monatswerte über 3 bis 36 Monate für PV, Bezug, Einspeisung, Verbrauch, Autarkie und Eigenverbrauch aus der Langzeitstatistik von Home Assistant.
- **Schnell geladen:** Die Karte zeigt zuerst nur den Energiefluss aus den Live-Werten. Die Daten einer Kategorie werden erst geladen, wenn du ihren Tab öffnest.
- Jede Kategorie ist im Editor einzeln ein- und ausschaltbar. Drei Sprachen (Deutsch, Englisch, Niederländisch). Versionsanzeige mit Update-Hinweis.

## Voraussetzungen

- Home Assistant ab 2025.6
- Recorder (Standard) für Tageswerte, PV-Stundenverlauf und Monatsverlauf
- Optional: Solcast PV Forecast ([BJReplay/ha-solcast-solar](https://github.com/BJReplay/ha-solcast-solar)) für die Prognose

## Installation

**HACS (empfohlen)**

1. HACS → Drei-Punkte-Menü → *Benutzerdefinierte Repositories*
2. `https://github.com/meine-smarte-welt/energie_manager` eintragen, Kategorie *Integration*
3. „Energie Manager“ installieren und Home Assistant neu starten

**Manuell**

1. Den Ordner `custom_components/energie_manager` in dein `config/custom_components/` kopieren
2. Home Assistant neu starten

## Einrichtung

1. *Einstellungen → Geräte & Dienste → Integration hinzufügen → Energie Manager*
2. Optionen bestätigen (Update-Prüfung, maximale Monate im Verlauf)
3. Die Karte wird automatisch als Lovelace-Ressource eingetragen. Im YAML-Modus trägst du sie selbst ein: URL `/energie_manager_files/energie-manager-card.js?v=0.0.1`, Typ *JavaScript-Modul*.
4. Dashboard bearbeiten → *Karte hinzufügen* → „Energie Manager“ → Sensoren im Editor auswählen
5. Nach einem Update einmal den Browser neu laden (Strg+F5)

## Die Karte

Alle Schlüssel stehen im Editor zur Verfügung. Beispiel (gekürzt, vollständig in [`examples/dashboard_karte.yaml`](examples/dashboard_karte.yaml)):

```yaml
type: custom:energie-manager-card
title: Energie
default_tab: flow
history_months: 12
grid_power: sensor.netz_leistung        # Bezug positiv, Einspeisung negativ
battery_power: sensor.speicher_leistung # Entladen positiv
battery_soc: sensor.speicher_ladestand
battery_capacity: 10
pv_count: 2
pv1_name: Süd
pv1_power: sensor.pv_sued_leistung
pv1_energy_today: sensor.pv_sued_energie_heute
pv1_forecast: sensor.solcast_pv_forecast_forecast_today
pv2_name: West
pv2_power: sensor.pv_west_leistung
pv2_energy_today: sensor.pv_west_energie_heute
pv2_forecast: sensor.solcast_pv_forecast_forecast_today
pv2_forecast_site: 1234_5678_9012_3456
energy_pv: sensor.pv_gesamt_energie
energy_import: sensor.netz_bezug_energie
energy_export: sensor.netz_einspeisung_energie
price_current: sensor.strompreis_aktuell
```

**Kategorien (Tabs):** `flow` (Energiefluss), `pv`, `battery`, `price`, `history`, `bridge` (Zahnrad: Einstellungen und Version). Jede hat einen Schalter `show_<kategorie>`; `default_tab` legt den Starttab fest. Mindestens eine Kategorie bleibt immer sichtbar.

**Wichtige Schlüssel**

| Gruppe | Schlüssel | Bedeutung |
|---|---|---|
| Energiefluss | `grid_power`, `grid_invert` | Netzleistung (Bezug positiv); Vorzeichen umkehren |
| | `grid_import_power`, `grid_export_power` | Alternative mit zwei getrennten Sensoren |
| | `home_power`, `pv_power` | Optional, sonst berechnet bzw. Summe der Anlagen |
| | `battery_power`, `battery_invert`, `battery_soc`, `battery_capacity` | Speicher (Entladen positiv), Ladestand, Kapazität in kWh |
| | `consumer1_name` … `consumer3_power` | Bis zu drei einzelne Verbraucher |
| PV | `pv_count` | Anzahl Anlagen (1 bis 4), zum Beispiel je Himmelsrichtung |
| | `pvN_name`, `pvN_power`, `pvN_energy_today` | Name, Leistung, Energie heute (setzt täglich zurück) |
| | `pvN_forecast`, `pvN_forecast_tomorrow`, `pvN_forecast_now` | Solcast: Prognose heute, morgen, Leistung jetzt |
| | `pvN_forecast_site` | Optional: Solcast-Site-ID, wenn Solcast die Anlagen als Attribute aufschlüsselt (Bindestriche als Unterstrich) |
| Zähler | `energy_pv`, `energy_import`, `energy_export`, `energy_home`, `energy_battery_charge`, `energy_battery_discharge` | Energiezähler in kWh mit state_class `total_increasing` für Tageswerte und Verlauf |
| Preis | `price_current`, `price_min`, `price_avg`, `price_max`, `price_level`, `feed_in_tariff`, `feed_in_tariff_fixed` | Preissensoren, Einspeisevergütung (Sensor oder fester Wert in €/kWh) |
| Darstellung | `title`, `show_title`, `zoom`, `show_stats`, `history_months`, `flow_threshold`, `read_only` | Titel, Zoom in %, Kennzahlen, Monate, Schwelle der Animation in W, nur lesen |

Leistungen werden in W, kW oder MW gelesen, Energien in Wh, kWh oder MWh. `read_only` blendet alle Bedienelemente zum Ändern aus.

## Farben

Alle Farben sind pro Karte einstellbar (Editor-Bereich „Farben“ oder `color_*`). Leer bedeutet Theme-Standard. Erlaubt sind Hex, `rgb()`, `hsl()` und `var(--…)`; Ungültiges wird verworfen.

| Schlüssel | Bedeutung |
|---|---|
| `color_tab_active` | Aktiver Tab |
| `color_success` / `color_warning` / `color_error` / `color_info` | grün, orange, rot, blau (feste Bedeutung) |
| `color_row_icon` | Zeilensymbole aller Kategorien |
| `color_icon_<kategorie>` | Symbolfarbe einer Kategorie (`flow`, `pv`, `battery`, `price`, `history`, `bridge`) |
| `color_live_banner` | Banner „Lade …“ |
| `color_pv`, `color_grid_import`, `color_grid_export`, `color_battery`, `color_home`, `color_forecast` | Farben im Energiefluss und in den Diagrammen |

## Services

| Service | Wirkung |
|---|---|
| `energie_manager.check_update` | Fragt sofort bei GitHub nach der neuesten Version |
| `energie_manager.clear_cache` | Leert den Zwischenspeicher der Langzeitwerte |

Beide haben das optionale Feld `entry_id`.

## Ereignisse

Version 0.0.1 sendet keine Ereignisse.

## Sensoren

| Sensor | Bedeutung |
|---|---|
| Versions-Sensor (Diagnose), zum Beispiel `sensor.energie_manager_installierte_version` (die Entity-ID hängt von der Sprache bei der Einrichtung ab) | Installierte Version; Attribute: `latest_version`, `update_available`, `release_url`, `checked_at`, `check_failed` |

Die Messwerte (Leistung, Energie, Preis) liest die Karte direkt aus deinen Sensoren. Die Integration legt dafür keine eigenen Sensoren an.

## Versionsanzeige und Update-Hinweis

Die Version steht an drei Stellen: *Zahnrad → App-Version* in der Karte, oben im Karten-Editor und im Optionen-Dialog der Integration. Die Integration fragt beim Start und danach alle 12 Stunden `api.github.com/repos/meine-smarte-welt/energie_manager/releases/latest` ab (ersatzweise das höchste Tag). Bei einer neuen Version werden Akkordeon, Hinweis und das „↑“ am Zahnrad orange. Haben Karte und Integration unterschiedliche Versionen (alter Browser-Cache), erscheint ebenfalls ein Hinweis. Ist GitHub nicht erreichbar, steht dort „Prüfung nicht möglich“ und die Karte läuft normal weiter. Die Prüfung lässt sich in den Optionen abschalten.

## Einstellungen

*Geräte & Dienste → Energie Manager → Konfigurieren*

| Option | Bedeutung |
|---|---|
| Nach neuen Versionen auf GitHub suchen | An/aus |
| Maximale Monate für den Verlauf | 6 bis 60, begrenzt die Anfragen der Karte |

*Neu konfigurieren* über das Drei-Punkte-Menü des Eintrags öffnet dieselben Felder.

## Sicherheit

- Schreibende Aktionen (Update-Prüfung, Zwischenspeicher leeren) sind nur für Administratoren möglich; Eingaben werden im Backend geprüft.
- Die Langzeitabfrage nimmt nur Sensoren aus `sensor`, `input_number` und `number` an, höchstens 40 je Anfrage.
- Alle Texte in der Karte werden maskiert, Farbwerte laufen über eine Allowlist.
- Die einzige Netzwerkverbindung nach außen ist die Versionsabfrage bei GitHub (abschaltbar). Es werden keine Daten von dir übertragen.
- Zwei-Klick-Bestätigung beim Leeren des Zwischenspeichers.

## Bekannte Einschränkungen

- **Ungeprüft an echter Hardware:** Version 0.0.1 wurde nicht an einer echten Anlage getestet. Getestet sind die Rechenlogik und die Karte mit simulierten Daten sowie der Import der Module gegen Home Assistant 2026.2.3. Nicht geprüft sind der Karten-Editor im echten Home-Assistant-Frontend, der automatische Lovelace-Eintrag und die Recorder-Abfragen mit echten Daten.
- **Solcast:** Das Datenformat (`detailedForecast`, `detailedHourly`, Attribute je Site) folgt der Dokumentation von ha-solcast-solar und ist nicht gegen eine echte Installation geprüft.
- **Tibber:** Der Entwickler nutzt Tibber nicht. Die Preisfunktion arbeitet mit beliebigen Sensoren, zeigt aber nur aktuelle Werte, keinen Preisverlauf.
- **Verlauf:** Benötigt Sensoren mit `state_class` (`total_increasing` für Zähler, `measurement` für Leistungen). Sensoren ohne Langzeitstatistik werden in der Karte genannt. Monatswerte gibt es für die Gesamtzähler, nicht je Himmelsrichtung.
- **Tagesenergie je Anlage** (`pvN_energy_today`) muss täglich auf null zurückgehen. Ein Zähler, der nie zurücksetzt, liefert falsche Tageswerte. Ohne diesen Sensor rechnet die Karte die Energie aus der Leistungsstatistik (5-Minuten-Mittelwerte) und zeigt sie als Näherung.
- „Prognose bis jetzt“ zählt nur abgeschlossene Solcast-Zeiträume (30 Minuten).
- Kein Filter, keine Suche und keine Ereignisse; das passt nicht zu einer Energie-Karte.

## Fehlerbehebung

| Problem | Lösung |
|---|---|
| Karte nicht in der Auswahl | Browser neu laden (Strg+F5); im YAML-Modus die Ressource manuell eintragen |
| Banner „Integration antwortet nicht“ | Integration einrichten und Home Assistant neu starten |
| „Keine Langzeitstatistik für …“ | Dem Sensor eine `state_class` geben (zum Beispiel über ein Template- oder Utility-Meter-Helfer) |
| PV-Prognosekurve leer | Am Prognose-Sensor fehlt das Attribut `detailedForecast`; bei Site-Aufschlüsselung `pvN_forecast_site` setzen |
| Vorzeichen vertauscht | `grid_invert` oder `battery_invert` einschalten |
| Fehlerhinweise im Log | Protokoll unter `custom_components.energie_manager` prüfen |

## Datei-Integrität

Jede `.py`, `.js` und `.yaml` trägt in der ersten Zeile einen SHA-256-Hash des Inhalts ab Zeile 2. Prüfen: `tail -n +2 datei.py | sha256sum`. Für JSON-Dateien (ohne Kommentare) gelten diese Hashes über die komplette Datei:

| Datei | SHA-256 (komplette Datei) |
|---|---|
| `hacs.json` | `7e6bd5e1470416ea5aa7754bc2de451c006812341445adae657e298f7ec5242b` |
| `custom_components/energie_manager/icons.json` | `4fe83cef322748803eb2069c89c027408330e6838dac3c05ee03022bf448fec4` |
| `custom_components/energie_manager/manifest.json` | `5115717e92022a7184fa2d7900901e7b5dd5747e3bb309e4963ac5151a96281e` |
| `custom_components/energie_manager/strings.json` | `b6115bd546fb295abc4177fafa661dbcc79e51de93095dcfe2997d7a1b75c142` |
| `custom_components/energie_manager/translations/de.json` | `b6115bd546fb295abc4177fafa661dbcc79e51de93095dcfe2997d7a1b75c142` |
| `custom_components/energie_manager/translations/en.json` | `d021c2af6b2ea75116bf39f0e0973e3e0e229383af531597b0f024b1c39f320b` |
| `custom_components/energie_manager/translations/nl.json` | `c65c489479c79e44dad98433fd9d8b61cabb2654b7f9465cb576174b10f59b72` |

## Lizenz

[MIT](LICENSE)
