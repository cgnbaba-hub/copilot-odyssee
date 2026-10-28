# Umsetzungsplan: Copilot-Lernapp "Odyssee"

Stand: 28.10.2026 · Lebendes Dokument: Jedes Arbeitspaket (AP) wird hier abgehakt, sobald es erledigt ist.

## 1. Ziel

Eine gamifizierte Lernapp, mit der sich KollegInnen in der Schweiz selbstständig beibringen, wie sie Copilot gut nutzen. Am Ende jeder Etappe stehen eigene Use Cases aus dem eigenen Arbeitsalltag.

Die App soll

1. **für alle** funktionieren. Die meisten haben eine E3-Lizenz und damit nur *Microsoft 365 Copilot Chat* (Basic). Premium (*Microsoft 365 Copilot*) ist eine eigene Stufe.
2. **im Microsoft-Tenant laufen**: Anmeldung mit dem Firmenkonto, Hosting und Daten in Microsoft 365, keine externen Server.
3. **modular** sein: Inhalte ändern sich bei Copilot ständig. Neue oder geänderte Inhalte dürfen kein Neuprogrammieren erfordern.
4. **Muster sichtbar machen**: welche Module oft wiederholt werden, wo Fragen besonders oft falsch beantwortet werden und wo abgebrochen wird. Daraus leiten sich gezielte Schulungen ab.
5. **zweisprachig** sein: Deutsch (Schweizer Schreibweise, also "ss" statt "ß") und Englisch. Weitere Sprachen wie Französisch lassen sich später ergänzen.

## 2. Plattform (entschieden: SPFx)

| Baustein | Lösung | Lizenz |
|---|---|---|
| App-Oberfläche | SPFx-Webpart (React), auf einer **SharePoint-Seite** und als **Teams-App** nutzbar | in E3 enthalten* |
| Hosting | SharePoint-App-Katalog (keine eigenen Server) | in E3 enthalten* |
| Anmeldung | automatisch über Entra ID (SSO) | in E3 enthalten* |
| Inhalte | JSON-Content-Pakete in einer SharePoint-Bibliothek | in E3 enthalten* |
| Fortschritt & Lerndaten | SharePoint-Listen | in E3 enthalten* |
| Erinnerungen, Pflege-Hinweise | Power Automate (Standard-Connectoren) | in E3 enthalten* |
| Auswertung für alle Admins | Dashboard direkt in der App | keine Zusatzlizenz |
| Tiefere Auswertung | Power-BI-Bericht für die wenigen Auswertenden (dafür reichen eure begrenzten Pro-Lizenzen) | Power BI Pro |
| KI-Feedback auf Prompts (optional, später) | Azure OpenAI im eigenen Tenant oder ein Copilot-Studio-Agent | eigenes Budget nötig |

\* Bitte mit eurer IT gegenprüfen. Lizenzumfänge ändern sich bei Microsoft regelmässig.

