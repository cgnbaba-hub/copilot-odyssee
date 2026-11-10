import bundle from '../../content/bundle.generated';
import { badgeStatuses, credentialId, linkedInUrl } from './badges';
import { initialState } from './state';
import { playedState } from './testState';

// The bundled content is still all drafts, so they have to be shown for islands to be playable.
const filter = { showDrafts: true };
const basicIds = bundle.islands.filter((i) => i.license === 'basic').map((i) => i.id);

describe('badgeStatuses', () => {
  it('returns both badges, unearned on a fresh state', () => {
    const result = badgeStatuses(bundle, initialState('de'), filter);
    expect(result.map((b) => b.id)).toEqual(['basic', 'premium']);
    result.forEach((b) => {
      expect(b.earned).toBe(false);
      expect(b.done).toBe(0);
      expect(b.earnedAt).toBeUndefined();
    });
    expect(result[0].total).toBe(basicIds.length);
    expect(result[1].total).toBe(bundle.islands.length);
  });

  it('earns basic after all basic islands, premium only after all islands', () => {
    const basic = badgeStatuses(bundle, playedState(bundle, filter, basicIds), filter);
    expect(basic[0].earned).toBe(true);
    expect(basic[0].done).toBe(basicIds.length);
    expect(basic[0].earnedAt).toBeDefined();
    expect(basic[1].earned).toBe(false);
    expect(basic[1].earnedAt).toBeUndefined();

    const all = badgeStatuses(bundle, playedState(bundle, filter), filter);
    expect(all[0].earned).toBe(true);
    expect(all[1].earned).toBe(true);
    expect(all[1].done).toBe(all[1].total);
  });

  it('does not earn basic with one island missing', () => {
    const partial = badgeStatuses(bundle, playedState(bundle, filter, basicIds.slice(1)), filter);
    expect(partial[0].earned).toBe(false);
    expect(partial[0].done).toBe(basicIds.length - 1);
  });
});

describe('credentialId', () => {
  it('is stable and readable', () => {
    const a = credentialId('basic', '2026-11-01T08:00:00.000Z', 'Anna Müller');
    expect(a).toBe(credentialId('basic', '2026-11-01T08:00:00.000Z', 'Anna Müller'));
    expect(a).toMatch(/^CO-B-2611-[2-9A-HJ-NP-Z]{4}$/);
    expect(credentialId('premium', '2026-11-01T08:00:00.000Z', undefined)).toMatch(/^CO-P-2611-[2-9A-HJ-NP-Z]{4}$/);
  });

  it('changes with tier, date and holder', () => {
    const base = credentialId('basic', '2026-11-01T08:00:00.000Z', 'Anna');
    expect(credentialId('premium', '2026-11-01T08:00:00.000Z', 'Anna').slice(5)).not.toBe(base.slice(5));
    expect(credentialId('basic', '2026-11-01T08:00:01.000Z', 'Anna')).not.toBe(base);
    expect(credentialId('basic', '2026-11-01T08:00:00.000Z', 'Berta')).not.toBe(base);
  });
});

describe('linkedInUrl', () => {
  const base = { name: 'Copilot Odyssee – Basic', organizationName: 'DERTOUR Suisse', earnedAt: '2026-11-01T08:00:00.000Z', credentialId: 'CO-B-2611-ABCD' };

  it('encodes values with spaces and umlauts', () => {
    const url = linkedInUrl({ ...base, name: 'Zürcher Übung Basic' });
    expect(url).toContain('https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=Z%C3%BCrcher%20%C3%9Cbung%20Basic');
    expect(url).toContain('organizationName=DERTOUR%20Suisse');
    expect(url).toContain('issueYear=2026&issueMonth=11&certId=CO-B-2611-ABCD');
    expect(url).not.toContain('organizationId');
    expect(url).not.toContain('certUrl');
  });

  it('sends the organization id instead of the name, and the certificate URL when given', () => {
    const url = linkedInUrl({ ...base, organizationId: '123456', certUrl: 'https://example.com/v?id=1' });
    expect(url).toContain('organizationId=123456');
    expect(url).not.toContain('organizationName');
    expect(url).toContain('certUrl=https%3A%2F%2Fexample.com%2Fv%3Fid%3D1');
  });
});
