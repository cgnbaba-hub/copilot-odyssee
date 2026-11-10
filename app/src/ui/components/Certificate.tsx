import * as React from 'react';

import { BadgeStatus } from '../../core/progress/badges';
import { formatLongDate } from '../format';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import styles from '../styles.module.scss';
import { BadgeArt } from './BadgeArt';
import { badgeName, useCoveredIslands } from './badgeHelpers';

/**
 * A printable certificate in landscape A4 proportions. Printing hides the rest
 * of the app (see the print rules in styles.module.scss), so «save as PDF» in
 * the print dialog gives a clean page.
 */
export function Certificate(props: { status: BadgeStatus; credential: string; earnedAt: string; opener?: HTMLElement; onClose: () => void }): React.ReactElement {
  const { strings, lang, theme, t, userName } = useGame();
  const { status } = props;
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [typedName, setTypedName] = React.useState('');
  const islands = useCoveredIslands(status.id);
  const { onClose, opener } = props;
  const issuer = theme.badges ? t(theme.badges.issuer) : '';
  const holder = userName || typedName;

  React.useEffect(() => {
    if (closeRef.current) closeRef.current.focus();
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      // Focus goes back to the button that opened the certificate.
      if (opener && opener.focus) opener.focus();
    };
  }, [onClose, opener]);

  return (
    <div className={styles.certificateOverlay} role="dialog" aria-modal="true" aria-label={strings.certDialogLabel}>
      <div className={styles.certificateBar}>
        <button ref={closeRef} type="button" className={styles.button} onClick={onClose}>
          {strings.certClose}
        </button>
        <button type="button" className={styles.buttonPrimary} onClick={() => window.print()}>
          {strings.certPrintButton}
        </button>
      </div>
      <div className={styles.certificateSheet}>
        <div className={styles.certificateInner}>
          <p className={styles.certificateIssuer}>{issuer}</p>
          <h2 className={styles.certificateTitle}>{strings.certTitle}</h2>
          {userName ? (
            <p className={styles.certificateHolder}>{userName}</p>
          ) : (
            <>
              <label className={styles.certificateHolderLabel} htmlFor="od-cert-name">
                {strings.certHolderLabel}
              </label>
              <input
                id="od-cert-name"
                className={styles.certificateHolderInput}
                type="text"
                value={typedName}
                placeholder={strings.certHolderPlaceholder}
                onChange={(e) => setTypedName(e.target.value)}
              />
              {/* On paper the input is replaced by its text, so no frame or placeholder is printed. */}
              <p className={styles.certificateHolderPrint}>{holder}</p>
            </>
          )}
          <p className={styles.certificateText}>
            {status.id === 'basic' ? format(strings.certCompleted, { count: status.total, tier: 'Basic' }) : format(strings.certCompletedAll, { count: status.total })}
          </p>
          <p className={styles.certificateBadgeName}>{badgeName(strings, status.id)}</p>
          <p className={styles.certificateIslandsTitle}>{strings.certIslands}</p>
          <p className={styles.certificateIslands}>{islands.join(' · ')}</p>
          <div className={styles.certificateFoot}>
            <span>
              {strings.certDate}: {formatLongDate(lang, props.earnedAt.slice(0, 10))}
            </span>
            <BadgeArt id={status.id} earned={true} className={styles.certificateArt} />
            <span>
              {strings.certId}: <code>{props.credential}</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
