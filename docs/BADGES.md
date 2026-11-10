# Abzeichen und Zertifikate

Die App vergibt zwei Abzeichen für den Abschluss der Copilot Odyssee. Sie werden aus dem Reisepass abgeleitet und nirgends zusätzlich gespeichert.

## So funktioniert es

- **Basic**: alle Basic-Inseln (7) sind abgeschlossen, das heisst alle Etappen sind erledigt und die Inselprüfung ist bestanden (= Stempel im Reisepass).
- **Premium**: alle Inseln (12) haben einen Stempel. Wer keine Premium-Lizenz hat, sieht dazu einen Hinweis.
- Logik: `app/src/core/progress/badges.ts` (baut auf `courseCompletion` und `passportStamps` auf).
- Im Reisepass gibt es pro Abzeichen: Bild herunterladen (PNG, 1024×1024), Zertifikat drucken (Browser-Druckdialog, auch «als PDF speichern») und «Zu LinkedIn hinzufügen».
- Beim ersten Erreichen erscheint einmal ein Glückwunsch-Dialog. Welche Abzeichen schon gefeiert wurden, steht im Profil (`badgesSeen`).
- Das Bild steckt in `app/src/ui/components/BadgeArt.tsx` und lässt sich dort austauschen.

## Die Kennung (Credential-ID)

Beispiel: `CO-B-2611-7F3K` (Copilot Odyssee, B = Basic / P = Premium, Jahr und Monat, vier Zeichen aus einer Prüfsumme über Stufe, Datum und Name).

- Sie ist eine **Kennung**: Man kann ein Abzeichen damit benennen und nachschlagen.
- Sie ist **kein kryptografischer Beweis**. Wer das Verfahren kennt, kann sie berechnen. Echt ist ein Abzeichen erst, wenn HR es mit den Fortschrittsdaten abgleicht oder eine Prüfseite es bestätigt.
- Gleiche Eingabe ergibt immer dieselbe Kennung. Ohne angemeldeten Namen fliesst kein Name ein.

## Was HR festlegen oder liefern muss

Alles in `app/src/ui/theme/odyssee.ts` (`badges`):

1. **Wortlaut des Ausstellers** (`issuer`), derzeit «DERTOUR Suisse».
2. **LinkedIn-Unternehmensseite** (`linkedInOrganizationId`): die numerische ID der Firmenseite. Damit zeigt LinkedIn das Firmenlogo statt nur den Namen.
3. **Öffentliche Prüf-URL** (`certUrl`, optional): eine Seite, auf der eine Kennung bestätigt werden kann. Sie wird an LinkedIn mitgegeben.

## Offizielle Ausstellung (Backlog)

Stand der Recherche, **noch nicht gegen Primärquellen geprüft**:

- Die Global AI Community stellt für ihre eigenen Bootcamps Event-Abzeichen über Credly aus (Chapters können Bootcamps durchführen). Einen Weg, die interne Schulung einer Firma dort zertifizieren zu lassen, haben wir nicht gefunden.
- Firmeneigene Abzeichen laufen üblicherweise über Plattformen wie Credly, Accredible oder Certifier. Certifier wirbt mit einem Gratis-Kontingent von rund 250 Zertifikaten pro Jahr (Angabe des Anbieters).
- Eine dokumentierte, native Open-Badges-Anbindung von SAP SuccessFactors Learning haben wir nicht gefunden.
- Das Format des LinkedIn-Links («Zu LinkedIn hinzufügen») stammt aus Drittquellen und muss einmal in LinkedIn getestet werden.
