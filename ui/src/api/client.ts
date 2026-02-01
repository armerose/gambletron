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
