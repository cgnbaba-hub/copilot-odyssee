# Inhalte pflegen

Alle Inhalte liegen als JSON-Dateien im Ordner [`content/`](../content/). Die App liest sie beim Bauen ein; in AP 1.4 kommt das Laden aus einer SharePoint-Bibliothek dazu, dann ist kein neues App-Paket mehr nötig.

## Aufbau

```
content/
├── islands.json          Alle Inseln der Seekarte
├── modules/              Ein Modul (Etappe) pro Datei
│   └── aiolos-gute-prompts.json
└── schema/               Regeln, gegen die geprüft wird
```

Editoren wie VS Code kennen über den Eintrag `"$schema"` am Dateianfang alle erlaubten Felder und zeigen Fehler und Erklärungen direkt beim Tippen an.

## Ein Modul

| Feld | Bedeutung |
|---|---|
| `id` | Eindeutiger Name, gleich wie der Dateiname, z. B. `aiolos-gute-prompts` |
| `island` | `id` der Insel aus `islands.json` |
| `order` | Reihenfolge auf der Insel |
| `version` | Versionsnummer, z. B. `1.2.0`; bei jeder inhaltlichen Änderung erhöhen |
| `owner` | Wer ist verantwortlich? |
| `status` | `draft` (Entwurf), `active` (live) oder `deprecated` (veraltet, ausgeblendet) |
| `reviewedAt`, `reviewIntervalDays` | Datum der letzten fachlichen Prüfung und Prüfintervall. Pflicht für `active` |
| `license` | Optional: überschreibt die Lizenzstufe der Insel (`basic` oder `premium`) |
| `title`, `summary` | Titel und Kurzbeschreibung |
| `estimatedMinutes` | Geschätzte Dauer |
| `notes` | Interne Notizen, erscheinen nicht in der App |
| `blocks` | Die Bausteine, siehe unten |

Alle Texte gibt es in beiden Sprachen: `{ "de": "…", "en": "…" }`. Deutsch in Schweizer Schreibweise, also «ss» statt «ß».

## Bausteine

| `type` | Wofür | Wichtigste Felder |
|---|---|---|
| `briefing` | Kurze Info | `title`, `body` (Absätze mit Leerzeile, Aufzählung mit `- `, **fett** mit `**…**`), optional `links` |
| `quiz` | Eine Frage | `question`, `difficulty`, `options` (je `text`, `correct`, optional `explanation`) |
| `prompt` | Prompt-Werkstatt | `title`, `scenario`, `difficulty`, `rubric` (`goal`, `context`, `source`, `expectation`), optional `examplePrompt` |
| `mission` | Im echten Copilot ausprobieren | `title`, `task`, optional `tip` |
| `usecase` | Eigenen Use Case festhalten | `intro` |

Seemeilen (XP) vergibt die App selbst: Quiz je nach Schwierigkeit 10–80, Prompt bis 100, Mission 30, Use Case 50, Briefing 5, Abschluss einer Etappe 50.

## Prüfen

```bash
cd app
npm run content:check
```

Die Prüfung meldet unter anderem fehlende Übersetzungen, unbekannte Felder, Verweise auf nicht existierende Inseln, Quizfragen ohne richtige Antwort, «ß» in deutschen Texten und überfällige Reviews (als Warnung). Die CI führt sie bei jedem Pull Request aus.
