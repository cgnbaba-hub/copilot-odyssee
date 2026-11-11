# Der Odyssee-Lotse: ein Agent in Copilot

Der Odyssee-Lotse ist ein Agent in Copilot Chat. Er kennt die Inhalte der Odyssee und beantwortet Fragen dort, wo sie auftauchen: bei der Arbeit in Copilot, nicht in der Lern-App. Er ersetzt die App nicht, er verlängert sie in den Alltag.

Den Agenten legt ihr von Hand in Copilot an. Dieses Repo liefert nur seine Texte und hält sie mit den Inhalten im Gleichschritt.

> Stand: Die Texte werden erzeugt und in der CI geprüft. Den Agenten selbst habe ich nicht angelegt und nicht getestet. Die Angaben zu Copilot unten stammen aus dem Gedächtnis und sind nicht gegen die aktuelle Microsoft-Dokumentation geprüft. Bitte vor dem Ausrollen mit der IT klären (siehe «Vorher klären»).

## Was erzeugt wird

In `app/`:

```bash
npm run agent:export -- --url https://<tenant>.sharepoint.com/sites/<site>/SitePages/Odyssee.aspx
```

Das schreibt nach `app/dist-agent/`:

| Datei | Inhalt | Wohin im Agenten |
|---|---|---|
| `anweisungen.md` | Rolle, Ton, Schweizer Schreibweise, Basic und Premium, Grenzen | Feld «Anweisungen» |
| `wissen.md` | Alle Hilfethemen, jede Etappe mit Zusammenfassung und Briefings, alle Prompt-Vorlagen | Als Datei unter «Wissen» |
| `starter.md` | Sechs Einstiegsfragen | «Vorgeschlagene Prompts» |

- `--url` ist die Adresse der Seite mit der Odyssee. Damit verlinkt die Wissensdatei jede Etappe direkt. Ohne `--url` nennt sie nur die Namen.
- Ohne `--drafts` kommen nur freigegebene Etappen (`active`) hinein. Solange alle Etappen Entwurf sind, ist die Wissensdatei ohne `--drafts` fast leer.
- Die CI erzeugt die Dateien bei jedem Lauf mit `--drafts` und legt sie als Artefakt `odyssee-lotse` ab.

## Vorher klären (mit der IT)

1. Dürfen Mitarbeitende mit Copilot Chat (Basic) einen geteilten Agenten nutzen, oder nur solche mit Microsoft 365 Copilot?
2. Darf der Agent eine hochgeladene Datei oder eine Datei in SharePoint als Wissen verwenden, und kostet das für Personen ohne Premium-Lizenz etwas (verbrauchsabhängige Abrechnung)?
3. Wer darf Agenten anlegen und im Unternehmen teilen?

Falls Wissen aus Dateien für Basic nicht geht: Der Agent funktioniert auch nur mit den Anweisungen. Er kennt dann Rolle, Regeln und die Inseln, aber nicht die Details der Etappen.

## Anlegen

1. Copilot Chat öffnen, links «Agents» und «Agent erstellen» wählen (die Bezeichnungen können abweichen).
2. Name: «Odyssee-Lotse». Beschreibung: «Hilft dir, Copilot bei deiner Arbeit zu nutzen. Kennt die Copilot Odyssee.»
3. Anweisungen: Inhalt von `anweisungen.md` einfügen.
4. Wissen: `wissen.md` hochladen, oder die Datei in der SharePoint-Bibliothek der Odyssee ablegen und dort als Quelle wählen.
5. Vorgeschlagene Prompts: die Fragen aus `starter.md` eintragen.
6. Testen: die Fragen aus `starter.md` stellen, dazu zwei eigene aus dem Alltag. Antwortet er mit «ss»? Nennt er, ob etwas Basic oder Premium braucht? Sagt er, wenn er etwas nicht weiss?
7. Teilen und den Link kopieren.

## In der App verlinken

Den Link in `content/help.json` als `agentUrl` eintragen, neben `contact`:

```json
"contact": "ai-automation@dertour.ch",
"agentUrl": "https://…"
```

Dann zeigt das Hilfe-Fenster «Frag den Odyssee-Lotsen». Das ist nur ein Link und funktioniert deshalb auch im LMS-Paket und in der HTML-Datei. Ohne `agentUrl` erscheint nichts.

## Aktuell halten

Nach jeder grösseren Inhaltsänderung `npm run agent:export` neu laufen lassen und `wissen.md` im Agenten ersetzen. Die Anweisungen ändern sich nur, wenn Inseln dazukommen oder die Kontaktadresse wechselt.
