import * as React from 'react';

import { BriefingBlock, Localized } from '../../core/content/types';
import { markBriefingRead } from '../../core/progress/state';
import { PromptText } from '../components/PromptCard';
import { RichText } from '../components/RichText';
import { copyText, CopyState } from '../copilot';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { BlockViewProps } from './BlockViewProps';

export function BriefingView(props: BlockViewProps<BriefingBlock>): React.ReactElement {
  const { strings, t, apply } = useGame();
  const { block, moduleId } = props;
  // Content can come from a SharePoint library, so only plain https links are rendered.
  const links = (block.links || []).filter((link) => /^https:\/\//.test(link.url));
  const [copyState, setCopyState] = React.useState<CopyState>('idle');
  const exampleRef = React.useRef<HTMLParagraphElement>(null);

  return (
    <>
      <h2 className={styles.blockTitle}>{t(block.title)}</h2>
      <RichText text={t(block.body)} />
      {block.example && (
        <div className={styles.briefingExample}>
          <p className={styles.briefingExampleLabel}>{strings.exampleToCopy}</p>
          <p className={styles.briefingExampleText} ref={exampleRef}>
            <PromptText text={t(block.example)} />
          </p>
          <button
            type="button"
            className={copyState === 'copied' ? styles.buttonSuccess : styles.button}
            onClick={() => copyText(t(block.example as Localized), exampleRef.current || undefined, setCopyState)}
          >
            {copyState === 'copied' ? `✓ ${strings.copied}` : `⧉ ${strings.copy}`}
          </button>
          {copyState === 'failed' && <p className={styles.copyFailed}>{strings.missionCopyFailed}</p>}
        </div>
      )}
      {links.length > 0 && (
        <ul className={styles.linkList}>
          {links.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {t(link.label)} ↗
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.actionBar}>
        <button
          type="button"
          className={`${styles.buttonPrimary} ${styles.buttonWide}`}
          onClick={() => {
            apply((s) => markBriefingRead(s, moduleId, block.id));
            props.onDone();
          }}
        >
          {strings.understood}
        </button>
      </div>
    </>
  );
}
