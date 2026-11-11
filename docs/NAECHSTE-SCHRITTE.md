# Nächste Schritte

Stand: 11. November 2026. Diese Datei ist die Übergabe für die nächsten Arbeitspakete. Jedes Paket ist für sich umsetzbar, je ein PR. Arbeitsregeln stehen in [`CLAUDE.md`](../CLAUDE.md), der grosse Plan in [`PLAN.md`](PLAN.md), offene Punkte für den Livegang in [`ROLLOUT.md`](ROLLOUT.md).

## Wo die App steht

Fertig und gemergt: 12 Inseln mit 33 Etappen (alle noch `draft`), Kompass-Kurs (6 Pflicht-Etappen), Quiz mit Auffrischen, Inselprüfungen, Spickzettel mit Prompt-Vorlagen nach Bereich, Prompt-Werkstatt, Use-Case-Karten, Hafen-Pinnwand mit Freigabe, Challenge der Woche, Reisepass, zwei Abzeichen mit Zertifikat, Auswertung für die Redaktion, Feedback und «Stimmt das noch?», Regatta (Bereichsvergleich, freiwillig), Demo, HTML-Datei für Kolleginnen und Kollegen, SCORM-Paket.

Leitfrage für alles Weitere: **Bringt es Leute dazu, Copilot bei ihrer echten Arbeit zu nutzen?** Mehr Spielmechanik (Ranglisten, Punkte) tut das kaum. Die Pakete unten sind danach geordnet.

## Paket A: «In Copilot öffnen» mit einem Klick

**Warum:** Heute heisst jede Übung: Prompt kopieren, Copilot suchen, einfügen. Das ist die grösste Hürde der ganzen App. Ein Knopf, der Copilot Chat mit dem fertigen Prompt öffnet, macht aus jeder Vorlage einen Klick.

**Zuerst prüfen (Auftraggeber, 1 Minute):** Öffnet `https://m365.cloud.microsoft/chat?q=Sag%20Hallo` im Firmen-Tenant Copilot Chat mit dem Text im Eingabefeld? Der Parameter `q` ist aus der Erinnerung, nicht geprüft. Wenn nein: Paket streichen oder nur «kopieren und öffnen» in einem Schritt bauen.

**Umfang**
- `app/src/ui/copilot.ts`: `copilotChatLink(prompt)` mit `encodeURIComponent`; über etwa 1800 Zeichen kein Link, dann wie bisher kopieren.
- Ein Knopf «In Copilot öffnen» überall, wo ein Prompt für Copilot Chat steht: `PromptCard.tsx`, `ChallengeCard.tsx`, `Pinboard.tsx`, `Bottle.tsx`, Missionen mit `copyText`, Beispiel im Briefing. Der Klick kopiert zusätzlich, damit Einfügen als Rückfall geht. Nicht für Prompts in Outlook, Word usw. (dort gibt es keinen solchen Link).
- Prompts mit Platzhaltern in eckigen Klammern: Hinweis «Ersetze die Klammern, bevor du sendest».
- Schalter im Theme (`theme.copilot.prefill`), damit man es ohne neuen Code abstellen kann.

**Fertig, wenn:** Tests für den Link (Kodierung, Längengrenze), Knopf in der Demo an allen genannten Stellen, Hilfethema ergänzt.

## Paket B: Der Odyssee-Lotse, ein Agent in Copilot

**Warum:** Fragen kommen bei der Arbeit, nicht in der Lern-App. Ein Agent in Copilot Chat, der die Inhalte der Odyssee kennt, hilft genau dann. Er zeigt nebenbei, was Agenten können (Insel des Hephaistos), und ist das, was man der Geschäftsleitung vorführt.

**Zuerst prüfen:** Können Mitarbeitende mit Copilot Chat (Basic) im Tenant einen geteilten Agenten nutzen, und darf er eine hochgeladene Datei als Wissen haben? Zeichengrenze für die Anweisungen (aus der Erinnerung 8000). Aktuelle Microsoft-Doku lesen, nichts annehmen.

**Umfang**
- `npm run agent:export` (neues Werkzeug in `app/tools/`) schreibt nach `app/dist-agent/`: `anweisungen.md` (Rolle, Ton, Schweizer Schreibweise, Grenzen, Verweis auf Etappen), `wissen.md` (aus den Inhalten erzeugt: Hilfethemen, Prompt-Vorlagen nach Bereich, pro Etappe Zusammenfassung und Direktlink `?etappe=<id>`), `starter.md` (sechs Einstiegsfragen).
- `docs/AGENT.md`: Schritt für Schritt, wie man den Agenten im Agent-Builder von Copilot anlegt, teilt und nach Inhaltsänderungen erneuert.
- In der App: optionaler Link «Frag den Odyssee-Lotsen» im Hilfe-Fenster (`theme.agentUrl`), unsichtbar, solange leer.

