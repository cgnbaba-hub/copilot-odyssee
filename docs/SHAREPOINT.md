# Odyssee in SharePoint einrichten

Diese Anleitung bringt die Odyssee auf eine SharePoint-Website, zum Beispiel für den Pilot. Sie richtet sich an die Person, die das einmalig mit der IT einrichtet.

> Die Skripte sind nach der Dokumentation von PnP PowerShell geschrieben, aber noch nicht in eurem Tenant gelaufen. Bitte beim ersten Mal auf einer Test-Website ausführen und Fehlermeldungen an mich zurückgeben.

## Überblick

| Was | Wo | Wofür |
|---|---|---|
| App-Paket `odyssee.sppkg` | App-Katalog (für den Pilot: Website-App-Katalog) | Das Webpart «Odyssee» |
| Bibliothek `OdysseeInhalte` | Website der Odyssee | Inhaltsdatei `odyssee-content.json` |
| Liste `OdysseeFortschritt` | Website der Odyssee | Spielstand, ein Eintrag pro Person |
| Liste `OdysseeFeedback` | Website der Odyssee | Rückmeldungen aus der App |

Bibliothek und Listen legt ein Skript an. Solange sie fehlen, läuft das Spiel trotzdem: mit den Inhalten aus dem App-Paket und mit Fortschritt im Browser. Ein Hinweis im Spiel weist darauf hin. Sobald die Liste da ist, wird der Browser-Fortschritt automatisch übernommen.

## 1. Voraussetzungen (einmalig, IT)

- **PowerShell 7.4** und das Modul **PnP.PowerShell**:
  ```powershell
  Install-Module PnP.PowerShell -Scope CurrentUser
  ```
- **App-Registrierung für PnP PowerShell** in Entra ID. PnP PowerShell braucht eine eigene App-Registrierung, die Client-ID verwenden die Skripte unten:
  ```powershell
  Register-PnPEntraIDAppForInteractiveLogin -ApplicationName "PnP Odyssee" -Tenant contoso.onmicrosoft.com
  ```
- **Website-App-Katalog** auf der Pilot-Website (braucht SharePoint-Admin-Rechte):
  ```powershell
  Connect-PnPOnline -Url https://contoso-admin.sharepoint.com -Interactive -ClientId <Client-ID>
  Add-PnPSiteCollectionAppCatalog -Site https://contoso.sharepoint.com/sites/odyssee
  ```

## 2. Bibliothek und Liste anlegen

```powershell
./provisioning/Setup-Odyssee.ps1 -SiteUrl https://contoso.sharepoint.com/sites/odyssee -ClientId <Client-ID>
```

Standardmässig dürfen alle internen Personen mitspielen. Für einen kleinen Pilot lässt sich stattdessen eine Gruppe angeben, zum Beispiel `-Participants "pilot-odyssee@contoso.com"`.

## 3. Inhalte hochladen

Im Ordner `app/` die Inhalte prüfen und exportieren, dann hochladen:

```bash
npm run content:export
```

```powershell
./provisioning/Publish-OdysseeContent.ps1 -SiteUrl https://contoso.sharepoint.com/sites/odyssee -ClientId <Client-ID>
```

Die Datei gibt es auch fertig als Download `odyssee-content` bei jedem CI-Lauf. Geänderte Inhalte sind nach dem nächsten Öffnen des Spiels live. Ein neues App-Paket ist dafür nicht nötig. Frühere Fassungen bleiben als Versionen in der Bibliothek.

## 4. App installieren und auf eine Seite setzen

1. `odyssee.sppkg` aus der CI herunterladen (Download `odyssee-sppkg`) oder mit `npm run build` bauen.
2. Auf der Website unter **Website-Inhalte → Apps für SharePoint** (Website-App-Katalog) hochladen und **Bereitstellen** wählen.
3. Eine Seite anlegen oder bearbeiten, **+** → **Odyssee** einfügen, veröffentlichen.

Liegen Bibliothek und Liste auf einer anderen Website als die Seite, im Eigenschaftenbereich des Webparts **«Website mit den Odyssee-Listen»** setzen.

## 5. Direktlinks auf Inseln und Etappen

Mit einem Zusatz an der Adresse der Odyssee-Seite öffnet die App direkt eine Insel oder eine Etappe, zum Beispiel für eine Teams-Nachricht oder eine Mail:

- `…/SitePages/Odyssee.aspx?insel=aiolos` öffnet die Insel des Aiolos.
- `…/SitePages/Odyssee.aspx?etappe=aiolos-gute-prompts` öffnet die Etappe «Gute Prompts schreiben».

Die Kennungen stehen in `content/islands.json` und als Dateinamen in `content/modules/`. Auf jeder Inselseite gibt es oben rechts den Knopf **«Link kopieren»**, der diesen Link erzeugt. Wer die Odyssee zum ersten Mal öffnet, sieht zuerst die kurze Einführung.

## 6. Als App in Teams

