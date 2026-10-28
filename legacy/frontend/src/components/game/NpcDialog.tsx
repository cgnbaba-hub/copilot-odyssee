import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PixelButton from '../common/PixelButton';

interface NpcDialogProps {
  npcName: string;
  text: string;
  onClose: () => void;
  visible: boolean;
}

function NpcPortrait({ name }: { name: string }) {
  const palette = ['#7B68EE', '#FF6B35', '#FF1493', '#00CC00', '#FFD700', '#E94560'];
  const col = palette[name.charCodeAt(0) % palette.length];
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}>
      <rect width="64" height="64" fill="#0D0D1A" />
      {/* Body */}
      <rect x="10" y="40" width="44" height="22" fill={col} />
      {/* Head */}
      <rect x="14" y="14" width="36" height="28" fill={col} opacity="0.85" />
      {/* Eyes */}
      <rect x="20" y="20" width="8" height="8" fill="#fff" />
      <rect x="36" y="20" width="8" height="8" fill="#fff" />
      <rect x="22" y="22" width="4" height="4" fill="#1A1A2E" />
      <rect x="38" y="22" width="4" height="4" fill="#1A1A2E" />
      {/* Mouth */}
      <rect x="20" y="34" width="24" height="4" fill="#1A1A2E" />
      {/* Hair */}
      <rect x="14" y="8"  width="36" height="8" fill={col} />
      {/* Border */}
      <rect x="0" y="0" width="64" height="64" fill="none" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

export default function NpcDialog({ npcName, text, onClose, visible }: NpcDialogProps) {
  const { t } = useTranslation();
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!visible) { setDisplayed(''); setDone(false); return; }
    setDisplayed('');
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, 28);
    return () => clearInterval(iv);
  }, [text, visible]);

  const skipToEnd = () => { setDisplayed(text); setDone(true); };

  if (!visible) return null;

  return (
    <div className="dialog-box w-full">
      <div className="flex gap-4 items-start">
        <div className="border-2 border-white shadow-pixel shrink-0 cursor-pointer" onClick={!done ? skipToEnd : undefined}>
          <NpcPortrait name={npcName} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-pixel text-xp-gold text-[10px] mb-2">{npcName}</div>
          <div className="font-pixel text-white text-[9px] leading-relaxed min-h-[56px] break-words">
            {displayed}
            {!done && <span style={{ animation: 'pixelBlink 0.6s step-end infinite' }}>_</span>}
          </div>
        </div>
      </div>
      {done && (
        <div className="mt-4 flex justify-end">
          <PixelButton variant="secondary" onClick={onClose}>
            {t('common.close')}
          </PixelButton>
        </div>
      )}
    </div>
  );
}
