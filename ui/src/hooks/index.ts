import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/client';

// ============= AGENTS =============
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => api.agents.list(),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 5, // Refetch every 5 seconds
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: ['agent', id],
    queryFn: () => api.agents.get(id),
    enabled: !!id,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 5,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.agents.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  });
}

export function useUpdateAgent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.agents.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useDeleteAgent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.agents.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  });
}

export function useStartAgent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.agents.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useStopAgent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.agents.stop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function usePauseAgent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.agents.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useAgentMetrics(id: string) {
  return useQuery({
    queryKey: ['agentMetrics', id],
    queryFn: () => api.agents.metrics(id),
    enabled: !!id,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 5,
  });
}

export function useAgentBacktest(id: string) {
  return useQuery({
    queryKey: ['agentBacktest', id],
    queryFn: () => api.agents.backtest(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}

// ============= DASHBOARD =============
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.dashboard.summary(),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 10, // Refetch every 10 seconds
  });
}

// ============= TRADES =============
export function useTrades(params?: any) {
  return useQuery({
    queryKey: ['trades', params],
    queryFn: () => api.trades.list(params),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 5,
  });
}

// ============= POSITIONS =============
export function usePositions(params?: any) {
  return useQuery({
    queryKey: ['positions', params],
    queryFn: () => api.positions.list(params),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 5,
  });
}

// ============= ORDERS =============
export function useCreateOrder() {
  return useMutation({
    mutationFn: (data: any) => api.orders.create(data),
  });
}

// ============= LOGS =============
export function useLogsTrades(params?: any) {
  return useQuery({
    queryKey: ['logsTrades', params],
    queryFn: () => api.logs.trades(params),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 10,
  });
}

export function useLogsSystem(params?: any) {
  return useQuery({
    queryKey: ['logsSystem', params],
    queryFn: () => api.logs.system(params),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 10,
  });
}

// ============= ANALYTICS =============
export function useAnalyticsEquity(params?: any) {
  return useQuery({
    queryKey: ['analyticsEquity', params],
    queryFn: () => api.analytics.equity(params),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 30,
  });
}

export function useAnalyticsPerformance() {
  return useQuery({
    queryKey: ['analyticsPerformance'],
    queryFn: () => api.analytics.performance(),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 30,
  });
}

// ============= STRATEGIES =============
export function useStrategies() {
  return useQuery({
    queryKey: ['strategies'],
    queryFn: () => api.strategies.list(),
    staleTime: 1000 * 60,
  });
}

export function useCreateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.strategies.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategies'] }),
  });
}

export function useUpdateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.strategies.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategies'] }),
  });
}

export function useDeleteStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.strategies.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategies'] }),
  });
}

// ============= DATA SOURCES =============
export function useDataSources() {
  return useQuery({
    queryKey: ['dataSources'],
    queryFn: () => api.dataSources.list(),
    staleTime: 1000 * 60,
  });
}

export function useCreateDataSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.dataSources.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dataSources'] }),
  });
}

export function useUpdateDataSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.dataSources.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dataSources'] }),
  });
}

export function useDeleteDataSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.dataSources.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dataSources'] }),
  });
}

export function useTestDataSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.dataSources.test(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dataSources'] }),
  });
}

// ============= INTEGRATIONS =============
export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: () => api.integrations.list(),
    staleTime: 1000 * 60,
  });
}

export function useCreateIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.integrations.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations'] }),
  });
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.integrations.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations'] }),
  });
}

export function useTestIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.integrations.test(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations'] }),
  });
}

// ============= SETTINGS =============
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api.settings.get(),
    staleTime: 1000 * 60,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.settings.update(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });
}
