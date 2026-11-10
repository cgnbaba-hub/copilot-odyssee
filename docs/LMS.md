# Copilot Odyssee im LMS (SCORM 1.2)

Neben dem SharePoint-Webpart und der einzelnen HTML-Datei für Kolleginnen und Kollegen gibt es die Odyssee als **SCORM-1.2-Paket**. Damit lässt sie sich in ein Lernmanagementsystem (LMS) wie **SAP SuccessFactors Learning** hochladen. Das LMS startet die App, speichert den Fortschritt und zeigt an, wer den Kurs abgeschlossen hat.

## Was das Paket ist

- Eine ZIP-Datei `copilot-odyssee-scorm12.zip` mit genau zwei Dateien im Wurzelverzeichnis:
  - `imsmanifest.xml`: beschreibt den Kurs für das LMS (SCORM 1.2, ein Kurs «Copilot Odyssee» mit einer Lerneinheit, Kennung `ch.dertour.copilot-odyssee`).
  - `index.html`: die ganze App in einer Datei, mit allen Inhalten. Sie braucht keinen Server und keine Verbindung zu SharePoint.
- Die App verhält sich wie die Team-Ausgabe: keine Beispiel-Auswertung, keine Hafen-Pinnwand, Feedback per Mail an die Kontaktadresse. Der Fortschritt liegt aber im LMS statt nur im Browser.
- Wird die `index.html` ausserhalb eines LMS geöffnet (z. B. direkt von der Festplatte), läuft sie trotzdem. Dann erscheint der Hinweis, dass der Fortschritt nur in diesem Browser gespeichert wird.

## Paket bauen

```bash
cd app
npm ci
npm run scorm:build
```

Das Ergebnis liegt in `app/dist-scorm/copilot-odyssee-scorm12.zip` (rund 320 KB). Der Befehl bündelt zuerst die Inhalte aus `content/`, baut dann die App und packt sie mit dem Manifest zusammen. Er braucht kein `zip`-Programm und funktioniert deshalb auch unter Windows. Nach jeder Inhaltsänderung muss das Paket neu gebaut und im LMS ersetzt werden.

## In SuccessFactors Learning testen

Die genauen Menüpfade hängen von der Version und der Konfiguration eures Systems ab. Die LMS-Administration kennt sie. Der Ablauf ist im Allgemeinen so:

1. **Inhalt importieren:** Die ZIP-Datei als Online-Inhalt importieren (Import von Inhalten bzw. Content-Import, Typ SCORM 1.2). Das LMS liest dabei das Manifest und legt ein Inhaltsobjekt an.
2. **Lerneinheit anlegen:** Ein Lernelement (Learning Item) erstellen und das importierte Inhaltsobjekt damit verknüpfen. Dort wird auch festgelegt, ob der Kurs im selben Fenster (eingebettet) oder in einem neuen Fenster (Pop-up) startet.
3. **Zuweisen:** Das Lernelement zuerst sich selbst oder einer kleinen Testgruppe zuweisen.
4. **Starten:** Als Testperson den Kurs aus dem eigenen Lernplan starten, ein paar Schritte spielen, schliessen und wieder öffnen.
5. **Ergebnis prüfen:** In der Lernhistorie bzw. im Bericht der Administration nachsehen, ob Status, Punktzahl und Lernzeit ankommen (siehe Checkliste unten).

Für einen schnellen Abschlusstest eignet sich eine Testperson, die die Basic-Inseln komplett durchspielt.

## Was an das LMS gemeldet wird

