import * as React from 'react';

import { useGame } from '../GameContext';
import { GuidePortrait, guideById } from '../guides';
import { format } from '../i18n/strings';
import styles from '../styles.module.scss';

interface TourStep {
  /** data-tour value of the highlighted element; none for a closing message. */
  target?: string;
  text: string;
  /** The player has to click the highlighted element to go on. */
  action?: boolean;
}

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const PAD = 6;
const GAP = 12;

/**
 * A first-time walk through the menu, as known from games: everything is
 * dimmed, only the element being explained lights up. Some steps ask the
 * player to click the element themselves.
 */
export function Tour(props: { getRoot: () => HTMLElement | undefined; onDone: () => void }): React.ReactElement {
  const { strings, player, t } = useGame();
  // The screen needs a moment to be laid out before the first element can be measured.
  const [root, setRoot] = React.useState<HTMLElement | undefined>(undefined);
  React.useEffect(() => {
    const timer = window.setTimeout(() => setRoot(props.getRoot()), 400);
    return () => window.clearTimeout(timer);
  }, []);
  const guide = guideById(player.profile.guide);
  const steps: TourStep[] = React.useMemo(
    () =>
      [
        { target: 'deck', text: strings.tour1 },
        { target: 'steer', text: strings.tour2, action: true },
        { target: 'dock', text: strings.tour3 },
        { target: 'next', text: strings.tour4 },
        { target: 'view', text: strings.tour5 },
        { target: 'nav-journey', text: strings.tour6 },
        { target: 'nav-cheatsheet', text: strings.tour7 },
        { target: 'nav-passport', text: strings.tour8 },
        { target: 'nav-help', text: strings.tour9 },
        { target: 'nav-settings', text: strings.tour10 },
        { text: strings.tour11 }
      ]
        .filter((s) => !s.target || !root || root.querySelector(`[data-tour="${s.target}"]`))
        // A disabled button cannot be clicked, so that step only explains.
        .map((s) => {
          const el = s.target && root ? (root.querySelector(`[data-tour="${s.target}"]`) as HTMLButtonElement | null) : null;
          return s.action && el && el.disabled ? { ...s, action: false } : s;
        }),
    [strings, root]
  );

  const [index, setIndex] = React.useState(0);
  const [box, setBox] = React.useState<Box | undefined>(undefined);
  const [viewport, setViewport] = React.useState({ width: window.innerWidth, height: window.innerHeight });
  const bubbleRef = React.useRef<HTMLDivElement>(null);
  const [bubbleHeight, setBubbleHeight] = React.useState(180);
  const step = steps[index];
  const last = index === steps.length - 1;

  const targetId = step.target;
  const findTarget = React.useCallback((): HTMLElement | null => {
    if (!targetId || !root) return null;
    return root.querySelector(`[data-tour="${targetId}"]`) as HTMLElement | null;
  }, [targetId, root]);

  // Bring the element into view, then follow it while the page scrolls or resizes.
  React.useEffect(() => {
    const target = findTarget();
    if (target && target.scrollIntoView) target.scrollIntoView({ block: 'center' });
    const measure = (): void => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      const el = findTarget();
      if (!el) {
        setBox(undefined);
        return;
      }
      const r = el.getBoundingClientRect();
      setBox({ left: r.left - PAD, top: r.top - PAD, right: r.right + PAD, bottom: r.bottom + PAD });
    };
    measure();
    const timer = window.setTimeout(measure, 350);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [findTarget]);

  // Steps that ask for a click go on once the player clicked the highlighted element.
  const needsClick = !!step.action;
  React.useEffect(() => {
    if (!needsClick) return undefined;
    const target = findTarget();
    if (!target) return undefined;
    let timer = 0;
    const onClick = (): void => {
      timer = window.setTimeout(() => setIndex((i) => i + 1), 900);
    };
    target.addEventListener('click', onClick);
    return () => {
      target.removeEventListener('click', onClick);
      window.clearTimeout(timer);
    };
  }, [needsClick, findTarget]);

  React.useLayoutEffect(() => {
    if (bubbleRef.current) setBubbleHeight(bubbleRef.current.offsetHeight);
  });

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') props.onDone();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [props.onDone]);

  React.useEffect(() => {
    const button = bubbleRef.current && (bubbleRef.current.querySelector('[data-primary]') as HTMLElement | null);
    if (button) button.focus({ preventScroll: true });
  }, [index]);

  const { width: W, height: H } = viewport;
  const bubbleWidth = Math.min(360, W - 24);
  let bubbleStyle: React.CSSProperties;
  if (box) {
    const centre = (box.left + box.right) / 2;
    const left = Math.min(Math.max(12, centre - bubbleWidth / 2), W - bubbleWidth - 12);
    let top: number;
    if (H - box.bottom >= bubbleHeight + GAP * 2) top = box.bottom + GAP;
    else if (box.top >= bubbleHeight + GAP * 2) top = box.top - bubbleHeight - GAP;
    else top = Math.max(12, Math.min(H - bubbleHeight - 12, box.bottom - bubbleHeight - GAP));
    bubbleStyle = { left, top, width: bubbleWidth };
  } else {
    bubbleStyle = { left: (W - bubbleWidth) / 2, top: Math.max(12, (H - bubbleHeight) / 2), width: bubbleWidth };
  }

  const shades: Box[] = box
    ? [
        { left: 0, top: 0, right: W, bottom: Math.max(0, box.top) },
        { left: 0, top: box.bottom, right: W, bottom: H },
        { left: 0, top: box.top, right: Math.max(0, box.left), bottom: box.bottom },
        { left: box.right, top: box.top, right: W, bottom: box.bottom }
      ]
    : [{ left: 0, top: 0, right: W, bottom: H }];
  const rect = (b: Box): React.CSSProperties => ({ left: b.left, top: b.top, width: Math.max(0, b.right - b.left), height: Math.max(0, b.bottom - b.top) });

  if (!root) return <></>;
  return (
    <div className={styles.tour}>
      {shades.map((b, i) => (
        <div key={i} className={styles.tourShade} style={rect(b)} />
      ))}
      {/* Without an action the highlighted element only gets explained, a click on it does nothing yet. */}
      {box && !step.action && <div className={styles.tourShadeClear} style={rect(box)} />}
      {box && <div className={styles.tourRing} style={rect(box)} />}
      <div
        ref={bubbleRef}
        className={styles.tourBubble}
        style={bubbleStyle}
        role="dialog"
        aria-modal="true"
        aria-label={format(strings.tourStep, { current: index + 1, total: steps.length })}
      >
        <div className={styles.tourHead}>
          <GuidePortrait id={guide.id} className={styles.tourPortrait} />
          <b>{t(guide.name)}</b>
        </div>
        <p className={styles.tourText}>{step.text}</p>
        <div className={styles.tourFoot}>
          <span className={styles.tourCount}>{format(strings.tourStep, { current: index + 1, total: steps.length })}</span>
          <div className={styles.tourButtons}>
            {!last && (
              <button type="button" className={styles.tourSkip} onClick={props.onDone}>
                {strings.tourSkip}
              </button>
            )}
            {step.action ? (
              <span className={styles.tourTap}>{strings.tourTap}</span>
            ) : (
              <button type="button" className={styles.buttonPrimary} data-primary onClick={() => (last ? props.onDone() : setIndex(index + 1))}>
                {last ? strings.tourFinish : strings.next}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
