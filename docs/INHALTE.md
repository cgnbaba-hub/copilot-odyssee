# Inhalte pflegen

Alle Inhalte liegen als JSON-Dateien im Ordner [`content/`](../content/). Für SharePoint werden sie geprüft und zu einer Datei `odyssee-content.json` zusammengefasst, die in die Bibliothek `OdysseeInhalte` hochgeladen wird (siehe [`SHAREPOINT.md`](SHAREPOINT.md)). Die App lädt sie beim Öffnen; ein neues App-Paket ist für Inhaltsänderungen nicht nötig. Fehlt die Datei, nutzt die App die Inhalte, die beim Bauen ins Paket kamen.

## Aufbau

```
content/
├── islands.json          Alle Inseln der Seekarte
├── help.json             Fragen und Antworten im Hilfe-Fenster
├── areas.json            Arbeitsbereiche mit Use-Case-Ideen
├── prompts.json          Prompt-Vorlagen für den Spickzettel
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
| `changes` | Freiwillig: Liste von Änderungen, je mit `date` (JJJJ-MM-TT), `note` (ein Satz, DE und EN) und bei einer neuen Etappe `"new": true`. Die App zeigt sie 60 Tage lang auf der Startseite unter «Neu seit deinem letzten Besuch» und weist bei abgeschlossenen Etappen auf die Änderung hin |
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
| `mission` | Im echten Copilot ausprobieren | `title`, `task`, optional `tip`, `copyText` (Text mit Knopf «Text kopieren»), `copilot: false` (Aufgabe ausserhalb von Copilot, dann ohne Schritt-Anleitung), `app` (`outlook`, `teams`, `word`, `excel` oder `powerpoint`: die Anleitung führt dann durch diese App statt zu Copilot Chat) |
| `usecase` | Eigenen Use Case festhalten | `intro` |

Seemeilen (XP) vergibt die App selbst: Quiz je nach Schwierigkeit 10–80, Prompt bis 100, Mission 30, Use Case 50, Briefing 5, Abschluss einer Etappe 50.

## Hilfe

`help.json` füllt das Hilfe-Fenster (Knopf «Hilfe» oben rechts). Jedes Thema hat `id`, `question` und `answer` (gleiche Formatierung wie `body` im Briefing). Mit `"illustration": "license"` erscheint unter der Antwort eine vereinfachte Darstellung, wie man Basic und Premium in Copilot erkennt. Neue Fragen von Kolleginnen und Kollegen lassen sich so ohne neues App-Paket ergänzen.

Die Themen stehen unter Überschriften aus `groups` (`id`, `title`); jedes Thema nennt seine Gruppe in `group`. Im Hilfe-Fenster kann man zusätzlich nach Stichworten suchen. `contact` ist die E-Mail-Adresse für Fragen, die die App nicht beantwortet. Sie erscheint unten in der Hilfe und unter jeder Ansicht der App.

## Bereiche und Prompt-Vorlagen

`areas.json` legt die Arbeitsbereiche fest, die man beim Start und in den Einstellungen wählt. Jeder Bereich hat `id`, `name`, `hint` (kurze Beschreibung) und `useCaseIdeas`: typische Aufgaben, die auf den Use-Case-Karten als anklickbare Vorschläge erscheinen. Der letzte Bereich sollte allgemein sein («Anderer Bereich»); seine Ideen erscheinen auch bei Personen, die keinen Bereich gewählt haben.

`prompts.json` füllt den Spickzettel. Jede Vorlage hat `id`, `title`, `prompt` und `license` (`basic` oder `premium`). Optional:
- `areas`: Liste von Bereichs-ids. Fehlt das Feld, passt die Vorlage für alle Bereiche.
- `app`: `outlook`, `teams`, `word`, `excel` oder `powerpoint`, wenn man die Vorlage dort verwendet. Ohne `app` gibt es den Knopf «Copilot öffnen».

Platzhalter schreibst du in eckige Klammern, zum Beispiel `[Thema]`. Die App hebt sie farbig hervor. Die Prüfung meldet unbekannte Bereiche, doppelte ids und «ß».

## Inselprüfungen

`content/exams.json` enthält pro Insel drei bis acht **neue** Fragen (Schema `schema/exams.schema.json`), aufgebaut wie die Quizfragen in den Modulen. Die Prüfung öffnet sich, wenn alle Etappen einer Insel abgeschlossen sind. Wer mindestens drei Viertel der Fragen auf Anhieb richtig beantwortet (bei 4 Fragen also 3), hat die Insel geschafft und bekommt den Stempel im Reisepass. Die Fragen kommen bei jedem Versuch in neuer Reihenfolge.

Gute Prüfungsfragen:
- fragen Wissen aus **mehreren Etappen** ab, nicht nur aus einer
- sind **neu**, also keine Kopie einer Frage aus den Etappen
- haben **gleich lange und gleich konkrete** Antworten; falsche Antworten sind typische Irrtümer, keine offensichtlichen Fehler

`npm run content:check` warnt, wenn eine richtige Antwort deutlich länger ist als alle falschen (in Etappen und Prüfungen), weil sie sich dadurch verrät.

## Prüfen

```bash
cd app
npm run content:check
```

Die Prüfung meldet unter anderem fehlende Übersetzungen, unbekannte Felder, Verweise auf nicht existierende Inseln, Quizfragen ohne richtige Antwort, «ß» in deutschen Texten und überfällige Reviews (als Warnung). Die CI führt sie bei jedem Pull Request aus.

## Review

Für fachliche Reviews ohne JSON:

```bash
cd app
npm run content:review
```

Das schreibt `app/dist-content/inhalte-review.md` mit allen deutschen Texten, richtigen und falschen Antworten, Beispiel-Prompts und den Redaktionsnotizen. Nach der Freigabe eines Moduls `status` auf `active` setzen und `reviewedAt` aktualisieren.

Jeder Beispiel-Prompt muss im Prompt-Feedback der App 100 Punkte erreichen; ein Test prüft das bei jedem Build.

## Inhalte ändern, ohne die App neu zu bauen

In SharePoint lädt die App die Inhalte bei jedem Öffnen aus der Bibliothek `OdysseeInhalte`. Eine Änderung braucht deshalb kein neues App-Paket:

1. JSON-Datei in `content/` ändern, `version` erhöhen, `reviewedAt` setzen. Wenn Teilnehmende davon erfahren sollen, einen Eintrag in `changes` ergänzen.
2. `npm run content:check` und `npm run content:export` (in `app/`).
3. Die erzeugte `odyssee-content.json` mit `provisioning/Publish-OdysseeContent.ps1` hochladen. Beim nächsten Öffnen sehen alle die neue Fassung.

Was zu prüfen ist, zeigt die Auswertung unter «Redaktion: Was ist zu prüfen?»: gemeldete Etappen («Stimmt das noch?»), überfällige und bald fällige Prüfungen. Eine Meldung verschwindet dort, sobald die Etappe oder der gemeldete Schritt (`asOf`) ein neueres Prüfdatum hat.

Das gilt nicht für die HTML-Datei für Kolleginnen und Kollegen und nicht für das LMS-Paket: Dort sind die Inhalte fest eingebaut. Nach einer Änderung `npm run team:build` oder `npm run scorm:build` laufen lassen und die Datei neu verteilen oder das Paket im LMS ersetzen. Der Spielstand bleibt dabei erhalten.