| SCORM-Feld | Inhalt |
|---|---|
| `cmi.core.lesson_status` | `incomplete`, sobald gespielt wird; `completed`, sobald alle **Basic-Inseln** abgeschlossen sind (alle Etappen und die Inselprüfung bestanden, also mit Stempel im Reisepass). Ein Status `completed` oder `passed` wird nie wieder zurückgesetzt, auch nicht über «Fortschritt zurücksetzen». |
| `cmi.core.score.raw` | Anteil der abgeschlossenen Basic-Inseln in Prozent (0–100), mit `score.min` 0 und `score.max` 100 |
| `cmi.core.session_time` | Dauer der Sitzung, wenn die App geschlossen wird |
| `cmi.core.lesson_location` | Kennung der Etappe, die gerade gespielt wird (nur als Hinweis für Berichte) |
| `cmi.suspend_data` | Der gesamte Spielstand, komprimiert. Damit geht es beim nächsten Start dort weiter, wo man aufgehört hat, auch auf einem anderen Gerät. |
| `cmi.core.exit` | `suspend`, damit das LMS den Spielstand für den nächsten Start aufbewahrt |

Vom LMS gelesen wird ausserdem der Name der Person (`cmi.core.student_name`, meist «Nachname, Vorname»). Er erscheint im Reisepass als «Vorname Nachname» und wird nicht gespeichert.

Die Premium-Inseln zählen für den LMS-Status nicht, sie bleiben freiwillig. Eine eigene Mindestpunktzahl (Mastery Score) ist im Manifest bewusst nicht gesetzt: Den Abschluss meldet die App selbst.

**Nicht gemeldet bzw. nicht verfügbar:**

- keine Hafen-Pinnwand (sie braucht die SharePoint-Listen)
- keine Auswertung in der App; Kennzahlen kommen aus den Berichten des LMS
- Feedback geht per Mail an die Kontaktadresse, nicht in eine Liste
- Use Cases, Quiz-Antworten und Bewertungen werden nicht einzeln an das LMS gemeldet, sie sind nur im Spielstand enthalten

## Die Grenze von 4096 Zeichen

SCORM 1.2 erlaubt für `cmi.suspend_data` höchstens 4096 Zeichen. Der Spielstand einer kompletten Reise ist als Text rund zehnmal so gross. Die App geht so damit um:

1. Der Spielstand wird verlustfrei in eine kurze Form gebracht und mit `lz-string` komprimiert, in Zeichen, die jedes LMS unverändert speichert. Vorne steht eine Formatkennung (`o1:`), damit spätere Versionen alte Stände lesen können.
2. Reicht das nicht (Ziel: höchstens 4000 Zeichen), wird schrittweise gekürzt, bis es passt:
   1. die Termine für «Auffrischen» (welche Fragen wann wiederkommen),
   2. die Einzelheiten zu den Schritten abgeschlossener Etappen (der Abschluss, die Daten für den Reisepass und die Seemeilen bleiben erhalten),
   3. lange Texte in Use-Case-Karten (auf 200, im Notfall auf 60 Zeichen).
3. Eine vollständige Kopie bleibt zusätzlich im Browser (localStorage), getrennt pro Person (nach der Kennung aus dem LMS). Findet die App im LMS keinen lesbaren Spielstand, nimmt sie diese Kopie.

Nebenwirkung des Kürzens: Wer nach einem gekürzten Stand eine bereits abgeschlossene Etappe wiederholt, bekommt für deren Schritte noch einmal Seemeilen. Stempel, Abschluss und der bisherige Seemeilen-Stand bleiben unverändert.

Gemessen: Eine komplett gespielte Reise (alle 12 Inseln, alle Prüfungen bestanden, 18 Use Cases) braucht nach dem Kürzen rund 2900 bis 3700 Zeichen, je nach Länge der Use-Case-Texte. Ohne Kürzen wären es über 5000.

## Test-Checkliste

