import * as React from 'react';

import { useGame } from '../GameContext';
import styles from '../styles.module.scss';

/** A small browser window: the Odyssey on the left, Copilot in the Edge sidebar on the right. */
function EdgeSketch(): React.ReactElement {
  return (
    <svg className={styles.edgeSketch} viewBox="0 0 320 150" aria-hidden="true">
      <rect x="2" y="2" width="316" height="146" rx="10" fill="#fbf6e8" stroke="#1a2940" strokeWidth="2.5" />
      <path d="M2 28 H318" stroke="#1a2940" strokeWidth="2" />
      <rect x="14" y="10" width="170" height="11" rx="5.5" fill="#efe4c8" stroke="#1a2940" strokeWidth="1.5" />
      <circle cx="298" cy="15.5" r="9" fill="#e40028" stroke="#1a2940" strokeWidth="2" />
      <path d="M294 15.5 a4 4 0 1 1 8 0 a4 4 0 1 1 -8 0" fill="none" stroke="#fbf6e8" strokeWidth="2" />
      <path d="M280 15.5 L268 15.5" stroke="#e40028" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M268 15.5 l5 -4 m-5 4 l5 4" stroke="#e40028" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="12" y="38" width="186" height="100" rx="6" fill="#f5e0b0" />
      <path d="M12 104 H198 V132 a6 6 0 0 1 -6 6 H18 a6 6 0 0 1 -6 -6 Z" fill="#1f5f8b" />
      <path d="M60 104 C80 82 120 78 150 104 Z" fill="#7f9a4e" stroke="#1a2940" strokeWidth="1.5" />
      <text x="105" y="58" textAnchor="middle" fontSize="13" fontFamily="League Gothic, sans-serif" fill="#1a2940">
        COPILOT ODYSSEE
      </text>
      <rect x="208" y="34" width="104" height="108" rx="6" fill="#ffffff" stroke="#e40028" strokeWidth="2.5" />
      <text x="260" y="52" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="sans-serif" fill="#1a2940">
        Copilot
      </text>
      <rect x="218" y="62" width="70" height="9" rx="4.5" fill="#e6e8ee" />
      <rect x="230" y="78" width="72" height="9" rx="4.5" fill="#dbe7f5" />
      <rect x="218" y="94" width="60" height="9" rx="4.5" fill="#e6e8ee" />
      <rect x="216" y="122" width="88" height="13" rx="6.5" fill="#fbf6e8" stroke="#1a2940" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * How to keep Copilot open beside the Odyssey: the Copilot icon in the Edge
 * sidebar. Below it, a short note that Copilot in Edge can also explain the
 * web page that is open, if this is switched on.
 */
export function EdgeTip(): React.ReactElement {
  const { strings } = useGame();
  return (
    <div className={styles.edgeTip}>
      <EdgeSketch />
      <details className={styles.edgeMore}>
        <summary>{strings.edgeMoreTitle}</summary>
        <p>{strings.edgeMoreText}</p>
        <ul>
          <li>{strings.edgeMoreExample1}</li>
          <li>{strings.edgeMoreExample2}</li>
          <li>{strings.edgeMoreExample3}</li>
        </ul>
        <p>{strings.edgeMoreSetting}</p>
      </details>
    </div>
  );
}
