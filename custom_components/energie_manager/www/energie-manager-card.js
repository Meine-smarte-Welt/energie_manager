// SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 56db6165ebe79fef2777b535a80cb4e66df27b50431e69b34987f85e01acb174
const CARD_VERSION = "0.0.1";
const CARD_TAG = "energie-manager-card";
const EDITOR_TAG = "energie-manager-card-editor";
const DOMAIN = "energie_manager";
const REPO_URL = "https://github.com/meine-smarte-welt/energie_manager";
const RELEASES_URL = REPO_URL + "/releases";

// ---------- Kategorien (Tabs): an einer Stelle gepflegt ----------
const TAB_ORDER = ["flow", "pv", "battery", "price", "history", "bridge"];
const TAB_META = {
  flow: { icon: "mdi:flash", label: "tab_flow" },
  pv: { icon: "mdi:solar-power", label: "tab_pv" },
  battery: { icon: "mdi:battery-70", label: "tab_battery" },
  price: { icon: "mdi:currency-eur", label: "tab_price" },
  history: { icon: "mdi:chart-bar", label: "tab_history" },
  bridge: { icon: "mdi:cog", label: "tab_bridge" },
};
const CATEGORY_ICON_COLOR_KEYS = Object.fromEntries(TAB_ORDER.map((k) => [k, `color_icon_${k}`]));

const PV_MAX = 4;
const CONSUMER_MAX = 3;
const LOAD_TTL = { today: 60000, pv: 120000, history: 600000 };

// ---------- Sensor-Schlüssel ----------
const FLOW_KEYS = [
  "grid_power", "grid_import_power", "grid_export_power", "home_power", "pv_power",
  "battery_power", "battery_soc", "consumer1_power", "consumer2_power", "consumer3_power",
];
const ENERGY_KEYS = [
  "energy_pv", "energy_import", "energy_export", "energy_home",
  "energy_battery_charge", "energy_battery_discharge",
];
const PRICE_KEYS = ["price_current", "price_min", "price_avg", "price_max", "price_level", "feed_in_tariff"];
const PV_FIELDS = ["power", "energy_today", "forecast", "forecast_tomorrow", "forecast_now"];

function allEntityKeys() {
  const keys = [...FLOW_KEYS, ...ENERGY_KEYS, ...PRICE_KEYS];
  for (let i = 1; i <= PV_MAX; i++) PV_FIELDS.forEach((f) => keys.push(`pv${i}_${f}`));
  return keys;
}

