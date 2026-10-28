import { Lang } from '../../core/i18n/locale';

/** UI texts. German uses Swiss spelling ("ss" instead of "ß"). */
const de = {
  loading: 'Segel werden gesetzt …',
  demoBanner: 'Demo-Modus: Der Fortschritt wird nur in diesem Browser gespeichert.',
  language: 'Sprache',
  settings: 'Einstellungen',
  close: 'Schliessen',
  back: 'Zurück',
  continue: 'Weiter',
  level: 'Stufe',
  rank: 'Rang',
  minutes: 'Min.',
  draft: 'Entwurf',

  onboardingTitle: 'Willkommen an Bord!',
  onboardingIntro:
    'Wie Odysseus reist du von Insel zu Insel. Auf jeder Insel lernst du, wie Copilot dir die Arbeit erleichtert, und bringst eigene Ideen mit nach Hause: nach Ithaka.',
  licenseQuestion: 'Welche Copilot-Version hast du?',
  licenseBasic: 'Microsoft 365 Copilot Chat',
  licenseBasicHint: 'Die Basis-Version, die fast alle haben.',
  licensePremium: 'Microsoft 365 Copilot',
  licensePremiumHint: 'Die Zusatzlizenz mit Copilot direkt in Outlook, Teams, Word, Excel und PowerPoint.',
  licenseUnknown: 'Weiss ich nicht',
  licenseUnknownHint: 'Kein Problem, du startest mit den Inseln für alle.',
  licenseHowTo:
    'Unter myaccount.microsoft.com siehst du bei «Abonnements», welche Lizenzen du hast. Du kannst deine Wahl jederzeit in den Einstellungen ändern.',
  startJourney: 'Leinen los!',

  mapIntro: 'Wähle eine Insel. Die Route ist ein Vorschlag, du kannst überall anlegen.',
  islandsList: 'Alle Inseln',
  nextStop: 'Nächster Halt',
  forEveryone: 'Für alle',
  premiumOnly: 'Microsoft 365 Copilot',
  previewNote:
    'Diese Insel zeigt Funktionen der Zusatzlizenz Microsoft 365 Copilot. Du kannst dich umsehen, einige Aufgaben lassen sich aber nur mit dieser Lizenz ausprobieren.',
  modules: 'Etappen',
  noModules: 'Diese Insel wird gerade vorbereitet. Schau bald wieder vorbei!',
  statusNew: 'Neu',
  statusInProgress: 'Angefangen',
  statusCompleted: 'Abgeschlossen',
  start: 'Starten',
  resume: 'Fortsetzen',
  repeat: 'Wiederholen',
  backToMap: 'Zur Seekarte',
  backToIsland: 'Zurück zur Insel',

  stepOf: 'Schritt {current} von {total}',
  understood: 'Verstanden',
  checkAnswer: 'Antwort prüfen',
  correct: 'Richtig!',
  wrong: 'Leider nicht.',
  tryAgain: 'Nochmal versuchen',

  promptLabel: 'Dein Prompt',
  promptPlaceholder: 'Schreib hier deinen Prompt …',
  promptPrivacy: 'Dein Text wird nur in deinem Browser ausgewertet und nicht gespeichert.',
  getFeedback: 'Feedback holen',
  score: 'Bewertung',
  promptTooShort: 'Dein Prompt ist sehr kurz. Ein, zwei Sätze mehr helfen Copilot meist sehr.',
  criterionMet: 'Erfüllt',
  criterionMissing: 'Fehlt noch',
  criterion_goal: 'Ziel',
  criterion_context: 'Kontext',
  criterion_source: 'Quelle',
  criterion_expectation: 'Erwartung',
  criterionTip_goal: 'Sag klar, was Copilot tun soll, zum Beispiel «Fasse … zusammen» oder «Entwirf …».',
  criterionTip_context: 'Erkläre, wofür und für wen du das Ergebnis brauchst.',
  criterionTip_source: 'Nenne, worauf sich Copilot stützen soll, zum Beispiel eine Datei oder einen eingefügten Text.',
  criterionTip_expectation: 'Beschreibe das gewünschte Ergebnis: Länge, Format oder Ton.',
  showExample: 'Beispiel anzeigen',
  hideExample: 'Beispiel ausblenden',
  improvePrompt: 'Prompt verbessern',

  missionOpenCopilot: 'Copilot Chat öffnen',
  missionTip: 'Tipp',
  missionRating: 'Wie hilfreich war das für dich?',
  missionRatingScale: '1 = gar nicht, 5 = sehr',
  missionDone: 'Erledigt',

  useCaseTask: 'Welche Aufgabe?',
  useCaseTaskPlaceholder: 'Zum Beispiel: Wöchentlichen Statusbericht aus meinen Notizen schreiben',
  useCaseFrequency: 'Wie oft?',
  frequency_daily: 'Täglich',
  frequency_weekly: 'Wöchentlich',
  frequency_monthly: 'Monatlich',
  frequency_rarely: 'Seltener',
  useCaseMinutes: 'Wie viele Minuten pro Mal?',
  useCasePrompt: 'Erste Idee für einen Prompt (optional)',
  useCaseSave: 'Karte speichern',
  useCaseSaved: 'Deine Karte ist in Ithaka angekommen.',
  useCaseTitle: 'Deine Use-Case-Karten',
  useCaseEmpty: 'Noch keine Karten. Jede Insel endet mit einer Karte, die hier landet.',
  useCaseTimePerMonth: '≈ {minutes} Min. pro Monat',

  moduleDoneTitle: 'Etappe geschafft!',
  moduleDoneText: 'Du hast {xp} {xpName} auf dieser Etappe gesammelt.',
  levelUp: 'Neuer Rang: {rank}!',

  settingsLicense: 'Copilot-Version',
  resetProgress: 'Fortschritt zurücksetzen',
  resetConfirm: 'Willst du deinen ganzen Fortschritt wirklich löschen?'
};

