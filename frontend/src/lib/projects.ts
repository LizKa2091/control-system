import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type ProjectStatus = 'planned' | 'in_progress' | 'completed';

export type Project = {
   id: string;
   name: string;
   status: ProjectStatus;
};

const STORAGE_KEY = 'cs_projects';

function readAll(): Project[] {
   const raw = localStorage.getItem(STORAGE_KEY);

   return raw ? (JSON.parse(raw) as Project[]) : [];
}

function writeAll(projects: Project[]) {
   localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function useProjects() {
   return useQuery({
      queryKey: ['projects'],
      queryFn: async () => readAll()
   });
}

export function useCreateProject() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (input: Omit<Project, 'id'>) => {
         const next: Project = {
            id: crypto.randomUUID(),
            name: input.name,
            status: input.status
         };

         const all = readAll();
         writeAll([next, ...all]);

         return next;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
   });
}

export function useUpdateProject() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (input: Partial<Project> & { id: string }) => {
         const all = readAll();
         const idx = all.findIndex((p) => p.id === input.id);

         if (idx >= 0) {
            all[idx] = { ...all[idx], ...input };
            writeAll(all);

            return all[idx];
         }
         throw new Error('Проект не найден');
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
   });
}

export function useDeleteProject() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (id: string) => {
         const all = readAll();
         writeAll(all.filter((p) => p.id !== id));

         return id;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
   });
}