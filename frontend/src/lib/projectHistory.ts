import { useQuery } from '@tanstack/react-query';
import { api } from './api';

export interface ProjectChange {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string } | null;
}

export const fetchProjectHistory = async (projectId: string): Promise<ProjectChange[]> => {
  const { data } = await api.get(`/projects/${projectId}/history`);
  return data;
};

export const useProjectHistory = (projectId: string) => {
  return useQuery({
    queryKey: ['projectHistory', projectId],
    queryFn: () => fetchProjectHistory(projectId),
  });
};