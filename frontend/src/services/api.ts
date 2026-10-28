import axios, { AxiosError } from 'axios';
import { PREVIEW_MODE } from '../config';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Request interceptor: inject token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !PREVIEW_MODE) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────
export const authApi = {
  register: (data: { username: string; email: string; password: string; display_name: string; preferred_language?: string }) =>
    api.post('/auth/register', data),
  login: (data: { login: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ─── User ─────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateAvatar: (avatar_config: Record<string, unknown>) =>
    api.put('/user/avatar', { avatar_config }),
  getProgress: () => api.get('/user/progress'),
  getStats: () => api.get('/user/stats'),
};

// ─── Islands ──────────────────────────────────────────────────
export const islandApi = {
  getAll: () => api.get('/islands'),
  getOne: (slug: string) => api.get(`/islands/${slug}`),
  getProgress: (slug: string) => api.get(`/islands/${slug}/progress`),
};

// ─── Quiz ─────────────────────────────────────────────────────
export const quizApi = {
  getNext: (islandSlug: string) => api.get(`/quiz/${islandSlug}/next`),
  getStats: (islandSlug: string) => api.get(`/quiz/${islandSlug}/stats`),
  submitAnswer: (question_id: string, option_id: string) =>
    api.post('/quiz/answer', { question_id, option_id }),
};

// ─── Prompt ───────────────────────────────────────────────────
export const promptApi = {
  getNext: (islandSlug: string) => api.get(`/prompt/${islandSlug}/next`),
  getHistory: (islandSlug: string) => api.get(`/prompt/${islandSlug}/history`),
  submit: (challenge_id: string, prompt_text: string) =>
    api.post('/prompt/submit', { challenge_id, prompt_text }),
};

// ─── Duel ─────────────────────────────────────────────────────
export const duelApi = {
  create: (island_slug: string, difficulty: string) =>
    api.post('/duel/create', { island_slug, difficulty }),
  getPending: () => api.get('/duel/pending'),
  getHistory: () => api.get('/duel/history'),
  submit: (id: string, prompt_text: string) =>
    api.post(`/duel/${id}/submit`, { prompt_text }),
  getResult: (id: string) => api.get(`/duel/${id}/result`),
};

// ─── Leaderboard ──────────────────────────────────────────────
export const leaderboardApi = {
  getGlobal: (period?: string) =>
    api.get('/leaderboard/global', { params: { period } }),
  getIsland: (slug: string) => api.get(`/leaderboard/island/${slug}`),
  getGuild: () => api.get('/leaderboard/guild'),
  getDuels: () => api.get('/leaderboard/duels'),
};

// ─── Guild ────────────────────────────────────────────────────
export const guildApi = {
  create: (data: { name: string; description?: string }) =>
    api.post('/guild/create', data),
  getOne: (id: string) => api.get(`/guild/${id}`),
  getMy: () => api.get('/guild/my'),
  join: (id: string) => api.post(`/guild/${id}/join`),
  leave: (id: string) => api.post(`/guild/${id}/leave`),
  search: (q: string) => api.get('/guild/search', { params: { q } }),
};

// ─── Quest ────────────────────────────────────────────────────
export const questApi = {
  getDaily: () => api.get('/quest/daily'),
  getWeekly: () => api.get('/quest/weekly'),
};

// ─── Admin ────────────────────────────────────────────────────
export const adminApi = {
  // Quiz
  listQuestions: (params?: Record<string, string>) =>
    api.get('/admin/quiz', { params }),
  createQuestion: (data: unknown) => api.post('/admin/quiz', data),
  updateQuestion: (id: string, data: unknown) => api.put(`/admin/quiz/${id}`, data),
  deleteQuestion: (id: string) => api.delete(`/admin/quiz/${id}`),

  // Analytics
  getActiveUsers: (days?: number) =>
    api.get('/admin/analytics/active-users', { params: { days } }),
  getLevelDistribution: () => api.get('/admin/analytics/level-distribution'),
  getIslandCompletion: () => api.get('/admin/analytics/island-completion'),
  getPromptQualityTrend: () => api.get('/admin/analytics/prompt-quality-trend'),
  getHardestQuestions: () => api.get('/admin/analytics/quiz-difficulty-analysis'),
  getDuelStatistics: () => api.get('/admin/analytics/duel-statistics'),
  exportCSV: () => api.get('/admin/analytics/export/csv', { responseType: 'blob' }),
};
