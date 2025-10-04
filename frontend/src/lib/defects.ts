import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import axios from 'axios';

export type DefectStatus = 'new' | 'in_progress' | 'review' | 'closed';
export type DefectPriority = 'low' | 'medium' | 'high';

export type Defect = {
   id: string;
   title: string;
   description?: string;
   priority: 'low' | 'medium' | 'high';
   status: 'new' | 'in_progress' | 'review' | 'closed';
   createdAt: string;
   updatedAt: string;

   project?: { id: string; name: string } | null;
   createdBy: { id: string; email: string };
   assignee?: { id: string; email: string } | null;

   attachments?: { id: string; name: string }[];
   comments: {
      id: string;
      text: string;
      createdAt: string;
      author: { id: string; email: string };
   }[];
};

export type DefectInput = {
   title: string;
   description?: string;
   projectId?: string;
   priority: DefectPriority;
   assigneeId?: string;
   attachments?: { filename: string }[];
};

export const useDefect = (id: string | null) => {
   return useQuery({
      queryKey: ['defect', id],
      queryFn: async () => {
         if (!id) return null;
         const { data } = await api.get<Defect>(`/defects/${id}`);
         return data;
      },
      enabled: !!id
   });
};

export const useDefects = () => {
   return useQuery({
      queryKey: ['defects'],
      queryFn: async () => {
         const { data } = await api.get<Defect[]>('/defects');
         return data;
      }
   });
};

export const useCreateDefect = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: async (input: DefectInput) => {
         const { data } = await api.post<Defect>('/defects', input);
         return data;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['defects'] })
   });
};

export const useUpdateDefect = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: async (input: DefectInput & { id: string }) => {
         const { data } = await api.put<Defect>(`/defects/${input.id}`, input);
         return data;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['defects'] })
   });
};

export const useDeleteDefect = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (id: string) => {
         await api.delete(`/defects/${id}`);
         return id;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['defects'] })
   });
};

export const useAdvanceStatus = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (id: string) => {
         const { data } = await api.put<Defect>(`/defects/${id}/advance`);
         return data;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['defects'] })
   });
};

export const useAddComment = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         defectId,
         text
      }: {
         defectId: string;
         text: string;
      }) => {
         const { data } = await axios.post(
            `/api/defects/${defectId}/comments`,
            { text }
         );
         return data;
      },
      onSuccess: (_, { defectId }) => {
         queryClient.invalidateQueries({ queryKey: ['defect', defectId] });
      }
   });
};
