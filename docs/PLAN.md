# Umsetzungsplan: Copilot-Lernapp

Stand: 28.10.2026 · Lebendes Dokument: Jedes Arbeitspaket (AP) wird hier abgehakt, sobald es erledigt ist.

## 1. Ziel

Eine gamifizierte Lernapp, mit der sich KollegInnen selbstständig beibringen, wie sie Copilot gut nutzen. Am Ende jeder Etappe stehen eigene Use Cases aus dem eigenen Arbeitsalltag.

Die App soll

1. **für alle** funktionieren. Die meisten haben eine E3-Lizenz und damit nur *Microsoft 365 Copilot Chat* (Basic). Premium (*Microsoft 365 Copilot*) ist eine eigene Stufe.
2. **im Microsoft-Tenant laufen**: Anmeldung mit dem Firmenkonto, Hosting und Daten in Microsoft 365, keine externen Server.
3. **modular** sein: Inhalte ändern sich bei Copilot ständig. Neue oder geänderte Inhalte dürfen kein Neuprogrammieren erfordern.
4. **Muster sichtbar machen**: welche Module oft wiederholt werden, wo Fragen besonders oft falsch beantwortet werden und wo abgebrochen wird. Daraus leiten sich gezielte Schulungen ab. Das geschieht datenschutzkonform und nur in aggregierter Form.

## 2. Plattform-Empfehlung

### Empfehlung: SharePoint-Framework-App (SPFx), eingebunden in Teams

| Baustein | Lösung | In E3 enthalten?* |
|---|---|---|
| App-Oberfläche | SPFx-Webpart (React), als **Teams-App** und auf einer SharePoint-Seite nutzbar | ja |
| Hosting | SharePoint-App-Katalog des Tenants (keine eigenen Server) | ja |
| Anmeldung | automatisch über Entra ID (SSO) | ja |
| Inhalte | JSON-Content-Pakete in einer SharePoint-Bibliothek | ja |
| Fortschritt & Lerndaten | SharePoint-Listen | ja |
| Erinnerungen, Pflege-Hinweise | Power Automate (Standard-Connectoren) | ja |
| Auswertung | Admin-Dashboard in der App, optional zusätzlich Power BI | Power BI Pro: **nein** (erst ab E5) |
| KI-Feedback auf Prompts (optional, später) | Azure OpenAI im eigenen Tenant oder ein Copilot-Studio-Agent | nein, eigenes Budget nötig |

\* Lizenzangaben bitte mit eurer IT gegenprüfen. Sie ändern sich bei Microsoft regelmäßig.

**Warum SPFx und nicht Power Apps?**

- **Der bestehende React-Code bleibt nutzbar.** Seiten, Komponenten und Übersetzungen werden übernommen. Backend, Datenbank, Docker und Mistral fallen weg, weil Microsoft 365 diese Aufgaben übernimmt.
- **Ein Spiel braucht eine freie Oberfläche.** Karte, Animationen und Level-ups lassen sich in React deutlich besser umsetzen als in Power-Apps-Canvas.
- **Ich kann die App hier vollständig bauen, testen und versionieren.** Eine Power App kann ich nicht ausführen. Jede Änderung müsstest du in Power Apps Studio einfügen und testen, was die Iterationen stark verlangsamt.
- **Inhalte bleiben trotzdem ohne Code pflegbar** (siehe Abschnitt 3).

**Wann Power Apps die bessere Wahl wäre:** wenn ihr die App dauerhaft *ohne* Entwicklerunterstützung selbst weiterbauen wollt oder die IT SPFx-Pakete grundsätzlich nicht freigibt. Ein Mittelweg ist in AP 4.3 vorgesehen: eine kleine **Power App nur für die Inhaltspflege**, die auf dieselben SharePoint-Listen zugreift.

Die REWE-Digital-App kenne ich nicht im Detail. Falls du Screenshots oder eine Beschreibung bekommst, gleiche ich Inhalte und Ablauf in AP 0.3 damit ab.

