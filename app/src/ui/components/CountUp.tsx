import * as React from 'react';

/**
 * A number that counts up from zero, like the miles log after a stage.
 * Shows the final value at once when motion is reduced.
 */
export function CountUp(props: { to: number; durationMs?: number; reduced?: boolean }): React.ReactElement {
  const { to, durationMs = 1200, reduced } = props;
  const [value, setValue] = React.useState(reduced ? to : 0);
  React.useEffect(() => {
    if (reduced || to <= 0 || !window.requestAnimationFrame) {
      setValue(to);
      return undefined;
    }
    let frame = 0;
    const start = Date.now();
    const tick = (): void => {
      const t = Math.min(1, (Date.now() - start) / durationMs);
      // Fast at first, gently settling on the final number.
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [to, reduced]);
  return <>{value}</>;
}
