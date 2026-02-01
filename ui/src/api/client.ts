import axios from 'axios';

// Get API URL from localStorage or environment or use default
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('apiUrl') || import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
};

export const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ============= AGENTS =============
export const agents = {
  list: async () => {
    try {
      const res = await apiClient.get('/agents');
      return res.data;
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      throw error;
    }
  },
  get: async (id: string) => {
    try {
      const res = await apiClient.get(`/agents/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Failed to fetch agent ${id}:`, error);
      throw error;
    }
  },
  create: async (data: any) => {
    try {
      const res = await apiClient.post('/agents', data);
      return res.data;
    } catch (error) {
      console.error('Failed to create agent:', error);
      throw error;
    }
  },
  update: async (id: string, data: any) => {
    try {
      const res = await apiClient.put(`/agents/${id}`, data);
      return res.data;
    } catch (error) {
      console.error(`Failed to update agent ${id}:`, error);
      throw error;
    }
  },
  delete: async (id: string) => {
    try {
      await apiClient.delete(`/agents/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete agent ${id}:`, error);
      throw error;
    }
  },
  start: async (id: string) => {
    try {
      const res = await apiClient.post(`/agents/${id}/start`);
      return res.data;
    } catch (error) {
      console.error(`Failed to start agent ${id}:`, error);
      throw error;
    }
  },
  stop: async (id: string) => {
    try {
      const res = await apiClient.post(`/agents/${id}/stop`);
      return res.data;
    } catch (error) {
      console.error(`Failed to stop agent ${id}:`, error);
      throw error;
    }
  },
  pause: async (id: string) => {
    try {
      const res = await apiClient.post(`/agents/${id}/pause`);
      return res.data;
    } catch (error) {
      console.error(`Failed to pause agent ${id}:`, error);
      throw error;
    }
  },
  status: async (id: string) => {
    try {
      const res = await apiClient.get(`/agents/${id}/status`);
      return res.data;
    } catch (error) {
      console.error(`Failed to fetch agent ${id} status:`, error);
      throw error;
    }
  },
  metrics: async (id: string) => {
    try {
      const res = await apiClient.get(`/agents/${id}/metrics`);
      return res.data;
    } catch (error) {
      console.error(`Failed to fetch agent ${id} metrics:`, error);
      throw error;
    }
  },
  backtest: async (id: string) => {
    try {
      const res = await apiClient.get(`/agents/${id}/backtest`);
      return res.data;
    } catch (error) {
      console.error(`Failed to fetch agent ${id} backtest results:`, error);
      throw error;
    }
  },
};

// ============= STRATEGIES =============
export const strategies = {
  list: async () => {
    try {
      const res = await apiClient.get('/strategies');
      return res.data;
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
      throw error;
    }
  },
  get: async (id: string) => {
    try {
      const res = await apiClient.get(`/strategies/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Failed to fetch strategy ${id}:`, error);
      throw error;
    }
  },
  create: async (data: any) => {
    try {
      const res = await apiClient.post('/strategies', data);
      return res.data;
    } catch (error) {
      console.error('Failed to create strategy:', error);
      throw error;
    }
  },
  update: async (id: string, data: any) => {
    try {
      const res = await apiClient.put(`/strategies/${id}`, data);
      return res.data;
    } catch (error) {
      console.error(`Failed to update strategy ${id}:`, error);
      throw error;
    }
  },
  delete: async (id: string) => {
    try {
      await apiClient.delete(`/strategies/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete strategy ${id}:`, error);
      throw error;
    }
  },
};

// ============= DATA SOURCES =============
export const dataSources = {
  list: async () => {
    try {
      const res = await apiClient.get('/data-sources');
      return res.data;
    } catch (error) {
      console.error('Failed to fetch data sources:', error);
      throw error;
    }
  },
  get: async (id: string) => {
    try {
      const res = await apiClient.get(`/data-sources/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Failed to fetch data source ${id}:`, error);
      throw error;
    }
  },
  create: async (data: any) => {
    try {
      const res = await apiClient.post('/data-sources', data);
      return res.data;
    } catch (error) {
      console.error('Failed to create data source:', error);
      throw error;
    }
  },
  update: async (id: string, data: any) => {
    try {
      const res = await apiClient.put(`/data-sources/${id}`, data);
      return res.data;
    } catch (error) {
      console.error(`Failed to update data source ${id}:`, error);
      throw error;
    }
  },
  delete: async (id: string) => {
    try {
      await apiClient.delete(`/data-sources/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete data source ${id}:`, error);
      throw error;
    }
  },
  test: async (id: string) => {
    try {
      const res = await apiClient.post(`/data-sources/${id}/test`);
      return res.data;
    } catch (error) {
      console.error(`Failed to test data source ${id}:`, error);
      throw error;
    }
  },
};