## 3. Modularer Aufbau

Alles, was sich bei Copilot ändert, ist **Inhalt (Daten)**. Fest programmiert ist nur die **Spiel-Engine**.

```
Spielwelt
└── Insel (z. B. "Copilot Chat")        → Lizenzstufe: basic | premium
    └── Modul (z. B. "Gute Prompts")    → Version, Verantwortliche, Review-Datum
        └── Bausteine (Reihenfolge frei)
            ├── briefing     Kurzinfo (1–3 Min.), Text/Bild/Link auf Video
            ├── quiz         Fragen mit Erklärungen
            ├── prompt       Prompt-Werkstatt mit Feedback
            ├── mission      "Probier es im echten Copilot aus" + kurze Reflexion
            └── usecase      eigenen Anwendungsfall festhalten
```

- **Content-Pakete** sind JSON-Dateien, eine pro Modul. Ein Schema prüft sie automatisch (CI).
- **Pflege ohne Code:** Ein geänderter Inhalt wird in die SharePoint-Bibliothek hochgeladen und ist sofort live. Ein neues App-Paket ist nicht nötig.
- **Neue Bausteintypen** (z. B. Video, Drag & Drop) sind Plug-ins in der Engine. Bestehende Inhalte bleiben davon unberührt.
- **Jedes Modul trägt:** `version`, `owner`, `reviewedAt`, `reviewIntervalDays`, `license` (basic/premium), `status` (entwurf/aktiv/veraltet). In der App steht "Stand: Monat Jahr". Überfällige Reviews werden gemeldet (AP 4.2).
- **Themes** (Optik, Begriffe wie "XP" vs. "Meilen", Bilder) sind ebenfalls austauschbar.

Beispiel (gekürzt):

```json
{
  "id": "chat-gute-prompts",
  "island": "copilot-chat",
  "license": "basic",
  "version": "1.2.0",
  "owner": "copilot-team",
  "reviewedAt": "2026-10-01",
  "reviewIntervalDays": 90,
  "title": { "de": "Gute Prompts schreiben", "en": "Writing good prompts" },
  "blocks": [
    { "type": "briefing", "id": "gcse", "body": { "de": "…" } },
    { "type": "quiz", "id": "q1", "question": { "de": "…" }, "options": [ … ] },
    { "type": "prompt", "id": "p1", "task": { "de": "…" }, "rubric": ["ziel", "kontext", "quelle", "erwartung"] },
    { "type": "mission", "id": "m1", "task": { "de": "Lass dir deine letzte lange Mail zusammenfassen …" } },
    { "type": "usecase", "id": "u1" }
  ]
}
```

## 4. Spielwelt und Inseln

**Optik:** Das Kampagnenbild ("Copilot Rollout – Willkommen an Bord") passt sehr gut zu einem **Flughafen-/Reise-Theme**. Die Spielwelt wäre dann ein Terminal, die Inseln sind Reiseziele. Für Fortschritt gibt es Meilen, für Abschlüsse Stempel im Reisepass, dazu Statusstufen wie bei einem Vielfliegerprogramm. Das Theme ist austauschbar (siehe Abschnitt 3). Die Pixel-Art des Prototyps bleibt als Alternative möglich.

