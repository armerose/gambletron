#!/bin/bash

# Enterprise UI Generation Script
cd /workspaces/gambletron/ui/src

# Create global styles
cat > styles/index.css << 'CSS'
@import './globals.css';
CSS

# Create main App component
cat > App.tsx << 'APP'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useAppStore } from './store';
import './styles/index.css';

// Layouts
import RootLayout from './components/layout/RootLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Monitor from './pages/Monitor';
import Analytics from './pages/Analytics';
import Logs from './pages/Logs';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, gcTime: 1000 * 60 * 5 },
  },
});

export default function App() {
  const { isDarkMode } = useAppStore();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className={isDarkMode ? 'dark' : ''}>
          <Routes>
            <Route element={<RootLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/monitor" element={<Monitor />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}
APP

# Create store
mkdir -p store
cat > store/index.ts << 'STORE'
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  notifications: Array<{ id: string; type: string; message: string }>;
  addNotification: (type: string, message: string) => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      notifications: [],
      addNotification: (type, message) =>
        set((s) => ({
          notifications: [...s.notifications, { id: Date.now().toString(), type, message }],
        })),
      removeNotification: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
    }),
    { name: 'app-store' }
  )
);
STORE

# Create API client
mkdir -p api
cat > api/client.ts << 'API'
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Agents
export const agents = {
  list: () => apiClient.get('/agents'),
  get: (id: string) => apiClient.get(`/agents/${id}`),
  create: (data: any) => apiClient.post('/agents', data),
  update: (id: string, data: any) => apiClient.put(`/agents/${id}`, data),
  delete: (id: string) => apiClient.delete(`/agents/${id}`),
  start: (id: string) => apiClient.post(`/agents/${id}/start`),
  stop: (id: string) => apiClient.post(`/agents/${id}/stop`),
  status: (id: string) => apiClient.get(`/agents/${id}/status`),
  metrics: (id: string) => apiClient.get(`/agents/${id}/metrics`),
};

// Dashboard
export const dashboard = {
  summary: () => apiClient.get('/dashboard'),
};

// Logs
export const logs = {
  trades: (params?: any) => apiClient.get('/logs/trades', { params }),
  signals: (params?: any) => apiClient.get('/logs/signals', { params }),
  system: (params?: any) => apiClient.get('/logs/system', { params }),
};

// Analytics
export const analytics = {
  equity: (params?: any) => apiClient.get('/logs/equity', { params }),
  performance: () => apiClient.get('/analytics/performance'),
};
API

# Create hooks
mkdir -p hooks
cat > hooks/index.ts << 'HOOKS'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/client';

export function useAgents() {
  return useQuery({ queryKey: ['agents'], queryFn: () => api.agents.list().then((r) => r.data) });
}

export function useAgent(id: string) {
  return useQuery({ queryKey: ['agent', id], queryFn: () => api.agents.get(id).then((r) => r.data) });
}

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: () => api.dashboard.summary().then((r) => r.data) });
}

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.agents.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  });
}
HOOKS

echo "✓ Enterprise UI structure generated"
