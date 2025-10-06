import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export type User = {
   id: string;
   name: string;
   email: string;
   role: 'engineer' | 'manager' | 'lead' | 'admin';
};

export const fetchProjectMembers = async (projectId: string): Promise<User[]> => {
   const { data } = await api.get(`/projects/${projectId}/members`);
   return data;
};

export const addProjectMember = async (projectId: string, userId: string): Promise<User> => {
   const { data } = await api.post(`/projects/${projectId}/members`, { userId });
   return data;
};

export const removeProjectMember = async (projectId: string, userId: string): Promise<void> => {
   await api.delete(`/projects/${projectId}/members/${userId}`);
};

export const fetchAllUsers = async (): Promise<User[]> => {
   const { data } = await api.get(`/users`);
   return data;
};

export const useProjectMembers = (projectId: string) => {
   return useQuery({
      queryKey: ['projectMembers', projectId],
      queryFn: () => fetchProjectMembers(projectId),
      enabled: !!projectId,
   });
};

export function useAddProjectMember(projectId: string) {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (userId: string) => addProjectMember(projectId, userId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['projectMembers', projectId] });
      },
   });
}

export function useRemoveProjectMember(projectId: string) {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (userId: string) => removeProjectMember(projectId, userId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['projectMembers', projectId] });
      },
   });
}

export const useAllUsers = () => {
   return useQuery({
      queryKey: ['allUsers'],
      queryFn: fetchAllUsers,
   })
};
