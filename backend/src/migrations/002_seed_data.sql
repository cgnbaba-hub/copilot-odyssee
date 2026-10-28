-- =============================================================
-- CoPilot Odyssey – Seed Data
-- Migration: 002_seed_data.sql
-- =============================================================

-- Create default tenant
INSERT INTO tenants (id, name, slug, branding_config)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'CoPilot Odyssey',
  'default',
  '{"primary_color": "#E94560", "logo_url": null}'
) ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- ISLANDS
-- =============================================================

-- Island 1: Aurora Archipel (Copilot Grundlagen)
INSERT INTO islands (
  id, tenant_id, slug,
  name_de, name_en,
  description_de, description_en,
  lore_de, lore_en,
  visual_theme, color_primary, color_secondary,
  sort_order, is_active,
  npc_name, npc_greeting_de, npc_greeting_en,
  guardian_name_de, guardian_name_en,
  guardian_description_de, guardian_description_en,
  xp_completion_bonus, prerequisite_island_ids
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'aurora',
  'Aurora-Archipel',
  'Aurora Archipelago',
  'Die ersten Schritte mit Microsoft 365 Copilot. Lerne die Grundlagen der KI-gestützten Produktivität.',
  'Your first steps with Microsoft 365 Copilot. Learn the foundations of AI-powered productivity.',
  'Einst ein Ort der ewigen Nacht, wurde der Aurora-Archipel durch das Licht der KI erleuchtet. Hier begannen die ersten Copilot-Pioniere ihre Reise.',
  'Once a place of eternal night, the Aurora Archipelago was illuminated by the light of AI. Here the first Copilot pioneers began their journey.',
  'aurora', '#7B68EE', '#E0E0FF',
  1, true,
  'Lumina',
  'Willkommen, Abenteurer! Ich bin Lumina, die Hüterin des Wissens. Microsoft 365 Copilot wird dein treuer Begleiter sein. Fang mit den Grundlagen an!',
  'Welcome, adventurer! I am Lumina, the keeper of knowledge. Microsoft 365 Copilot will be your faithful companion. Start with the basics!',
  'Der Halluzinator', 'The Hallucinator',
  'Ein Wächter, der falsche Informationen als Waffe einsetzt. Nur präzise Prompts können ihn besiegen!',
  'A guardian who uses false information as a weapon. Only precise prompts can defeat him!',
  500, '[]'
) ON CONFLICT (tenant_id, slug) DO NOTHING;

-- Island 2: Gridforge (Copilot in Excel & Teams)
INSERT INTO islands (
  id, tenant_id, slug,
  name_de, name_en,
  description_de, description_en,
  lore_de, lore_en,
  visual_theme, color_primary, color_secondary,
  sort_order, is_active,
  npc_name, npc_greeting_de, npc_greeting_en,
  guardian_name_de, guardian_name_en,
  guardian_description_de, guardian_description_en,
  xp_completion_bonus, prerequisite_island_ids
) VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'gridforge',
  'Gridforge',
  'Gridforge',
  'Meistere Copilot in Excel und Microsoft Teams. Analysiere Daten und optimiere die Zusammenarbeit.',
  'Master Copilot in Excel and Microsoft Teams. Analyze data and optimize collaboration.',
  'In den glühenden Schmieden von Gridforge wurden die mächtigsten Datenmodelle erschaffen. Die Hitzewellen der Formeln können nur durch KI gebändigt werden.',
  'In the glowing forges of Gridforge, the most powerful data models were created. The heat waves of formulas can only be tamed by AI.',
  'gridforge', '#FF6B35', '#FFB347',
  2, true,
  'Forge',
  'Heiß hier, oder? Ich bin Forge. In Excel und Teams wirst du Copilot wirklich brauchen. Lass uns komplexe Daten bändigen!',
  'Hot here, isn''t it? I''m Forge. In Excel and Teams you''ll really need Copilot. Let''s tame complex data!',
  'Der Datenmoloch', 'The Data Moloch',
  'Ein mächtiger Wächter aus tausend Tabellen. Nur wer die richtigen Fragen stellt, überwindet ihn.',
  'A mighty guardian made of a thousand spreadsheets. Only those who ask the right questions can overcome him.',
  750, '["b0000000-0000-0000-0000-000000000001"]'
) ON CONFLICT (tenant_id, slug) DO NOTHING;

