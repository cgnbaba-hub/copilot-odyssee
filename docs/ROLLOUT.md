# Vorführen und Livegang

Dieses Dokument hilft bei zwei Dingen: die Odyssee in wenigen Minuten zeigen (zum Beispiel der Geschäftsleitung) und sie danach für das ganze Unternehmen freischalten.

## Vorführen in fünf Minuten

Die Demo (`npm run demo` oder die veröffentlichte Demo-Seite) hat in den **Einstellungen** den Abschnitt **«Vorführen»** mit drei fertig gespielten Beispielreisen. Sie ersetzen den eigenen Stand; direkt danach lässt sich das rückgängig machen.

Vorschlag für den Ablauf:

1. **Start (1 Min.):** Frisch beginnen, Einführung durchklicken. Zeigen: Deck mit Himmel nach Tageszeit, nächstes Ticket, Kompass-Kurs («die 6 wichtigsten Etappen, etwa eine Stunde»).
2. **Eine Etappe anspielen (1 Min.):** Ein Info-Schritt, ein Quiz mit «Erst überlegen», eine Aufgabe im echten Copilot.
3. **Beispielreise «Basic-Abzeichen frisch verdient» laden (2 Min.):** Die Feier erscheint. Im Reisepass: Stempel, Abzeichen, Zertifikat drucken, «Zu LinkedIn hinzufügen». Im Spickzettel: gesammelte Use Cases und Vorlagen.
4. **Auswertung (1 Min.):** Teilnehmende, Kompass-Kurs geschafft, Abzeichen, Use Cases mit geschätzter Arbeitszeit pro Monat, Feedback. In der Demo sind das Beispieldaten.

Die Beispielreisen gibt es nur in der Demo, nicht in SharePoint, nicht in der HTML-Datei für Kolleginnen und Kollegen und nicht im LMS-Paket.

## Checkliste für den Livegang

**Inhalte**
- [ ] Alle Etappen fachlich geprüft und von `draft` auf `active` gestellt, `reviewedAt` gesetzt (siehe `docs/INHALTE.md`). Solange alles Entwurf ist, zeigt das Webpart nur mit der Einstellung «Entwürfe zeigen» Inhalte.
- [ ] Kontaktadresse in `content/help.json` stimmt.
- [ ] Bereichsliste (`content/areas.json`) entspricht den echten Bereichen.

**Technik (mit der IT)**
- [ ] SharePoint-Listen angelegt (`docs/SHAREPOINT.md`): Fortschritt, Feedback, Pinnwand, Daumen, Regatta.
- [ ] Regatta mit Datenschutz (und Personalvertretung) geklärt: Teilnahme ist freiwillig, die Liste ist aber für alle Teilnehmenden lesbar (`docs/SHAREPOINT.md`, Abschnitt Datenschutz). Ohne Freigabe die Liste `OdysseeRegatta` weglassen.
- [ ] Freigabe der Pinnwand im echten Tenant getestet.
- [ ] App-Paket im App-Katalog, Webpart auf der Zielseite, in Teams als Registerkarte.
- [ ] Wer die Auswertung sehen darf, ist festgelegt (Berechtigung auf der Fortschrittsliste).
- [ ] Optional: LMS-Paket in SuccessFactors getestet (`docs/LMS.md`).
- [ ] Optional: Odyssee-Lotse in Copilot angelegt und in `content/help.json` als `agentUrl` eingetragen (`docs/AGENT.md`).

**Abzeichen (mit HR)**
- [ ] Wortlaut des Ausstellers bestätigt, LinkedIn-Unternehmensseite eingetragen, LinkedIn-Link einmal getestet (`docs/BADGES.md`).
- [ ] Entscheid, wie HR ein Abzeichen auf Anfrage bestätigt.

**Einführung**
- [ ] Pilot mit einer kleinen Gruppe aus verschiedenen Bereichen, Feedback über «Feedback geben» und «Stimmt das noch?».
- [ ] Ankündigung mit klarer Erwartung: Kompass-Kurs (etwa eine Stunde) als Ziel für alle, der Rest ist freiwillig.
- [ ] Zuständigkeit für Rückmeldungen und für die Pflege der Inhalte (Prüfintervall pro Etappe).
- [ ] Kennzahlen für den Erfolg festgelegt, zum Beispiel Anteil «Kompass-Kurs geschafft» nach vier Wochen.

## Was die Auswertung zeigt

Für alle mit Zugriff auf die Fortschrittsliste: Teilnehmende und Aktive, abgeschlossene Etappen, **Kompass-Kurs geschafft**, **Abzeichen Basic und Premium**, gesammelte Use Cases mit geschätzter Arbeitszeit pro Monat, Verteilung nach Lizenz und Bereich (kleine Gruppen werden zusammengefasst), Fortschritt pro Insel und Etappe, Feedback. Tabellen lassen sich als CSV exportieren.
