import { useEffect } from 'react';

interface XPGainAnimationProps {
  amount: number;
  visible: boolean;
  onComplete?: () => void;
}

export default function XPGainAnimation({ amount, visible, onComplete }: XPGainAnimationProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => onComplete?.(), 1100);
    return () => clearTimeout(timer);
  }, [visible, onComplete]);

  if (!visible || amount <= 0) return null;

  return (
    <div
      className="fixed top-1/2 left-1/2 z-50 pointer-events-none"
      style={{
        transform: 'translate(-50%, -50%)',
        animation: 'xpFloat 1s ease-out forwards',
      }}
    >
      <div className="font-pixel text-xp-gold text-xl border-2 border-xp-gold bg-bg-dark px-4 py-2 shadow-pixel">
        +{amount} XP
      </div>
    </div>
  );
}