| # | Insel | Lizenz | Inhalt (Auswahl) |
|---|---|---|---|
| 0 | **Check-in: KI-Grundlagen** | alle | Was ist ein Sprachmodell, Grenzen, Halluzinationen, verantwortungsvoller Umgang, Firmenregeln |
| 1 | **Copilot Chat (Basic, E3)** | alle | Prompting (Ziel, Kontext, Quelle, Erwartung), Web- vs. Arbeitsdaten, Datenschutz-Schild, Dateien hochladen, Copilot Chat in Teams/Outlook/Edge, verfügbare Agenten |
| 2 | **Mein Arbeitsalltag** | alle | Eigene Aufgaben analysieren: Was mache ich oft, was kostet Zeit, wo hilft Copilot? → persönliche Use-Case-Sammlung |
| 3 | Outlook | Premium | Postfach-Zusammenfassungen, Entwürfe, Coaching |
| 4 | Teams | Premium | Meeting-Recap, Chats zusammenfassen, Aufgaben ableiten |
| 5 | Word | Premium | Entwürfe aus Dateien, Umschreiben, Zusammenfassungen |
| 6 | Excel *(war Gridforge)* | Premium | Analyse, Formeln, Diagramme |
| 7 | PowerPoint *(war Deckstorm)* | Premium | Präsentationen aus Dokumenten, Überarbeiten, Sprechernotizen |
| 8 | Copilot mit Arbeitsdaten | Premium | Suche über Mails, Chats und Dateien, Notebooks, Pages |
| 9 | Agenten | Premium | Researcher, Analyst, eigene Agenten erstellen |

Die konkreten Funktionen pro Insel prüfe ich beim Schreiben jedes Moduls gegen den aktuellen Microsoft-Stand. Die Liste oben ist nur eine Ausgangsbasis.

- **Lizenzlogik:** Beim Start wählt man "Ich habe Copilot Chat", "Ich habe Microsoft 365 Copilot" oder "Weiß nicht". Bei "Weiß nicht" gibt es eine Anleitung zum Nachsehen. Premium-Inseln bleiben für Basic-Nutzende als **"Ausblick"** sichtbar. Wie oft Basic-Nutzende in Premium-Inseln hineinschauen, ist selbst ein wertvolles Signal für den Lizenzbedarf.
- **Use Cases sind der rote Faden:** Jede Insel endet mit einer Mission im echten Copilot und einer Use-Case-Karte (Aufgabe, Häufigkeit, Zeitaufwand, Prompt, geschätzte Ersparnis).

## 5. Lernanalyse und Datenschutz

### Was erfasst wird (Events)

`modul_gestartet`, `baustein_abgeschlossen`, `quiz_antwort` (Frage, richtig, Versuch), `modul_wiederholt`, `modul_abgebrochen`, `mission_bewertet` (hat geholfen 1–5, Zeitersparnis), `usecase_erfasst` (Kategorie, nicht der Freitext), `premium_ausblick_geöffnet`.

### Was daraus sichtbar wird

| Muster | Bedeutung |
|---|---|
| Hohe **Wiederholungsquote** eines Moduls | Thema ist schwierig → Schulungsangebot |
| Niedrige **Erstversuch-Quote** je Frage | Thema unklar *oder* Frage schlecht formuliert |
| **Abbruchpunkte** | Modul zu lang oder zu schwer |
| Bewertung der **Missionen** | Was hilft im Alltag wirklich? |
| **Use-Case-Kategorien** nach Bereich | Wo steckt das größte Potenzial? |
| **Premium-Interesse** von Basic-Nutzenden | Lizenzbedarf |

**Schulungsbedarf-Signal** (Schwellen konfigurierbar), zum Beispiel: Wiederholungsquote ≥ 30 % *und* Erstversuch-Quote < 60 %, bei mindestens 10 Personen.

### Datenschutz (Voraussetzung für den Rollout)

Lerndaten von Mitarbeitenden auszuwerten ist **mitbestimmungspflichtig** (§ 87 Abs. 1 Nr. 6 BetrVG) und fällt unter die DSGVO. Deshalb gilt:

