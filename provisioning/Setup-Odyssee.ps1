<#
.SYNOPSIS
    Legt auf einer SharePoint-Website alles an, was die Odyssee braucht.

.DESCRIPTION
    - Bibliothek "OdysseeInhalte": enthält die Inhaltsdatei odyssee-content.json.
      Alle Teilnehmenden dürfen lesen, bearbeiten dürfen Besitzer und Mitglieder der Website.
    - Liste "OdysseeFortschritt": ein Eintrag pro Person mit dem Spielstand.
      Alle Teilnehmenden dürfen Einträge anlegen, sehen und ändern aber nur ihre eigenen.
      Versionierung ist aus, damit nicht jeder Spielzug eine Version erzeugt.
    - Liste "OdysseeFeedback": Rückmeldungen aus der App (Art, Nachricht, Seite, Sprache/Lizenz/Bereich).
      Alle Teilnehmenden dürfen Einträge anlegen und nur ihre eigenen sehen.
      Besitzer der Website sehen alle Einträge und können sie z. B. nach Excel exportieren.

    Das Skript ist idempotent: Es kann mehrfach laufen und ergänzt nur, was fehlt.

.PARAMETER SiteUrl
    Adresse der Website, z. B. https://contoso.sharepoint.com/sites/odyssee

.PARAMETER ClientId
    Client-ID der Entra-App-Registrierung für PnP PowerShell (siehe docs/SHAREPOINT.md).

.PARAMETER Participants
    Wer mitspielen darf. Standard: alle internen Personen ("Everyone except external users").
    Alternativ der Anmeldename einer Microsoft-365-Gruppe oder Sicherheitsgruppe.

.EXAMPLE
    ./Setup-Odyssee.ps1 -SiteUrl https://contoso.sharepoint.com/sites/odyssee -ClientId 00000000-0000-0000-0000-000000000000
#>
#Requires -Version 7.4
#Requires -Modules PnP.PowerShell

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $SiteUrl,
    [Parameter(Mandatory = $true)] [string] $ClientId,
    [string] $Participants
)

$ErrorActionPreference = 'Stop'

# Must match app/src/data/sharepoint/names.ts
$ContentLibrary = 'OdysseeInhalte'
$ProgressList = 'OdysseeFortschritt'
$StateField = 'OdysseeState'
$FeedbackList = 'OdysseeFeedback'

Connect-PnPOnline -Url $SiteUrl -Interactive -ClientId $ClientId

if (-not $Participants) {
    $tenantId = Get-PnPTenantId
    $Participants = "c:0-.f|rolemanager|spo-grid-all-users/$tenantId"
}

function Grant-ListRole([string] $List, [string] $Role) {
    $l = Get-PnPList -Identity $List -Includes HasUniqueRoleAssignments
    if (-not $l.HasUniqueRoleAssignments) {
        # Keeps the owners' and members' access from the site.
        Set-PnPList -Identity $List -BreakRoleInheritance -CopyRoleAssignments | Out-Null
    }
    Set-PnPListPermission -Identity $List -User $Participants -AddRole $Role
}

# Content library
if (-not (Get-PnPList -Identity $ContentLibrary -ErrorAction SilentlyContinue)) {
    Write-Host "Lege Bibliothek $ContentLibrary an …"
    New-PnPList -Title $ContentLibrary -Url $ContentLibrary -Template DocumentLibrary -OnQuickLaunch:$false | Out-Null
}
Grant-ListRole -List $ContentLibrary -Role 'Read'

# Progress list
if (-not (Get-PnPList -Identity $ProgressList -ErrorAction SilentlyContinue)) {
    Write-Host "Lege Liste $ProgressList an …"
    New-PnPList -Title $ProgressList -Url "Lists/$ProgressList" -Template GenericList -OnQuickLaunch:$false | Out-Null
}
if (-not (Get-PnPField -List $ProgressList -Identity $StateField -ErrorAction SilentlyContinue)) {
    Add-PnPFieldFromXml -List $ProgressList -FieldXml "<Field Type='Note' Name='$StateField' StaticName='$StateField' DisplayName='Spielstand' NumLines='6' RichText='FALSE' />" | Out-Null
}
# The app looks up each player by title.
Set-PnPField -List $ProgressList -Identity 'Title' -Values @{ Indexed = $true } | Out-Null
Set-PnPList -Identity $ProgressList -EnableVersioning $false | Out-Null

# Item-level permissions: read and edit only own items (1 = all items, 2 = own items).
$list = Get-PnPList -Identity $ProgressList
$list.ReadSecurity = 2
$list.WriteSecurity = 2
$list.Update()
Invoke-PnPQuery

Grant-ListRole -List $ProgressList -Role 'Contribute'

# Feedback list
if (-not (Get-PnPList -Identity $FeedbackList -ErrorAction SilentlyContinue)) {
    Write-Host "Lege Liste $FeedbackList an …"
    New-PnPList -Title $FeedbackList -Url "Lists/$FeedbackList" -Template GenericList -OnQuickLaunch:$false | Out-Null
}
$feedbackFields = @(
    "<Field Type='Note' Name='OdysseeMessage' StaticName='OdysseeMessage' DisplayName='Nachricht' NumLines='8' RichText='FALSE' />",
    "<Field Type='Text' Name='OdysseeContext' StaticName='OdysseeContext' DisplayName='Seite' MaxLength='255' />",
    "<Field Type='Text' Name='OdysseeProfile' StaticName='OdysseeProfile' DisplayName='Sprache, Lizenz, Bereich' MaxLength='255' />"
)
foreach ($xml in $feedbackFields) {
    $name = ([xml]$xml).Field.Name
    if (-not (Get-PnPField -List $FeedbackList -Identity $name -ErrorAction SilentlyContinue)) {
        Add-PnPFieldFromXml -List $FeedbackList -FieldXml $xml | Out-Null
    }
}
Set-PnPField -List $FeedbackList -Identity 'Title' -Values @{ Title = 'Art' } | Out-Null
# Show the new columns in the default view, newest first.
$view = Get-PnPView -List $FeedbackList | Where-Object { $_.DefaultView }
Set-PnPView -List $FeedbackList -Identity $view.Id -Fields 'Title', 'OdysseeMessage', 'OdysseeContext', 'OdysseeProfile', 'Author', 'Created' -Values @{ ViewQuery = '<OrderBy><FieldRef Name="Created" Ascending="FALSE" /></OrderBy>' } | Out-Null

# Participants add feedback and see only their own; site owners see everything.
$list = Get-PnPList -Identity $FeedbackList
$list.ReadSecurity = 2
$list.WriteSecurity = 2
$list.Update()
Invoke-PnPQuery

Grant-ListRole -List $FeedbackList -Role 'Contribute'

Write-Host ''
Write-Host 'Fertig. Nächster Schritt: Inhalte hochladen mit Publish-OdysseeContent.ps1.'
