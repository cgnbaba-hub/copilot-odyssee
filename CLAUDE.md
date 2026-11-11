# Copilot Odyssee – Arbeitsregeln für dieses Repo

Lern-App für Microsoft Copilot bei DERTOUR Suisse, als SharePoint-Webpart (SPFx). Basic = Copilot Chat, Premium = Microsoft 365 Copilot.

## Sprache

- Mit dem Auftraggeber Deutsch. Texte in der App immer Deutsch **und** Englisch.
- Schweizer Schreibweise: immer «ss», nie das Eszett (die Inhaltsprüfung lehnt es ab). Anführungszeichen « ».
- Du-Form, kurze Sätze, keine Fachwörter ohne Erklärung.

## Aufbau

- `content/` Inhalte als JSON (Inseln, Etappen in `modules/`, Hilfe, Bereiche, Prompts, Challenges, Prüfungen), Schemas in `content/schema/`.
- `app/src/core/` reine Logik mit Tests, kein DOM. `app/src/data/` SharePoint und SCORM. `app/src/ui/` React 17. `app/src/demo/` Demo-Einstieg mit Beispieldaten.
- `app/src/ui/i18n/strings.ts`: zwei Objekte `de` und `en`, jeder Schlüssel in beiden.
- `app/src/ui/styles.module.scss`: eine Datei; Neues als eigener Abschnitt ans Ende.
- `provisioning/` PnP-Skripte, `docs/` Anleitungen. Plan: `docs/PLAN.md`, nächste Pakete: `docs/NAECHSTE-SCHRITTE.md`.

## Befehle (in `app/`)

- `npm run build` – Inhalte bündeln, Lint, alle Tests, App-Paket. Das ist auch die CI. Tests laufen nur so (Heft), nicht mit `npx jest`.
- `npm run content:check` – Inhalte prüfen.
- `npm run demo:build` (→ `dist-demo`), `team:build` (eine HTML-Datei), `scorm:build` (LMS-Paket).
- `npm run agent:export` – Texte für den Odyssee-Lotsen nach `dist-agent` (siehe `docs/AGENT.md`).
- `npx tsc --noEmit -p .` meldet fehlende Style-Klassen, bis `npm run build` die Typen erzeugt hat; andere Fehler sind echt.
- Formatieren, nur angefasste Dateien, nie die SCSS-Datei: `npx prettier --single-quote --print-width 180 --trailing-comma none --write <dateien>`. Nicht umformatieren: `LicenseMockup.tsx`, `RichText.tsx`, `UseCaseCards.tsx`.

## Muster

- Eine neue SharePoint-Quelle ist optional: Interface in `core/`, Klasse in `data/sharepoint/`, in `data/connect.ts` prüfen und bei fehlender Liste weglassen, Liste in `provisioning/Setup-Odyssee.ps1`, Beispiel in `demo/`, Abschnitt in `docs/SHAREPOINT.md`. Vorlagen: Pinnwand und Regatta.
- Ausgaben `demo`, `team`, `scorm` über die Konstante `__ODYSSEE_EDITION__`; `team` und `scorm` haben keine geteilten Daten.
- Neue Felder im Spielstand (`core/progress/state.ts`) immer optional, alte Stände müssen weiter laden.
- Datenschutz: Auswertungen nur zusammengefasst, Gruppen unter 5 nicht einzeln. Alles, was andere sehen, nur nach eigener Wahl der Person. Seemeilen und Ränge schalten keine Lizenz frei.
- Aussagen über Copilot nur, wenn geprüft; Unsicheres im PR nennen. Die meisten SharePoint-Teile sind noch nicht im echten Tenant gelaufen: nichts als getestet ausgeben, was nur gegen Attrappen lief.

## Ablauf

- Ein Paket = ein PR von `claude/great-hypatia-msucti` nach `main`, als Entwurf eröffnen. Wenn die CI «Inhalte, Tests und Pakete» grün ist: bereit setzen und squash-mergen, danach den Branch auf `main` zurücksetzen.
- Vor dem PR: `npm run build` grün, Oberfläche in der Demo am Desktop und bei 390 px Breite ansehen (Playwright ist installiert, `locale: 'de-CH'`).
