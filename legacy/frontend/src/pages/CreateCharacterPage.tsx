import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { userApi } from '../services/api';
import { useAuthStore } from '../context/AuthStore';
import AvatarBuilder from '../components/game/AvatarBuilder';
import PixelButton from '../components/common/PixelButton';
import type { AvatarConfig } from '../types';

const DEFAULT_AVATAR: AvatarConfig = { skin: '#FDBCB4', hair: 'short', outfit: 'robe', accessory: 'none' };

export default function CreateCharacterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      await userApi.updateAvatar(avatar as unknown as Record<string, unknown>);
      updateUser({ avatar_config: avatar });
      navigate('/map');
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark pixel-stars flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="font-pixel text-xp-gold text-sm mb-2">{t('character.create')}</div>
          <div className="font-pixel text-[9px] text-gray-400">
            Willkommen, <span className="text-white">{user?.display_name}</span>! Gestalte deinen Helden.
          </div>
        </div>

        <div className="border-2 border-white bg-bg-darker shadow-[6px_6px_0_#000] p-6">
          <AvatarBuilder value={avatar} onChange={setAvatar} />

          {error && (
            <div className="mt-4 border border-hp-red px-3 py-2 font-pixel text-[9px] text-hp-red">✗ {error}</div>
          )}

          <div className="mt-6">
            <PixelButton onClick={handleCreate} loading={loading} variant="success" fullWidth>
              {t('character.confirm')} ►
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}
