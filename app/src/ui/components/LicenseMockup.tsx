import * as React from 'react';

import { LicenseChoice } from '../../core/progress/state';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';

/**
 * Simplified drawing of a Copilot chat window for each version, so people
 * know what label to look for. Deliberately schematic, without logos.
 */
export function LicenseMockup(props: { highlight?: LicenseChoice }): React.ReactElement {
  const { strings } = useGame();
  const windows: { license: 'basic' | 'premium'; label: string }[] = [
    { license: 'basic', label: strings.versionBasic },
    { license: 'premium', label: strings.versionPremium }
  ];

  return (
    <figure className={styles.mockup}>
      <div className={styles.mockupWindows}>
        {windows.map((w) => (
          <div
            key={w.license}
            className={`${styles.mockupWindow} ${props.highlight === w.license ? styles.mockupWindowActive : ''}`}
            aria-hidden="true"
          >
            <div className={styles.mockupBar}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.mockupHead}>
              <span className={styles.mockupLogo} />
              <span className={w.license === 'premium' ? `${styles.mockupLabel} ${styles.mockupLabelPremium}` : styles.mockupLabel}>{w.label}</span>
            </div>
            <div className={styles.mockupChat}>
              <span className={styles.mockupLineShort} />
              <span className={styles.mockupLine} />
              <span className={styles.mockupLine} />
            </div>
            <div className={styles.mockupInput}>{strings.mockupInput}</div>
          </div>
        ))}
      </div>
      <figcaption className={styles.muted}>{strings.mockupCaption}</figcaption>
    </figure>
  );
}
