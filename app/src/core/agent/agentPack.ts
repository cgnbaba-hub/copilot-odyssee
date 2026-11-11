import { ContentFilter, isModuleVisible, moduleLicense, sortedIslands } from '../content/bundle';
import { ContentBundle } from '../content/types';

/**
 * Everything needed to set up the «Odyssee-Lotse», an agent inside Copilot
 * that answers questions with what the Odyssey teaches: instructions for
 * the agent, a knowledge file made from the content, and questions to start
 * with. The agent is created by hand in Copilot (see docs/AGENT.md); this
 * only keeps its texts in step with the content.
 */

/** Copilot's agent builder takes instructions up to this length. */
export const INSTRUCTIONS_MAX = 8000;

export interface AgentPack {
  instructions: string;
  knowledge: string;
  starters: string[];
}

export interface AgentPackOptions extends ContentFilter {
  /** Address of the app; with it the knowledge file links every stage. */
  appUrl?: string;
}

const APPS = { outlook: 'Outlook', teams: 'Teams', word: 'Word', excel: 'Excel', powerpoint: 'PowerPoint' };
const LICENCE = { basic: 'Copilot Chat (Basic)', premium: 'Microsoft 365 Copilot (Premium)' };

function stageLink(appUrl: string | undefined, moduleId: string): string {
  if (!appUrl) return '';
  return `${appUrl}${appUrl.indexOf('?') >= 0 ? '&' : '?'}etappe=${moduleId}`;
}

function instructions(content: ContentBundle, options: AgentPackOptions): string {
  const islands = sortedIslands(content)
    .map((island) => `- ${island.name.de} (${LICENCE[island.license]}): ${island.tool.de}`)
    .join('\n');
  const contact = content.contact ? `Verweise dann auf ${content.contact}.` : 'Sag dann, dass die Person intern nachfragen soll.';
  const app = options.appUrl ? `Die Lern-App «Copilot Odyssee» liegt unter ${options.appUrl}.` : 'Die Lern-App heisst «Copilot Odyssee».';
  return [
    '# Rolle',
    `Du bist der Odyssee-Lotse. Du hilfst Mitarbeitenden von DERTOUR Suisse, Microsoft Copilot bei ihrer täglichen Arbeit zu nutzen. ${app} Du ergänzt sie: Du beantwortest Fragen in dem Moment, in dem sie bei der Arbeit auftauchen.`,
    '',
    '# So antwortest du',
    '- Kurz und konkret, in der Du-Form. Zuerst die Antwort, dann höchstens drei Schritte.',
    '- Schweizer Schreibweise: immer «ss», nie das Eszett. Anführungszeichen « ».',
    '- Antworte in der Sprache der Frage (Deutsch oder Englisch).',
    '- Stütze dich zuerst auf dein Wissen aus der Odyssee (Datei «wissen.md»). Wenn dort nichts steht, sag das offen und rate nicht.',
    '- Nenne Knöpfe und Menüs nur so, wie sie in deinem Wissen stehen. Copilot sieht je nach Version etwas anders aus: Sag das, wenn jemand etwas nicht findet.',
    '- Wenn es passt, gib einen fertigen Prompt zum Kopieren mit Platzhaltern in eckigen Klammern, zum Beispiel [Text einfügen].',
    '- Ein guter Prompt nennt Ziel, Kontext, Quelle und gewünschte Form. Hilf, vage Prompts so zu verbessern.',
    '- Empfiehl am Ende die passende Etappe der Odyssee, wenn jemand mehr lernen will.',
    '',
    '# Basic und Premium',
    '- Basic heisst Copilot Chat: für alle Mitarbeitenden, im Browser, in Teams und in der Seitenleiste von Edge.',
    '- Premium heisst Microsoft 365 Copilot: Copilot direkt in Outlook, Teams, Word, Excel und PowerPoint, mit Zugriff auf die eigenen Arbeitsdaten.',
    '- Sag bei jeder Anleitung, ob sie mit Basic geht oder Premium braucht.',
    '- Versprich niemandem eine Premium-Lizenz. Ob jemand sie bekommt, entscheidet ein eigener Prozess und hängt von der Verfügbarkeit ab.',
    '',
    '# Daten und Verantwortung',
    '- Erinnere daran, Ergebnisse von Copilot zu prüfen, bevor sie verwendet oder verschickt werden.',
    '- Keine Kunden- oder Personendaten in Prompts, wenn es nicht nötig ist. Bei Unsicherheit gelten die internen Regeln.',
    '- Du triffst keine rechtlichen, personellen oder finanziellen Entscheide und gibst dazu keine verbindliche Auskunft.',
    '',
    '# Wenn du nicht weiterweisst',
    `Sag es klar. ${contact}`,
    '',
    '# Die Inseln der Odyssee',
    islands
  ].join('\n');
}

