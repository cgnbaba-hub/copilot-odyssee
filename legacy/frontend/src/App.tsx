import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './context/AuthStore';
import Layout from './components/common/Layout';
import { PREVIEW_MODE } from './config';

const PREVIEW_USER = {
  id: 'preview-user',
  username: 'preview',
  email: 'preview@odyssey.dev',
  display_name: 'Preview',
  current_level: 5,
  total_xp: 2500,
  preferred_language: 'de',
  role: 'super_admin' as const,
  avatar_config: { character: 'player_1', hair: 'short', skin: '#FDBCB4', outfit: 'robe', accessory: 'none' },
};

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateCharacterPage from './pages/CreateCharacterPage';
import MapPage from './pages/MapPage';
import IslandPage from './pages/IslandPage';
import QuizPage from './pages/QuizPage';
import PromptPage from './pages/PromptPage';
import ArenaPage from './pages/ArenaPage';
import DuelDetailPage from './pages/DuelDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import GuildPage from './pages/GuildPage';
import QuestPage from './pages/QuestPage';
import GuardianPage from './pages/GuardianPage';
import AdminPage from './pages/AdminPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (PREVIEW_MODE) return <>{children}</>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (PREVIEW_MODE) return <Navigate to="/map" replace />;
  return !isAuthenticated ? <>{children}</> : <Navigate to="/map" replace />;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  if (PREVIEW_MODE) return <>{children}</>;
  if (!user) return <Navigate to="/login" replace />;
  if (!['content_admin', 'super_admin'].includes(user.role)) {
    return <Navigate to="/map" replace />;
  }
  return <>{children}</>;
}

function RequireCharacter({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  if (PREVIEW_MODE) return <>{children}</>;
  if (!user) return <Navigate to="/login" replace />;
  // Check if character has been created (avatar_config set)
  const hasAvatar = user.avatar_config && Object.keys(user.avatar_config).length > 0;
  return hasAvatar ? <>{children}</> : <Navigate to="/create-character" replace />;
}

export default function App() {
  useEffect(() => {
    if (PREVIEW_MODE) {
      useAuthStore.setState({
        user: PREVIEW_USER,
        token: 'preview-token',
        isAuthenticated: true,
      });
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={
          <RequireGuest><LoginPage /></RequireGuest>
        } />
        <Route path="/register" element={
          <RequireGuest><RegisterPage /></RequireGuest>
        } />

        {/* Character creation */}
        <Route path="/create-character" element={
          <RequireAuth><CreateCharacterPage /></RequireAuth>
        } />

        {/* Game Routes */}
        <Route path="/" element={
          <RequireAuth>
            <RequireCharacter>
              <Layout />
            </RequireCharacter>
          </RequireAuth>
        }>
          <Route index element={<Navigate to="/map" replace />} />
          <Route path="map" element={<MapPage />} />
          <Route path="island/:slug" element={<IslandPage />} />
          <Route path="island/:slug/quiz" element={<QuizPage />} />
          <Route path="island/:slug/prompt" element={<PromptPage />} />
          <Route path="island/:slug/guardian" element={<GuardianPage />} />
          <Route path="arena" element={<ArenaPage />} />
          <Route path="duel/:id" element={<DuelDetailPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="guild" element={<GuildPage />} />
          <Route path="quest" element={<QuestPage />} />
          <Route path="admin/*" element={
            <RequireAdmin><AdminPage /></RequireAdmin>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/map" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
