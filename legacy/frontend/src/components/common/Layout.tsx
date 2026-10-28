import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../context/AuthStore';
import { authApi } from '../../services/api';
import XPBar from './XPBar';

export default function Layout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await authApi.logout(); } catch { /* ignore */ }
    finally { logout(); navigate('/login'); }
  };

  const isAdmin = user?.role === 'content_admin' || user?.role === 'super_admin';
  const navLinks = [
    { to: '/map',         label: t('nav.map'),        icon: 'MAP' },
    { to: '/arena',       label: t('nav.arena'),       icon: 'PVP' },
    { to: '/leaderboard', label: t('nav.leaderboard'), icon: 'TOP' },
    { to: '/profile',     label: t('nav.profile'),     icon: 'USR' },
    { to: '/guild',       label: t('nav.guild'),        icon: 'GLD' },
    { to: '/quest',       label: t('nav.quest'),        icon: 'QST' },
  ];
  if (isAdmin) navLinks.push({ to: '/admin', label: t('nav.admin'), icon: 'ADM' });

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <div className="flex min-h-screen bg-bg-dark">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={[
          'fixed top-0 left-0 h-full w-56 bg-bg-darker border-r-2 border-white z-30',
          'flex flex-col shadow-pixel transform transition-transform duration-150',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="p-4 border-b-2 border-white shrink-0">
          <div className="text-accent-red font-pixel text-xs leading-loose">
            <div>COPILOT</div>
            <div>ODYSSEY</div>
          </div>
          <div className="text-gray-500 text-[8px] mt-1 font-pixel">v1.0.0</div>
        </div>

        {user && (
          <div className="p-3 border-b-2 border-white bg-accent-teal shrink-0">
            <div className="text-white font-pixel text-[9px] mb-1 truncate">{user.display_name}</div>
            <div className="text-xp-gold font-pixel text-[8px] mb-2">LV.{user.current_level}</div>
            <XPBar totalXp={user.total_xp} currentLevel={user.current_level} />
          </div>
        )}

        <nav className="flex-1 py-2 overflow-y-auto">
          {navLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={[
                'flex items-center gap-3 px-4 py-3 font-pixel text-[9px]',
                'border-b border-gray-800 transition-colors duration-75',
                isActive(to)
                  ? 'bg-accent-red text-white border-l-4 border-l-xp-gold'
                  : 'text-gray-300 hover:bg-accent-teal hover:text-white',
              ].join(' ')}
            >
              <span className="font-pixel text-[8px] text-xp-gold w-8 shrink-0">[{icon}]</span>
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t-2 border-white shrink-0">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full btn-pixel btn-danger text-[9px] py-2"
          >
            {loggingOut ? t('auth.loading') : t('nav.logout')}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-bg-darker border-b-2 border-white px-4 py-2 flex items-center gap-4 sticky top-0 z-10 shrink-0">
          <button
            className="lg:hidden btn-pixel bg-accent-teal text-white text-[9px] px-2 py-1"
            onClick={() => setSidebarOpen(true)}
          >
            MENU
          </button>
          <div className="hidden lg:block font-pixel text-[9px] text-gray-400">
            {navLinks.find(l => isActive(l.to))?.label ?? 'COPILOT ODYSSEY'}
          </div>
          {user && (
            <div className="flex items-center gap-3 ml-auto">
              <span className="font-pixel text-[9px] text-xp-gold">LV.{user.current_level}</span>
              <div className="w-28 hidden md:block">
                <XPBar totalXp={user.total_xp} currentLevel={user.current_level} />
              </div>
              <span className="font-pixel text-[9px] text-gray-300 hidden sm:block max-w-[120px] truncate">
                {user.display_name}
              </span>
            </div>
          )}
        </header>
        <main className="flex-1 overflow-y-auto p-4 pixel-stars">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
