import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type DefectStatus = 'new' | 'in_progress' | 'review' | 'closed';
export type DefectPriority = 'low' | 'medium' | 'high';

export type Defect = {
  id: string
  title: string
  description?: string
  projectId?: string
  projectName?: string
  priority: DefectPriority
  status: DefectStatus
  attachments: { id: string; name: string }[]
}

const STORAGE_KEY = 'cs_defects';

function readAll(): Defect[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  return raw ? (JSON.parse(raw) as Defect[]) : [];
}

function writeAll(defects: Defect[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defects))
}

export function useDefects() {
  return useQuery({
    queryKey: ['defects'],
    queryFn: async () => readAll(),
  })
}

export function useCreateDefect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<Defect, 'id' | 'status' | 'attachments'> & { attachments?: { id: string; name: string }[] }) => {
      const next: Defect = {
        id: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        projectId: input.projectId,
        projectName: input.projectName,
        priority: input.priority,
        status: 'new',
        attachments: input.attachments ?? [],
      };

      const all = readAll();
      writeAll([next, ...all]);
      return next;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['defects'] }),
  })
}

export function useUpdateDefect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<Defect> & { id: string }) => {
      const all = readAll();
      const idx = all.findIndex(d => d.id === input.id);

      if (idx >= 0) {
        all[idx] = { ...all[idx], ...input };
        writeAll(all);
        
        return all[idx];
      }
      throw new Error('Дефект не найден');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['defects'] }),
  })
}

export function useDeleteDefect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const all = readAll();
      writeAll(all.filter(d => d.id !== id));

      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['defects'] }),
  })
}

export function useAdvanceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const all = readAll();
      const idx = all.findIndex(d => d.id === id);

      if (idx === -1) throw new Error('Дефект не найден');

      const order: DefectStatus[] = ['new', 'in_progress', 'review', 'closed'];
      const current = all[idx].status;
      const nextIndex = Math.min(order.indexOf(current) + 1, order.length - 1);

      all[idx].status = order[nextIndex];
      writeAll(all);

      return all[idx];
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['defects'] }),
  })
}
