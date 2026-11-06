# Experimentelle Funktionen – Energie Manager

Stand: 2026-11-07 · Version: 0.0.2

Diese Funktionen sind **ungeprüft** und standardmäßig ausgeblendet.
Einschalten: Optionen → „Experimentelle Funktionen anzeigen“ und der Schalter der Funktion, in der Karte Editor → „Experimentell“.

## Offen (noch zu prüfen)

| Funktion | Schlüssel | Seit | Warum experimentell | Was zu prüfen ist | Status |
|---|---|---|---|---|---|
| Sensoren des Kostal Managers automatisch erkennen | `autodetect` | 0.0.2 | Neu in 0.0.2. Nur mit simulierten Registerdaten, einer simulierten Karte und der Home-Assistant-Bibliothek 2026.2.3 getestet, nicht mit einem laufenden Kostal Manager und nicht an einer echten Anlage. | 1. Kostal Manager (mit gewählten Strings) und Energie Manager laufen, beide Schalter in den Optionen und `show_experimental` in der Karte an: Der Tab *Einstellungen* zeigt das Akkordeon „Automatische Erkennung“ mit einer Zuordnung. 2. Neue Karte ohne eingetragene Sensoren: Der Energiefluss zeigt PV-Leistung, Netz, Speicher und Haus; der PV-Tab zeigt je gewähltem String eine Anlage, passend zu DC1, DC2 (DC3 nur, wenn als String gewählt). 3. Vorzeichen prüfen: Netz positiv bei Bezug, Speicher positiv beim Entladen. Stimmt es nicht, `grid_invert` oder `battery_invert` setzen und das Ergebnis melden. 4. Einen Sensor im Karten-Editor eintragen: Dieser gewinnt, die Markierung „automatisch“ verschwindet für dieses Feld. 5. Option in der Integration ausschalten: Die Karte zeigt wieder nur die selbst eingetragenen Sensoren. | offen |

## Hinweis zu Version 0.0.1

Auch die Funktionen aus Version 0.0.1 (Energiefluss, PV-Vergleich mit Solcast, Speicher, Strompreis, Verlauf, Versionsanzeige) sind noch **nicht** an einer echten Anlage bestätigt. Sie waren schon in 0.0.1 sichtbar und bleiben es. Sie stehen hier nicht als experimentell, bis über ihren Status entschieden ist; die README nennt sie weiterhin offen als ungeprüft.

## Geprüft (Historie)

| Funktion | Geprüft am | In Version | Bestätigt von |
|---|---|---|---|
| – | – | – | – |
