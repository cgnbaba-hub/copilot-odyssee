import * as React from 'react';

import { BadgeStatus, credentialId, linkedInUrl } from '../../core/progress/badges';
import { downloadBadge } from '../badgeImage';
import { copyText, CopyState } from '../copilot';
import { formatDate } from '../format';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import styles from '../styles.module.scss';
import { BadgeArt } from './BadgeArt';
import { badgeName } from './badgeHelpers';
import { Certificate } from './Certificate';
import { TermTip } from './Legend';

function BadgeCard(props: { status: BadgeStatus }): React.ReactElement {
  const { player, lang, strings, theme, t, userName } = useGame();
  const { status } = props;
  const svgRef = React.useRef<SVGSVGElement>(null);
  const printRef = React.useRef<HTMLButtonElement>(null);
  const idRef = React.useRef<HTMLElement>(null);
  const [copy, setCopy] = React.useState<CopyState>('idle');
  const [printing, setPrinting] = React.useState(false);
  const [notice, setNotice] = React.useState<string | undefined>(undefined);
  const name = badgeName(strings, status.id);
  const percent = status.total > 0 ? Math.round((status.done / status.total) * 100) : 0;
  const earnedAt = status.earned ? status.earnedAt : undefined;

  if (!earnedAt) {
    const needsPremium = status.id === 'premium' && player.profile.license !== 'premium';
    const missing = status.total - status.done;
    return (
      <li className={`${styles.badgeCard} ${styles.badgeCardLocked}`}>
        <BadgeArt id={status.id} earned={false} className={styles.badgeArt} />
        <div className={styles.badgeBody}>
          <h3>{name}</h3>
          <p className={styles.badgeProgressText}>{format(strings.badgeProgress, { done: status.done, total: status.total })}</p>
          <span
            className={styles.badgeBar}
            role="progressbar"
            aria-label={name}
            aria-valuemin={0}
            aria-valuemax={status.total}
            aria-valuenow={status.done}
            aria-valuetext={format(strings.badgeProgress, { done: status.done, total: status.total })}
          >
            <span style={{ width: `${percent}%` }} />
          </span>
          <p className={styles.muted}>
            {needsPremium ? strings.badgeNeedsPremium : format(status.id === 'basic' ? strings.badgeMissingBasic : strings.badgeMissingPremium, { missing })}
          </p>
        </div>
      </li>
    );
  }

  const id = credentialId(status.id, earnedAt, userName);
  const issuer = theme.badges ? t(theme.badges.issuer) : t(theme.terms.company || theme.terms.appTitle);
  const href = linkedInUrl({
    name,
    organizationName: issuer,
    organizationId: theme.badges && theme.badges.linkedInOrganizationId,
    earnedAt,
    credentialId: id,
    certUrl: theme.badges && theme.badges.certUrl
  });
  return (
    <li className={`${styles.badgeCard} ${styles.badgeCardEarned}`}>
      <BadgeArt ref={svgRef} id={status.id} earned={true} className={styles.badgeArt} />
      <div className={styles.badgeBody}>
        <h3>{name}</h3>
        <p className={styles.badgeProgressText}>{format(strings.badgeEarnedOn, { date: formatDate(lang, earnedAt) })}</p>
        <p className={styles.badgeId}>
          {strings.badgeCredentialId}: <code ref={idRef}>{id}</code>
          <button type="button" className={styles.badgeCopy} aria-label={strings.badgeCopyId} onClick={() => copyText(id, idRef.current || undefined, setCopy)}>
            {copy === 'copied' ? `✓ ${strings.badgeCopied}` : '⧉'}
          </button>
        </p>
        <div className={styles.badgeActions}>
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={() => {
              if (!svgRef.current) return;
              setNotice(undefined);
              downloadBadge(svgRef.current, `copilot-odyssee-${status.id}`)
                .then((png) => setNotice(png ? undefined : strings.badgeDownloadFailed))
                .catch(() => setNotice(strings.badgeDownloadFailed));
            }}
          >
            {strings.badgeDownload}
          </button>
          <button ref={printRef} type="button" className={styles.button} onClick={() => setPrinting(true)}>
            {strings.badgePrint}
          </button>
          <a className={styles.button} href={href} target="_blank" rel="noopener noreferrer">
            {strings.badgeLinkedIn}
          </a>
        </div>
        <p className={styles.muted}>{strings.badgeLinkedInHint}</p>
        {notice && (
          <p className={styles.muted} role="status">
            {notice}
          </p>
        )}
      </div>
      {printing && <Certificate status={status} credential={id} earnedAt={earnedAt} opener={printRef.current || undefined} onClose={() => setPrinting(false)} />}
    </li>
  );
}

export function BadgesSection(props: { statuses: BadgeStatus[] }): React.ReactElement {
  const { strings } = useGame();
  return (
    <>
      <h2 className={styles.sectionTitle}>
        {strings.passportBadgesTitle} <TermTip term="badge" />
      </h2>
      <ul className={styles.badgeGrid}>
        {props.statuses.map((status) => (
          <BadgeCard key={status.id} status={status} />
        ))}
      </ul>
    </>
  );
}