-- Island 3: Deckstorm (Copilot für Präsentationen)
INSERT INTO islands (
  id, tenant_id, slug,
  name_de, name_en,
  description_de, description_en,
  lore_de, lore_en,
  visual_theme, color_primary, color_secondary,
  sort_order, is_active,
  npc_name, npc_greeting_de, npc_greeting_en,
  guardian_name_de, guardian_name_en,
  guardian_description_de, guardian_description_en,
  xp_completion_bonus, prerequisite_island_ids
) VALUES (
  'b0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'deckstorm',
  'Deckstorm',
  'Deckstorm',
  'Erstelle überzeugende Präsentationen mit Copilot in PowerPoint und Word.',
  'Create compelling presentations with Copilot in PowerPoint and Word.',
  'Deckstorm – wo Ideen zu Stürmen werden. Die Insel der ewigen Präsentationen, bewacht von einem Wesen, das Langeweile zur Waffe macht.',
  'Deckstorm – where ideas become storms. The island of eternal presentations, guarded by a being that uses boredom as a weapon.',
  'deckstorm', '#FF1493', '#FFD700',
  3, true,
  'Aurora',
  'Willkommen in Deckstorm! Ich bin Aurora. Hier lernst du, mit Copilot in PowerPoint und Word zu zaubern. Lass uns deine Ideen zum Leben erwecken!',
  'Welcome to Deckstorm! I''m Aurora. Here you''ll learn to work magic with Copilot in PowerPoint and Word. Let''s bring your ideas to life!',
  'Der Präsentations-Teufel', 'The Presentation Devil',
  'Ein Wächter, der von schlechten Folien lebt. Nur brillante Prompts für PowerPoint können ihn besiegen.',
  'A guardian that feeds on bad slides. Only brilliant PowerPoint prompts can defeat him.',
  1000, '["b0000000-0000-0000-0000-000000000002"]'
) ON CONFLICT (tenant_id, slug) DO NOTHING;

-- =============================================================
-- QUIZ QUESTIONS – Aurora Archipel
-- =============================================================

-- Question 1
INSERT INTO quiz_questions (id, tenant_id, island_id, question_de, question_en, difficulty, xp_reward, is_active)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'Was ist Microsoft 365 Copilot?',
  'What is Microsoft 365 Copilot?',
  'beginner', 10, true
) ON CONFLICT DO NOTHING;