- [ ] **Start:** Der Kurs startet im LMS, die Einführung erscheint, kein Hinweis «nur in diesem Browser».
- [ ] **Name:** Im Reisepass steht der Name aus dem LMS.
- [ ] **Fortsetzen:** Einführung abschliessen, eine Etappe beginnen, Kurs schliessen. Beim nächsten Start geht es ohne Einführung weiter, die Seemeilen stimmen.
- [ ] **Anderes Gerät/anderer Browser:** Der Spielstand kommt auch dort an (dann stammt er sicher aus dem LMS).
- [ ] **Status im LMS:** nach dem ersten Spielen «in Bearbeitung» (incomplete).
- [ ] **Abschluss:** Nach allen Basic-Inseln zeigt das LMS «abgeschlossen» (completed) und die Punktzahl 100.
- [ ] **Lernzeit:** Die Sitzungsdauer erscheint in der Lernhistorie.
- [ ] **Zurücksetzen:** «Fortschritt zurücksetzen» in den Einstellungen setzt den Spielstand zurück, ein bereits abgeschlossener Kurs bleibt abgeschlossen.
- [ ] **Handy:** Start aus der SuccessFactors-App bzw. im mobilen Browser; Darstellung, Fortsetzen und Abschluss prüfen.
- [ ] **Pop-up und eingebettet:** Beide Startarten testen. Beim Pop-up darf der Pop-up-Blocker nicht eingreifen; beim Schliessen des Fensters muss der Stand trotzdem ankommen.
- [ ] **Schliessen mitten in einer Etappe:** Fenster oder Tab direkt schliessen; beim nächsten Start ist der Stand der letzten Sekunden da.

## Offene Fragen (Backlog)

- **SCORM 2004 oder xAPI?** SCORM 2004 erlaubt 64 000 Zeichen Spielstand und trennt «abgeschlossen» von «bestanden». xAPI könnte einzelne Lernereignisse (Etappe, Prüfung) melden. Was SuccessFactors bei euch unterstützt, klärt die LMS-Administration.
- **Ein Kurs oder einer pro Insel?** Heute ist die Odyssee ein einziger Kurs. Einzelne Pakete pro Insel würden feinere Nachweise erlauben, aber den Spielstand aufteilen.
- **Verknüpfung mit SharePoint:** Wer im Webpart in SharePoint/Teams spielt, hat einen anderen Spielstand als im LMS. Zu klären ist, ob und wie beides zusammenfinden soll (z. B. Abschlüsse aus SharePoint als externe Lernereignisse melden).
- **Zertifikate:** Soll das LMS beim Abschluss ein Zertifikat ausstellen (siehe auch «Abschlusszertifikat» im Backlog in `docs/PLAN.md`)?
- **Premium:** Soll der Abschluss aller Inseln (Premium) als eigener Kurs oder eigenes Abzeichen sichtbar werden?

## Und Articulate?

Articulate Storyline und Rise veröffentlichen ebenfalls SCORM-Pakete. Das Odyssee-Paket steht im LMS also gleichberechtigt neben solchen Kursen und wird gleich importiert und zugewiesen. Die App lässt sich aber **nicht in ein bearbeitbares Articulate-Projekt umwandeln**: Sie ist eine programmierte Anwendung, kein Folien- oder Baustein-Kurs. Umgekehrt geht es: Rise oder Storyline können die einzelne HTML-Datei (`index.html` aus dem Paket oder die Team-Ausgabe) als Web-Objekt einbetten. Den Fortschritt meldet dann allerdings der Articulate-Kurs, nicht die Odyssee.

## Technische Hinweise

- Code: `app/src/data/scorm/` (Suche nach der SCORM-Schnittstelle, Speicherung, Komprimierung) und `app/src/core/progress/completion.ts` (wann ein Kurs als abgeschlossen gilt).
- Die App sucht das SCORM-Objekt `API` im eigenen Fenster, in bis zu zehn übergeordneten Frames und im Fenster, das sie als Pop-up geöffnet hat.
- Beim Schliessen (`pagehide`/`beforeunload`) schreibt die App den letzten Stand, meldet die Sitzungsdauer und beendet die Sitzung (`LMSFinish`). Holt der Browser die Seite später aus seinem Zwischenspeicher zurück, lädt sie neu und beginnt eine neue Sitzung.
- Getestet mit einem nachgebauten LMS im Browser (Start, Fortsetzen aus `suspend_data`, Status und Punktzahl). Ein Test in SuccessFactors selbst steht noch aus.
