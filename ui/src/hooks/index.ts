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
