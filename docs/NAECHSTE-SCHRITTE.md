# Übergabe und nächste Schritte

Stand: 11. November 2026. Diese Datei ist die Übergabe an die nächste Sitzung. Arbeitsregeln stehen in [`CLAUDE.md`](../CLAUDE.md), der grosse Plan in [`PLAN.md`](PLAN.md), offene Punkte für den Livegang in [`ROLLOUT.md`](ROLLOUT.md).

Leitfrage für alles Weitere: **Bringt es Leute dazu, Copilot bei ihrer echten Arbeit zu nutzen?** Mehr Spielmechanik tut das kaum.

## Was zuletzt dazukam

| Paket | Was | Wo im Code |
|---|---|---|
| Regatta | Bereichsvergleich und freiwillige Rangliste, Wochen- und Gesamtwertung | `core/regatta/`, `ui/components/Regatta.tsx`, `data/sharepoint/SharePointRegattaSource.ts` |
| Ein Klick | «Kopieren und Copilot öffnen» an allen Prompts | `ui/components/CopilotLink.tsx`, `ui/copilot.ts` (`copyNow`) |
| Dranbleiben | Lernzeit als Kalenderdatei (.ics), Wochen-Serie | `core/progress/habit.ts`, `ui/components/StayOnCourse.tsx` |
| Use Cases teilen | Beitrag als Use Case mit Zeitangabe, «Übernehmen», Summe der Stunden | `core/pinboard/pinboard.ts`, `ui/components/Pinboard.tsx`, `state.ts` (`adoptUseCase`) |
| Aktuell bleiben | Redaktions-Übersicht in der Auswertung, «Neu seit deinem letzten Besuch» | `core/admin/editorial.ts`, `core/content/news.ts`, `ui/components/EditorialSection.tsx`, `NewsCard.tsx` |
| Odyssee-Lotse | Texte für einen Agenten in Copilot, Link im Hilfe-Fenster | `core/agent/agentPack.ts`, `tools/agent-export.ts`, [`AGENT.md`](AGENT.md) |

Geprüft ist alles mit Tests und in der Demo. **Nicht** geprüft: der echte Tenant, der Import der Kalenderdatei in Outlook, der Agent selbst.

## Was in welcher Ausgabe läuft

| Funktion | SharePoint | Demo | HTML-Datei | LMS-Paket (SCORM) |
|---|---|---|---|---|
| Etappen, Quiz, Prüfungen, Reisepass, Abzeichen | ja | ja | ja | ja |
| «Kopieren und Copilot öffnen» | ja | ja | ja | ja |
| Lernzeit einplanen, Wochen-Serie | ja | ja | ja, ohne Link im Termin | ja, ohne Link im Termin |
| «Neu seit deinem letzten Besuch» | ja | ja | ja | ja |
| Link zum Odyssee-Lotsen | ja | ja | ja | ja |
| Inhalte ändern ohne neues Paket | ja | – | nein | nein |
| Hafen-Pinnwand, Use Cases teilen | ja | Beispiele | nein | nein |
| Regatta | ja | Beispiele | nein | nein |
| Auswertung, Redaktions-Übersicht, Feedback-Liste | ja | Beispiele | nein | nein |

Grund für die «nein»: HTML-Datei und LMS-Paket haben keinen gemeinsamen Speicher. Der Spielstand liegt im Browser oder im LMS (`cmi.suspend_data`), alles Geteilte braucht die SharePoint-Listen. Das Profil wird im LMS vollständig gespeichert, neue Profilfelder (`plan`, `newsSeen`, `regatta`) überleben also.

## Nächste Pakete

### 1. LMS-Paket näher an die SharePoint-Fassung bringen

Das Paket soll nicht zur zweiten Klasse werden. Vorschläge, einzeln umsetzbar:

