import bundle from '../../content/bundle.generated';
import { isModuleVisible } from '../content/bundle';
import { buildAgentPack, INSTRUCTIONS_MAX } from './agentPack';

describe('buildAgentPack', () => {
  const pack = buildAgentPack(bundle, { showDrafts: true, appUrl: 'https://contoso.sharepoint.com/sites/odyssee/SitePages/Odyssee.aspx' });

  it('keeps the instructions within what the agent builder takes', () => {
    expect(pack.instructions.length).toBeLessThanOrEqual(INSTRUCTIONS_MAX);
    expect(pack.instructions).toContain('Odyssee-Lotse');
    expect(pack.instructions).toContain('nie das Eszett');
  });

  it('puts every visible stage, every help topic and every template into the knowledge', () => {
    bundle.modules.filter((m) => isModuleVisible(m, { showDrafts: true })).forEach((m) => expect(pack.knowledge).toContain(`#### Etappe: ${m.title.de}`));
    (bundle.help || []).forEach((topic) => expect(pack.knowledge).toContain(`### ${topic.question.de}`));
    (bundle.prompts || []).forEach((prompt) => expect(pack.knowledge).toContain(`### ${prompt.title.de}`));
    expect(pack.knowledge).toContain('Odyssee.aspx?etappe=aiolos-gute-prompts');
  });

  it('leaves out drafts and links where they are not wanted', () => {
    const plain = buildAgentPack(bundle, { showDrafts: false });
    bundle.modules.filter((m) => m.status === 'draft').forEach((m) => expect(plain.knowledge).not.toContain(`#### Etappe: ${m.title.de}`));
    expect(plain.knowledge).not.toContain('etappe=');
  });

  it('offers a handful of questions to start with', () => {
    expect(pack.starters.length).toBeGreaterThanOrEqual(4);
  });
});
