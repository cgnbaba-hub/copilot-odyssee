# Odyssee – das Copilot-Lernspiel

Eine gamifizierte Lernreise für **Microsoft 365 Copilot Chat** (Basic, für alle mit E3) und **Microsoft 365 Copilot** (Premium). Die App läuft als SharePoint-Framework-Webpart (SPFx) auf SharePoint-Seiten und in Teams, ohne eigene Server.

Plan und Arbeitspakete: [`docs/PLAN.md`](docs/PLAN.md)

## Aufbau

| Ordner | Inhalt |
|---|---|
| [`content/`](content/) | Inseln und Lernmodule als JSON, plus die JSON-Schemas dazu. Anleitung: [`docs/INHALTE.md`](docs/INHALTE.md) |
| [`app/src/core/`](app/src/core/) | Spiel-Engine ohne Plattform-Bezug: Inhaltsmodell, Prüfung, Fortschritt, XP, Prompt-Feedback |
| [`app/src/ui/`](app/src/ui/) | React-Oberfläche, Theme und Übersetzungen (de-CH, en) |
| [`app/src/data/`](app/src/data/) | Anbindung an SharePoint: Inhaltsdatei, Fortschrittsliste, Rückfall auf Browser-Speicher |
| [`app/src/webparts/odyssee/`](app/src/webparts/odyssee/) | SharePoint-Webpart, das die Oberfläche einbindet |
| [`provisioning/`](provisioning/) | PnP-PowerShell-Skripte zum Einrichten der Website und Hochladen der Inhalte |
| [`app/src/demo/`](app/src/demo/) | Demo-Einstieg: dieselbe Oberfläche mit Testdaten, ohne Tenant |
| [`app/tools/`](app/tools/) | Prüfen und Bündeln der Inhalte |
| [`legacy/`](legacy/) | Bisheriger Prototyp (React/Node/PostgreSQL), nur noch als Referenz |

## Entwickeln

Voraussetzung: Node.js 22 (SPFx 1.23 verlangt `>=22.14 <23`).

```bash
cd app
npm ci
```

| Befehl | Was passiert |
|---|---|
| `npm run content:check` | Prüft alle Inhalte in `content/` (Schema, Verweise, Schweizer Schreibweise) |
| `npm run content:export` | Prüft und schreibt `app/dist-content/odyssee-content.json` für SharePoint |
| `npm run demo` | Startet die Demo unter http://localhost:5173 |
| `npm run demo:build` | Baut die Demo nach `app/dist-demo/` |
| `npm test` | Typecheck, Lint und Unit-Tests |
| `npm run build` | Wie `npm test`, dazu das App-Paket `app/sharepoint/solution/odyssee.sppkg` |
| `npm start` | SPFx-Entwicklungsserver für die gehostete Workbench in SharePoint |

Die CI (GitHub Actions) führt Inhaltsprüfung, Build und Tests bei jedem Pull Request aus und stellt das App-Paket und die Demo als Download bereit.

## In SharePoint installieren

Schritt für Schritt in [`docs/SHAREPOINT.md`](docs/SHAREPOINT.md): App-Katalog, Liste und Bibliothek per Skript anlegen, Inhalte hochladen, Webpart auf eine Seite setzen.