- **Brücke zur Gemeinschaft:** freiwilliges Feld in den Inhalten (wie `agentUrl` in `content/help.json`), z. B. `communityUrl`. Ist es gesetzt, zeigen HTML-Datei und LMS-Paket im Spickzettel einen Link «Hafen-Pinnwand und Regatta öffnen», der zur SharePoint-Seite führt. So bleibt der Kurs im LMS, das Geteilte an einem Ort.
- **Mehr ans LMS melden:** heute nur Status und Fortschritt (`data/scorm/ScormProgressStore.ts`). Sinnvoll wären `cmi.core.score.raw` (Anteil geschaffter Basic-Etappen) und Lernzeit (`cmi.core.session_time`). Erst im echten LMS prüfen, was SuccessFactors anzeigt, siehe [`LMS.md`](LMS.md).
- **Eigene Prompts mitnehmen:** In HTML-Datei und LMS-Paket fehlt die Pinnwand. Ein Export der eigenen Use-Case-Karten als Datei (oder «alle kopieren») gäbe dort wenigstens einen Weg, sie zu teilen.
- **Inhalte aktualisieren:** Nach Inhaltsänderungen `npm run scorm:build` und das Paket im LMS ersetzen. Prüfen, ob SuccessFactors den Spielstand beim Ersetzen behält; wenn nicht, in `LMS.md` festhalten.

### 2. Nacharbeiten an den neuen Paketen

- **Ein Klick:** im SharePoint-Webpart und in Teams testen (eingebettete Seiten sperren die Zwischenablage manchmal). Fällt `copyNow` dort aus, bleibt der Knopf «Kopieren».
- **Dranbleiben:** Import der `.ics` in Outlook (neu und klassisch) testen. Wochen-Serie zusätzlich im Reisepass zeigen. Optional ein Link «in Outlook im Web anlegen», falls ein solcher Link im Tenant funktioniert (nicht annehmen: der Link für vorausgefüllte Prompts funktionierte nicht).
- **Use Cases:** zählen, wie oft ein Use Case übernommen wurde (heute zählt nur «Hat mir geholfen»). Im Spickzettel «Aus deinem Bereich» mit den drei beliebtesten Use Cases zeigen. Eigene geteilte Beiträge in der App zurückziehen können.
- **Aktuell bleiben:** Hinweis «seit deinem Abschluss geändert» auch an der Etappe auf der Insel. Neuigkeiten auch für Hilfethemen. Beim Hinzufügen einer Etappe den Eintrag in `changes` mit `"new": true` nicht vergessen.
- **Odyssee-Lotse:** Agent anlegen und testen (macht der Auftraggeber, siehe `AGENT.md`), dann `agentUrl` eintragen. Offene Lizenzfragen stehen dort. Wissensdatei auf Englisch ergänzen, falls gebraucht.
- **Regatta:** mit Datenschutz klären, dann im Tenant testen (`SHAREPOINT.md`).

### 3. Kleiner, bei Gelegenheit

- Suche über Etappen, Hilfe und Prompt-Vorlagen.
- Grusswort der Geschäftsleitung auf der Startseite (Text in den Inhalten, ausblendbar).

## Was nicht geht (geprüft)

- Ein Link, der Copilot Chat mit vorausgefülltem Prompt öffnet: `m365.cloud.microsoft/chat?q=…` zeigt im Tenant nur das leere Chatfenster. Nicht noch einmal versuchen, ausser Microsoft dokumentiert einen solchen Link.

## Wartet auf den Auftraggeber

Steht in `ROLLOUT.md`: Etappen fachlich prüfen und freigeben (alle 33 sind noch `draft`), echte Bereichsliste, Einrichtung im Tenant mit der IT, Regatta mit dem Datenschutz klären, Entscheide von HR zu den Abzeichen, SCORM-Test im LMS, Odyssee-Lotsen anlegen.

## Sparsam arbeiten

- Pro Paket eine neue Sitzung starten. Der Verlauf früherer Sitzungen wird nicht gebraucht, diese Datei und `CLAUDE.md` reichen.
- Erst die betroffenen Dateien lesen, nicht das ganze Repo. Die Stil-Datei hat über 9000 Zeilen: mit Suche arbeiten, nie ganz lesen.
- `npm run build` einmal am Ende, nicht nach jeder Änderung. Screenshots nur für neue Ansichten.
