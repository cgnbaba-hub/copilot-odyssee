<#
.SYNOPSIS
    Lädt die geprüfte Inhaltsdatei in die Bibliothek "OdysseeInhalte".

.DESCRIPTION
    Die Datei entsteht mit "npm run content:export" im Ordner app/ (oder als Download
    "odyssee-content" aus der CI). Das Spiel lädt sie beim nächsten Öffnen; ein neues
    App-Paket ist nicht nötig. Die Bibliothek behält frühere Fassungen als Versionen,
    ein Fehler lässt sich also über den Versionsverlauf rückgängig machen.

.EXAMPLE
    ./Publish-OdysseeContent.ps1 -SiteUrl https://contoso.sharepoint.com/sites/odyssee -ClientId 00000000-0000-0000-0000-000000000000
#>
#Requires -Version 7.4
#Requires -Modules PnP.PowerShell

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $SiteUrl,
    [Parameter(Mandatory = $true)] [string] $ClientId,
    [string] $Path = (Join-Path $PSScriptRoot '../app/dist-content/odyssee-content.json')
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $Path)) {
    throw "Inhaltsdatei nicht gefunden: $Path. Zuerst im Ordner app/ 'npm run content:export' ausführen."
}

$content = Get-Content -Path $Path -Raw | ConvertFrom-Json
if ($content.format -ne 1) {
    throw "Unbekanntes Format der Inhaltsdatei ($($content.format))."
}

Connect-PnPOnline -Url $SiteUrl -Interactive -ClientId $ClientId
Add-PnPFile -Path $Path -Folder 'OdysseeInhalte' | Out-Null

Write-Host "Hochgeladen: $(@($content.islands).Count) Inseln, $(@($content.modules).Count) Module (Stand $($content.generatedAt))."