Der Webpart läuft auch in Teams, als persönliche App in der linken Leiste oder als Registerkarte in einem Team. Der Fortschritt ist derselbe wie auf der SharePoint-Seite, weil er in denselben Listen liegt.

1. Im **Tenant-App-Katalog** das Paket `odyssee.sppkg` auswählen und **Mit Teams synchronisieren** wählen. Für eine Website-App-Sammlung reicht das nicht, die Synchronisation geht nur über den Tenant-App-Katalog.
2. Im **Teams Admin Center** unter **Teams-Apps → Apps verwalten** die App «Odyssee» erlauben und bei Bedarf über eine Setup-Richtlinie anheften.
3. **Wichtig:** In Teams kennt der Webpart die Odyssee-Website nicht von selbst. Vor dem Bauen in `app/src/webparts/odyssee/OdysseeWebPart.manifest.json` bei `preconfiguredEntries → properties → dataSiteUrl` die Adresse der Odyssee-Website eintragen, zum Beispiel `https://dertour.sharepoint.com/sites/odyssee`. Bei einer Registerkarte im Team lässt sich die Adresse auch im Eigenschaftenbereich setzen.

Fehlt die Adresse, speichert die App nur im Browser und zeigt oben einen Hinweis.

## Auswertung

Wer die Listen der Website verwalten darf (in der Regel die Besitzerinnen und Besitzer), sieht unten in der App zusätzlich den Menüpunkt **«Auswertung»**. Die App prüft das bei jedem Start über die SharePoint-Berechtigung «Listen verwalten»; alle anderen sehen den Menüpunkt nicht und könnten die Einträge anderer auch gar nicht lesen.

Die Auswertung zeigt:
- Teilnehmende, Aktivität der letzten 30 Tage, abgeschlossene Etappen, Use-Case-Karten mit dem Zeitpotenzial pro Monat und die Zahl der Feedbacks
- Fortschritt pro Insel und pro Etappe, mit Hinweis auf Etappen, bei denen viele anfangen, aber nicht abschliessen
- Durchschnittliche Bewertung der Missionen, Verteilung nach Copilot-Version und Bereich
- Alle Feedbacks, filterbar nach Art

Alles ist zusammengefasst, Namen erscheinen nicht. Bereiche und Bewertungen mit weniger als 5 Personen werden nicht einzeln gezeigt. Über «Etappen als CSV» und «Feedback als CSV» lassen sich die Zahlen in Excel weiterverwenden.

Wer die Auswertung sehen soll, ohne Besitzer der ganzen Website zu sein, bekommt auf den beiden Listen die Berechtigungsstufe «Bearbeiten» (enthält «Listen verwalten»).

## Feedback lesen

Über «Feedback geben» (unten auf jeder Seite und in der Hilfe) schicken Teilnehmende eine Idee, einen Fehler, einen Hinweis auf falsche Inhalte oder Lob. Jede Rückmeldung wird ein Eintrag in der Liste `OdysseeFeedback`: Art, Nachricht, die Seite, auf der sie geschrieben wurde, sowie Sprache, Lizenz und Bereich. SharePoint speichert dazu, wer den Eintrag angelegt hat und wann.

- **Lesen:** Website öffnen, «Websiteinhalte», Liste `OdysseeFeedback`. Die neusten Einträge stehen oben.
- **Auswerten:** In der Liste «Exportieren» und «Nach CSV exportieren» oder «In Excel öffnen».
- **Bearbeiten:** Wer mag, ergänzt in der Liste eine Spalte «Status» (z. B. Neu, Geplant, Erledigt), um den Überblick zu behalten. Die App liest diese Spalte nicht und stört sich nicht daran.

Solange die Liste fehlt, zeigt die App statt des Formulars die Kontaktadresse aus `help.json`.

## Datenschutz und Berechtigungen

- **Liste `OdysseeFortschritt`:** Elementberechtigungen sind so gesetzt, dass alle nur ihre eigenen Einträge sehen und ändern. Der Titel eines Eintrags ist ein SHA-256-Hash der Entra-Objekt-ID, nicht der Name.
- **Grenze der Pseudonymisierung:** SharePoint speichert bei jedem Eintrag automatisch, wer ihn angelegt hat. Besitzerinnen und Besitzer der Website können deshalb technisch sehen, welcher Eintrag zu wem gehört. Die Auswertungen in Phase 3 arbeiten nur mit dem Hash und nur aggregiert. Der Zugriff auf die Website sollte auf wenige Personen beschränkt bleiben.
- **Liste `OdysseeFeedback`:** Teilnehmende sehen nur ihre eigenen Einträge, Besitzerinnen und Besitzer der Website alle. Das Formular sagt offen, dass der Name mitgespeichert wird.
- **Prompt-Texte** werden nicht gespeichert. Use-Case-Karten liegen im eigenen Spielstand.
- **Grösse:** Ein Spielstand ist wenige Kilobyte gross. Ein Feld vom Typ «Mehrere Textzeilen» reicht dafür auf Jahre.
