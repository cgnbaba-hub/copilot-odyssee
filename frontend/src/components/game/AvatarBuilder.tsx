import { useTranslation } from 'react-i18next';
import type { AvatarConfig } from '../../types';

interface AvatarBuilderProps {
  value: AvatarConfig;
  onChange: (cfg: AvatarConfig) => void;
}

const CHARACTERS = [
  { id: 'player_1', label: 'Charakter 1' },
  { id: 'player_2', label: 'Charakter 2' },
  { id: 'player_3', label: 'Charakter 3' },
  { id: 'player_4', label: 'Charakter 4' },
] as const;

const SKINS   = ['#FDBCB4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#FFDBAC'];
const HAIRS   = ['short', 'long', 'spiky', 'bald'] as const;
const OUTFITS = ['robe', 'armor', 'casual', 'ninja'] as const;
const ACCS    = ['none', 'glasses', 'hat', 'crown'] as const;

const HAIR_COLORS: Record<string, string> = {
  short: '#4A2900', long: '#8B5E3C', spiky: '#E94560', bald: 'transparent',
};
const OUTFIT_COLORS: Record<string, string> = {
  robe: '#7B68EE', armor: '#888888', casual: '#FF6B35', ninja: '#222222',
};

function AvatarSVG({ cfg }: { cfg: AvatarConfig }) {
  const skin    = cfg.skin    || '#FDBCB4';
  const hair    = cfg.hair    || 'short';
  const outfit  = cfg.outfit  || 'robe';
  const acc     = cfg.accessory || 'none';
  const bodyCol = OUTFIT_COLORS[outfit] ?? '#7B68EE';
  const hairCol = HAIR_COLORS[hair]    ?? '#4A2900';

  return (
    <svg width="80" height="96" viewBox="0 0 80 96" xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}>
      {/* Body */}
      <rect x="18" y="58" width="44" height="36" fill={bodyCol} />
      {/* Arms */}
      <rect x="8"  y="58" width="12" height="28" fill={bodyCol} />
      <rect x="60" y="58" width="12" height="28" fill={bodyCol} />
      {/* Neck */}
      <rect x="30" y="52" width="20" height="8"  fill={skin} />
      {/* Head */}
      <rect x="16" y="20" width="48" height="36" fill={skin} />
      {/* Eyes */}
      <rect x="24" y="30" width="8"  height="8"  fill="#1A1A2E" />
      <rect x="48" y="30" width="8"  height="8"  fill="#1A1A2E" />
      <rect x="26" y="32" width="4"  height="4"  fill="white" />
      <rect x="50" y="32" width="4"  height="4"  fill="white" />
      {/* Mouth */}
      <rect x="28" y="46" width="24" height="4"  fill="#1A1A2E" />
      {/* Hair */}
      {hair !== 'bald' && (
        <rect x="16" y="12" width="48" height="12" fill={hairCol} />
      )}
      {hair === 'spiky' && (
        <>
          <rect x="22" y="4"  width="8"  height="10" fill={hairCol} />
          <rect x="36" y="2"  width="8"  height="12" fill={hairCol} />
          <rect x="50" y="4"  width="8"  height="10" fill={hairCol} />
        </>
      )}
      {hair === 'long' && (
        <>
          <rect x="10" y="20" width="8"  height="32" fill={hairCol} />
          <rect x="62" y="20" width="8"  height="32" fill={hairCol} />
        </>
      )}
      {/* Accessory */}
      {acc === 'glasses' && (
        <>
          <rect x="22" y="29" width="14" height="10" fill="none" stroke="#FFD700" strokeWidth="2" />
          <rect x="44" y="29" width="14" height="10" fill="none" stroke="#FFD700" strokeWidth="2" />
          <rect x="36" y="33" width="8"  height="2"  fill="#FFD700" />
        </>
      )}
      {acc === 'hat' && (
        <>
          <rect x="12" y="10" width="56" height="6"  fill="#E94560" />
          <rect x="20" y="2"  width="40" height="10" fill="#E94560" />
        </>
      )}
      {acc === 'crown' && (
        <>
          <rect x="16" y="8"  width="48" height="6"  fill="#FFD700" />
          <rect x="20" y="2"  width="8"  height="8"  fill="#FFD700" />
          <rect x="36" y="0"  width="8"  height="10" fill="#FFD700" />
          <rect x="52" y="2"  width="8"  height="8"  fill="#FFD700" />
          <rect x="26" y="4"  width="4"  height="4"  fill="#E94560" />
          <rect x="38" y="2"  width="4"  height="4"  fill="#7B68EE" />
          <rect x="50" y="4"  width="4"  height="4"  fill="#00FF00" />
        </>
      )}
    </svg>
  );
}

