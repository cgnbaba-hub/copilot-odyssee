/**
 * Writes the texts for the «Odyssee-Lotse», the companion agent in Copilot,
 * to dist-agent/ (see docs/AGENT.md):
 *
 *   tsx tools/agent-export.ts [--url https://…/Odyssee.aspx] [--drafts]
 *
 * --url     address of the app, so the knowledge file links every stage
 * --drafts  include stages that are still drafts
 *
 * Run `npm run content:bundle` first (the npm script does).
 */
import * as fs from 'fs';
import * as path from 'path';

import content from '../src/content/bundle.generated';
import { buildAgentPack, INSTRUCTIONS_MAX } from '../src/core/agent/agentPack';

const OUT_DIR = path.resolve(__dirname, '../dist-agent');
const args = process.argv.slice(2);
const urlAt = args.indexOf('--url');
const appUrl = urlAt >= 0 ? args[urlAt + 1] : undefined;
const showDrafts = args.indexOf('--drafts') >= 0;

const pack = buildAgentPack(content, { showDrafts, appUrl });
if (pack.instructions.length > INSTRUCTIONS_MAX) {
  console.error(`Die Anweisungen sind ${pack.instructions.length} Zeichen lang, erlaubt sind ${INSTRUCTIONS_MAX}.`);
  process.exit(1);
}
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'anweisungen.md'), pack.instructions + '\n');
fs.writeFileSync(path.join(OUT_DIR, 'wissen.md'), pack.knowledge + '\n');
fs.writeFileSync(path.join(OUT_DIR, 'starter.md'), pack.starters.map((s) => `- ${s}`).join('\n') + '\n');
console.log(`Odyssee-Lotse: anweisungen.md (${pack.instructions.length} Zeichen), wissen.md (${Math.round(pack.knowledge.length / 1024)} KB), starter.md in ${OUT_DIR}`);
if (!showDrafts && pack.knowledge.indexOf('#### Etappe:') < 0) console.warn('Hinweis: Keine Etappe ist freigegeben (alle Entwurf). Mit --drafts werden Entwürfe aufgenommen.');
