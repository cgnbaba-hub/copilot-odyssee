import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/api';
import { useAuthStore } from '../context/AuthStore';
import PixelButton from '../components/common/PixelButton';
import type { User } from '../types';

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({
    username: '', email: '', password: '', display_name: '', preferred_language: 'de',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Passwort muss mindestens 8 Zeichen haben.'); return; }
    setLoading(true);
    try {
      const res = await authApi.register(form);
      const { token, user } = res.data.data as { token: string; user: User };
      i18n.changeLanguage(form.preferred_language);
      setAuth(user, token);
      navigate('/create-character');
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e.response?.status === 409) setError(t('auth.error.userExists'));
      else setError(t('auth.error.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark pixel-stars flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="font-pixel text-accent-red text-2xl mb-2">COPILOT<br/>ODYSSEY</div>
        <div className="font-pixel text-[9px] text-gray-400">Abenteuer beginnen</div>
      </div>

      <div className="w-full max-w-sm border-2 border-white bg-bg-darker shadow-[6px_6px_0_#000] p-6">
        <h2 className="font-pixel text-xs text-xp-gold mb-6 border-b border-white pb-3">{t('auth.register')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'username',     label: t('auth.username'),    type: 'text',     auto: 'username' },
            { key: 'email',        label: t('auth.email'),       type: 'email',    auto: 'email' },
            { key: 'display_name', label: t('auth.displayName'), type: 'text',     auto: 'name' },
            { key: 'password',     label: t('auth.password'),    type: 'password', auto: 'new-password' },
          ].map(({ key, label, type, auto }) => (
            <div key={key}>
              <label className="block font-pixel text-[9px] text-gray-400 mb-2">{label}</label>
              <input
                type={type}
                className="input-pixel"
                value={form[key as keyof typeof form]}
                onChange={set(key)}
                autoComplete={auto}
                required
              />
            </div>
          ))}

          <div>
            <label className="block font-pixel text-[9px] text-gray-400 mb-2">{t('common.language')}</label>
            <select
              className="input-pixel"
              value={form.preferred_language}
              onChange={set('preferred_language')}
            >
              <option value="de">{t('common.german')}</option>
              <option value="en">{t('common.english')}</option>
            </select>
          </div>

          {error && (
            <div className="border border-hp-red bg-red-950/50 px-3 py-2 font-pixel text-[9px] text-hp-red">✗ {error}</div>
          )}

          <PixelButton type="submit" loading={loading} fullWidth>
            {t('character.confirm')} ►
          </PixelButton>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="font-pixel text-[9px] text-aurora hover:text-white transition-colors">
            {t('auth.loginCta')}
          </Link>
        </div>
      </div>
    </div>
  );
}
