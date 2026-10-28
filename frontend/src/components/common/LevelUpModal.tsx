import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PixelButton from './PixelButton';

interface LevelUpModalProps {
  newLevel: number;
  visible: boolean;
  onClose: () => void;
}

interface Pixel { x: number; y: number; color: string }

export default function LevelUpModal({ newLevel, visible, onClose }: LevelUpModalProps) {
  const { t } = useTranslation();
  const [pixels, setPixels] = useState<Pixel[]>([]);

  useEffect(() => {
    if (!visible) return;
    const colors = ['#E94560', '#FFD700', '#00FF00', '#7B68EE', '#FF6B35', '#FF1493'];
    setPixels(
      Array.from({ length: 32 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
    );
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      {/* Pixel confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {pixels.map((p, i) => (
          <div
            key={i}
            className="absolute w-3 h-3"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: p.color,
              animation: `pixelBlink ${0.3 + Math.random() * 0.7}s step-end infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative card-pixel-dark border-4 border-xp-gold shadow-pixel-lg text-center max-w-sm w-full mx-4 z-10">
        <div
          className="font-pixel text-xp-gold text-[11px] mb-2"
          style={{ animation: 'pixelBlink 1s step-end infinite' }}
        >
          *** LEVEL UP! ***
        </div>
        <div
          className="font-pixel text-white text-4xl my-6"
          style={{ textShadow: '4px 4px 0 #000, -2px -2px 0 #FFD700' }}
        >
          {newLevel}
        </div>
        <div className="font-pixel text-[9px] text-gray-300 mb-6">
          {t('guardian.xpBonus')}
        </div>
        <PixelButton variant="success" onClick={onClose} className="w-full">
          {t('common.confirm')}
        </PixelButton>
      </div>
    </div>
  );
}
