# Odyssee in SharePoint einrichten

Diese Anleitung bringt die Odyssee auf eine SharePoint-Website, zum Beispiel für den Pilot. Sie richtet sich an die Person, die das einmalig mit der IT einrichtet.

> Die Skripte sind nach der Dokumentation von PnP PowerShell geschrieben, aber noch nicht in eurem Tenant gelaufen. Bitte beim ersten Mal auf einer Test-Website ausführen und Fehlermeldungen an mich zurückgeben.

## Überblick

| Was | Wo | Wofür |
|---|---|---|
| App-Paket `odyssee.sppkg` | App-Katalog (für den Pilot: Website-App-Katalog) | Das Webpart «Odyssee» |
| Bibliothek `OdysseeInhalte` | Website der Odyssee | Inhaltsdatei `odyssee-content.json` |
| Liste `OdysseeFortschritt` | Website der Odyssee | Spielstand, ein Eintrag pro Person |

Bibliothek und Liste legt ein Skript an. Solange sie fehlen, läuft das Spiel trotzdem: mit den Inhalten aus dem App-Paket und mit Fortschritt im Browser. Ein Hinweis im Spiel weist darauf hin. Sobald die Liste da ist, wird der Browser-Fortschritt automatisch übernommen.

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

## Datenschutz und Berechtigungen

- **Liste `OdysseeFortschritt`:** Elementberechtigungen sind so gesetzt, dass alle nur ihre eigenen Einträge sehen und ändern. Der Titel eines Eintrags ist ein SHA-256-Hash der Entra-Objekt-ID, nicht der Name.
- **Grenze der Pseudonymisierung:** SharePoint speichert bei jedem Eintrag automatisch, wer ihn angelegt hat. Besitzerinnen und Besitzer der Website können deshalb technisch sehen, welcher Eintrag zu wem gehört. Die Auswertungen in Phase 3 arbeiten nur mit dem Hash und nur aggregiert. Der Zugriff auf die Website sollte auf wenige Personen beschränkt bleiben.
- **Prompt-Texte** werden nicht gespeichert. Use-Case-Karten liegen im eigenen Spielstand.
- **Grösse:** Ein Spielstand ist wenige Kilobyte gross. Ein Feld vom Typ «Mehrere Textzeilen» reicht dafür auf Jahre.