// ============= DASHBOARD =============
export const dashboard = {
  summary: async () => {
    try {
      const res = await apiClient.get('/dashboard');
      return res.data;
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      throw error;
    }
  },
};

// ============= TRADES =============
export const trades = {
  list: async (params?: any) => {
    try {
      const res = await apiClient.get('/trades', { params });
      return res.data;
    } catch (error) {
      console.error('Failed to fetch trades:', error);
      throw error;
    }
  },
  get: async (id: string) => {
    try {
      const res = await apiClient.get(`/trades/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Failed to fetch trade ${id}:`, error);
      throw error;
    }
  },
};

// ============= POSITIONS =============
export const positions = {
  list: async (params?: any) => {
    try {
      const res = await apiClient.get('/positions', { params });
      return res.data;
    } catch (error) {
      console.error('Failed to fetch positions:', error);
      throw error;
    }
  },
};

// ============= ORDERS =============
export const orders = {
  create: async (data: any) => {
    try {
      const res = await apiClient.post('/orders', data);
      return res.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  },
};

// ============= LOGS =============
export const logs = {
  trades: async (params?: any) => {
    try {
      const res = await apiClient.get('/logs/trades', { params });
      return res.data;
    } catch (error) {
      console.error('Failed to fetch trade logs:', error);
      throw error;
    }
  },
  signals: async (params?: any) => {
    try {
      const res = await apiClient.get('/logs/signals', { params });
      return res.data;
    } catch (error) {
      console.error('Failed to fetch signal logs:', error);
      throw error;
    }
  },
  system: async (params?: any) => {
    try {
      const res = await apiClient.get('/logs/system', { params });
      return res.data;
    } catch (error) {
      console.error('Failed to fetch system logs:', error);
      throw error;
    }
  },
};

// ============= ANALYTICS =============
export const analytics = {
  equity: async (params?: any) => {
    try {
      const res = await apiClient.get('/analytics/equity', { params });
      return res.data;
    } catch (error) {
      console.error('Failed to fetch equity curve:', error);
      throw error;
    }
  },
  performance: async () => {
    try {
      const res = await apiClient.get('/analytics/performance');
      return res.data;
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      throw error;
    }
  },
};

// ============= SETTINGS =============
export const settings = {
  get: async () => {
    try {
      const res = await apiClient.get('/settings');
      return res.data;
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      throw error;
    }
  },
  update: async (data: any) => {
    try {
      const res = await apiClient.put('/settings', data);
      return res.data;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },
};

// ============= INTEGRATIONS =============
export const integrations = {
  list: async () => {
    try {
      const res = await apiClient.get('/integrations');
      return res.data;
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      throw error;
    }
  },
  get: async (id: string) => {
    try {
      const res = await apiClient.get(`/integrations/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Failed to fetch integration ${id}:`, error);
      throw error;
    }
  },
  create: async (data: any) => {
    try {
      const res = await apiClient.post('/integrations', data);
      return res.data;
    } catch (error) {
      console.error('Failed to create integration:', error);
      throw error;
    }
  },
  update: async (id: string, data: any) => {
    try {
      const res = await apiClient.put(`/integrations/${id}`, data);
      return res.data;
    } catch (error) {
      console.error(`Failed to update integration ${id}:`, error);
      throw error;
    }
  },
  delete: async (id: string) => {
    try {
      await apiClient.delete(`/integrations/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete integration ${id}:`, error);
      throw error;
    }
  },
  test: async (id: string) => {
    try {
      const res = await apiClient.post(`/integrations/${id}/test`);
      return res.data;
    } catch (error) {
      console.error(`Failed to test integration ${id}:`, error);
      throw error;
    }
  },
};