**Fertig, wenn:** Der Export läuft in der CI mit, Test prüft Grösse und dass jede aktive Etappe im Wissen steht, Anleitung ist da. Den Agenten selbst legt der Auftraggeber an.

## Paket C: Use-Case-Bibliothek und Wirkung

**Warum:** Die Use-Case-Karten sind das Wertvollste, was Teilnehmende erzeugen: echte Aufgaben mit geschätzter Zeit. Heute bleiben sie privat. Geteilt werden sie zur Ideensammlung nach Bereich, und die Auswertung kann zeigen, wie viele Stunden pro Monat zusammenkommen. Das ist die Zahl, nach der die Geschäftsleitung fragt.

**Umfang**
- Eigene Karte teilen (Knopf auf der Karte), mit Freigabe durch die Redaktion wie bei der Pinnwand. Am einfachsten: Liste `OdysseePinnwand` um die Felder Art (`prompt` oder `usecase`), Häufigkeit und Minuten erweitern, statt einer neuen Liste.
- Reiter «Use Cases» im Spickzettel: nach Bereich filtern, «Hat mir geholfen», «Übernehmen» legt eine Kopie in den eigenen Karten an.
- Auswertung: geteilte Use Cases nach Bereich, Summe der Stunden pro Monat, als CSV.
- Vor dem Teilen dieselbe Warnung vor Personen- und Kundendaten wie auf der Pinnwand (`sensitiveHints`).

**Fertig, wenn:** Tests für Quelle und Zählung, Demo mit Beispielen, Setup-Skript und `docs/SHAREPOINT.md` ergänzt.

## Paket D: Aktuell bleiben

**Warum:** Copilot ändert sich monatlich. Ohne dieses Paket ist die App in einem Vierteljahr stellenweise falsch, und niemand merkt es.

**Umfang**
- **Redaktions-Übersicht** in `AdminView.tsx`, Logik in `core/admin/editorial.ts`: pro Etappe fällig am (`reviewedAt` + `reviewIntervalDays`), offene Meldungen aus «Stimmt das noch?» (Art `Stimmt das noch? (Schritt prüfen)`, die Kennung `etappe/schritt` steht in Klammern im Feld Seite). Offen heisst: gemeldet am oder nach dem Prüfdatum der Etappe oder des Schritts (`asOf`). Reihenfolge: gemeldet, überfällig, in 30 Tagen fällig. Dazu die Zahl der Entwürfe und ein CSV.
- **«Neu seit deinem letzten Besuch»:** optionales Feld `changes` pro Etappe (Datum, kurzer Text DE/EN) im Schema; `lastVisit` im Profil; Karte auf der Startseite mit neuen und geänderten Etappen; bei abgeschlossenen Etappen ein Hinweis «Seit deinem Abschluss geändert».

**Fertig, wenn:** Tests für Fälligkeit und Zuordnung der Meldungen, Demo zeigt beides, `docs/INHALTE.md` erklärt das Feld `changes`.

## Paket E: Dranbleiben

**Warum:** Die meisten hören nach der ersten Sitzung auf. Ein fester Termin wirkt stärker als jede Mechanik in der App.

**Umfang**
- «15 Minuten pro Woche einplanen»: erzeugt eine Kalenderdatei (ICS, wöchentlich, mit Link zur App), Wochentag und Zeit wählbar. Angebot nach der ersten abgeschlossenen Etappe und in den Einstellungen.
- Wochen-Serie: Wochen in Folge mit mindestens einer abgeschlossenen Etappe, sichtbar im Reisepass. Eine verpasste Woche setzt freundlich zurück, ohne Strafe.
- Läuft ohne SharePoint, also auch in der HTML-Datei und im LMS-Paket.

## Kleiner, bei Gelegenheit

- Suche über Etappen, Hilfe und Prompt-Vorlagen.
- Grusswort der Geschäftsleitung auf der Startseite (Text in den Inhalten, ausblendbar).

## Wartet auf den Auftraggeber

Steht in `ROLLOUT.md`: Etappen fachlich prüfen und freigeben, echte Bereichsliste, Einrichtung im Tenant mit der IT, Regatta mit dem Datenschutz klären, Entscheide von HR zu den Abzeichen, SCORM-Test im LMS.

## Sparsam arbeiten

- Pro Paket eine neue Sitzung starten. Der Verlauf früherer Sitzungen wird nicht gebraucht, diese Datei und `CLAUDE.md` reichen.
- Erst die betroffenen Dateien lesen, nicht das ganze Repo. Die Stil-Datei hat über 9000 Zeilen: mit Suche arbeiten, nie ganz lesen.
- `npm run build` einmal am Ende, nicht nach jeder Änderung. Screenshots nur für neue Ansichten.