INSERT INTO quiz_options (question_id, text_de, text_en, is_correct, explanation_de, explanation_en, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Eine KI-Integration in Microsoft 365-Apps', 'An AI integration in Microsoft 365 apps', true, 'Richtig! Copilot ist in Apps wie Word, Excel, Teams und Outlook integriert.', 'Correct! Copilot is integrated in apps like Word, Excel, Teams, and Outlook.', 0),
  ('c0000000-0000-0000-0000-000000000001', 'Ein neues Textverarbeitungsprogramm', 'A new word processor', false, 'Copilot ist keine eigenständige App, sondern eine KI-Ergänzung.', 'Copilot is not a standalone app, but an AI enhancement.', 1),
  ('c0000000-0000-0000-0000-000000000001', 'Ein Cloud-Speicherdienst', 'A cloud storage service', false, 'Das ist OneDrive. Copilot ist ein KI-Assistent.', 'That''s OneDrive. Copilot is an AI assistant.', 2),
  ('c0000000-0000-0000-0000-000000000001', 'Ein Videokonferenz-Tool', 'A video conferencing tool', false, 'Das ist Teams. Copilot funktioniert in Teams, ist aber mehr als das.', 'That''s Teams. Copilot works in Teams, but is more than that.', 3)
ON CONFLICT DO NOTHING;

-- Question 2
INSERT INTO quiz_questions (id, tenant_id, island_id, question_de, question_en, difficulty, xp_reward, is_active)
VALUES (
  'c0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'Welches Sprachmodell liegt Microsoft 365 Copilot zugrunde?',
  'Which language model underpins Microsoft 365 Copilot?',
  'beginner', 10, true
) ON CONFLICT DO NOTHING;

INSERT INTO quiz_options (question_id, text_de, text_en, is_correct, explanation_de, explanation_en, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000002', 'GPT-4 von OpenAI', 'GPT-4 from OpenAI', true, 'Microsoft nutzt GPT-4 von OpenAI als Basis für Copilot.', 'Microsoft uses GPT-4 from OpenAI as the foundation for Copilot.', 0),
  ('c0000000-0000-0000-0000-000000000002', 'BERT von Google', 'BERT from Google', false, 'BERT ist ein Google-Modell und nicht Basis von Copilot.', 'BERT is a Google model and not the basis of Copilot.', 1),
  ('c0000000-0000-0000-0000-000000000002', 'LLaMA von Meta', 'LLaMA from Meta', false, 'LLaMA kommt von Meta und ist nicht Teil von Copilot.', 'LLaMA comes from Meta and is not part of Copilot.', 2),
  ('c0000000-0000-0000-0000-000000000002', 'Ein eigenes Microsoft-Modell', 'A proprietary Microsoft model', false, 'Microsoft entwickelt eigene Modelle, nutzt aber OpenAI für Copilot.', 'Microsoft develops its own models but uses OpenAI for Copilot.', 3)
ON CONFLICT DO NOTHING;

-- Question 3
INSERT INTO quiz_questions (id, tenant_id, island_id, question_de, question_en, difficulty, xp_reward, is_active)
VALUES (
  'c0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'Was versteht man unter "Prompt" im Kontext von KI?',
  'What is a "prompt" in the context of AI?',
  'beginner', 10, true
) ON CONFLICT DO NOTHING;

INSERT INTO quiz_options (question_id, text_de, text_en, is_correct, explanation_de, explanation_en, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000003', 'Eine Eingabeaufforderung oder Anweisung an die KI', 'An input or instruction given to the AI', true, 'Ein Prompt ist die Texteingabe, mit der du der KI mitteilst, was sie tun soll.', 'A prompt is the text input that tells the AI what to do.', 0),
  ('c0000000-0000-0000-0000-000000000003', 'Ein Fehler im System', 'An error in the system', false, 'Ein Fehler wäre ein Bug, kein Prompt.', 'An error would be a bug, not a prompt.', 1),
  ('c0000000-0000-0000-0000-000000000003', 'Eine Datenbankabfrage', 'A database query', false, 'Datenbankabfragen verwendet man in SQL, nicht für KI-Eingaben.', 'Database queries are used in SQL, not for AI inputs.', 2),
  ('c0000000-0000-0000-0000-000000000003', 'Ein Programmierbefehl', 'A programming command', false, 'Prompts sind in natürlicher Sprache, keine Programmierbefehle.', 'Prompts are in natural language, not programming commands.', 3)
ON CONFLICT DO NOTHING;

-- Question 4 – intermediate
INSERT INTO quiz_questions (id, tenant_id, island_id, question_de, question_en, difficulty, xp_reward, is_active)
VALUES (
  'c0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'Was ist ein wichtiges Element eines guten Copilot-Prompts?',
  'What is an important element of a good Copilot prompt?',
  'intermediate', 20, true
) ON CONFLICT DO NOTHING;

INSERT INTO quiz_options (question_id, text_de, text_en, is_correct, explanation_de, explanation_en, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000004', 'Klare Zieldefinition und relevanter Kontext', 'Clear goal definition and relevant context', true, 'Ein guter Prompt beschreibt präzise, was du möchtest, und gibt der KI nötigen Kontext.', 'A good prompt precisely describes what you want and gives the AI necessary context.', 0),
  ('c0000000-0000-0000-0000-000000000004', 'Möglichst kurze Anfragen', 'As short requests as possible', false, 'Kürze allein ist kein Qualitätsmerkmal – Präzision und Kontext sind wichtiger.', 'Brevity alone is not a quality feature – precision and context are more important.', 1),
  ('c0000000-0000-0000-0000-000000000004', 'Technische Fachbegriffe verwenden', 'Use technical jargon', false, 'Fachbegriffe können helfen, sind aber kein Muss. Klarheit ist entscheidend.', 'Technical terms can help but are not mandatory. Clarity is key.', 2),
  ('c0000000-0000-0000-0000-000000000004', 'Mehrere Themen gleichzeitig ansprechen', 'Address multiple topics at once', false, 'Fokus auf ein Thema pro Prompt liefert bessere Ergebnisse.', 'Focusing on one topic per prompt delivers better results.', 3)
ON CONFLICT DO NOTHING;

-- =============================================================
-- QUIZ QUESTIONS – Gridforge
-- =============================================================

INSERT INTO quiz_questions (id, tenant_id, island_id, question_de, question_en, difficulty, xp_reward, is_active)
VALUES (
  'c0000000-0000-0000-0000-000000000005',
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'Was kann Copilot in Microsoft Excel tun?',
  'What can Copilot do in Microsoft Excel?',
  'beginner', 10, true
) ON CONFLICT DO NOTHING;

INSERT INTO quiz_options (question_id, text_de, text_en, is_correct, explanation_de, explanation_en, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000005', 'Daten analysieren und Formeln vorschlagen', 'Analyze data and suggest formulas', true, 'Copilot in Excel kann Trends erkennen, Formeln generieren und Daten zusammenfassen.', 'Copilot in Excel can identify trends, generate formulas, and summarize data.', 0),
  ('c0000000-0000-0000-0000-000000000005', 'Nur einfache Berechnungen durchführen', 'Only perform simple calculations', false, 'Copilot geht weit über einfache Berechnungen hinaus.', 'Copilot goes far beyond simple calculations.', 1),
  ('c0000000-0000-0000-0000-000000000005', 'Externe Daten aus dem Internet laden', 'Load external data from the internet', false, 'Copilot arbeitet mit den vorhandenen Daten und greift nicht selbst ins Internet.', 'Copilot works with existing data and doesn''t access the internet itself.', 2),
  ('c0000000-0000-0000-0000-000000000005', 'Automatisch Makros schreiben', 'Automatically write macros', false, 'Copilot schreibt keine vollständigen Makros, kann aber Formeln und Analysen vorschlagen.', 'Copilot doesn''t write full macros, but can suggest formulas and analyses.', 3)
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (id, tenant_id, island_id, question_de, question_en, difficulty, xp_reward, is_active)
VALUES (
  'c0000000-0000-0000-0000-000000000006',
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'Welche Funktion hat Copilot in Microsoft Teams?',
  'What function does Copilot have in Microsoft Teams?',
  'beginner', 10, true
) ON CONFLICT DO NOTHING;

INSERT INTO quiz_options (question_id, text_de, text_en, is_correct, explanation_de, explanation_en, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000006', 'Besprechungen zusammenfassen und Action Items erstellen', 'Summarize meetings and create action items', true, 'Copilot kann Meetings in Echtzeit zusammenfassen und Aufgaben aus Gesprächen ableiten.', 'Copilot can summarize meetings in real-time and derive tasks from conversations.', 0),
  ('c0000000-0000-0000-0000-000000000006', 'Automatisch an Meetings teilnehmen ohne Einladung', 'Automatically join meetings without invitation', false, 'Copilot ersetzt keine Teilnehmer und braucht eine Einladung.', 'Copilot doesn''t replace participants and needs an invitation.', 1),
  ('c0000000-0000-0000-0000-000000000006', 'Videos für Meetings schneiden', 'Edit videos for meetings', false, 'Das ist nicht Copilots Funktion in Teams.', 'That is not Copilot''s function in Teams.', 2),
  ('c0000000-0000-0000-0000-000000000006', 'E-Mails aus Teams heraus versenden', 'Send emails from Teams', false, 'E-Mails werden in Outlook gesendet, nicht direkt via Copilot in Teams.', 'Emails are sent in Outlook, not directly via Copilot in Teams.', 3)
ON CONFLICT DO NOTHING;

-- =============================================================
-- QUIZ QUESTIONS – Deckstorm
-- =============================================================

INSERT INTO quiz_questions (id, tenant_id, island_id, question_de, question_en, difficulty, xp_reward, is_active)
VALUES (
  'c0000000-0000-0000-0000-000000000007',
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000003',
  'Was kann Copilot in PowerPoint erstellen?',
  'What can Copilot create in PowerPoint?',
  'beginner', 10, true
) ON CONFLICT DO NOTHING;

INSERT INTO quiz_options (question_id, text_de, text_en, is_correct, explanation_de, explanation_en, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000007', 'Vollständige Präsentationen aus einem Prompt', 'Complete presentations from a prompt', true, 'Copilot kann basierend auf einer Beschreibung komplette Präsentationen mit Folien, Titeln und Inhalten erstellen.', 'Copilot can create complete presentations with slides, titles, and content based on a description.', 0),
  ('c0000000-0000-0000-0000-000000000007', 'Nur einzelne Textboxen befüllen', 'Only fill individual text boxes', false, 'Copilot kann ganze Präsentationen erstellen, nicht nur einzelne Textboxen.', 'Copilot can create entire presentations, not just individual text boxes.', 1),
  ('c0000000-0000-0000-0000-000000000007', 'Nur Bilder in Folien einfügen', 'Only insert images into slides', false, 'Copilot kann weit mehr als nur Bilder einfügen.', 'Copilot can do much more than just insert images.', 2),
  ('c0000000-0000-0000-0000-000000000007', 'Animationen automatisch hinzufügen', 'Automatically add animations', false, 'Animationen sind nicht die Hauptfunktion von Copilot in PowerPoint.', 'Animations are not the main function of Copilot in PowerPoint.', 3)
ON CONFLICT DO NOTHING;

-- =============================================================
-- PROMPT CHALLENGES – Aurora Archipel
-- =============================================================

INSERT INTO prompt_challenges (
  id, tenant_id, island_id,
  title_de, title_en,
  description_de, description_en,
  scenario_de, scenario_en,
  ideal_prompt_de, ideal_prompt_en,
  evaluation_criteria, difficulty, xp_reward_max, is_active
) VALUES (
  'd0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'Erster Copilot-Prompt in Word',
  'First Copilot Prompt in Word',
  'Formuliere einen klaren Prompt für Copilot in Word, um einen professionellen Text zu erstellen.',
  'Formulate a clear prompt for Copilot in Word to create professional text.',
  'Du musst einen kurzen Einführungstext (ca. 200 Wörter) für einen neuen Mitarbeiter schreiben, der das Team und die Unternehmenskultur beschreibt. Nutze Copilot in Word, um diesen Text zu erstellen.',
  'You need to write a short introductory text (approx. 200 words) for a new employee describing the team and company culture. Use Copilot in Word to create this text.',
  'Erstelle einen professionellen Einführungstext von 200 Wörtern für neue Mitarbeiter. Beschreibe ein innovatives Tech-Unternehmen mit flachen Hierarchien, Fokus auf Teamarbeit und einer "Learning by Doing"-Kultur. Verwende einen freundlichen, einladenden Ton.',
  'Create a professional 200-word introductory text for new employees. Describe an innovative tech company with flat hierarchies, focus on teamwork, and a "Learning by Doing" culture. Use a friendly, welcoming tone.',
  '{"criteria": ["Klares Ziel", "Spezifischer Kontext", "Gewünschter Ton", "Längenangabe"]}',
  'beginner', 100, true
) ON CONFLICT DO NOTHING;

INSERT INTO prompt_challenges (
  id, tenant_id, island_id,
  title_de, title_en,
  description_de, description_en,
  scenario_de, scenario_en,
  ideal_prompt_de, ideal_prompt_en,
  evaluation_criteria, difficulty, xp_reward_max, is_active
) VALUES (
  'd0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'E-Mail mit Copilot verfassen',
  'Write an Email with Copilot',
  'Schreibe einen effektiven Prompt, um Copilot eine professionelle E-Mail erstellen zu lassen.',
  'Write an effective prompt to have Copilot create a professional email.',
  'Dein Team hat ein wichtiges Projekt erfolgreich abgeschlossen. Schreibe mithilfe von Copilot in Outlook eine Dankesnachricht an alle Beteiligten (15 Personen aus 3 verschiedenen Abteilungen).',
  'Your team has successfully completed an important project. Use Copilot in Outlook to write a thank-you message to all involved (15 people from 3 different departments).',
  'Verfasse eine Dankes-E-Mail an 15 Teammitglieder aus den Abteilungen Engineering, Design und Marketing, die gemeinsam das Projekt "Aurora Launch" in 3 Monaten erfolgreich abgeschlossen haben. Hebe besonders die Teamarbeit hervor. Verwende einen wertschätzenden, professionellen Ton. Länge: 150-200 Wörter.',
  'Write a thank-you email to 15 team members from Engineering, Design, and Marketing who successfully completed the "Aurora Launch" project together in 3 months. Particularly highlight teamwork. Use an appreciative, professional tone. Length: 150-200 words.',
  '{"criteria": ["Empfänger definiert", "Anlass klar", "Ton spezifiziert", "Kontext vollständig"]}',
  'beginner', 100, true
) ON CONFLICT DO NOTHING;

-- =============================================================
-- PROMPT CHALLENGES – Gridforge
-- =============================================================

INSERT INTO prompt_challenges (
  id, tenant_id, island_id,
  title_de, title_en,
  description_de, description_en,
  scenario_de, scenario_en,
  ideal_prompt_de, ideal_prompt_en,
  evaluation_criteria, difficulty, xp_reward_max, is_active
) VALUES (
  'd0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'Excel-Analyse mit Copilot',
  'Excel Analysis with Copilot',
  'Formuliere einen Prompt, um Copilot eine Datenanalyse in Excel durchführen zu lassen.',
  'Formulate a prompt to have Copilot perform a data analysis in Excel.',
  'Du hast eine Excel-Tabelle mit Verkaufsdaten der letzten 12 Monate (Produkt, Region, Umsatz, Anzahl Verkäufe). Dein Manager möchte eine Zusammenfassung der Top 3 Produkte und Trends.',
  'You have an Excel spreadsheet with sales data from the last 12 months (product, region, revenue, number of sales). Your manager wants a summary of the Top 3 products and trends.',
  'Analysiere die Verkaufstabelle und identifiziere die Top 3 Produkte nach Gesamtumsatz. Erstelle eine Zusammenfassung mit: 1) Ranking der Top-Produkte, 2) Umsatzentwicklung über 12 Monate, 3) Empfehlung für das nächste Quartal. Formatiere die Ergebnisse übersichtlich.',
  'Analyze the sales table and identify the Top 3 products by total revenue. Create a summary with: 1) Ranking of top products, 2) Revenue development over 12 months, 3) Recommendation for the next quarter. Format the results clearly.',
  '{"criteria": ["Datenquelle klar", "Spezifische Anfrage", "Ausgabeformat definiert", "Handlungsempfehlung"]}',
  'intermediate', 150, true
) ON CONFLICT DO NOTHING;

-- =============================================================
-- PROMPT CHALLENGES – Deckstorm
-- =============================================================

INSERT INTO prompt_challenges (
  id, tenant_id, island_id,
  title_de, title_en,
  description_de, description_en,
  scenario_de, scenario_en,
  ideal_prompt_de, ideal_prompt_en,
  evaluation_criteria, difficulty, xp_reward_max, is_active
) VALUES (
  'd0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000003',
  'PowerPoint-Präsentation mit Copilot',
  'PowerPoint Presentation with Copilot',
  'Erstelle einen Prompt, der Copilot anweist, eine Präsentation zu einem Geschäftsthema zu erstellen.',
  'Create a prompt that instructs Copilot to create a presentation on a business topic.',
  'Dein CEO hat dich gebeten, eine Präsentation für das nächste Investoren-Meeting vorzubereiten. Das Thema: Die Einführung von Microsoft 365 Copilot im Unternehmen und der erwartete ROI.',
  'Your CEO has asked you to prepare a presentation for the next investor meeting. The topic: The introduction of Microsoft 365 Copilot in the company and the expected ROI.',
  'Erstelle eine PowerPoint-Präsentation mit 8 Folien zum Thema "Microsoft 365 Copilot Einführung" für ein Investoren-Meeting. Struktur: 1) Titelfolie, 2) Ausgangssituation, 3) Was ist Copilot?, 4) Vorteile für unser Unternehmen, 5) Implementierungsplan (6 Monate), 6) Erwarteter ROI mit Zahlen, 7) Risiken und Mitigation, 8) Nächste Schritte. Verwende professionelles Business-Design.',
  'Create a PowerPoint presentation with 8 slides on "Microsoft 365 Copilot Introduction" for an investor meeting. Structure: 1) Title slide, 2) Current situation, 3) What is Copilot?, 4) Benefits for our company, 5) Implementation plan (6 months), 6) Expected ROI with numbers, 7) Risks and mitigation, 8) Next steps. Use professional business design.',
  '{"criteria": ["Klare Struktur", "Zielgruppe definiert", "Anzahl Folien angegeben", "Inhaltliche Tiefe", "Design-Anforderungen"]}',
  'intermediate', 150, true
) ON CONFLICT DO NOTHING;

-- =============================================================
-- BADGES
-- =============================================================

INSERT INTO badges (id, tenant_id, slug, name_de, name_en, description_de, description_en, icon_url)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'first-quest', 'Erstes Abenteuer', 'First Adventure',
   'Schließe deine erste Quest ab', 'Complete your first quest', null),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'aurora-master', 'Aurora-Meister', 'Aurora Master',
   'Schließe den Aurora-Archipel vollständig ab', 'Complete the Aurora Archipelago fully', null),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'prompt-perfectionist', 'Prompt-Perfektionist', 'Prompt Perfectionist',
   'Erreiche 90+ Punkte in einer Prompt-Challenge', 'Score 90+ points in a prompt challenge', null),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
   'duel-champion', 'Duell-Champion', 'Duel Champion',
   'Gewinne 10 Duelle', 'Win 10 duels', null),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
   'copilot-master', 'Copilot-Meister', 'Copilot Master',
   'Schließe alle Inseln ab', 'Complete all islands', null)
ON CONFLICT DO NOTHING;

-- =============================================================
-- CHARACTER CLASSES
-- =============================================================

INSERT INTO character_classes (id, tenant_id, slug, name_de, name_en, description_de, description_en, required_island_ids, bonus_type, bonus_value)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'prompt-engineer', 'Prompt-Ingenieur', 'Prompt Engineer',
   'Meistert die Kunst des Prompt-Engineerings. Erhält 10% mehr XP bei Prompt-Challenges.',
   'Masters the art of prompt engineering. Earns 10% more XP on prompt challenges.',
   '["b0000000-0000-0000-0000-000000000001"]', 'xp_multiplier', 1.10),
  ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'data-wizard', 'Daten-Zauberer', 'Data Wizard',
   'Beherrscht Datenanalyse mit Copilot. Erhält Hinweise bei Quiz-Fragen.',
   'Masters data analysis with Copilot. Receives hints on quiz questions.',
   '["b0000000-0000-0000-0000-000000000002"]', 'quiz_hint', 1.00),
  ('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'presentation-guru', 'Präsentations-Guru', 'Presentation Guru',
   'Meister der KI-gestützten Präsentationen. Erhält Bonus-XP bei Duelltriumphen.',
   'Master of AI-powered presentations. Earns bonus XP on duel victories.',
   '["b0000000-0000-0000-0000-000000000003"]', 'prompt_bonus', 1.15)
ON CONFLICT DO NOTHING;