- Speicherung nur unter einer **pseudonymen ID** (gehashte Entra-ID), keine Namen in den Lerndaten.
- Auswertung **nur aggregiert**, mit einer Mindestgruppengröße von 5. Es gibt keine Auswertung einzelner Personen.
- **Rangliste nur auf freiwilliger Basis** (mit Spitznamen). Standardmäßig gibt es eine Wertung nach Bereich.
- **Prompt-Texte werden nicht gespeichert**, da sie vertrauliche Inhalte enthalten können. Das Feedback läuft lokal im Browser.
- Löschfristen sind festgelegt, und jede Person kann ihre eigenen Daten einsehen.
- Datenschutzbeauftragte und Betriebsrat werden **früh** eingebunden (AP 0.2). Den Entwurf des Datenschutzkonzepts schreibe ich.

## 6. Arbeitspakete

Legende: 🤖 = setze ich um · 👤 = brauche ich von dir · 🏢 = IT, Datenschutz oder Betriebsrat

### Phase 0: Klärung (parallel zu Phase 1)

- [ ] **AP 0.1 Plattform und IT-Freigabe** 👤🏢
  Plattform bestätigen (Abschnitt 2). Bei der IT klären: Darf ein SPFx-Paket in den App-Katalog, kann eine Teams-App bereitgestellt werden, welche SharePoint-Site wird genutzt?
  *Fertig, wenn:* Plattform entschieden und Ansprechperson in der IT bekannt.
- [ ] **AP 0.2 Datenschutzkonzept** 🤖👤🏢
  Ich schreibe `docs/DATENSCHUTZKONZEPT.md`: erfasste Daten, Zweck, Pseudonymisierung, Aggregation, Löschfristen. Du bringst es bei Datenschutz und Betriebsrat ein.
  *Fertig, wenn:* Freigabe liegt vor (spätestens vor dem Pilot in AP 2.6).
- [ ] **AP 0.3 Inhalt und Design abstimmen** 👤🤖
  Theme festlegen, Inselliste bestätigen, Kampagnen-Assets vom Kommunikationsteam besorgen, REWE-App als Referenz ansehen.
  *Fertig, wenn:* Inselliste und Theme sind festgelegt.

### Phase 1: Fundament

- [ ] **AP 1.1 Repo-Umbau und CI** 🤖
  Prototyp mit dem Tag `v0-prototyp` sichern und nach `legacy/` verschieben. Neue Projektstruktur anlegen, GitHub Actions für Lint, Typecheck, Tests und Build einrichten.
  *Fertig, wenn:* CI ist grün.
- [ ] **AP 1.2 Content-Modell** 🤖 *(plattformunabhängig, kann sofort starten)*
  JSON-Schema für Insel, Modul und Bausteine. Prüfskript in der CI. Die 7 Quizfragen und 4 Prompt-Challenges aus dem Prototyp werden übernommen.
  *Fertig, wenn:* Beispielmodul validiert und fehlerhafte Inhalte lassen die CI rot werden.
- [ ] **AP 1.3 App-Gerüst** 🤖
  SPFx-Projekt (Teams-App und SharePoint-Seite), Übersetzungen DE/EN, Theme-System. Lokal startbar mit Testdaten, ganz ohne Tenant.
  *Fertig, wenn:* App läuft lokal und das `.sppkg`-Paket wird gebaut.
- [ ] **AP 1.4 Datenschicht** 🤖
  Einheitliche Schnittstelle mit zwei Umsetzungen: Testdaten (lokal und für Tests) und SharePoint. Ein PnP-PowerShell-Skript legt alle Listen und die Bibliothek automatisch an.
  *Fertig, wenn:* Skript und Anleitung sind da, Tests laufen gegen die Testdaten.

### Phase 2: Spielbares MVP (Basic zuerst)

- [ ] **AP 2.1 Spielwelt und Onboarding** 🤖
  Karte mit Inseln, Lizenzabfrage, Freischaltlogik, Premium-Ausblick.
- [ ] **AP 2.2 Bausteine** 🤖
  Briefing, Quiz, Prompt-Werkstatt (regelbasiertes Feedback nach Ziel/Kontext/Quelle/Erwartung), Mission mit Reflexion, Use-Case-Karte.
