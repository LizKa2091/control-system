import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export type ProjectStatus = 'planned' | 'in_progress' | 'completed';

export type Project = {
   id: string;
   name: string;
   status: ProjectStatus;
   description?: string;
   createdAt?: string;
   updatedAt?: string;
};

export const fetchProjects = async (): Promise<Project[]> => {
   const { data } = await api.get('/projects');
   return data;
}

export const createProject = async (input: Omit<Project, 'id'>): Promise<Project> => {
   const { data } = await api.post('/projects', input);
   return data;
}

export const updateProject = async (input: Partial<Project> & { id: string }): Promise<Project> => {
   const { data } = await api.put(`/projects/${input.id}`, input);
   return data;
}

export const deleteProject = async (id: string): Promise<string> => {
   await api.delete(`/projects/${id}`);
   return id;
}

export const useProjects = () => {
   return useQuery({
      queryKey: ['projects'],
      queryFn: fetchProjects,
   });
}

export const useCreateProject = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: createProject,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
   });
}

export const useUpdateProject = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: updateProject,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
   });
}

export const useDeleteProject = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: deleteProject,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
   });
}

export const fetchProjectById = async (id: string): Promise<Project> => {
   const { data } = await api.get(`/projects/${id}`);
   return data;
}

export const useProjectById = (id: string) => {
   return useQuery({
      queryKey: ['project', id],
      queryFn: () => fetchProjectById(id),
      enabled: !!id,
   });
}