function knowledge(content: ContentBundle, options: AgentPackOptions): string {
  const parts: string[] = ['# Wissen des Odyssee-Lotsen', '', 'Diese Datei wird aus den Inhalten der Copilot Odyssee erzeugt. Nicht von Hand ändern.', ''];

  parts.push('## Häufige Fragen', '');
  (content.help || []).forEach((topic) => parts.push(`### ${topic.question.de}`, '', topic.answer.de, ''));

  parts.push('## Etappen', '');
  sortedIslands(content).forEach((island) => {
    const modules = content.modules.filter((m) => m.island === island.id && isModuleVisible(m, options)).sort((a, b) => a.order - b.order);
    if (modules.length === 0) return;
    parts.push(`### Insel: ${island.name.de} (${island.tool.de})`, '', island.summary.de, '');
    modules.forEach((module) => {
      const link = stageLink(options.appUrl, module.id);
      parts.push(
        `#### Etappe: ${module.title.de}`,
        '',
        `${LICENCE[moduleLicense(content, module)]} · ca. ${module.estimatedMinutes} Minuten${link ? ` · ${link}` : ''}`,
        '',
        module.summary.de,
        ''
      );
      module.blocks.forEach((block) => {
        if (block.type !== 'briefing') return;
        parts.push(`**${block.title.de}**`, '', block.body.de, '');
        if (block.example) parts.push('Beispiel:', '', block.example.de, '');
      });
    });
  });

  const prompts = content.prompts || [];
  if (prompts.length > 0) {
    parts.push('## Prompt-Vorlagen', '');
    const areaName = (id: string): string => ((content.areas || []).filter((a) => a.id === id)[0] || { name: { de: id } }).name.de;
    prompts.forEach((prompt) => {
      const where = prompt.app ? `Copilot in ${APPS[prompt.app]}` : 'Copilot Chat';
      const areas = prompt.areas && prompt.areas.length > 0 ? prompt.areas.map(areaName).join(', ') : 'alle Bereiche';
      parts.push(`### ${prompt.title.de}`, '', `${where} · ${LICENCE[prompt.license]} · ${areas}`, '', prompt.prompt.de, '');
    });
  }
  return parts.join('\n');
}

const STARTERS = [
  'Was ist der Unterschied zwischen Copilot Chat und Microsoft 365 Copilot?',
  'Hilf mir, diesen Prompt besser zu machen: [Prompt einfügen]',
  'Gib mir einen Prompt, um eine lange Mail zusammenzufassen.',
  'Wie bringe ich Copilot die Schweizer Schreibweise bei?',
  'Darf ich Kundendaten in Copilot eingeben?',
  'Ich habe zehn Minuten: Welche Etappe der Odyssee lohnt sich für mich?'
];

export function buildAgentPack(content: ContentBundle, options: AgentPackOptions): AgentPack {
  return { instructions: instructions(content, options), knowledge: knowledge(content, options), starters: STARTERS.slice() };
}