export default function AvatarBuilder({ value, onChange }: AvatarBuilderProps) {
  const { t } = useTranslation();
  const update = (key: keyof AvatarConfig) => (val: string) =>
    onChange({ ...value, [key]: val });

  const selectedChar = value.character ?? 'player_1';

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Preview */}
      <div className="card-pixel-dark flex flex-col items-center gap-4 p-6 shrink-0 min-w-[160px]">
        <div className="font-pixel text-[8px] text-gray-400 text-center">{t('character.choose')}</div>
        <div className="border-4 border-white shadow-pixel p-2 bg-bg-dark flex items-center justify-center" style={{ minHeight: 112 }}>
          <img
            src={`/assets/characters/player/${selectedChar}_front.png`}
            alt={selectedChar}
            style={{ imageRendering: 'pixelated', height: 96, width: 'auto' }}
          />
        </div>
        <div className="font-pixel text-[7px] text-xp-gold text-center">
          {CHARACTERS.find(c => c.id === selectedChar)?.label ?? selectedChar}
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 min-w-0">

        {/* Character Sprite Selection */}
        <div className="mb-5">
          <div className="font-pixel text-[9px] text-xp-gold mb-2">CHARAKTER</div>
          <div className="grid grid-cols-4 gap-2">
            {CHARACTERS.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => update('character')(c.id)}
                className={[
                  'border-2 p-1 flex flex-col items-center gap-1 transition-all bg-bg-dark',
                  value.character === c.id || (!value.character && c.id === 'player_1')
                    ? 'border-xp-gold shadow-pixel'
                    : 'border-white hover:border-gray-400',
                ].join(' ')}
              >
                <img
                  src={`/assets/characters/player/${c.id}_front.png`}
                  alt={c.label}
                  style={{ imageRendering: 'pixelated', height: 56, width: 'auto' }}
                />
                <span className="font-pixel text-[6px] text-gray-300">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Skin */}
        <div className="mb-4">
          <div className="font-pixel text-[9px] text-xp-gold mb-2">SKIN</div>
          <div className="flex gap-2 flex-wrap">
            {SKINS.map(s => (
              <button key={s} type="button" onClick={() => update('skin')(s)}
                className={['w-9 h-9 border-2 transition-all', value.skin === s ? 'border-xp-gold shadow-pixel scale-110' : 'border-white hover:border-gray-400'].join(' ')}
                style={{ backgroundColor: s }} title={s}
              />
            ))}
          </div>
        </div>

        {/* Hair */}
        <div className="mb-4">
          <div className="font-pixel text-[9px] text-xp-gold mb-2">HAIR</div>
          <div className="flex gap-2 flex-wrap">
            {HAIRS.map(h => (
              <button key={h} type="button" onClick={() => update('hair')(h)}
                className={['w-9 h-9 border-2 flex items-center justify-center transition-all', value.hair === h ? 'border-xp-gold shadow-pixel' : 'border-white hover:border-gray-400'].join(' ')}
                style={{ backgroundColor: h === 'bald' ? '#333' : HAIR_COLORS[h] }}
              >
                <span className="font-pixel text-[6px] text-white">{h.slice(0,3).toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Outfit */}
        <div className="mb-4">
          <div className="font-pixel text-[9px] text-xp-gold mb-2">OUTFIT</div>
          <div className="flex gap-2 flex-wrap">
            {OUTFITS.map(o => (
              <button key={o} type="button" onClick={() => update('outfit')(o)}
                className={['w-9 h-9 border-2 flex items-center justify-center transition-all', value.outfit === o ? 'border-xp-gold shadow-pixel' : 'border-white hover:border-gray-400'].join(' ')}
                style={{ backgroundColor: OUTFIT_COLORS[o] }}
              >
                <span className="font-pixel text-[6px] text-white">{o.slice(0,3).toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accessory */}
        <div className="mb-4">
          <div className="font-pixel text-[9px] text-xp-gold mb-2">ACCESSORY</div>
          <div className="flex gap-2 flex-wrap">
            {ACCS.map(a => (
              <button key={a} type="button" onClick={() => update('accessory')(a)}
                className={['btn-pixel text-[7px] py-1 px-2', value.accessory === a ? 'btn-success' : 'btn-ghost'].join(' ')}
              >
                {a.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Mini SVG preview (fallback / customisation reference) */}
        <div className="mt-2 border-t border-gray-700 pt-3">
          <div className="font-pixel text-[7px] text-gray-500 mb-1">SVG-VORSCHAU (Farbkonfiguration)</div>
          <AvatarSVG cfg={value} />
        </div>
      </div>
    </div>
  );
}
