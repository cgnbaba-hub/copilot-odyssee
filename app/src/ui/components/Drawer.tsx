import * as React from 'react';

import { useGame } from '../GameContext';
import styles from '../styles.module.scss';

/** Side panel over the game. Escape, the close button and a click outside close it. */
export function Drawer(props: { id: string; title: string; onClose: () => void; children: React.ReactNode }): React.ReactElement {
  const { strings } = useGame();
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const onClose = React.useRef(props.onClose);
  onClose.current = props.onClose;

  React.useEffect(() => {
    if (closeRef.current) closeRef.current.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={styles.drawerBackdrop} onClick={props.onClose}>
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby={props.id} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHead}>
          <h2 id={props.id}>{props.title}</h2>
          <button type="button" ref={closeRef} className={styles.button} onClick={props.onClose}>
            {strings.close}
          </button>
        </div>
        {props.children}
      </aside>
    </div>
  );
}