Der bestehende React-Code (Seiten, Komponenten, Übersetzungen, XP-Logik) wird übernommen. Backend, Datenbank, Docker und Mistral entfallen, weil Microsoft 365 diese Aufgaben übernimmt. Als spätere Ergänzung ist eine kleine **Power App nur für die Inhaltspflege** möglich (AP 4.3).

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
- **Themes** (Optik, Begriffe, Bilder) und **Sprachen** sind ebenfalls austauschbar.

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
    { "type": "briefing", "id": "gcse", "body": { "de": "…", "en": "…" } },
    { "type": "quiz", "id": "q1", "question": { "de": "…", "en": "…" }, "options": [ … ] },
    { "type": "prompt", "id": "p1", "task": { "de": "…", "en": "…" }, "rubric": ["ziel", "kontext", "quelle", "erwartung"] },
    { "type": "mission", "id": "m1", "task": { "de": "Lass dir deine letzte lange Mail zusammenfassen …", "en": "…" } },
    { "type": "usecase", "id": "u1" }
  ]
}
```

## 4. Spielwelt: die Odyssee

Wie Odysseus segeln die Spielenden von Insel zu Insel. **Ithaka ist Heimathafen und Ziel zugleich**: Dort sammeln sich die Use-Case-Karten aus jeder Etappe. Die Botschaft der Reise ist, das Gelernte in den eigenen Arbeitsalltag heimzubringen.

- **Begriffe:** Fortschritt in *Seemeilen*, Abzeichen als *Trophäen der Reise*, Ränge von der *Deckshilfe* bis zur *Kapitänin / zum Kapitän*. Alle Begriffe sind im Theme hinterlegt und austauschbar.
- **Stil:** Pixel-Art aus dem Prototyp als Ausgangspunkt. Der Stil ist eigenständig und lehnt sich nicht an Kampagnen anderer an. Das Feintuning passiert in AP 0.3.

Die Inselnamen sind Vorschläge. Das Motiv aus der Odyssee passt jeweils zum Thema:

| # | Insel (Vorschlag) | Thema | Lizenz |
|---|---|---|---|
| 0 | **Sirenenfelsen** | KI-Grundlagen: Halluzinationen ("klingt verlockend, stimmt aber nicht"), Grenzen, verantwortungsvoller Umgang, Firmenregeln | alle |
| 1 | **Insel des Aiolos** | **Copilot Chat (Basic, E3)**: Prompts steuern wie Winde (Ziel, Kontext, Quelle, Erwartung), Web- vs. Arbeitsdaten, Datenschutz-Schild, Dateien hochladen, Copilot Chat in Teams/Outlook/Edge, verfügbare Agenten | alle |
| 2 | **Ithaka** | Mein Arbeitsalltag: Was mache ich oft, was kostet Zeit, wo hilft Copilot? Hier entsteht die persönliche Use-Case-Sammlung | alle |
| 3 | Hermes' Botenstation | Outlook: Postfach-Zusammenfassungen, Entwürfe, Coaching | Premium |
| 4 | Hof der Phaiaken | Teams: Meeting-Recap, Chats zusammenfassen (Odysseus erzählt am Fest seine Geschichte) | Premium |
| 5 | Penelopes Webstuhl | Word: Texte entwerfen, umschreiben, zusammenfassen | Premium |
| 6 | Höhle des Polyphem | Excel: Analyse, Formeln, Diagramme (der Zyklop zählt seine Schafe) | Premium |
| 7 | Kirkes Insel | PowerPoint: Verwandlung von Dokumenten in Präsentationen | Premium |
| 8 | Orakel des Teiresias | Copilot mit Arbeitsdaten, Researcher | Premium |
| 9 | Schmiede des Hephaistos | Eigene Agenten erstellen | Premium |

Die konkreten Funktionen pro Insel prüfe ich beim Schreiben jedes Moduls gegen den aktuellen Microsoft-Stand. Die Liste oben ist nur eine Ausgangsbasis.

- **Lizenzlogik:** Beim Start wählt man "Ich habe Copilot Chat", "Ich habe Microsoft 365 Copilot" oder "Weiss nicht". Bei "Weiss nicht" gibt es eine Anleitung zum Nachsehen. Premium-Inseln bleiben für Basic-Nutzende als **"Ausblick"** sichtbar. Wie oft Basic-Nutzende hineinschauen, ist selbst ein Signal für den Lizenzbedarf.
- **Use Cases sind der rote Faden:** Jede Insel endet mit einer Mission im echten Copilot und einer Use-Case-Karte (Aufgabe, Häufigkeit, Zeitaufwand, Prompt, geschätzte Ersparnis). Die Karte wandert nach Ithaka.

## 5. Lernanalyse und Datenschutz (Schweiz)

### Was erfasst wird (Events)

`modul_gestartet`, `baustein_abgeschlossen`, `quiz_antwort` (Frage, richtig, Versuch), `modul_wiederholt`, `modul_abgebrochen`, `mission_bewertet` (hat geholfen 1–5, Zeitersparnis), `usecase_erfasst` (Kategorie, nicht der Freitext), `premium_ausblick_geöffnet`.

### Was daraus sichtbar wird

| Muster | Bedeutung |
|---|---|
| Hohe **Wiederholungsquote** eines Moduls | Thema ist schwierig → Schulungsangebot |
| Niedrige **Erstversuch-Quote** je Frage | Thema unklar *oder* Frage schlecht formuliert |
| **Abbruchpunkte** | Modul zu lang oder zu schwer |
| Bewertung der **Missionen** | Was hilft im Alltag wirklich? |
| **Use-Case-Kategorien** nach Bereich | Wo steckt das grösste Potenzial? |
| **Premium-Interesse** von Basic-Nutzenden | Lizenzbedarf |

**Schulungsbedarf-Signal** (Schwellen konfigurierbar), zum Beispiel: Wiederholungsquote ≥ 30 % *und* Erstversuch-Quote < 60 %, bei mindestens 10 Personen.

### Rechtlicher Rahmen

Eine Mitbestimmung durch einen Betriebsrat wie in Deutschland entfällt. Relevant sind:

- **revDSG** (Datenschutzgesetz): Transparenz und Verhältnismässigkeit.
- **Art. 328b OR**: Daten über Mitarbeitende nur, soweit für das Arbeitsverhältnis nötig. Weiterbildung gehört dazu.
- **Art. 26 ArGV 3**: Systeme, die das *Verhalten* von Mitarbeitenden überwachen sollen, sind unzulässig. Deshalb zielt die Auswertung auf **Themen und Inhalte, nicht auf Personen**.
- **Konzern-Tenant:** Falls der Microsoft-Tenant konzernweit (auch aus Deutschland) betrieben wird, kurz klären, ob dort Konzernregeln für M365-Apps gelten.

Das ist keine Rechtsberatung. Ein kurzer Abgleich mit eurer Datenschutzstelle genügt aber voraussichtlich (AP 0.2).

### Umsetzung (Privacy by Design)

Das bringt auch Akzeptanz: Wer weiss, dass niemand die eigenen Fehler sieht, probiert mutiger aus.

- Lerndaten unter einer **pseudonymen ID** (gehashte Entra-ID), keine Namen.
- Auswertung **aggregiert**, mit einer Mindestgruppengrösse von 5.
- Jede Person sieht **ihre eigenen** Statistiken in der App.
- **Rangliste freiwillig** mit Spitznamen. Standardmässig gibt es eine Wertung nach Bereich.
- **Prompt-Texte werden nicht gespeichert**, weil sie vertrauliche Inhalte enthalten können. Das Feedback läuft lokal im Browser.
- Ein kurzer **Datenschutzhinweis** in der App erklärt, was erfasst wird. Löschfristen sind festgelegt.

## 6. Testen und Feedback

| Stufe | Ab | Wie | Was du brauchst |
|---|---|---|---|
| **1. Klickbare Demo** | AP 1.3 | Nach jedem Meilenstein veröffentliche ich eine Demo mit Testdaten als privaten Link. Sie läuft im Browser, du musst nichts installieren. Feedback gibst du direkt hier im Chat. | nichts |
| **2. Pilot-Site in SharePoint** | AP 2.5 | Das App-Paket (`.sppkg`) kommt in den **Website-App-Katalog** einer Test-Site. Dann setzt du das Webpart einfach auf eine SharePoint-Seite. Echte Anmeldung, echte Daten. | Die IT aktiviert den Website-App-Katalog einmalig für die Test-Site |
| **3. Teams und Rollout** | AP 4.5 | Bereitstellung als Teams-App für alle | Freigabe durch Teams-Admin |

Wer Node.js installiert hat, kann die App zusätzlich lokal starten (`npm start`).

## 7. Arbeitspakete

Legende: 🤖 = setze ich um · 👤 = brauche ich von dir · 🏢 = IT oder Datenschutz

### Phase 0: Klärung (parallel zu Phase 1)

- [x] **AP 0.1a Plattform** – SPFx entschieden.
- [ ] **AP 0.1b IT-Freigabe** 👤🏢
  Bei der IT klären: Website-App-Katalog für eine Test-Site, später der Tenant-App-Katalog und die Teams-App-Freigabe. Ausserdem: welche SharePoint-Site wird genutzt?
  *Fertig, wenn:* Test-Site und Ansprechperson sind bekannt.
- [ ] **AP 0.2 Datenschutzhinweis und Datenkonzept** 🤖👤
  Ich schreibe `docs/DATENSCHUTZ.md` (Daten, Zweck, Pseudonymisierung, Aggregation, Löschfristen) und den Text für den Hinweis in der App. Du gleichst beides mit eurer Datenschutzstelle ab.
  *Fertig, wenn:* Freigabe vor dem Pilot (AP 2.6) liegt vor.
- [ ] **AP 0.3 Design und Inselnamen** 👤🤖
  Odyssee-Theme verfeinern, Inselnamen und Stil bestätigen.
  *Fertig, wenn:* Inselliste und Stil sind festgelegt.

### Phase 1: Fundament

- [ ] **AP 1.1 Repo-Umbau und CI** 🤖
  Prototyp mit dem Tag `v0-prototyp` sichern und nach `legacy/` verschieben. Neue Projektstruktur anlegen, GitHub Actions für Lint, Typecheck, Tests und Build einrichten.
  *Fertig, wenn:* CI ist grün.
- [ ] **AP 1.2 Content-Modell** 🤖
  JSON-Schema für Insel, Modul und Bausteine. Prüfskript in der CI, das auch fehlende Übersetzungen DE/EN findet. Die 7 Quizfragen und 4 Prompt-Challenges aus dem Prototyp werden übernommen.
  *Fertig, wenn:* Beispielmodul validiert und fehlerhafte Inhalte lassen die CI rot werden.
- [ ] **AP 1.3 App-Gerüst und Demo-Modus** 🤖
  SPFx-Projekt (SharePoint-Seite und Teams), Übersetzungen de-CH/EN, Theme-System. Ein Demo-Modus mit Testdaten läuft ohne Tenant im Browser.
  *Fertig, wenn:* Die erste klickbare Demo ist als Link verfügbar und das `.sppkg`-Paket wird gebaut.
- [ ] **AP 1.4 Datenschicht** 🤖
  Einheitliche Schnittstelle mit zwei Umsetzungen: Testdaten (Demo und Tests) und SharePoint. Ein PnP-PowerShell-Skript legt alle Listen und die Bibliothek automatisch an.
  *Fertig, wenn:* Skript und Anleitung sind da, Tests laufen gegen die Testdaten.

### Phase 2: Spielbares MVP (Basic zuerst)

- [ ] **AP 2.1 Seekarte und Onboarding** 🤖
  Karte mit Inseln, Lizenzabfrage, Freischaltlogik, Premium-Ausblick.
- [ ] **AP 2.2 Bausteine** 🤖
  Briefing, Quiz, Prompt-Werkstatt (regelbasiertes Feedback nach Ziel/Kontext/Quelle/Erwartung), Mission mit Reflexion, Use-Case-Karte.
- [ ] **AP 2.3 Gamification** 🤖
  Seemeilen und Ränge (Logik aus dem Prototyp übernommen), Trophäen, Serien. Bereichswertung statt Einzel-Rangliste, Rangliste optional.
- [ ] **AP 2.4 Inhalte Inseln 0–2** 🤖👤
  Sirenenfelsen, Aiolos (Copilot Chat Basic) und Ithaka mit vollständigen Inhalten auf DE und EN. Ich schreibe die Inhalte, du prüfst sie auf Passung zu euren Regeln und Beispielen.
- [ ] **AP 2.5 Installationspaket und Pilot-Site** 🤖👤
  GitHub Action baut das `.sppkg`. Dazu eine Schritt-für-Schritt-Anleitung: Website-App-Katalog, Listen anlegen, Webpart auf eine Seite setzen.
- [ ] **AP 2.6 Pilot** 👤
  10–20 KollegInnen testen zwei Wochen, Feedback über ein Microsoft-Formular. Danach arbeite ich das Feedback ein.

### Phase 3: Lernanalyse

- [ ] **AP 3.1 Event-Tracking** 🤖 – pseudonym, gemäss AP 0.2.
- [ ] **AP 3.2 Dashboard in der App** 🤖 – Kennzahlen und Schulungsbedarf-Signale aus Abschnitt 5, für eine Admin-Gruppe. Kommt ohne Zusatzlizenz aus.
- [ ] **AP 3.3 Power-BI-Bericht** 🤖 – Vorlage für die wenigen Auswertenden mit Pro-Lizenz, für Verläufe und tiefere Analysen.
- [ ] **AP 3.4 Use-Case-Bibliothek** 🤖 – Use Cases freiwillig und anonym teilen, mit Moderation. KollegInnen können sich gegenseitig inspirieren.

### Phase 4: Ausbau und Betrieb

- [ ] **AP 4.1 Premium-Inseln** 🤖👤 – eine Insel pro AP (3–9), in der Reihenfolge eures Bedarfs.
- [ ] **AP 4.2 Pflegeprozess** 🤖
  Review-Fälligkeiten im Dashboard. Ein Modul "Was ist neu". Ein Power-Automate-Flow meldet relevante Einträge der Microsoft-365-Roadmap per Teams an die Content-Verantwortlichen.
- [ ] **AP 4.3 Inhaltspflege ohne JSON** 🤖 – Editor in der App *oder* eine kleine Power App auf denselben Listen.
- [ ] **AP 4.4 KI-Feedback auf Prompts** *(optional)* 🤖🏢 – Azure OpenAI im eigenen Tenant oder Copilot Studio, nur nach Freigabe und mit Budget.
- [ ] **AP 4.5 Rollout** 👤🏢 – Teams-App für alle bereitstellen und anheften, Kommunikation, Copilot-Champions einbinden.

## 8. Was aus dem Prototyp wird

| Übernommen | Entfällt |
|---|---|
| React-Seiten und -Komponenten (angepasst) | Node/Express-Backend |
| Übersetzungen DE/EN | PostgreSQL, Docker, Nginx, `deploy.sh` |
| XP- und Level-Logik (`XPService`) | Eigene Anmeldung (JWT) → Entra-SSO |
| Abzeichen-Regeln (`BadgeService`) | Mistral-API (externer Dienst) |
| Quizfragen und Prompt-Challenges (ins neue Format) | Duelle und Gilden (später optional, Gilden → Bereichswertung) |
| Pixel-Art-Insel-Konzept | Spieler-Sprites werden im Zuge von AP 0.3 neu bewertet |

## 9. Entscheidungen

| Frage | Stand |
|---|---|
| Plattform | ✅ SPFx |
| Theme | ✅ Odyssee-Seereise mit Inseln, eigenständiger Stil |
| Sprachen | ✅ Deutsch (CH) und Englisch |
| Power BI | ✅ Pro begrenzt vorhanden → nur für Auswertende, alle anderen nutzen das Dashboard in der App |
| Mitbestimmung | ✅ Kein Betriebsrat (Schweiz). Abgleich mit der Datenschutzstelle (AP 0.2) |
| IT: Website-App-Katalog für eine Test-Site | ⏳ klärst du (AP 0.1b) |
| Inselnamen und Stil im Detail | ⏳ AP 0.3 |