// ---------- Farben ----------
const COLOR_CONFIG_KEYS = {
  tab_active: { cssVar: "--em-color-tab-active", fallback: "var(--primary-color, #03a9f4)" },
  success: { cssVar: "--em-color-success", fallback: "var(--success-color, #43a047)" },
  warning: { cssVar: "--em-color-warning", fallback: "var(--warning-color, #ff9800)" },
  error: { cssVar: "--em-color-error", fallback: "var(--error-color, #db4437)" },
  info: { cssVar: "--em-color-info", fallback: "var(--info-color, #039be5)" },
  row_icon: { cssVar: "--em-color-row-icon", fallback: "var(--secondary-text-color, #727272)" },
  live_banner: { cssVar: "--em-color-live-banner", fallback: "var(--state-icon-active-color, #03a9f4)" },
  pv: { cssVar: "--em-color-pv", fallback: "var(--energy-solar-color, #ff9800)" },
  grid_import: { cssVar: "--em-color-grid-import", fallback: "var(--energy-grid-consumption-color, #488fc2)" },
  grid_export: { cssVar: "--em-color-grid-export", fallback: "var(--energy-grid-return-color, #8353d1)" },
  battery: { cssVar: "--em-color-battery", fallback: "var(--energy-battery-in-color, #4db6ac)" },
  home: { cssVar: "--em-color-home", fallback: "var(--primary-color, #03a9f4)" },
  forecast: { cssVar: "--em-color-forecast", fallback: "var(--secondary-text-color, #727272)" },
};
const SAFE_COLOR_RE = /^[a-zA-Z0-9#(),.%\-\s]+$/; // verwirft ; { } < > Anführungszeichen
function sanitizeColor(v) {
  const t = String(v || "").trim();
  return t && SAFE_COLOR_RE.test(t) ? t : "";
}

// ---------- Texte (de, en, nl) ----------
const I18N = {
  de: {
    tab_flow: "Energiefluss", tab_pv: "PV-Erzeugung", tab_battery: "Speicher",
    tab_price: "Strompreis", tab_history: "Verlauf", tab_bridge: "Einstellungen",
    node_pv: "PV", node_grid: "Netz", node_home: "Haus", node_battery: "Speicher",
    flow_import: "Bezug", flow_export: "Einspeisung", flow_charging: "Lädt",
    flow_discharging: "Entlädt", flow_idle: "Ruhe",
    stat_pv: "PV heute", stat_import: "Bezug heute", stat_export: "Einspeisung heute",
    stat_home: "Verbrauch heute", stat_autarky: "Autarkie", stat_selfuse: "Eigenverbrauch",
    stat_pv_actual: "Erzeugt bis jetzt", stat_pv_forecast: "Prognose bis jetzt", stat_pv_dev: "Abweichung",
    loading: "Lade …", refresh: "Aktualisieren", close: "Schließen",
    no_sensors: "Noch keine Sensoren ausgewählt. Öffne den Karten-Editor und wähle deine Sensoren aus.",
    err_backend: "Die Integration „Energie Manager“ antwortet nicht. Ist sie eingerichtet und Home Assistant neu gestartet?",
    err_recorder: "Der Recorder ist nicht verfügbar. Langzeitwerte können nicht geladen werden.",
    err_load: "Laden fehlgeschlagen: {e}",
    warn_stats: "Keine Langzeitstatistik für: {list}. Der Sensor braucht eine state_class (measurement oder total_increasing).",
    warn_forecast_attr: "Am Prognose-Sensor fehlen die Detaildaten (detailedForecast): Der Stundenverlauf der Prognose bleibt leer.",
    pv_total: "Gesamt", pv_array: "Anlage {n}", pv_none: "Keine PV-Anlage ausgewählt.",
    pv_actual: "Erzeugt heute", pv_forecast_day: "Prognose heute", pv_forecast_now: "Prognose bis jetzt",
    pv_actual_now: "Erzeugt bis jetzt", pv_deviation: "Abweichung zur Prognose",
    pv_tomorrow: "Prognose morgen", pv_power: "Leistung jetzt", pv_forecast_power: "Prognose-Leistung jetzt",
    pv_chart: "Verlauf heute in kW", legend_actual: "Tatsächlich", legend_forecast: "Prognose",
    battery_none: "Kein Speicher ausgewählt.", battery_soc: "Ladestand", battery_power: "Leistung",
    battery_capacity: "Kapazität", battery_content: "Aktueller Inhalt",
    battery_eta_full: "Voll in ca. {t}", battery_eta_empty: "Leer in ca. {t}",
    battery_charged: "Geladen heute", battery_discharged: "Entladen heute",
    price_none: "Kein Preissensor ausgewählt. Es funktioniert jeder Preissensor (zum Beispiel Tibber, aWATTar oder Nord Pool).",
    price_current: "Aktueller Preis", price_min: "Niedrigster Preis", price_avg: "Durchschnitt", price_max: "Höchster Preis",
    price_level: "Preisstufe", level_cheap: "Günstig", level_normal: "Mittel", level_expensive: "Teuer",
    price_cost: "Netzbezug kostet jetzt", price_revenue: "Einspeisung bringt jetzt", price_per_hour: "{v} pro Stunde",
    price_feed_in: "Einspeisevergütung",
    hist_none: "Keine Energie-Zähler ausgewählt. Wähle im Karten-Editor unter „Energie-Zähler“ mindestens einen Zähler.",
    hist_months: "{n} Monate", hist_pv: "PV", hist_import: "Bezug", hist_export: "Einspeisung",
    hist_home: "Verbrauch", hist_autarky: "Autarkie", hist_selfuse: "Eigenverbrauch",
    hist_chart: "Monatswerte", hist_calculated: "Verbrauch aus der Energiebilanz berechnet",
    acc_version: "App-Version", acc_status: "Status", acc_sensors: "Sensoren", acc_options: "Optionen",
    acc_maintenance: "Wartung", acc_events: "Ereignisse",
    v_integration: "Integration", v_card: "Karte", v_latest: "Neueste Version", v_checked: "Zuletzt geprüft",
    v_never: "noch nie", v_check_now: "Jetzt prüfen", v_release: "Release ansehen",
    v_up_to_date: "Aktuell", v_check_failed: "Prüfung nicht möglich",
    v_update: "Neue Version {v} verfügbar. Aktualisiere über HACS und starte Home Assistant neu. Danach Browser neu laden (Strg+F5).",
    v_mismatch: "Karte ({c}) und Integration ({i}) haben unterschiedliche Versionen. Browser neu laden (Strg+F5).",
    st_backend: "Integration", st_recorder: "Recorder", st_ok: "OK", st_error: "Nicht erreichbar",
    st_unknown: "Unbekannt", st_selected: "Sensoren ausgewählt", st_unavailable: "nicht verfügbar",
    st_missing: "nicht gefunden",
    opt_text: "Die Sensoren und die Darstellung änderst du im Karten-Editor (Stift im Dashboard). Optionen der Integration findest du unter Einstellungen > Geräte & Dienste > Energie Manager > Konfigurieren.",
    btn_clear_cache: "Zwischenspeicher leeren", btn_confirm: "Wirklich?", btn_reload: "Alle Werte neu laden",
    toast_cache: "Zwischenspeicher geleert", toast_checked: "Update-Prüfung abgeschlossen",
    toast_reloaded: "Werte werden neu geladen", toast_err: "Fehler: {e}",
    readonly_hint: "Schreibgeschützt: Aktionen sind ausgeblendet.",
    ev_none: "Noch keine Ereignisse.", ev_loaded: "{k} geladen", ev_error: "{k}: {e}",
    popup_info: "Informationen", popup_forecast: "Prognose", popup_sensors: "Sensoren",
    m_name: "Name", m_power: "Leistung", m_energy: "Energie heute", m_month: "Monat",
    unit_none: "–",
  },
  en: {
    tab_flow: "Energy flow", tab_pv: "PV generation", tab_battery: "Battery",
    tab_price: "Electricity price", tab_history: "History", tab_bridge: "Settings",
    node_pv: "PV", node_grid: "Grid", node_home: "Home", node_battery: "Battery",
    flow_import: "Import", flow_export: "Export", flow_charging: "Charging",
    flow_discharging: "Discharging", flow_idle: "Idle",
    stat_pv: "PV today", stat_import: "Import today", stat_export: "Export today",
    stat_home: "Usage today", stat_autarky: "Self-sufficiency", stat_selfuse: "Self-consumption",
    stat_pv_actual: "Generated so far", stat_pv_forecast: "Forecast so far", stat_pv_dev: "Deviation",
    loading: "Loading …", refresh: "Refresh", close: "Close",
    no_sensors: "No sensors selected yet. Open the card editor and pick your sensors.",
    err_backend: "The \"Energy Manager\" integration does not respond. Is it set up and has Home Assistant been restarted?",
    err_recorder: "The recorder is not available. Long-term values cannot be loaded.",
    err_load: "Loading failed: {e}",
    warn_stats: "No long-term statistics for: {list}. The sensor needs a state_class (measurement or total_increasing).",
    warn_forecast_attr: "The forecast sensor has no detail data (detailedForecast): the hourly forecast curve stays empty.",
    pv_total: "Total", pv_array: "Array {n}", pv_none: "No PV array selected.",
    pv_actual: "Generated today", pv_forecast_day: "Forecast today", pv_forecast_now: "Forecast so far",
    pv_actual_now: "Generated so far", pv_deviation: "Deviation from forecast",
    pv_tomorrow: "Forecast tomorrow", pv_power: "Power now", pv_forecast_power: "Forecast power now",
    pv_chart: "Today in kW", legend_actual: "Actual", legend_forecast: "Forecast",
    battery_none: "No battery selected.", battery_soc: "State of charge", battery_power: "Power",
    battery_capacity: "Capacity", battery_content: "Current content",
    battery_eta_full: "Full in approx. {t}", battery_eta_empty: "Empty in approx. {t}",
    battery_charged: "Charged today", battery_discharged: "Discharged today",
    price_none: "No price sensor selected. Any price sensor works (for example Tibber, aWATTar or Nord Pool).",
    price_current: "Current price", price_min: "Lowest price", price_avg: "Average", price_max: "Highest price",
    price_level: "Price level", level_cheap: "Cheap", level_normal: "Medium", level_expensive: "Expensive",
    price_cost: "Grid import costs now", price_revenue: "Export earns now", price_per_hour: "{v} per hour",
    price_feed_in: "Feed-in tariff",
    hist_none: "No energy meters selected. In the card editor, pick at least one meter under \"Energy meters\".",
    hist_months: "{n} months", hist_pv: "PV", hist_import: "Import", hist_export: "Export",
    hist_home: "Usage", hist_autarky: "Self-sufficiency", hist_selfuse: "Self-consumption",
    hist_chart: "Monthly values", hist_calculated: "Usage calculated from the energy balance",
    acc_version: "App version", acc_status: "Status", acc_sensors: "Sensors", acc_options: "Options",
    acc_maintenance: "Maintenance", acc_events: "Events",
    v_integration: "Integration", v_card: "Card", v_latest: "Latest version", v_checked: "Last checked",
    v_never: "never", v_check_now: "Check now", v_release: "View release",
    v_up_to_date: "Up to date", v_check_failed: "Check not possible",
    v_update: "New version {v} available. Update via HACS and restart Home Assistant. Then reload the browser (Ctrl+F5).",
    v_mismatch: "Card ({c}) and integration ({i}) have different versions. Reload the browser (Ctrl+F5).",
    st_backend: "Integration", st_recorder: "Recorder", st_ok: "OK", st_error: "Not reachable",
    st_unknown: "Unknown", st_selected: "sensors selected", st_unavailable: "unavailable",
    st_missing: "not found",
    opt_text: "Change sensors and appearance in the card editor (pencil in the dashboard). Integration options: Settings > Devices & services > Energy Manager > Configure.",
    btn_clear_cache: "Clear cache", btn_confirm: "Really?", btn_reload: "Reload all values",
    toast_cache: "Cache cleared", toast_checked: "Update check finished",
    toast_reloaded: "Reloading values", toast_err: "Error: {e}",
    readonly_hint: "Read-only: actions are hidden.",
    ev_none: "No events yet.", ev_loaded: "{k} loaded", ev_error: "{k}: {e}",
    popup_info: "Information", popup_forecast: "Forecast", popup_sensors: "Sensors",
    m_name: "Name", m_power: "Power", m_energy: "Energy today", m_month: "Month",
    unit_none: "–",
  },
  nl: {
    tab_flow: "Energiestroom", tab_pv: "PV-opwekking", tab_battery: "Batterij",
    tab_price: "Stroomprijs", tab_history: "Verloop", tab_bridge: "Instellingen",
    node_pv: "PV", node_grid: "Net", node_home: "Huis", node_battery: "Batterij",
    flow_import: "Afname", flow_export: "Teruglevering", flow_charging: "Laadt",
    flow_discharging: "Ontlaadt", flow_idle: "Rust",
    stat_pv: "PV vandaag", stat_import: "Afname vandaag", stat_export: "Teruglevering vandaag",
    stat_home: "Verbruik vandaag", stat_autarky: "Zelfvoorziening", stat_selfuse: "Eigen verbruik",
    stat_pv_actual: "Opgewekt tot nu", stat_pv_forecast: "Prognose tot nu", stat_pv_dev: "Afwijking",
    loading: "Laden …", refresh: "Vernieuwen", close: "Sluiten",
    no_sensors: "Nog geen sensoren gekozen. Open de kaarteditor en kies je sensoren.",
    err_backend: "De integratie \"Energie Manager\" reageert niet. Is ze ingesteld en is Home Assistant herstart?",
    err_recorder: "De recorder is niet beschikbaar. Langetermijnwaarden kunnen niet worden geladen.",
    err_load: "Laden mislukt: {e}",
    warn_stats: "Geen langetermijnstatistieken voor: {list}. De sensor heeft een state_class nodig (measurement of total_increasing).",
    warn_forecast_attr: "De prognosesensor heeft geen detailgegevens (detailedForecast): het uurverloop van de prognose blijft leeg.",
    pv_total: "Totaal", pv_array: "Installatie {n}", pv_none: "Geen PV-installatie gekozen.",
    pv_actual: "Opgewekt vandaag", pv_forecast_day: "Prognose vandaag", pv_forecast_now: "Prognose tot nu",
    pv_actual_now: "Opgewekt tot nu", pv_deviation: "Afwijking van de prognose",
    pv_tomorrow: "Prognose morgen", pv_power: "Vermogen nu", pv_forecast_power: "Prognosevermogen nu",
    pv_chart: "Vandaag in kW", legend_actual: "Werkelijk", legend_forecast: "Prognose",
    battery_none: "Geen batterij gekozen.", battery_soc: "Laadstand", battery_power: "Vermogen",
    battery_capacity: "Capaciteit", battery_content: "Huidige inhoud",
    battery_eta_full: "Vol over ca. {t}", battery_eta_empty: "Leeg over ca. {t}",
    battery_charged: "Geladen vandaag", battery_discharged: "Ontladen vandaag",
    price_none: "Geen prijssensor gekozen. Elke prijssensor werkt (bijvoorbeeld Tibber, aWATTar of Nord Pool).",
    price_current: "Huidige prijs", price_min: "Laagste prijs", price_avg: "Gemiddelde", price_max: "Hoogste prijs",
    price_level: "Prijsniveau", level_cheap: "Goedkoop", level_normal: "Gemiddeld", level_expensive: "Duur",
    price_cost: "Afname kost nu", price_revenue: "Teruglevering levert nu", price_per_hour: "{v} per uur",
    price_feed_in: "Terugleververgoeding",
    hist_none: "Geen energiemeters gekozen. Kies in de kaarteditor onder \"Energiemeters\" minstens één meter.",
    hist_months: "{n} maanden", hist_pv: "PV", hist_import: "Afname", hist_export: "Teruglevering",
    hist_home: "Verbruik", hist_autarky: "Zelfvoorziening", hist_selfuse: "Eigen verbruik",
    hist_chart: "Maandwaarden", hist_calculated: "Verbruik berekend uit de energiebalans",
    acc_version: "App-versie", acc_status: "Status", acc_sensors: "Sensoren", acc_options: "Opties",
    acc_maintenance: "Onderhoud", acc_events: "Gebeurtenissen",
    v_integration: "Integratie", v_card: "Kaart", v_latest: "Nieuwste versie", v_checked: "Laatst gecontroleerd",
    v_never: "nog nooit", v_check_now: "Nu controleren", v_release: "Release bekijken",
    v_up_to_date: "Actueel", v_check_failed: "Controle niet mogelijk",
    v_update: "Nieuwe versie {v} beschikbaar. Werk bij via HACS en herstart Home Assistant. Laad daarna de browser opnieuw (Ctrl+F5).",
    v_mismatch: "Kaart ({c}) en integratie ({i}) hebben verschillende versies. Laad de browser opnieuw (Ctrl+F5).",
    st_backend: "Integratie", st_recorder: "Recorder", st_ok: "OK", st_error: "Niet bereikbaar",
    st_unknown: "Onbekend", st_selected: "sensoren gekozen", st_unavailable: "niet beschikbaar",
    st_missing: "niet gevonden",
    opt_text: "Sensoren en weergave wijzig je in de kaarteditor (potlood in het dashboard). Opties van de integratie: Instellingen > Apparaten & diensten > Energie Manager > Configureren.",
    btn_clear_cache: "Cache legen", btn_confirm: "Echt?", btn_reload: "Alle waarden opnieuw laden",
    toast_cache: "Cache geleegd", toast_checked: "Updatecontrole afgerond",
    toast_reloaded: "Waarden worden opnieuw geladen", toast_err: "Fout: {e}",
    readonly_hint: "Alleen-lezen: acties zijn verborgen.",
    ev_none: "Nog geen gebeurtenissen.", ev_loaded: "{k} geladen", ev_error: "{k}: {e}",
    popup_info: "Informatie", popup_forecast: "Prognose", popup_sensors: "Sensoren",
    m_name: "Naam", m_power: "Vermogen", m_energy: "Energie vandaag", m_month: "Maand",
    unit_none: "–",
  },
};

// ---------- Hilfsfunktionen ----------
function esc(v) {
  return String(v == null ? "" : v).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}
function num(v, d) {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : d;
}
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function isSet(v) { return typeof v === "string" && v.trim() !== ""; }

const DEFAULTS = {
  title: "Energie Manager", show_title: true,
  show_flow: true, show_pv: true, show_battery: true, show_price: true, show_history: true, show_bridge: true,
  default_tab: "flow", zoom: 100, show_stats: true, history_months: 6, flow_threshold: 10,
  read_only: false, pv_count: 2, grid_invert: false, battery_invert: false,
};

function normalizeConfig(raw) {
  const cfg = Object.assign({}, DEFAULTS, raw || {});
  cfg.zoom = clamp(num(cfg.zoom, 100), 50, 200);
  cfg.pv_count = clamp(Math.round(num(cfg.pv_count, 2)), 1, PV_MAX);
  cfg.history_months = clamp(Math.round(num(cfg.history_months, 6)), 1, 36);
  cfg.flow_threshold = clamp(num(cfg.flow_threshold, 10), 0, 1000);
  if (typeof cfg.title !== "string") cfg.title = DEFAULTS.title;
  return cfg;
}

function visibleTabs(cfg) {
  const tabs = TAB_ORDER.filter((k) => cfg[`show_${k}`] !== false);
  return tabs.length ? tabs : [TAB_ORDER[0]];
}

// Verbrauchsrechnung des Energieflusses. Alle Eingaben in Watt, Vorzeichen:
// Netz positiv = Bezug, Speicher positiv = Entladen. Gibt für jeden Knoten Betrag und Richtung zurück.
function computeFlow(inp) {
  const thr = inp.threshold == null ? 10 : inp.threshold;
  let grid = inp.grid;
  if (grid == null && (inp.gridImport != null || inp.gridExport != null)) {
    grid = (inp.gridImport || 0) - (inp.gridExport || 0);
  }
  if (grid != null && inp.gridInvert) grid = -grid;
  let battery = inp.battery;
  if (battery != null && inp.batteryInvert) battery = -battery;
  const pv = inp.pv == null ? null : Math.max(0, inp.pv);
  let home = inp.home;
  if (home == null) {
    home = Math.max(0, (pv || 0) + (grid || 0) + (battery || 0));
  } else {
    home = Math.max(0, home);
  }
  const consumers = (inp.consumers || []).map((c) => (c == null ? null : Math.max(0, c)));
  const dir = (v, pos, neg) => (v == null || Math.abs(v) < thr ? "idle" : v > 0 ? pos : neg);
  return {
    pv,
    grid,
    battery,
    home,
    consumers,
    pvActive: pv != null && pv >= thr,
    gridDir: dir(grid, "import", "export"),
    batteryDir: dir(battery, "discharge", "charge"),
    consumerActive: consumers.map((c) => c != null && c >= thr),
  };
}

// Einheiten umrechnen
function toWatt(value, unit) {
  const u = String(unit || "").trim().toLowerCase();
  if (u === "kw") return value * 1000;
  if (u === "mw") return value * 1000000;
  return value;
}
function toKwh(value, unit) {
  const u = String(unit || "").trim().toLowerCase();
  if (u === "wh") return value / 1000;
  if (u === "mwh") return value * 1000;
  return value;
}
// Preis in Währung je kWh (ct/kWh wird durch 100 geteilt)
function toCurrencyPerKwh(value, unit) {
  const u = String(unit || "").toLowerCase();
  if (u.startsWith("ct") || u.startsWith("cent") || u.startsWith("c/")) return value / 100;
  return value;
}

function niceMax(v) {
  const steps = [0.5, 1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 40, 50, 60, 80, 100, 150, 200, 300, 400, 500, 800, 1000, 1500, 2000, 3000, 5000, 10000];
  for (const s of steps) if (v <= s) return s;
  return Math.ceil(v / 1000) * 1000;
}

function fmtDuration(hours, lang) {
  if (!Number.isFinite(hours) || hours <= 0) return "";
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const hs = lang === "nl" ? "u" : "h";
  return h > 0 ? `${h} ${hs} ${m} min` : `${m} min`;
}

// ---------- Stile ----------
function buildCss() {
  const vars = Object.entries(COLOR_CONFIG_KEYS)
    .map(([k, m]) => `--em-c-${k.replace(/_/g, "-")}: var(${m.cssVar}, ${m.fallback});`)
    .join("");
  return `
:host{display:block}
ha-card{${vars}overflow:hidden}
.wrap{container-name:em;container-type:inline-size}
.zoom{padding-bottom:12px}
.hdr{padding:16px 16px 4px;font-size:var(--ha-card-header-font-size,24px);line-height:1.2;color:var(--ha-card-header-color,var(--primary-text-color))}
.banner{display:flex;align-items:center;gap:8px;margin:8px 12px 0;padding:8px 12px;border-radius:8px;font-size:13px;border:1px solid var(--c);color:var(--c);background:color-mix(in srgb,var(--c) 10%,transparent)}
.banner.err{--c:var(--em-c-error)}.banner.warn{--c:var(--em-c-warning)}.banner.live{--c:var(--em-c-live-banner)}
.banner span{color:var(--primary-text-color)}
.tabs{display:flex;gap:2px;padding:4px 8px 0;border-bottom:1px solid var(--divider-color);overflow-x:auto}
.tab{flex:1;min-width:0;position:relative;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 6px;cursor:pointer;background:none;border:none;border-bottom:2px solid transparent;color:var(--secondary-text-color);font:inherit;font-size:14px}
.tab ha-icon{--mdc-icon-size:20px;color:var(--ic,inherit)}
.tab.active{color:var(--em-c-tab-active);border-bottom-color:var(--em-c-tab-active)}
.tab .lbl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.badge{min-width:16px;height:16px;padding:0 4px;border-radius:8px;font-size:11px;line-height:16px;text-align:center;color:#fff;background:var(--em-c-warning)}
@container em (max-width:480px){.tab .lbl{display:none}}
.chips{display:flex;flex-wrap:wrap;gap:8px;padding:12px 12px 0}
.chip{flex:1 1 90px;min-width:0;padding:8px 10px;border-radius:10px;border:1px solid var(--divider-color)}
.chip .cl{display:block;font-size:11px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip .cv{display:block;font-size:16px;font-weight:600;margin-top:2px;color:var(--c,var(--primary-text-color))}
.empty{padding:24px 16px;text-align:center;color:var(--secondary-text-color);font-size:14px}
.flow{position:relative;margin:12px 12px 28px;aspect-ratio:360/280}
.flow svg{position:absolute;inset:0;width:100%;height:100%}
.line{fill:none;stroke:var(--c);stroke-width:2;stroke-dasharray:5 5;opacity:.25;vector-effect:non-scaling-stroke}
.line.active{opacity:1;animation:dash 1s linear infinite}
@keyframes dash{to{stroke-dashoffset:-20}}
@media (prefers-reduced-motion:reduce){.line.active{animation:none}}
.node{position:absolute;width:18%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;border:3px solid var(--c);box-sizing:border-box;background:var(--card-background-color,#fff);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;line-height:1.15}
.node ha-icon{--mdc-icon-size:clamp(14px,5cqw,22px);color:var(--c)}
.node .nv{font-size:clamp(9px,2.9cqw,14px);font-weight:600}
.node .ns{font-size:clamp(8px,2.3cqw,11px);color:var(--secondary-text-color)}
.node .nl{position:absolute;top:100%;margin-top:3px;font-size:clamp(9px,2.5cqw,12px);color:var(--secondary-text-color);white-space:nowrap}
.sub{padding:0 16px;color:var(--secondary-text-color);font-size:12px;text-align:center}
.selbar{display:flex;flex-wrap:wrap;gap:6px;padding:12px 12px 0}
.sel{padding:4px 12px;border-radius:14px;border:1px solid var(--divider-color);background:none;color:var(--primary-text-color);font:inherit;font-size:13px;cursor:pointer}
.sel.on{border-color:var(--em-c-tab-active);color:var(--em-c-tab-active);background:color-mix(in srgb,var(--em-c-tab-active) 10%,transparent)}
.panel{margin:12px 12px 0;padding:12px;border:1px solid var(--divider-color);border-radius:10px}
.big{font-size:28px;font-weight:600;line-height:1.1;color:var(--c,var(--primary-text-color))}
.muted{color:var(--secondary-text-color);font-size:12px}
.kv{display:flex;justify-content:space-between;gap:12px;padding:6px 0;font-size:14px;border-top:1px solid var(--divider-color)}
.kv:first-child{border-top:none}
.kv .k{color:var(--secondary-text-color)}.kv .v{font-weight:600;text-align:right}
.bar{position:relative;height:8px;border-radius:4px;background:var(--divider-color);overflow:hidden}
.bar>i{display:block;height:100%;background:var(--c,var(--em-c-pv))}
.bar.small{width:56px}
.barwrap{position:relative}
.mark{position:absolute;top:-3px;width:2px;height:14px;background:var(--primary-text-color);opacity:.6}
.legend{display:flex;gap:14px;font-size:12px;color:var(--secondary-text-color);padding:6px 0 0}
.legend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px;vertical-align:-1px}
.chart{width:100%;height:auto;display:block;margin-top:8px}
.chart text{fill:var(--secondary-text-color);font-size:9px}
.chart .grid{stroke:var(--divider-color);stroke-width:1}
.chart .act{fill:var(--em-c-pv)}
.chart .fc{fill:none;stroke:var(--em-c-forecast);stroke-width:2;stroke-dasharray:4 3}
.chart .now{stroke:var(--em-c-tab-active);stroke-width:1;stroke-dasharray:2 2}
.row{display:flex;align-items:center;gap:12px;padding:10px 16px;border-top:1px solid var(--divider-color);cursor:pointer;background:none;border-left:none;border-right:none;border-bottom:none;width:100%;box-sizing:border-box;color:inherit;font:inherit;text-align:left}
.rows{margin-top:12px}
.row .ico{position:relative;color:var(--ic,var(--em-c-row-icon))}
.row .ico ha-icon{--mdc-icon-size:24px}
.row .dot{position:absolute;right:-2px;bottom:-2px;width:9px;height:9px;border-radius:50%;border:2px solid var(--card-background-color,#fff);background:var(--c)}
.row .main{flex:1;min-width:0}
.row .name{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row .second{font-size:12px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pills{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.pill{border:1px solid var(--c,var(--divider-color));color:var(--c,var(--primary-text-color));border-radius:12px;padding:2px 8px;font-size:12px;white-space:nowrap}
.btn{border-radius:6px;border:1px solid var(--divider-color);background:none;color:var(--primary-text-color);padding:6px 12px;font:inherit;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;text-decoration:none}
.btn.primary{background:var(--em-c-tab-active);border-color:var(--em-c-tab-active);color:#fff}
.btn.danger{border-color:var(--em-c-error);color:var(--em-c-error)}
.btn.small{padding:3px 8px;font-size:12px}
.btn.icon{padding:4px}
.btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.settings{padding:12px 12px 0;display:flex;flex-direction:column;gap:8px}
.settings-accordion{border:1px solid var(--divider-color);border-radius:8px;overflow:hidden}
.settings-accordion.update{border-color:var(--em-c-warning)}
.settings-accordion.danger{border-color:var(--em-c-error)}
.settings-accordion-summary{display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;list-style:none;position:relative;padding-right:34px}
.settings-accordion-summary::-webkit-details-marker{display:none}
.settings-accordion-summary::after{content:"";position:absolute;right:14px;top:50%;width:7px;height:7px;border-right:2px solid var(--secondary-text-color);border-bottom:2px solid var(--secondary-text-color);transform:translateY(-70%) rotate(45deg);transition:transform .15s}
details[open]>.settings-accordion-summary::after{transform:translateY(-30%) rotate(-135deg)}
.settings-accordion-summary ha-icon{--mdc-icon-size:20px;color:var(--secondary-text-color)}
.grow{flex:1;min-width:0;font-weight:500}
.meta{font-size:12px;color:var(--secondary-text-color)}
.settings-accordion-body{padding:4px 12px 12px;border-top:1px solid var(--divider-color)}
.settings-line{display:flex;justify-content:space-between;gap:12px;padding:6px 0;font-size:14px}
.settings-line .lbl{color:var(--secondary-text-color)}
.settings-line .val{font-weight:600;text-align:right;word-break:break-word}
.hint{margin-top:8px;padding:8px 10px;border-radius:8px;font-size:13px;border:1px solid var(--c);background:color-mix(in srgb,var(--c) 10%,transparent)}
.ev{font-size:12px;padding:3px 0;color:var(--secondary-text-color)}
.backdrop{position:fixed;inset:0;z-index:9;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center}
.popup{width:min(440px,94vw);max-height:86vh;overflow:auto;background:var(--card-background-color,#fff);color:var(--primary-text-color);border-radius:12px;outline:none;padding-bottom:12px}
.popup .ph{display:flex;align-items:center;gap:10px;padding:14px 12px 8px}
.popup .ph ha-icon{color:var(--em-c-row-icon)}
.popup .pb{padding:4px 12px;display:flex;flex-direction:column;gap:8px}
.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:10;padding:10px 16px;border-radius:8px;background:var(--primary-text-color);color:var(--card-background-color,#fff);font-size:14px;max-width:90vw}
.toast.err{background:var(--em-c-error);color:#fff}
`;
}

// ---------- Karte ----------
class EnergieManagerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._cfg = null;
    this._hass = null;
    this._lang = "en";
    this._tab = null;
    this._rc = {};
    this._shell = false;
    this._sig = "";
    this._raf = 0;
    this._accState = {};
    this._events = [];
    this._pvSel = "total";
    this._metric = "pv";
    this._months = 6;
    this._popup = null;
    this._confirm = null;
    this._toastTimer = 0;
    this._infoTimer = 0;
    this._info = { value: null, error: null, ts: 0, loading: false };
    this._resetData();
    this._onKey = (e) => {
      if (e.key === "Escape" && this._popup) { this._popup = null; this._queueRender(); }
    };
    this.shadowRoot.addEventListener("click", (e) => this._onClick(e));
    this.shadowRoot.addEventListener("toggle", (e) => {
      const el = e.target;
      if (el && el.dataset && el.dataset.k) this._accState[el.dataset.k] = el.open;
    }, true);
  }

  connectedCallback() { document.addEventListener("keydown", this._onKey); }
  disconnectedCallback() {
    document.removeEventListener("keydown", this._onKey);
    clearTimeout(this._infoTimer);
    clearTimeout(this._toastTimer);
  }

  static getConfigElement() { return document.createElement(EDITOR_TAG); }
  static getStubConfig() { return {}; }
  getCardSize() { return 6; }
  getGridOptions() { return { columns: 12, min_columns: 6, rows: "auto" }; }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    this._cfg = normalizeConfig(config);
    const tabs = visibleTabs(this._cfg);
    if (!this._tab || !tabs.includes(this._tab)) {
      this._tab = tabs.includes(this._cfg.default_tab) ? this._cfg.default_tab : tabs[0];
    }
    this._months = this._cfg.history_months;
    this._tracked = this._trackedIds();
    this._resetData();
    this._buildShell();
    this._sig = "";
    this._queueRender();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    const lang = String((hass && (hass.language || (hass.locale && hass.locale.language))) || "en").slice(0, 2).toLowerCase();
    this._lang = I18N[lang] ? lang : "en";
    if (first) this._infoTimer = setTimeout(() => this._loadInfo(false), 1500);
    const sig = this._signature();
    if (sig !== this._sig) { this._sig = sig; this._queueRender(); }
  }
  get hass() { return this._hass; }

  // ----- Daten -----
  _resetData() {
    const fresh = () => ({ value: null, error: null, ts: 0, loading: false, skipped: false });
    this._data = { today: fresh(), pv: fresh(), history: fresh() };
  }

  _trackedIds() {
    const ids = [];
    allEntityKeys().forEach((k) => { if (isSet(this._cfg[k])) ids.push(this._cfg[k].trim()); });
    return ids;
  }

  _signature() {
    if (!this._hass || !this._tracked) return this._lang;
    const st = this._hass.states;
    let s = this._lang + "|";
    for (const id of this._tracked) {
      const x = st[id];
      s += id + "=" + (x ? x.state + "@" + x.last_updated : "?") + ";";
    }
    return s;
  }

  _entities(kind) {
    const c = this._cfg;
    const out = {};
    if (kind === "today" || kind === "history") {
      ENERGY_KEYS.forEach((k) => { if (isSet(c[k])) out[k] = c[k].trim(); });
    } else if (kind === "pv") {
      for (let i = 1; i <= c.pv_count; i++) {
        ["power", "forecast"].forEach((f) => { const k = `pv${i}_${f}`; if (isSet(c[k])) out[k] = c[k].trim(); });
      }
    }
    return out;
  }

  _payload(kind) {
    const entities = this._entities(kind);
    if (!Object.keys(entities).length) return null;
    const msg = { type: `${DOMAIN}/category`, category: kind, entities };
    if (kind === "history") msg.months = this._months;
    if (kind === "pv") {
      const sites = {};
      for (let i = 1; i <= this._cfg.pv_count; i++) {
        const s = this._cfg[`pv${i}_forecast_site`];
        if (isSet(s)) sites[String(i)] = s.trim();
      }
      msg.sites = sites;
    }
    return msg;
  }

  _errText(err) {
    const code = err && err.code;
    if (code === "unknown_command" || code === "not_found") return this._t("err_backend");
    if (code === "recorder_unavailable") return this._t("err_recorder");
    return this._t("err_load", { e: (err && err.message) || String(err) });
  }

  async _load(kind, force) {
    const e = this._data[kind];
    if (!this._hass || e.loading) return;
    if (!force && e.ts && Date.now() - e.ts < LOAD_TTL[kind]) return;
    const payload = this._payload(kind);
    if (!payload) { e.skipped = true; e.ts = Date.now(); return; }
    e.loading = true;
    e.skipped = false;
    this._queueRender();
    try {
      e.value = await this._hass.connection.sendMessagePromise(payload);
      e.error = null;
      this._log("ev_loaded", { k: kind });
    } catch (err) {
      e.error = this._errText(err);
      this._log("ev_error", { k: kind, e: e.error });
    }
    e.ts = Date.now();
    e.loading = false;
    this._queueRender();
  }

  async _loadInfo(force) {
    const i = this._info;
    if (!this._hass || i.loading) return;
    if (!force && i.ts && Date.now() - i.ts < 60000) return;
    i.loading = true;
    try {
      i.value = await this._hass.connection.sendMessagePromise({ type: `${DOMAIN}/info` });
      i.error = null;
    } catch (err) {
      i.error = this._errText(err);
    }
    i.ts = Date.now();
    i.loading = false;
    this._queueRender();
  }

  _maybeLoad(tab) {
    // Daten einer Kategorie werden erst geladen, wenn ihr Tab geöffnet wird.
    if (tab === "flow" && this._cfg.show_stats) this._load("today", false);
    else if (tab === "pv") this._load("pv", false);
    else if (tab === "battery") this._load("today", false);
    else if (tab === "history") this._load("history", false);
    else if (tab === "bridge") this._loadInfo(false);
  }

  _log(key, vars) {
    this._events.unshift({ ts: new Date(), text: this._t(key, vars) });
    if (this._events.length > 30) this._events.length = 30;
  }

  // ----- Texte und Formate -----
  _t(key, vars) {
    const dict = I18N[this._lang] || I18N.en;
    let s = dict[key];
    if (s == null) s = I18N.en[key];
    if (s == null) s = key;
    if (vars) Object.keys(vars).forEach((k) => { s = s.split(`{${k}}`).join(String(vars[k])); });
    return s;
  }
  _fmt(n, d) {
    return Number(n).toLocaleString(this._lang, { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  _power(w) {
    if (w == null) return "–";
    return Math.abs(w) >= 1000 ? `${this._fmt(w / 1000, 2)} kW` : `${this._fmt(w, 0)} W`;
  }
  _kwh(v) { return v == null ? "–" : `${this._fmt(v, Math.abs(v) >= 100 ? 0 : 1)} kWh`; }
  _pct(v, d) { return v == null ? "–" : `${this._fmt(v, d == null ? 0 : d)} %`; }
  _date(iso) {
    if (!iso) return this._t("v_never");
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? this._t("v_never") : d.toLocaleString(this._lang);
  }
  _monthLabel(key) {
    const [y, m] = String(key).split("-").map(Number);
    return new Date(y, (m || 1) - 1, 1).toLocaleDateString(this._lang, { month: "short", year: "numeric" });
  }

  // ----- Zustände lesen -----
  _st(id) { return isSet(id) && this._hass ? this._hass.states[id.trim()] : undefined; }
  _numState(id) {
    const s = this._st(id);
    if (!s) return null;
    const v = parseFloat(s.state);
    return Number.isFinite(v) ? v : null;
  }
  _unit(id) { const s = this._st(id); return s && s.attributes ? s.attributes.unit_of_measurement : ""; }
  _watt(id) { const v = this._numState(id); return v == null ? null : toWatt(v, this._unit(id)); }
  _energy(id) { const v = this._numState(id); return v == null ? null : toKwh(v, this._unit(id)); }
  _siteValue(id, site) {
    const s = this._st(id);
    if (!s || !s.attributes) return null;
    const v = parseFloat(s.attributes[`estimate_${site}`]);
    return Number.isFinite(v) ? v : null;
  }

  _pvArrays() {
    const c = this._cfg;
    const out = [];
    for (let i = 1; i <= c.pv_count; i++) {
      const k = (f) => c[`pv${i}_${f}`];
      const site = isSet(k("forecast_site")) ? k("forecast_site").trim().replace(/-/g, "_") : "";
      const configured = PV_FIELDS.some((f) => isSet(k(f)));
      const forecastToday = site ? this._siteValue(k("forecast"), site) : this._energy(k("forecast"));
      const forecastTomorrow = site ? this._siteValue(k("forecast_tomorrow"), site) : this._energy(k("forecast_tomorrow"));
      out.push({
        i, configured, site,
        name: isSet(k("name")) ? k("name").trim() : this._t("pv_array", { n: i }),
        power: this._watt(k("power")),
        energyToday: this._energy(k("energy_today")),
        forecastToday, forecastTomorrow,
        forecastNow: this._watt(k("forecast_now")),
      });
    }
    return out;
  }

  _colorStyle() {
    let s = "";
    for (const [k, m] of Object.entries(COLOR_CONFIG_KEYS)) {
      const v = sanitizeColor(this._cfg[`color_${k}`]);
      if (v) s += `${m.cssVar}:${v};`;
    }
    return s;
  }

  _iconColor(tab) {
    const v = sanitizeColor(this._cfg.color_row_icon) || sanitizeColor(this._cfg[CATEGORY_ICON_COLOR_KEYS[tab]]);
    return v ? `--ic:${v};` : "";
  }

  // ----- Zeichnen -----
  _buildShell() {
    const zoom = this._cfg.zoom / 100;
    this.shadowRoot.innerHTML = `<style>${buildCss()}</style>
<ha-card style="${this._colorStyle()}"><div class="wrap"><div class="zoom" style="zoom:${zoom}">
<div id="hdr"></div><div id="banner"></div><div id="tabs"></div><div id="stats"></div><div id="content"></div>
</div></div></ha-card><div id="popup"></div><div id="toast"></div>`;
    this._rc = {};
    this._shell = true;
  }

  _set(id, html) {
    if (this._rc[id] === html) return;
    this._rc[id] = html;
    const el = this.shadowRoot.getElementById(id);
    if (el) el.innerHTML = html;
  }

  _queueRender() {
    if (this._raf) return;
    const run = () => { this._raf = 0; this._render(); };
    this._raf = typeof requestAnimationFrame === "function" ? requestAnimationFrame(run) : setTimeout(run, 16);
  }

  _render() {
    if (!this._cfg || !this._hass || !this._shell) return;
    const tabs = visibleTabs(this._cfg);
    if (!tabs.includes(this._tab)) this._tab = tabs[0];
    this._maybeLoad(this._tab);
    const c = this._cfg;
    this._set("hdr", c.show_title && c.title ? `<div class="hdr">${esc(c.title)}</div>` : "");
    this._set("banner", this._bannerHtml());
    this._set("tabs", tabs.length > 1 ? this._tabsHtml(tabs) : "");
    this._set("stats", c.show_stats ? this._statsHtml() : "");
    this._set("content", this._contentHtml());
    const wasOpen = !!this._rc.popup;
    this._set("popup", this._popupHtml());
    if (!wasOpen && this._rc.popup) {
      const p = this.shadowRoot.querySelector(".popup");
      if (p) p.focus();
    }
  }

  _hasMismatch() {
    const v = this._info.value;
    return !!(v && v.version && v.version !== CARD_VERSION);
  }

  _bannerHtml() {
    const parts = [];
    const tab = this._tab;
    const kinds = tab === "pv" ? ["pv"] : tab === "history" ? ["history"] : tab === "flow" || tab === "battery" ? ["today"] : [];
    let loading = false;
    const errors = new Set();
    const warns = [];
    kinds.forEach((k) => {
      const e = this._data[k];
      if (e.loading && !e.value) loading = true;
      if (e.error) errors.add(e.error);
      const v = e.value;
      if (v && v.missing && v.missing.length) warns.push(this._t("warn_stats", { list: v.missing.join(", ") }));
      if (k === "pv" && v && v.arrays) {
        const noAttr = Object.keys(v.arrays).some((i) => {
          const a = v.arrays[i];
          return !a.has_forecast_data && isSet(this._cfg[`pv${i}_forecast`]);
        });
        if (noAttr) warns.push(this._t("warn_forecast_attr"));
      }
    });
    if (tab === "bridge" && this._info.error) errors.add(this._info.error);
    errors.forEach((t) => parts.push(`<div class="banner err" role="alert"><ha-icon icon="mdi:alert-circle"></ha-icon><span>${esc(t)}</span></div>`));
    warns.forEach((t) => parts.push(`<div class="banner warn"><ha-icon icon="mdi:alert"></ha-icon><span>${esc(t)}</span></div>`));
    if (loading && !errors.size) parts.push(`<div class="banner live"><ha-icon icon="mdi:progress-clock"></ha-icon><span>${esc(this._t("loading"))}</span></div>`);
    return parts.join("");
  }

  _tabsHtml(tabs) {
    const info = this._info.value;
    return `<div class="tabs" role="tablist">${tabs.map((k) => {
      const meta = TAB_META[k];
      const badge = k === "bridge" && ((info && info.update_available) || this._hasMismatch())
        ? `<span class="badge" title="${esc(this._t("acc_version"))}">↑</span>` : "";
      const label = this._t(meta.label);
      return `<button class="tab${k === this._tab ? " active" : ""}" role="tab" aria-selected="${k === this._tab}" data-act="tab" data-v="${k}" title="${esc(label)}" style="${this._iconColor(k)}">
<ha-icon icon="${meta.icon}"></ha-icon><span class="lbl">${esc(label)}</span>${badge}</button>`;
    }).join("")}</div>`;
  }

  _chips(list) {
    const items = list.filter((x) => x);
    if (!items.length) return "";
    return `<div class="chips">${items.map((x) => `<div class="chip" style="${x.c ? `--c:${x.c};` : ""}"><span class="cl">${esc(x.l)}</span><span class="cv">${esc(x.v)}</span></div>`).join("")}</div>`;
  }

  _statsHtml() {
    const c = this._cfg;
    if (this._tab === "flow") {
      const t = this._data.today.value;
      const energyConfigured = ENERGY_KEYS.some((k) => isSet(c[k]));
      if (!energyConfigured) return "";
      const td = (t && t.today) || {};
      const dv = (t && t.derived) || {};
      const ld = this._data.today.loading && !t ? this._t("loading") : null;
      const val = (v) => (ld || (v == null ? "–" : this._kwh(v)));
      return this._chips([
        isSet(c.energy_pv) && { l: this._t("stat_pv"), v: val(td.pv), c: "var(--em-c-pv)" },
        isSet(c.energy_import) && { l: this._t("stat_import"), v: val(td.import), c: "var(--em-c-grid-import)" },
        isSet(c.energy_export) && { l: this._t("stat_export"), v: val(td.export), c: "var(--em-c-grid-export)" },
        (isSet(c.energy_home) || dv.home != null) && { l: this._t("stat_home"), v: val(dv.home != null ? dv.home : td.home), c: "var(--em-c-home)" },
        dv.autarky != null && { l: this._t("stat_autarky"), v: this._pct(dv.autarky) },
        dv.self_consumption != null && { l: this._t("stat_selfuse"), v: this._pct(dv.self_consumption) },
      ]);
    }
    if (this._tab === "pv") {
      const sel = this._pvStats(this._pvSel);
      if (!sel) return "";
      const devColor = this._devColor(sel.deviation);
      return this._chips([
        { l: this._t("stat_pv_actual"), v: this._kwh(sel.actual), c: "var(--em-c-pv)" },
        { l: this._t("stat_pv_forecast"), v: this._kwh(sel.forecastNow), c: "var(--em-c-forecast)" },
        sel.deviation != null && { l: this._t("stat_pv_dev"), v: `${sel.deviation > 0 ? "+" : ""}${this._fmt(sel.deviation, 0)} %`, c: devColor },
      ]);
    }
    return "";
  }

  _devColor(dev) {
    if (dev == null) return "";
    if (dev >= -10) return "var(--em-c-success)";
    if (dev >= -30) return "var(--em-c-warning)";
    return "var(--em-c-error)";
  }

  _empty(key) { return `<div class="empty">${esc(this._t(key))}</div>`; }

  _contentHtml() {
    switch (this._tab) {
      case "flow": return this._flowHtml();
      case "pv": return this._pvHtml();
      case "battery": return this._batteryHtml();
      case "price": return this._priceHtml();
      case "history": return this._historyHtml();
      case "bridge": return this._bridgeHtml();
      default: return "";
    }
  }

  // ----- Tab: Energiefluss -----
  _flowHtml() {
    const c = this._cfg;
    const arrays = this._pvArrays();
    let pv = this._watt(c.pv_power);
    if (pv == null) {
      const parts = arrays.map((a) => a.power).filter((v) => v != null);
      pv = parts.length ? parts.reduce((x, y) => x + y, 0) : null;
    }
    const hasPv = isSet(c.pv_power) || arrays.some((a) => isSet(c[`pv${a.i}_power`]));
    const hasGrid = isSet(c.grid_power) || isSet(c.grid_import_power) || isSet(c.grid_export_power);
    const hasBattery = isSet(c.battery_power) || isSet(c.battery_soc);
    const consumerIdx = [1, 2, 3].filter((i) => isSet(c[`consumer${i}_power`]));
    if (!hasPv && !hasGrid && !hasBattery && !consumerIdx.length && !isSet(c.home_power)) return this._empty("no_sensors");

    const f = computeFlow({
      pv,
      grid: this._watt(c.grid_power),
      gridImport: this._watt(c.grid_import_power),
      gridExport: this._watt(c.grid_export_power),
      battery: this._watt(c.battery_power),
      home: this._watt(c.home_power),
      consumers: consumerIdx.map((i) => this._watt(c[`consumer${i}_power`])),
      threshold: c.flow_threshold,
      gridInvert: c.grid_invert,
      batteryInvert: c.battery_invert,
    });

    const X = (x) => (x / 360 * 100).toFixed(2);
    const Y = (y) => (y / 280 * 100).toFixed(2);
    const R = 32.5;
    const pos = { pv: [180, 40], grid: [48, 140], home: [180, 140], battery: [312, 140] };
    const lines = [];
    const nodes = [];
    const line = (x1, y1, x2, y2, color, active) =>
      lines.push(`<path class="line${active ? " active" : ""}" style="--c:${color}" d="M${x1} ${y1} L${x2} ${y2}"/>`);
    const node = (p, icon, color, value, label, sub) =>
      nodes.push(`<div class="node" style="left:${X(p[0])}%;top:${Y(p[1])}%;--c:${color}"><ha-icon icon="${icon}"></ha-icon><span class="nv">${esc(value)}</span>${sub ? `<span class="ns">${esc(sub)}</span>` : ""}<span class="nl">${esc(label)}</span></div>`);

    const home = pos.home;
    if (hasPv) {
      node(pos.pv, "mdi:solar-power", "var(--em-c-pv)", this._power(f.pv), this._t("node_pv"));
      line(pos.pv[0], pos.pv[1] + R, home[0], home[1] - R, "var(--em-c-pv)", f.pvActive);
    }
    if (hasGrid) {
      const imp = f.gridDir !== "export";
      const color = imp ? "var(--em-c-grid-import)" : "var(--em-c-grid-export)";
      const sub = f.gridDir === "import" ? this._t("flow_import") : f.gridDir === "export" ? this._t("flow_export") : this._t("flow_idle");
      node(pos.grid, "mdi:transmission-tower", color, this._power(f.grid == null ? null : Math.abs(f.grid)), this._t("node_grid"), sub);
      const a = [pos.grid[0] + R, pos.grid[1]];
      const b = [home[0] - R, home[1]];
      if (f.gridDir === "export") line(b[0], b[1], a[0], a[1], color, true);
      else line(a[0], a[1], b[0], b[1], color, f.gridDir === "import");
    }
    if (hasBattery) {
      const soc = this._numState(c.battery_soc);
      const color = "var(--em-c-battery)";
      const sub = f.batteryDir === "charge" ? this._t("flow_charging") : f.batteryDir === "discharge" ? this._t("flow_discharging") : this._t("flow_idle");
      const icon = soc == null ? "mdi:battery" : soc >= 90 ? "mdi:battery" : soc >= 60 ? "mdi:battery-70" : soc >= 30 ? "mdi:battery-40" : "mdi:battery-10";
      const value = f.battery == null ? this._pct(soc) : this._power(Math.abs(f.battery));
      node(pos.battery, icon, color, value, this._t("node_battery"), f.battery == null ? sub : (soc == null ? sub : `${this._pct(soc)}`));
      const a = [pos.battery[0] - R, pos.battery[1]];
      const b = [home[0] + R, home[1]];
      if (f.batteryDir === "charge") line(b[0], b[1], a[0], a[1], color, true);
      else line(a[0], a[1], b[0], b[1], color, f.batteryDir === "discharge");
    }
    node(home, "mdi:home", "var(--em-c-home)", this._power(f.home), this._t("node_home"));

    const n = consumerIdx.length;
    const xs = n === 1 ? [180] : n === 2 ? [100, 260] : [60, 180, 300];
    consumerIdx.forEach((idx, k) => {
      const p = [xs[k], 240];
      const name = isSet(c[`consumer${idx}_name`]) ? c[`consumer${idx}_name`].trim() : `${this._t("node_home")} ${idx}`;
      node(p, "mdi:flash-outline", "var(--em-c-home)", this._power(f.consumers[k]), name);
      line(home[0], home[1] + R, p[0], p[1] - R, "var(--em-c-home)", f.consumerActive[k]);
    });

    return `<div class="flow" role="img" aria-label="${esc(this._t("tab_flow"))}"><svg viewBox="0 0 360 280" preserveAspectRatio="none" aria-hidden="true">${lines.join("")}</svg>${nodes.join("")}</div>`;
  }

  // ----- Tab: PV -----
  _pvStats(sel) {
    const arrays = this._pvArrays().filter((a) => a.configured);
    if (!arrays.length) return null;
    const d = this._data.pv.value;
    const back = (i) => (d && d.arrays ? d.arrays[String(i)] : null);
    const sum = (vals) => {
      const p = vals.filter((v) => v != null);
      return p.length ? p.reduce((x, y) => x + y, 0) : null;
    };
    const one = (a) => {
      const b = back(a.i);
      const actual = a.energyToday != null ? a.energyToday : (b ? b.actual_kwh : null);
      const forecastNow = b ? b.forecast_kwh_now : null;
      return {
        actual,
        forecastDay: b && b.forecast_kwh != null ? b.forecast_kwh : a.forecastToday,
        forecastNow,
        deviation: actual != null && forecastNow != null && forecastNow > 0 ? Math.round((actual - forecastNow) / forecastNow * 1000) / 10 : null,
        tomorrow: a.forecastTomorrow,
        power: a.power,
        forecastPower: a.forecastNow,
      };
    };
    if (sel !== "total") {
      const a = arrays.find((x) => String(x.i) === String(sel));
      return a ? one(a) : this._pvStats("total");
    }
    const all = arrays.map(one);
    const actual = sum(all.map((x) => x.actual));
    const forecastNow = sum(all.map((x) => x.forecastNow));
    return {
      actual,
      forecastDay: sum(all.map((x) => x.forecastDay)),
      forecastNow,
      deviation: actual != null && forecastNow != null && forecastNow > 0 ? Math.round((actual - forecastNow) / forecastNow * 1000) / 10 : null,
      tomorrow: sum(all.map((x) => x.tomorrow)),
      power: sum(all.map((x) => x.power)),
      forecastPower: sum(all.map((x) => x.forecastPower)),
    };
  }

  _pvChart(actual, forecast, hourNow) {
    const W = 340, H = 150, L = 30, R = 6, T = 8, B = 20;
    const pw = W - L - R, ph = H - T - B;
    const vals = actual.concat(forecast).filter((v) => v != null);
    const max = niceMax(Math.max(0.1, ...vals));
    const bw = pw / 24;
    const y = (v) => T + ph - (v / max) * ph;
    const bars = actual.map((v, h) => (v == null ? "" : `<rect class="act" x="${(L + h * bw + bw * 0.15).toFixed(1)}" y="${y(v).toFixed(1)}" width="${(bw * 0.7).toFixed(1)}" height="${Math.max(0, T + ph - y(v)).toFixed(1)}" rx="1"/>`)).join("");
    const pts = forecast.map((v, h) => (v == null ? null : `${(L + h * bw + bw / 2).toFixed(1)},${y(v).toFixed(1)}`)).filter(Boolean);
    const lineEl = pts.length > 1 ? `<polyline class="fc" points="${pts.join(" ")}"/>` : "";
    const xl = [0, 6, 12, 18, 23].map((h) => `<text x="${(L + h * bw + bw / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle">${h}</text>`).join("");
    const nowX = hourNow == null ? "" : `<line class="now" x1="${(L + hourNow * bw + bw / 2).toFixed(1)}" x2="${(L + hourNow * bw + bw / 2).toFixed(1)}" y1="${T}" y2="${T + ph}"/>`;
    const label = `${this._t("pv_chart")}: ${this._t("legend_actual")} / ${this._t("legend_forecast")}`;
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
<line class="grid" x1="${L}" x2="${W - R}" y1="${T + ph}" y2="${T + ph}"/><line class="grid" x1="${L}" x2="${W - R}" y1="${T}" y2="${T}"/>
<text x="${L - 4}" y="${T + 3}" text-anchor="end">${this._fmt(max, max < 10 ? 1 : 0)}</text><text x="${L - 4}" y="${T + ph + 3}" text-anchor="end">0</text>
${bars}${lineEl}${nowX}${xl}</svg>`;
  }

  _pvHtml() {
    const arrays = this._pvArrays().filter((a) => a.configured);
    if (!arrays.length) return this._empty("pv_none");
    const c = this._cfg;
    if (this._pvSel !== "total" && !arrays.some((a) => String(a.i) === String(this._pvSel))) this._pvSel = "total";
    const sel = this._pvStats(this._pvSel);
    const sels = arrays.length > 1
      ? `<div class="selbar">${[{ v: "total", l: this._t("pv_total") }].concat(arrays.map((a) => ({ v: String(a.i), l: a.name }))).map((o) =>
        `<button class="sel${String(this._pvSel) === o.v ? " on" : ""}" data-act="pvsel" data-v="${esc(o.v)}">${esc(o.l)}</button>`).join("")}</div>` : "";
    const d = this._data.pv.value;
    let chartData = null;
    if (d) chartData = this._pvSel === "total" ? d.total : (d.arrays || {})[String(this._pvSel)];
    const pct = sel.forecastDay && sel.actual != null ? clamp(sel.actual / sel.forecastDay * 100, 0, 100) : 0;
    const mark = sel.forecastDay && sel.forecastNow != null ? clamp(sel.forecastNow / sel.forecastDay * 100, 0, 100) : null;
    const summary = `<div class="panel">
<div class="muted">${esc(this._t("pv_actual"))}</div>
<div class="big" style="--c:var(--em-c-pv)">${esc(this._kwh(sel.actual))}</div>
<div class="barwrap" style="margin:8px 0"><div class="bar" style="--c:var(--em-c-pv)"><i style="width:${pct.toFixed(1)}%"></i></div>${mark == null ? "" : `<span class="mark" style="left:${mark.toFixed(1)}%"></span>`}</div>
<div class="kv"><span class="k">${esc(this._t("pv_forecast_day"))}</span><span class="v">${esc(this._kwh(sel.forecastDay))}</span></div>
<div class="kv"><span class="k">${esc(this._t("pv_forecast_now"))}</span><span class="v">${esc(this._kwh(sel.forecastNow))}</span></div>
<div class="kv"><span class="k">${esc(this._t("pv_deviation"))}</span><span class="v" style="color:${this._devColor(sel.deviation) || "inherit"}">${sel.deviation == null ? "–" : `${sel.deviation > 0 ? "+" : ""}${this._fmt(sel.deviation, 1)} %`}</span></div>
<div class="kv"><span class="k">${esc(this._t("pv_tomorrow"))}</span><span class="v">${esc(this._kwh(sel.tomorrow))}</span></div>
<div class="kv"><span class="k">${esc(this._t("pv_power"))}</span><span class="v">${esc(this._power(sel.power))}</span></div>
${sel.forecastPower != null ? `<div class="kv"><span class="k">${esc(this._t("pv_forecast_power"))}</span><span class="v">${esc(this._power(sel.forecastPower))}</span></div>` : ""}
</div>`;
    const chart = chartData
      ? `<div class="panel"><div class="muted">${esc(this._t("pv_chart"))}</div>${this._pvChart(chartData.actual || [], chartData.forecast || [], d.hour_now)}
<div class="legend"><span><i style="background:var(--em-c-pv)"></i>${esc(this._t("legend_actual"))}</span><span><i style="background:var(--em-c-forecast)"></i>${esc(this._t("legend_forecast"))}</span></div></div>`
      : (this._data.pv.loading ? `<div class="empty">${esc(this._t("loading"))}</div>` : "");
    const rows = arrays.length > 1 ? `<div class="rows">${arrays.map((a) => {
      const st = this._pvStats(String(a.i));
      const on = a.power != null && a.power >= c.flow_threshold;
      const dev = st.deviation;
      return `<button class="row" data-act="popup" data-t="pv" data-i="${a.i}" style="${this._iconColor("pv")}">
<span class="ico"><ha-icon icon="mdi:solar-panel"></ha-icon><span class="dot" style="--c:${on ? "var(--em-c-success)" : "var(--divider-color)"}"></span></span>
<span class="main"><span class="name" style="display:block">${esc(a.name)}</span><span class="second" style="display:block">${esc(this._t("pv_actual"))} ${esc(this._kwh(st.actual))} · ${esc(this._t("pv_forecast_day"))} ${esc(this._kwh(st.forecastDay))}</span></span>
<span class="pills"><span class="pill" style="--c:var(--em-c-pv)">${esc(this._power(a.power))}</span>${dev == null ? "" : `<span class="pill" style="--c:${this._devColor(dev)}">${dev > 0 ? "+" : ""}${this._fmt(dev, 0)} %</span>`}</span></button>`;
    }).join("")}</div>` : "";
    return `${sels}${summary}${chart}${rows}`;
  }

  // ----- Tab: Speicher -----
  _batteryHtml() {
    const c = this._cfg;
    if (!isSet(c.battery_power) && !isSet(c.battery_soc)) return this._empty("battery_none");
    const soc = this._numState(c.battery_soc);
    let p = this._watt(c.battery_power);
    if (p != null && c.battery_invert) p = -p;
    const thr = c.flow_threshold;
    const dir = p == null || Math.abs(p) < thr ? "idle" : p > 0 ? "discharge" : "charge";
    const color = soc == null ? "var(--em-c-battery)" : soc >= 50 ? "var(--em-c-success)" : soc >= 20 ? "var(--em-c-warning)" : "var(--em-c-error)";
    const cap = num(c.battery_capacity, null);
    const content = cap != null && soc != null ? cap * soc / 100 : null;
    let eta = "";
    if (cap != null && soc != null && p != null && Math.abs(p) >= thr) {
      const kw = Math.abs(p) / 1000;
      if (dir === "charge") eta = this._t("battery_eta_full", { t: fmtDuration(cap * (1 - soc / 100) / kw, this._lang) });
      else eta = this._t("battery_eta_empty", { t: fmtDuration(cap * soc / 100 / kw, this._lang) });
    }
    const t = this._data.today.value;
    const td = (t && t.today) || {};
    const dirText = dir === "charge" ? this._t("flow_charging") : dir === "discharge" ? this._t("flow_discharging") : this._t("flow_idle");
    return `<div class="panel">
<div class="muted">${esc(this._t("battery_soc"))}</div>
<div class="big" style="--c:${color}">${esc(this._pct(soc))}</div>
<div class="bar" style="--c:${color};margin:8px 0"><i style="width:${soc == null ? 0 : clamp(soc, 0, 100)}%"></i></div>
<div class="kv"><span class="k">${esc(this._t("battery_power"))}</span><span class="v">${esc(this._power(p == null ? null : Math.abs(p)))} · ${esc(dirText)}</span></div>
${cap != null ? `<div class="kv"><span class="k">${esc(this._t("battery_capacity"))}</span><span class="v">${esc(this._kwh(cap))}</span></div>` : ""}
${content != null ? `<div class="kv"><span class="k">${esc(this._t("battery_content"))}</span><span class="v">${esc(this._kwh(content))}</span></div>` : ""}
${eta ? `<div class="kv"><span class="k"></span><span class="v">${esc(eta)}</span></div>` : ""}
${isSet(c.energy_battery_charge) ? `<div class="kv"><span class="k">${esc(this._t("battery_charged"))}</span><span class="v">${esc(td.charge == null ? (this._data.today.loading ? this._t("loading") : "–") : this._kwh(td.charge))}</span></div>` : ""}
${isSet(c.energy_battery_discharge) ? `<div class="kv"><span class="k">${esc(this._t("battery_discharged"))}</span><span class="v">${esc(td.discharge == null ? (this._data.today.loading ? this._t("loading") : "–") : this._kwh(td.discharge))}</span></div>` : ""}
</div>`;
  }

  // ----- Tab: Strompreis -----
  _priceHtml() {
    const c = this._cfg;
    if (!isSet(c.price_current)) return this._empty("price_none");
    const cur = this._numState(c.price_current);
    const unit = this._unit(c.price_current) || "";
    const mn = this._numState(c.price_min), mx = this._numState(c.price_max), av = this._numState(c.price_avg);
    let level = null, label = "";
    const ls = this._st(c.price_level);
    if (ls && ls.state && !["unknown", "unavailable"].includes(ls.state)) {
      label = String(ls.state).replace(/_/g, " ").toLowerCase();
      const s = String(ls.state).toUpperCase();
      level = s.includes("CHEAP") ? "cheap" : s.includes("EXPENSIVE") ? "expensive" : "normal";
    } else if (cur != null && mn != null && mx != null && mx > mn) {
      const pos = (cur - mn) / (mx - mn);
      level = pos < 0.33 ? "cheap" : pos > 0.66 ? "expensive" : "normal";
      label = this._t(level === "cheap" ? "level_cheap" : level === "expensive" ? "level_expensive" : "level_normal");
    }
    const lc = level === "cheap" ? "var(--em-c-success)" : level === "expensive" ? "var(--em-c-error)" : "var(--em-c-warning)";
    const fmtPrice = (v) => (v == null ? "–" : `${this._fmt(v, Math.abs(v) < 1 && !/^c/i.test(unit) ? 4 : 2)} ${unit}`);
    const grid = this._watt(c.grid_power);
    const gi = this._watt(c.grid_import_power), ge = this._watt(c.grid_export_power);
    let imp = null, exp = null;
    if (grid != null) {
      const g = c.grid_invert ? -grid : grid;
      imp = Math.max(0, g); exp = Math.max(0, -g);
    } else if (gi != null || ge != null) {
      imp = gi == null ? null : gi; exp = ge == null ? null : ge;
    }
    const cur$ = (v) => (v == null ? null : toCurrencyPerKwh(v, unit));
    const currency = /^(ct|cent|c\/)/i.test(unit) ? "€" : (unit.split("/")[0] || "€");
    const money = (v) => `${this._fmt(v, 2)} ${currency}`;
    const priceKwh = cur$(cur);
    const costRow = imp != null && priceKwh != null
      ? `<div class="kv"><span class="k">${esc(this._t("price_cost"))}</span><span class="v">${esc(this._t("price_per_hour", { v: money(imp / 1000 * priceKwh) }))}</span></div>` : "";
    let tariff = null;
    if (isSet(c.feed_in_tariff)) { const tv = this._numState(c.feed_in_tariff); tariff = tv == null ? null : toCurrencyPerKwh(tv, this._unit(c.feed_in_tariff)); }
    else if (c.feed_in_tariff_fixed != null && c.feed_in_tariff_fixed !== "") tariff = num(c.feed_in_tariff_fixed, null);
    const revRow = exp != null && tariff != null
      ? `<div class="kv"><span class="k">${esc(this._t("price_revenue"))}</span><span class="v">${esc(this._t("price_per_hour", { v: money(exp / 1000 * tariff) }))}</span></div>` : "";
    return `<div class="panel">
<div class="muted">${esc(this._t("price_current"))}</div>
<div class="big" style="--c:${level ? lc : "var(--primary-text-color)"}">${esc(fmtPrice(cur))}</div>
${level ? `<div style="margin:8px 0"><span class="pill" style="--c:${lc}">${esc(this._t("price_level"))}: ${esc(label)}</span></div>` : ""}
${isSet(c.price_min) ? `<div class="kv"><span class="k">${esc(this._t("price_min"))}</span><span class="v">${esc(fmtPrice(mn))}</span></div>` : ""}
${isSet(c.price_avg) ? `<div class="kv"><span class="k">${esc(this._t("price_avg"))}</span><span class="v">${esc(fmtPrice(av))}</span></div>` : ""}
${isSet(c.price_max) ? `<div class="kv"><span class="k">${esc(this._t("price_max"))}</span><span class="v">${esc(fmtPrice(mx))}</span></div>` : ""}
${costRow}${revRow}
</div>`;
  }

  // ----- Tab: Verlauf -----
  _historyHtml() {
    const c = this._cfg;
    if (!ENERGY_KEYS.some((k) => isSet(c[k]))) return this._empty("hist_none");
    const monthsOpts = [3, 6, 12, 24].concat([this._cfg.history_months]).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
    const monthBar = `<div class="selbar">${monthsOpts.map((m) =>
      `<button class="sel${m === this._months ? " on" : ""}" data-act="months" data-v="${m}">${esc(this._t("hist_months", { n: m }))}</button>`).join("")}</div>`;
    const d = this._data.history.value;
    if (!d) return monthBar + (this._data.history.loading ? `<div class="empty">${esc(this._t("loading"))}</div>` : "");
    const rows = d.months || [];
    const metrics = [
      ["pv", "hist_pv", "pv", "var(--em-c-pv)", "kWh"],
      ["import", "hist_import", "import", "var(--em-c-grid-import)", "kWh"],
      ["export", "hist_export", "export", "var(--em-c-grid-export)", "kWh"],
      ["home", "hist_home", "home", "var(--em-c-home)", "kWh"],
      ["autarky", "hist_autarky", "autarky", "var(--em-c-success)", "%"],
      ["self_consumption", "hist_selfuse", "self_consumption", "var(--em-c-success)", "%"],
    ].filter((m) => rows.some((r) => r[m[2]] != null));
    if (!metrics.length) return monthBar + this._empty("hist_none");
    if (!metrics.some((m) => m[0] === this._metric)) this._metric = metrics[0][0];
    const cur = metrics.find((m) => m[0] === this._metric);
    const metricBar = `<div class="selbar">${metrics.map((m) =>
      `<button class="sel${m[0] === this._metric ? " on" : ""}" data-act="metric" data-v="${m[0]}">${esc(this._t(m[1]))}</button>`).join("")}</div>`;
    const chart = this._barChart(rows, cur);
    const list = `<div class="rows">${rows.slice().reverse().map((r) => {
      const pills = [
        r.pv != null && `<span class="pill" style="--c:var(--em-c-pv)">${esc(this._t("hist_pv"))} ${esc(this._kwh(r.pv))}</span>`,
        r.import != null && `<span class="pill" style="--c:var(--em-c-grid-import)">${esc(this._t("hist_import"))} ${esc(this._kwh(r.import))}</span>`,
        r.export != null && `<span class="pill" style="--c:var(--em-c-grid-export)">${esc(this._t("hist_export"))} ${esc(this._kwh(r.export))}</span>`,
        r.autarky != null && `<span class="pill" style="--c:var(--em-c-success)">${esc(this._pct(r.autarky))}</span>`,
      ].filter(Boolean).join("");
      return `<button class="row" data-act="popup" data-t="month" data-k="${esc(r.month)}" style="${this._iconColor("history")}">
<span class="ico"><ha-icon icon="mdi:calendar-month"></ha-icon></span>
<span class="main"><span class="name" style="display:block">${esc(this._monthLabel(r.month))}</span></span><span class="pills">${pills}</span></button>`;
    }).join("")}</div>`;
    const note = rows.some((r) => r.home_calculated) ? `<div class="sub" style="margin-top:8px">${esc(this._t("hist_calculated"))}</div>` : "";
    return monthBar + metricBar + `<div class="panel"><div class="muted">${esc(this._t("hist_chart"))}: ${esc(this._t(cur[1]))} (${cur[4]})</div>${chart}</div>${note}${list}`;
  }

  _barChart(rows, metric) {
    const W = 340, H = 150, L = 34, R = 6, T = 14, B = 22;
    const pw = W - L - R, ph = H - T - B;
    const key = metric[2];
    const vals = rows.map((r) => r[key]);
    const max = metric[4] === "%" ? 100 : niceMax(Math.max(1, ...vals.filter((v) => v != null)));
    const bw = pw / Math.max(1, rows.length);
    const labelEvery = rows.length > 12 ? 2 : 1;
    const showVal = rows.length <= 8;
    const bars = vals.map((v, i) => {
      const x = L + i * bw + bw * 0.15;
      if (v == null) return "";
      const h = clamp(v / max, 0, 1) * ph;
      return `<rect x="${x.toFixed(1)}" y="${(T + ph - h).toFixed(1)}" width="${(bw * 0.7).toFixed(1)}" height="${h.toFixed(1)}" rx="2" style="fill:${metric[3]}"/>` +
        (showVal ? `<text x="${(x + bw * 0.35).toFixed(1)}" y="${(T + ph - h - 3).toFixed(1)}" text-anchor="middle">${this._fmt(v, v >= 100 || metric[4] === "%" ? 0 : 1)}</text>` : "");
    }).join("");
    const labels = rows.map((r, i) => (i % labelEvery ? "" :
      `<text x="${(L + i * bw + bw / 2).toFixed(1)}" y="${H - 7}" text-anchor="middle">${esc(this._monthShort(r.month))}</text>`)).join("");
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(this._t("hist_chart"))}">
<line class="grid" x1="${L}" x2="${W - R}" y1="${T + ph}" y2="${T + ph}"/>
<text x="${L - 4}" y="${T + 3}" text-anchor="end">${this._fmt(max, 0)}</text><text x="${L - 4}" y="${T + ph + 3}" text-anchor="end">0</text>
${bars}${labels}</svg>`;
  }

  _monthShort(key) {
    const [y, m] = String(key).split("-").map(Number);
    return new Date(y, (m || 1) - 1, 1).toLocaleDateString(this._lang, { month: "short" });
  }

  // ----- Tab: Einstellungen -----
  _acc(k, icon, title, meta, body, cls, open) {
    const isOpen = k in this._accState ? this._accState[k] : !!open;
    return `<details class="settings-accordion ${cls || ""}" data-k="${esc(k)}"${isOpen ? " open" : ""}><summary class="settings-accordion-summary"><ha-icon icon="${icon}"></ha-icon><span class="grow">${esc(title)}</span>${meta ? `<span class="meta">${meta}</span>` : ""}</summary><div class="settings-accordion-body">${body}</div></details>`;
  }
  _line(label, value, color) {
    return `<div class="settings-line"><span class="lbl">${esc(label)}</span><span class="val"${color ? ` style="color:${color}"` : ""}>${esc(value)}</span></div>`;
  }

  _bridgeHtml() {
    const c = this._cfg;
    const info = this._info.value;
    const ro = !!c.read_only;
    // 1. App-Version
    let versionBody = this._line(this._t("v_integration"), info ? info.version : "–")
      + this._line(this._t("v_card"), CARD_VERSION);
    let cls = "";
    if (info && info.check_failed) versionBody += this._line(this._t("v_latest"), this._t("v_check_failed"), "var(--em-c-error)");
    else versionBody += this._line(this._t("v_latest"), info && info.latest_version ? info.latest_version : "–");
    versionBody += this._line(this._t("v_checked"), this._date(info && info.checked_at));
    if (info && info.update_available) {
      cls = "update";
      versionBody += `<div class="hint" style="--c:var(--em-c-warning)">${esc(this._t("v_update", { v: info.latest_version }))}</div>`;
    } else if (this._hasMismatch()) {
      cls = "update";
      versionBody += `<div class="hint" style="--c:var(--em-c-warning)">${esc(this._t("v_mismatch", { c: CARD_VERSION, i: info.version }))}</div>`;
    } else if (info && info.latest_version && !info.check_failed) {
      versionBody += `<div class="hint" style="--c:var(--em-c-success)">${esc(this._t("v_up_to_date"))}</div>`;
    }
    const rel = info && typeof info.release_url === "string" && info.release_url.startsWith("https://github.com/") ? info.release_url : RELEASES_URL;
    versionBody += `<div class="btns">${ro ? "" : `<button class="btn" data-act="check"><ha-icon icon="mdi:refresh"></ha-icon>${esc(this._t("v_check_now"))}</button>`}<a class="btn" href="${esc(rel)}" target="_blank" rel="noopener noreferrer"><ha-icon icon="mdi:github"></ha-icon>${esc(this._t("v_release"))}</a></div>`;
    const meta = info && info.update_available ? `<span style="color:var(--em-c-warning)">↑ ${esc(info.latest_version)}</span>` : esc(CARD_VERSION);

    // 2. Status
    const backendOk = !!info;
    const keys = allEntityKeys().filter((k) => isSet(c[k]) && (k.startsWith("pv") ? Number(k[2]) <= c.pv_count : true));
    const unavailable = keys.filter((k) => { const s = this._st(c[k]); return !s || ["unavailable", "unknown"].includes(s.state); });
    const statusBody = this._line(this._t("st_backend"), backendOk ? this._t("st_ok") : (this._info.error ? this._t("st_error") : this._t("st_unknown")), backendOk ? "var(--em-c-success)" : (this._info.error ? "var(--em-c-error)" : ""))
      + this._line(this._t("st_recorder"), info ? (info.recorder ? this._t("st_ok") : this._t("st_error")) : this._t("st_unknown"), info ? (info.recorder ? "var(--em-c-success)" : "var(--em-c-error)") : "")
      + this._line(`${keys.length} ${this._t("st_selected")}`, unavailable.length ? `${unavailable.length} ${this._t("st_unavailable")}` : this._t("st_ok"), unavailable.length ? "var(--em-c-warning)" : "var(--em-c-success)");

    // 3. Sensoren
    const sensorBody = keys.length ? keys.map((k) => {
      const s = this._st(c[k]);
      const text = !s ? this._t("st_missing") : ["unavailable", "unknown"].includes(s.state) ? this._t("st_unavailable") : s.state;
      return this._line(`${k}`, `${c[k]} · ${text}`, !s ? "var(--em-c-error)" : ["unavailable", "unknown"].includes(s.state) ? "var(--em-c-warning)" : "");
    }).join("") : `<div class="muted" style="padding-top:8px">${esc(this._t("no_sensors"))}</div>`;

    // 4. Optionen
    const optBody = `<div class="muted" style="padding-top:8px">${esc(this._t("opt_text"))}</div>`;

    // 5. Wartung
    const maint = ro
      ? `<div class="muted" style="padding-top:8px">${esc(this._t("readonly_hint"))}</div>`
      : `<div class="btns"><button class="btn${this._confirm === "clear" ? " danger" : ""}" data-act="clear-cache"><ha-icon icon="mdi:broom"></ha-icon>${esc(this._confirm === "clear" ? this._t("btn_confirm") : this._t("btn_clear_cache"))}</button><button class="btn" data-act="reload"><ha-icon icon="mdi:reload"></ha-icon>${esc(this._t("btn_reload"))}</button></div>`;

    // 6. Ereignisse
    const evBody = this._events.length
      ? this._events.map((e) => `<div class="ev">${esc(e.ts.toLocaleTimeString(this._lang))} · ${esc(e.text)}</div>`).join("")
      : `<div class="muted" style="padding-top:8px">${esc(this._t("ev_none"))}</div>`;

    return `<div class="settings">
${this._acc("version", "mdi:tag-outline", this._t("acc_version"), meta, versionBody, cls, true)}
${this._acc("status", "mdi:heart-pulse", this._t("acc_status"), "", statusBody, "", true)}
${this._acc("sensors", "mdi:format-list-bulleted", this._t("acc_sensors"), `${keys.length}`, sensorBody, "", false)}
${this._acc("options", "mdi:tune", this._t("acc_options"), "", optBody, "", false)}
${this._acc("maintenance", "mdi:wrench", this._t("acc_maintenance"), "", maint, "", false)}
${this._acc("events", "mdi:history", this._t("acc_events"), `${this._events.length}`, evBody, "", false)}
</div>`;
  }

  // ----- Popup -----
  _popupModel() {
    const p = this._popup;
    if (!p) return null;
    if (p.t === "pv") {
      const a = this._pvArrays().find((x) => x.i === p.i);
      if (!a) return null;
      const st = this._pvStats(String(a.i));
      const c = this._cfg;
      const line = (l, v) => this._line(l, v);
      const info = [
        line(this._t("pv_power"), this._power(a.power)),
        line(this._t("pv_actual"), this._kwh(st.actual)),
        line(this._t("pv_deviation"), st.deviation == null ? "–" : `${st.deviation > 0 ? "+" : ""}${this._fmt(st.deviation, 1)} %`),
      ].join("");
      const fc = [
        line(this._t("pv_forecast_day"), this._kwh(st.forecastDay)),
        line(this._t("pv_forecast_now"), this._kwh(st.forecastNow)),
        line(this._t("pv_tomorrow"), this._kwh(st.tomorrow)),
        line(this._t("pv_forecast_power"), this._power(a.forecastNow)),
      ].join("");
      const sens = PV_FIELDS.concat(["forecast_site"]).filter((f) => isSet(c[`pv${a.i}_${f}`])).map((f) => line(f, c[`pv${a.i}_${f}`])).join("");
      return { icon: "mdi:solar-panel", title: a.name, sections: [
        { k: "p_info", icon: "mdi:information-outline", title: this._t("popup_info"), open: true, body: info },
        { k: "p_fc", icon: "mdi:weather-sunny", title: this._t("popup_forecast"), open: false, body: fc },
        { k: "p_sens", icon: "mdi:format-list-bulleted", title: this._t("popup_sensors"), open: false, body: sens || `<div class="muted">–</div>` },
      ] };
    }
    if (p.t === "month") {
      const d = this._data.history.value;
      const r = d && (d.months || []).find((x) => x.month === p.k);
      if (!r) return null;
      const L = (l, v) => this._line(l, v);
      const body = [
        L(this._t("hist_pv"), this._kwh(r.pv)), L(this._t("hist_import"), this._kwh(r.import)),
        L(this._t("hist_export"), this._kwh(r.export)), L(this._t("hist_home"), this._kwh(r.home)),
        L(this._t("hist_autarky"), this._pct(r.autarky, 1)), L(this._t("hist_selfuse"), this._pct(r.self_consumption, 1)),
      ].join("");
      return { icon: "mdi:calendar-month", title: this._monthLabel(r.month), sections: [
        { k: "m_info", icon: "mdi:information-outline", title: this._t("popup_info"), open: true, body },
      ] };
    }
    return null;
  }

  _popupHtml() {
    const m = this._popupModel();
    if (!m) return "";
    return `<div class="backdrop" data-act="popup-close"><div class="popup" role="dialog" aria-modal="true" aria-label="${esc(m.title)}" tabindex="-1">
<div class="ph"><ha-icon icon="${m.icon}"></ha-icon><span class="grow" style="font-size:18px">${esc(m.title)}</span><button class="btn icon" data-act="popup-x" aria-label="${esc(this._t("close"))}" title="${esc(this._t("close"))}"><ha-icon icon="mdi:close"></ha-icon></button></div>
<div class="pb">${m.sections.map((s) => this._acc(s.k, s.icon, s.title, "", s.body, "", s.open)).join("")}</div></div></div>`;
  }

  // ----- Bedienung -----
  _toast(text, isErr) {
    clearTimeout(this._toastTimer);
    this._set("toast", `<div class="toast${isErr ? " err" : ""}" role="status">${esc(text)}</div>`);
    this._toastTimer = setTimeout(() => this._set("toast", ""), 5000);
  }

  async _action(name) {
    try {
      const res = await this._hass.connection.sendMessagePromise({ type: `${DOMAIN}/action`, action: name });
      this._info = { value: res, error: null, ts: Date.now(), loading: false };
      if (name === "clear_cache") { this._resetData(); this._toast(this._t("toast_cache")); }
      else this._toast(this._t("toast_checked"));
    } catch (err) {
      this._toast(this._t("toast_err", { e: (err && err.message) || String(err) }), true);
    }
    this._queueRender();
  }

  _onClick(e) {
    const path = e.composedPath ? e.composedPath() : [e.target];
    const el = path.find((n) => n && n.dataset && n.dataset.act);
    if (!el) return;
    const act = el.dataset.act;
    const v = el.dataset.v;
    switch (act) {
      case "tab":
        this._tab = v; this._popup = null; this._queueRender(); break;
      case "pvsel":
        this._pvSel = v; this._queueRender(); break;
      case "metric":
        this._metric = v; this._queueRender(); break;
      case "months": {
        const m = Number(v);
        if (m !== this._months) { this._months = m; this._data.history = { value: null, error: null, ts: 0, loading: false, skipped: false }; }
        this._queueRender(); break;
      }
      case "popup":
        this._popup = el.dataset.t === "pv" ? { t: "pv", i: Number(el.dataset.i) } : { t: "month", k: el.dataset.k };
        this._queueRender(); break;
      case "popup-close":
        if (e.target === el) { this._popup = null; this._queueRender(); }
        break;
      case "popup-x":
        this._popup = null; this._queueRender(); break;
      case "check":
        if (!this._cfg.read_only) this._action("check_update");
        break;
      case "clear-cache":
        if (this._cfg.read_only) break;
        if (this._confirm !== "clear") {
          this._confirm = "clear";
          setTimeout(() => { if (this._confirm === "clear") { this._confirm = null; this._queueRender(); } }, 4000);
          this._queueRender();
        } else {
          this._confirm = null;
          this._action("clear_cache");
        }
        break;
      case "reload":
        this._resetData(); this._toast(this._t("toast_reloaded")); this._loadInfo(true); this._queueRender(); break;
      default: break;
    }
  }
}

// ---------- Karten-Editor ----------
const TAB_LABELS_DE = {
  flow: "Energiefluss", pv: "PV-Erzeugung", battery: "Speicher",
  price: "Strompreis", history: "Verlauf", bridge: "Einstellungen",
};
const COLOR_LABELS_DE = {
  color_tab_active: "Aktiver Tab", color_success: "Erfolg (grün)", color_warning: "Warnung (orange)",
  color_error: "Fehler (rot)", color_info: "Information (blau)", color_row_icon: "Zeilensymbole (alle Kategorien)",
  color_live_banner: "Live-Banner", color_pv: "PV", color_grid_import: "Netzbezug",
  color_grid_export: "Einspeisung", color_battery: "Speicher", color_home: "Haus", color_forecast: "Prognose",
};
TAB_ORDER.forEach((k) => { COLOR_LABELS_DE[`color_icon_${k}`] = `Symbolfarbe: ${TAB_LABELS_DE[k]}`; });

function editorLabels() {
  const L = {
    title: "Titel (leer = keine Überschrift)", show_title: "Titel anzeigen",
    default_tab: "Starttab", zoom: "Zoom (%)", show_stats: "Kennzahlen anzeigen",
    history_months: "Monate im Verlauf", flow_threshold: "Schwelle für Fluss-Animation (W)",
    read_only: "Nur lesen (Bedienelemente ausblenden)",
    grid_power: "Netz-Leistung (Bezug positiv)", grid_invert: "Netz-Vorzeichen umkehren",
    grid_import_power: "Netzbezug-Leistung (alternativ)", grid_export_power: "Einspeise-Leistung (alternativ)",
    home_power: "Hausverbrauch-Leistung (optional, sonst berechnet)", pv_power: "PV-Gesamtleistung (optional, sonst Summe der Anlagen)",
    battery_power: "Speicher-Leistung (Entladen positiv)", battery_invert: "Speicher-Vorzeichen umkehren",
    battery_soc: "Speicher-Ladestand (%)", battery_capacity: "Speicher-Kapazität (kWh)",
    pv_count: "Anzahl PV-Anlagen (Himmelsrichtungen)",
    energy_pv: "PV-Erzeugung gesamt (Zähler, kWh)", energy_import: "Netzbezug (Zähler, kWh)",
    energy_export: "Einspeisung (Zähler, kWh)", energy_home: "Hausverbrauch (Zähler, optional, sonst berechnet)",
    energy_battery_charge: "Speicher geladen (Zähler, kWh)", energy_battery_discharge: "Speicher entladen (Zähler, kWh)",
    price_current: "Aktueller Preis", price_min: "Niedrigster Preis (optional)", price_avg: "Durchschnittspreis (optional)",
    price_max: "Höchster Preis (optional)", price_level: "Preisstufe (optional, z. B. Tibber)",
    feed_in_tariff: "Einspeisevergütung (Sensor, optional)", feed_in_tariff_fixed: "Einspeisevergütung fest (€/kWh)",
  };
  TAB_ORDER.forEach((k) => { L[`show_${k}`] = `Kategorie „${TAB_LABELS_DE[k]}“ anzeigen`; });
  for (let i = 1; i <= CONSUMER_MAX; i++) {
    L[`consumer${i}_name`] = `Verbraucher ${i}: Name`;
    L[`consumer${i}_power`] = `Verbraucher ${i}: Leistung`;
  }
  for (let i = 1; i <= PV_MAX; i++) {
    L[`pv${i}_name`] = `Anlage ${i}: Name (z. B. Süd)`;
    L[`pv${i}_power`] = `Anlage ${i}: aktuelle Leistung`;
    L[`pv${i}_energy_today`] = `Anlage ${i}: Energie heute (kWh, setzt täglich zurück)`;
    L[`pv${i}_forecast`] = `Anlage ${i}: Solcast Prognose heute`;
    L[`pv${i}_forecast_site`] = `Anlage ${i}: Solcast-Site-ID (optional)`;
    L[`pv${i}_forecast_tomorrow`] = `Anlage ${i}: Solcast Prognose morgen`;
    L[`pv${i}_forecast_now`] = `Anlage ${i}: Solcast Prognose-Leistung jetzt`;
  }
  return L;
}

function editorHelpers() {
  const H = {
    grid_power: "Ein Sensor, der beim Bezug positiv und bei Einspeisung negativ ist.",
    battery_power: "Positiv = Speicher entlädt, negativ = Speicher lädt. Sonst Vorzeichen umkehren.",
    pv_count: "Jede Himmelsrichtung ist eine eigene Anlage mit eigenen Sensoren.",
    history_months: "3, 6, 12, 24 oder bis zu 36 Monate. Die Integration begrenzt den Wert zusätzlich.",
    energy_pv: "Zähler mit state_class total_increasing (auch tägliche Utility-Meter), damit die Langzeitstatistik greift.",
  };
  for (let i = 1; i <= PV_MAX; i++) {
    H[`pv${i}_forecast`] = "Zum Beispiel sensor.solcast_pv_forecast_forecast_today. Die Detaildaten liest die Integration aus dem Attribut detailedForecast.";
    H[`pv${i}_forecast_site`] = "Nur nötig, wenn Solcast die Anlagen als Attribute aufschlüsselt. Bindestriche der Site-ID als Unterstrich schreiben.";
  }
  return H;
}

function buildSchema(cfg) {
  const entity = { entity: { domain: ["sensor", "input_number", "number"] } };
  const E = (name) => ({ name, selector: entity });
  const B = (name) => ({ name, selector: { boolean: {} } });
  const T = (name) => ({ name, selector: { text: {} } });
  const N = (name, min, max, step, unit) => ({
    name, selector: { number: Object.assign({ min, max, step, mode: "box" }, unit ? { unit_of_measurement: unit } : {}) },
  });
  const group = (title, icon, schema, expanded) => ({ type: "expandable", name: "", title, icon, flatten: true, expanded: !!expanded, schema });
  const count = clamp(Math.round(num(cfg.pv_count, 2)), 1, PV_MAX);

  const pvGroups = [];
  for (let i = 1; i <= count; i++) {
    pvGroups.push(group(`Anlage ${i}${isSet(cfg[`pv${i}_name`]) ? `: ${cfg[`pv${i}_name`]}` : ""}`, "mdi:solar-panel", [
      T(`pv${i}_name`), E(`pv${i}_power`), E(`pv${i}_energy_today`), E(`pv${i}_forecast`),
      T(`pv${i}_forecast_site`), E(`pv${i}_forecast_tomorrow`), E(`pv${i}_forecast_now`),
    ], i === 1));
  }
  const consumers = [];
  for (let i = 1; i <= CONSUMER_MAX; i++) consumers.push(T(`consumer${i}_name`), E(`consumer${i}_power`));

  return [
    group("Kategorien", "mdi:tab", [
      ...TAB_ORDER.map((k) => B(`show_${k}`)),
      { name: "default_tab", selector: { select: { mode: "dropdown", options: TAB_ORDER.map((k) => ({ value: k, label: TAB_LABELS_DE[k] })) } } },
    ], true),
    group("Darstellung", "mdi:palette-outline", [
      T("title"), B("show_title"), N("zoom", 50, 200, 5, "%"), B("show_stats"),
      { name: "history_months", selector: { select: { mode: "dropdown", options: [3, 6, 12, 24, 36].map((v) => ({ value: v, label: `${v} Monate` })) } } },
      N("flow_threshold", 0, 1000, 1, "W"),
    ]),
    group("Bearbeiten", "mdi:pencil-lock-outline", [B("read_only")]),
    group("Energiefluss-Sensoren", "mdi:flash", [
      E("grid_power"), B("grid_invert"), E("grid_import_power"), E("grid_export_power"),
      E("home_power"), E("pv_power"), E("battery_power"), B("battery_invert"), E("battery_soc"), N("battery_capacity", 0, 1000, 0.1, "kWh"),
      ...consumers,
    ]),
    group("PV-Anlagen und Solcast", "mdi:solar-power", [
      { name: "pv_count", selector: { number: { min: 1, max: PV_MAX, step: 1, mode: "box" } } },
      ...pvGroups,
    ]),
    group("Energie-Zähler (Tageswerte und Verlauf)", "mdi:counter", ENERGY_KEYS.map(E)),
    group("Strompreis", "mdi:currency-eur", [
      E("price_current"), E("price_min"), E("price_avg"), E("price_max"), E("price_level"),
      E("feed_in_tariff"), N("feed_in_tariff_fixed", 0, 10, 0.001, "€/kWh"),
    ]),
  ];
}

function schemaFieldNames(schema, out) {
  (schema || []).forEach((s) => {
    if (s.type === "expandable") schemaFieldNames(s.schema, out);
    else if (s.name) out.push(s.name);
  });
  return out;
}

class EnergieManagerCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._cfg = {};
    this._hass = null;
    this._info = null;
    this._infoError = null;
    this._form = null;
    this._built = false;
    this._pvCount = null;
    this._fieldNames = [];
  }

  setConfig(config) {
    this._cfg = Object.assign({}, config || {});
    if (!this._built) this._build();
    this._sync();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (this._form) this._form.hass = hass;
    if (first) { this._ensureComponents(); this._loadInfo(); }
  }
  get hass() { return this._hass; }

  async _ensureComponents() {
    try {
      if (window.loadCardHelpers) {
        const helpers = await window.loadCardHelpers();
        const card = await helpers.createCardElement({ type: "entities", entities: [] });
        if (card && card.constructor && card.constructor.getConfigElement) await card.constructor.getConfigElement();
      }
    } catch (e) { /* ha-form lädt die Auswahlfelder notfalls selbst */ }
  }

  async _loadInfo() {
    try {
      this._info = await this._hass.connection.sendMessagePromise({ type: `${DOMAIN}/info` });
      this._infoError = null;
    } catch (err) {
      this._info = null;
      this._infoError = err && err.code ? err.code : "error";
    }
    this._renderVersion();
  }

  _lang() {
    const l = String((this._hass && this._hass.language) || "de").slice(0, 2);
    return l;
  }

  _build() {
    this.shadowRoot.innerHTML = `<style>
:host{display:block}
.ver{padding:10px 12px;margin-bottom:12px;border:1px solid var(--divider-color);border-radius:8px;font-size:14px}
.ver.warn{border-color:var(--warning-color,#ff9800)}.ver.err{border-color:var(--error-color,#db4437)}
.ver .s{display:block;margin-top:4px;font-size:13px;color:var(--secondary-text-color)}
.colors{margin-top:12px;border:1px solid var(--divider-color);border-radius:8px;overflow:hidden}
.colors>summary{padding:10px 12px;cursor:pointer;font-weight:500}
.crow{display:flex;align-items:center;gap:8px;padding:6px 12px;border-top:1px solid var(--divider-color)}
.crow label{flex:1;min-width:0;font-size:13px}
.crow input[type=text]{width:130px;padding:4px 6px;border:1px solid var(--divider-color);border-radius:6px;background:var(--card-background-color);color:var(--primary-text-color);font:inherit;font-size:13px}
.crow input[type=color]{width:34px;height:28px;padding:0;border:1px solid var(--divider-color);border-radius:6px;background:none}
.crow button,.reset{border:1px solid var(--divider-color);background:none;color:var(--primary-text-color);border-radius:6px;padding:3px 8px;cursor:pointer;font:inherit;font-size:12px}
.reset{margin:8px 12px 10px}
</style>
<div id="ver"></div><div id="form"></div>
<details class="colors" id="colors"><summary>Farben</summary><div id="crows"></div><button class="reset" id="reset" type="button">Alle Farben zurücksetzen</button></details>`;
    this._built = true;
    this._form = document.createElement("ha-form");
    this._form.hass = this._hass;
    this._form.computeLabel = (s) => this._labels[s.name] || s.name;
    this._form.computeHelper = (s) => this._helpers[s.name] || "";
    this._form.addEventListener("value-changed", (ev) => { ev.stopPropagation(); this._update(ev.detail.value || {}); });
    this._labels = editorLabels();
    this._helpers = editorHelpers();
    this.shadowRoot.getElementById("form").appendChild(this._form);
    this.shadowRoot.getElementById("reset").addEventListener("click", () => {
      Object.keys(this._cfg).filter((k) => k.startsWith("color_")).forEach((k) => delete this._cfg[k]);
      this._fire();
      this._renderColors();
    });
    this._renderColors();
    this._renderVersion();
  }

  _sync() {
    const count = clamp(Math.round(num(this._cfg.pv_count, 2)), 1, PV_MAX);
    if (this._pvCount !== count || !this._form.schema) {
      this._pvCount = count;
      const schema = buildSchema(this._cfg);
      this._form.schema = schema;
      this._fieldNames = schemaFieldNames(schema, []);
    }
    this._form.hass = this._hass;
    this._form.data = Object.assign({}, DEFAULTS, this._cfg);
    this._renderVersion();
  }

  _renderVersion() {
    const el = this.shadowRoot && this.shadowRoot.getElementById("ver");
    if (!el) return;
    const info = this._info;
    let cls = "", status = "";
    if (info && info.update_available) {
      cls = "warn";
      status = `Neue Version ${esc(info.latest_version)} verfügbar. Aktualisiere über HACS und starte Home Assistant neu. Danach Browser neu laden (Strg+F5).`;
    } else if (info && info.version && info.version !== CARD_VERSION) {
      cls = "warn";
      status = `Karte (${CARD_VERSION}) und Integration (${esc(info.version)}) haben unterschiedliche Versionen. Browser neu laden (Strg+F5).`;
    } else if (info && info.check_failed) {
      cls = "err";
      status = "Prüfung auf neue Version nicht möglich.";
    } else if (info && info.latest_version) {
      status = "Aktuell.";
    } else if (this._infoError) {
      cls = "err";
      status = "Die Integration „Energie Manager“ antwortet nicht. Ist sie eingerichtet?";
    }
    el.innerHTML = `<div class="ver ${cls}"><strong>Karte ${esc(CARD_VERSION)} · Integration ${esc(info && info.version ? info.version : "–")}</strong>${status ? `<span class="s">${status}</span>` : ""}</div>`;
  }

  _colorKeys() {
    return Object.keys(COLOR_CONFIG_KEYS).map((k) => `color_${k}`).concat(TAB_ORDER.map((k) => `color_icon_${k}`));
  }

  _renderColors() {
    const box = this.shadowRoot.getElementById("crows");
    if (!box) return;
    box.innerHTML = this._colorKeys().map((k) => {
      const v = sanitizeColor(this._cfg[k]);
      const hex = /^#[0-9a-fA-F]{6}$/.test(v) ? v : "#000000";
      return `<div class="crow"><label for="t_${k}">${esc(COLOR_LABELS_DE[k] || k)}</label>
<input type="color" data-ck="${k}" value="${hex}" aria-label="${esc(COLOR_LABELS_DE[k] || k)}">
<input type="text" id="t_${k}" data-ck="${k}" data-fk="t_${k}" value="${esc(v)}" placeholder="Theme-Standard">
<button type="button" data-clear="${k}" title="Zurücksetzen">×</button></div>`;
    }).join("");
    box.querySelectorAll("input").forEach((inp) => {
      inp.addEventListener("input", () => {
        const k = inp.dataset.ck;
        const v = sanitizeColor(inp.value);
        if (inp.type === "color") {
          const t = box.querySelector(`input[type=text][data-ck="${k}"]`);
          if (t) t.value = inp.value;
        }
        if (v) this._cfg[k] = v; else delete this._cfg[k];
        this._fire();
      });
    });
    box.querySelectorAll("button[data-clear]").forEach((b) => {
      b.addEventListener("click", () => {
        delete this._cfg[b.dataset.clear];
        this._fire();
        this._renderColors();
      });
    });
  }

  _update(value) {
    const next = Object.assign({}, this._cfg);
    for (const name of this._fieldNames) {
      const v = value[name];
      if (v === undefined || v === null || (v === "" && name !== "title")) { delete next[name]; continue; }
      if (name in DEFAULTS && v === DEFAULTS[name] && !(name in this._cfg)) continue;
      next[name] = v;
    }
    next.type = this._cfg.type || `custom:${CARD_TAG}`;
    this._cfg = next;
    this._fire();
    const count = clamp(Math.round(num(next.pv_count, 2)), 1, PV_MAX);
    if (count !== this._pvCount) this._sync();
  }

  _fire() {
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: Object.assign({}, this._cfg) }, bubbles: true, composed: true }));
  }
}

// ---------- Registrierung ----------
if (!customElements.get(CARD_TAG)) customElements.define(CARD_TAG, EnergieManagerCard);
if (!customElements.get(EDITOR_TAG)) customElements.define(EDITOR_TAG, EnergieManagerCardEditor);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === CARD_TAG)) {
  window.customCards.push({
    type: CARD_TAG,
    name: "Energie Manager",
    description: "Energiefluss, PV-Erzeugung mit Solcast-Prognose, Speicher, Strompreis und Monatsverlauf.",
    preview: false,
  });
}
console.info(
  `%c ENERGIE-MANAGER-CARD %c ${CARD_VERSION} `,
  "color:#fff;background:#3b6642;font-weight:700;border-radius:3px 0 0 3px",
  "color:#3b6642;background:#fff;font-weight:700;border:1px solid #3b6642;border-radius:0 3px 3px 0"
);
if (window.__EM_TEST__) {
  window.__EM_TEST__ = { computeFlow, normalizeConfig, visibleTabs, toWatt, toKwh, toCurrencyPerKwh, sanitizeColor, buildSchema, schemaFieldNames, esc, niceMax, fmtDuration, I18N, EnergieManagerCard, CARD_VERSION };
}