- [ ] **AP 2.3 Gamification** 🤖
  Erfahrungspunkte und Level (Logik aus dem Prototyp übernommen), Abzeichen, Serien. Bereichswertung statt Einzel-Rangliste, Rangliste optional.
- [ ] **AP 2.4 Inhalte Inseln 0–2** 🤖👤
  Check-in, Copilot Chat (Basic) und Mein Arbeitsalltag mit vollständigen Inhalten. Ich schreibe die Inhalte, du prüfst sie auf Passung zu euren Regeln und Beispielen.
- [ ] **AP 2.5 Installationspaket** 🤖
  GitHub Action baut das `.sppkg`. Dazu eine Schritt-für-Schritt-Anleitung für die IT.
- [ ] **AP 2.6 Pilot** 👤🏢
  10–20 KollegInnen testen zwei Wochen, Feedback über ein Microsoft-Formular. Danach arbeite ich das Feedback ein.

### Phase 3: Lernanalyse

- [ ] **AP 3.1 Event-Tracking** 🤖 – pseudonym, gemäß Datenschutzkonzept.
- [ ] **AP 3.2 Admin-Dashboard in der App** 🤖 – Kennzahlen und Schulungsbedarf-Signale aus Abschnitt 5, nur aggregiert. Kommt ohne Zusatzlizenz aus.
- [ ] **AP 3.3 Power-BI-Vorlage** 🤖 *(optional, Pro-Lizenz nötig)* – für tiefere Auswertungen und Verläufe.
- [ ] **AP 3.4 Use-Case-Bibliothek** 🤖 – Use Cases freiwillig und anonym teilen, mit Moderation. KollegInnen können sich gegenseitig inspirieren.

### Phase 4: Ausbau und Betrieb

- [ ] **AP 4.1 Premium-Inseln** 🤖👤 – eine Insel pro AP (3–9), in der Reihenfolge eures Bedarfs.
- [ ] **AP 4.2 Pflegeprozess** 🤖
  Review-Fälligkeiten im Dashboard. Ein Modul "Was ist neu". Ein Power-Automate-Flow meldet relevante Einträge der Microsoft-365-Roadmap per Teams an die Content-Verantwortlichen.
- [ ] **AP 4.3 Inhaltspflege ohne JSON** 🤖 – Editor in der App *oder* eine kleine Power App auf denselben Listen.
- [ ] **AP 4.4 KI-Feedback auf Prompts** *(optional)* 🤖🏢 – Azure OpenAI im eigenen Tenant oder Copilot Studio, nur nach Freigabe und mit Budget.
- [ ] **AP 4.5 Rollout** 👤🏢 – Teams-App für alle bereitstellen und anheften, Kommunikation, Copilot-Champions einbinden.

## 7. Was aus dem Prototyp wird

| Übernommen | Entfällt |
|---|---|
| React-Seiten und -Komponenten (angepasst) | Node/Express-Backend |
| Übersetzungen DE/EN | PostgreSQL, Docker, Nginx, `deploy.sh` |
| Erfahrungspunkte- und Level-Logik (`XPService`) | Eigene Anmeldung (JWT) → Entra-SSO |
| Abzeichen-Regeln (`BadgeService`) | Mistral-API (externer Dienst) |
| Quizfragen und Prompt-Challenges (ins neue Format) | Duelle und Gilden (später optional, Gilden → Bereichswertung) |

## 8. Offene Entscheidungen

1. **Plattform:** SPFx (Empfehlung) oder Power Apps?
2. **Theme:** Flughafen/Reise passend zur Kampagne oder Pixel-Inseln?
3. **IT:** Gibt es einen App-Katalog und eine Ansprechperson für Teams-Apps?
4. **Power BI Pro:** vorhanden? Wenn nicht, reicht zunächst das Dashboard in der App.
5. **Sprachen:** Deutsch und Englisch oder nur Deutsch?
