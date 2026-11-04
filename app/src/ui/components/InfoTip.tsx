import * as React from 'react';

import styles from '../styles.module.scss';

let nextId = 0;

/**
 * A small «i» that explains a term right where it appears: it opens on hover,
 * on keyboard focus and on a tap, and closes with Escape or when the pointer
 * or focus moves on.
 */
export function InfoTip(props: { text: string; label: string; light?: boolean; align?: 'left' | 'right' }): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const id = React.useRef(`od-tip-${++nextId}`).current;
  const bubbleClass = [styles.infoTipBubble, props.align === 'right' ? styles.infoTipRight : props.align === 'left' ? styles.infoTipLeft : ''].join(' ');
  return (
    <span className={styles.infoTip} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className={props.light ? `${styles.infoTipButton} ${styles.infoTipLight}` : styles.infoTipButton}
        aria-label={props.label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={(event) => {
          // Inside clickable cards the tip must not trigger the card as well.
          event.stopPropagation();
          setOpen(!open);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
      >
        i
      </button>
      {open && (
        <span role="tooltip" id={id} className={bubbleClass}>
          {props.text}
        </span>
      )}
    </span>
  );
}