export type Strings = typeof de;

const en: Strings = {
  loading: 'Setting sail …',
  demoBanner: 'Demo mode: progress is only saved in this browser.',
  language: 'Language',
  settings: 'Settings',
  close: 'Close',
  back: 'Back',
  continue: 'Continue',
  level: 'Level',
  rank: 'Rank',
  minutes: 'min',
  draft: 'Draft',

  onboardingTitle: 'Welcome aboard!',
  onboardingIntro:
    'Like Odysseus, you travel from island to island. On each island you learn how Copilot makes your work easier, and you bring your own ideas home: to Ithaca.',
  licenseQuestion: 'Which version of Copilot do you have?',
  licenseBasic: 'Microsoft 365 Copilot Chat',
  licenseBasicHint: 'The base version almost everyone has.',
  licensePremium: 'Microsoft 365 Copilot',
  licensePremiumHint: 'The add-on licence with Copilot built into Outlook, Teams, Word, Excel and PowerPoint.',
  licenseUnknown: "I don't know",
  licenseUnknownHint: "No problem, you'll start with the islands for everyone.",
  licenseHowTo:
    'At myaccount.microsoft.com, under "Subscriptions", you can see which licences you have. You can change your choice in the settings at any time.',
  startJourney: 'Cast off!',

  mapIntro: 'Choose an island. The route is a suggestion, you can land anywhere.',
  islandsList: 'All islands',
  nextStop: 'Next stop',
  forEveryone: 'For everyone',
  premiumOnly: 'Microsoft 365 Copilot',
  previewNote:
    'This island shows features of the Microsoft 365 Copilot add-on licence. You are welcome to look around, but some tasks can only be tried with that licence.',
  modules: 'Stages',
  noModules: 'This island is being prepared. Check back soon!',
  statusNew: 'New',
  statusInProgress: 'In progress',
  statusCompleted: 'Completed',
  start: 'Start',
  resume: 'Resume',
  repeat: 'Repeat',
  backToMap: 'To the sea chart',
  backToIsland: 'Back to the island',

  stepOf: 'Step {current} of {total}',
  understood: 'Got it',
  checkAnswer: 'Check answer',
  correct: 'Correct!',
  wrong: 'Not quite.',
  tryAgain: 'Try again',

  promptLabel: 'Your prompt',
  promptPlaceholder: 'Write your prompt here …',
  promptPrivacy: 'Your text is evaluated in your browser only and is not stored.',
  getFeedback: 'Get feedback',
  score: 'Score',
  promptTooShort: 'Your prompt is very short. One or two more sentences usually help Copilot a lot.',
  criterionMet: 'Covered',
  criterionMissing: 'Missing',
  criterion_goal: 'Goal',
  criterion_context: 'Context',
  criterion_source: 'Source',
  criterion_expectation: 'Expectations',
  criterionTip_goal: 'Say clearly what Copilot should do, for example "Summarise …" or "Draft …".',
  criterionTip_context: 'Explain what you need the result for and for whom.',
  criterionTip_source: 'Name what Copilot should rely on, for example a file or pasted text.',
  criterionTip_expectation: 'Describe the result you want: length, format or tone.',
  showExample: 'Show example',
  hideExample: 'Hide example',
  improvePrompt: 'Improve prompt',

  missionOpenCopilot: 'Open Copilot Chat',
  missionTip: 'Tip',
  missionRating: 'How helpful was this for you?',
  missionRatingScale: '1 = not at all, 5 = very',
  missionDone: 'Done',

  useCaseTask: 'Which task?',
  useCaseTaskPlaceholder: 'For example: write my weekly status report from my notes',
  useCaseFrequency: 'How often?',
  frequency_daily: 'Daily',
  frequency_weekly: 'Weekly',
  frequency_monthly: 'Monthly',
  frequency_rarely: 'Less often',
  useCaseMinutes: 'How many minutes each time?',
  useCasePrompt: 'First idea for a prompt (optional)',
  useCaseSave: 'Save card',
  useCaseSaved: 'Your card has arrived in Ithaca.',
  useCaseTitle: 'Your use case cards',
  useCaseEmpty: 'No cards yet. Every island ends with a card that lands here.',
  useCaseTimePerMonth: '≈ {minutes} min per month',

  moduleDoneTitle: 'Stage complete!',
  moduleDoneText: 'You collected {xp} {xpName} on this stage.',
  levelUp: 'New rank: {rank}!',

  settingsLicense: 'Copilot version',
  resetProgress: 'Reset progress',
  resetConfirm: 'Do you really want to delete all your progress?'
};

const STRINGS: Record<Lang, Strings> = { de, en };

export function stringsFor(lang: Lang): Strings {
  return STRINGS[lang];
}

/** Replaces {placeholders} in a UI text. */
export function format(text: string, values: { [key: string]: string | number }): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
