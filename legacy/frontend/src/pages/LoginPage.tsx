import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/api';
import { useAuthStore } from '../context/AuthStore';
import PixelButton from '../components/common/PixelButton';
import type { User } from '../types';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ login, password });
      const { token, user } = res.data.data as { token: string; user: User };
      setAuth(user, token);
      navigate('/map');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string }; status?: number } };
      if (e.response?.status === 401) setError(t('auth.error.invalidCredentials'));
      else setError(t('auth.error.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark pixel-stars flex flex-col items-center justify-center p-4">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'de' ? 'en' : 'de')}
          className="font-pixel text-[9px] text-gray-400 border border-white px-3 py-2 hover:bg-white hover:text-black transition-colors"
        >
          {i18n.language === 'de' ? '🇬🇧 EN' : '🇩🇪 DE'}
        </button>
      </div>

      {/* Logo */}
      <div className="text-center mb-10">
        <div className="font-pixel text-accent-red text-2xl mb-2 leading-tight">
          COPILOT<br/>ODYSSEY
        </div>
        <div className="font-pixel text-[9px] text-gray-400">{t('app.tagline')}</div>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm border-2 border-white bg-bg-darker shadow-[6px_6px_0_#000] p-6">
        <h2 className="font-pixel text-xs text-xp-gold mb-6 border-b border-white pb-3">{t('auth.login')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-pixel text-[9px] text-gray-400 mb-2">{t('auth.username')}</label>
            <input
              className="input-pixel"
              value={login}
              onChange={e => setLogin(e.target.value)}
              placeholder="username / email"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block font-pixel text-[9px] text-gray-400 mb-2">{t('auth.password')}</label>
            <input
              type="password"
              className="input-pixel"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="border border-hp-red bg-red-950/50 px-3 py-2 font-pixel text-[9px] text-hp-red">
              ✗ {error}
            </div>
          )}

          <PixelButton type="submit" loading={loading} fullWidth>
            {t('auth.login')} ►
          </PixelButton>
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/register"
            className="font-pixel text-[9px] text-aurora hover:text-white transition-colors"
          >
            {t('auth.registerCta')}
          </Link>
        </div>
      </div>

      <div className="mt-8 font-pixel text-[8px] text-gray-600 text-center">
        © 2025 CoPilot Odyssey
      </div>
    </div>
  );
}
