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
  assigneeId?: string
  assigneeName?: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  attachments: { id: string; name: string }[]
  comments: { id: string; text: string; author: string; createdAt: string }[]
}

const STORAGE_KEY = 'cs_defects';

function readAll(): Defect[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw) {
    return JSON.parse(raw) as Defect[];
  }

  // Инициализация тестовыми данными, если нет сохраненных данных
  const testData: Defect[] = [
    {
      id: '1',
      title: 'Трещина в фундаменте',
      description: 'Обнаружена трещина в фундаменте здания на участке А-1',
      projectName: 'Жилой комплекс "Солнечный"',
      priority: 'high',
      status: 'new',
      assigneeName: 'Иванов И.И.',
      createdBy: 'admin',
      createdByName: 'Администратор',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      attachments: [
        { id: '1', name: 'фото_трещины.jpg' },
        { id: '2', name: 'план_участка.pdf' }
      ],
      comments: [
        {
          id: '1',
          text: 'Необходимо срочно провести экспертизу',
          author: 'Петров П.П.',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: '2',
      title: 'Неисправность лифта',
      description: 'Лифт в подъезде №2 не работает',
      projectName: 'Жилой комплекс "Солнечный"',
      priority: 'medium',
      status: 'in_progress',
      assigneeName: 'Сидоров С.С.',
      createdBy: 'admin',
      createdByName: 'Администратор',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      attachments: [],
      comments: [
        {
          id: '2',
          text: 'Заказаны запчасти, ожидаем поставку',
          author: 'Сидоров С.С.',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: '3',
      title: 'Протечка в подвале',
      description: 'Обнаружена протечка воды в подвальном помещении',
      projectName: 'Офисный центр "Бизнес-Плаза"',
      priority: 'high',
      status: 'review',
      assigneeName: 'Козлов К.К.',
      createdBy: 'admin',
      createdByName: 'Администратор',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      attachments: [
        { id: '3', name: 'видео_протечки.mp4' }
      ],
      comments: [
        {
          id: '3',
          text: 'Протечка устранена, требуется проверка',
          author: 'Козлов К.К.',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
  ];

  writeAll(testData);
  return testData;
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
    mutationFn: async (input: Omit<Defect, 'id' | 'status' | 'attachments' | 'comments' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdByName'> & { 
      attachments?: { id: string; name: string }[] 
    }) => {
      const now = new Date().toISOString();
      const next: Defect = {
        id: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        projectId: input.projectId,
        projectName: input.projectName,
        priority: input.priority,
        status: 'new',
        assigneeId: input.assigneeId,
        assigneeName: input.assigneeName,
        createdBy: 'current-user', // TODO: получить из контекста аутентификации
        createdByName: 'Текущий пользователь', // TODO: получить из контекста аутентификации
        createdAt: now,
        updatedAt: now,
        attachments: input.attachments ?? [],
        comments: [],
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
        all[idx] = { 
          ...all[idx], 
          ...input, 
          updatedAt: new Date().toISOString() 
        };
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
      all[idx].updatedAt = new Date().toISOString();
      writeAll(all);

      return all[idx];
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['defects'] }),
  })
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ defectId, text }: { defectId: string; text: string }) => {
      const all = readAll();
      const idx = all.findIndex(d => d.id === defectId);

      if (idx === -1) throw new Error('Дефект не найден');

      const comment = {
        id: crypto.randomUUID(),
        text,
        author: 'Текущий пользователь', // TODO: получить из контекста аутентификации
        createdAt: new Date().toISOString(),
      };

      all[idx].comments.push(comment);
      all[idx].updatedAt = new Date().toISOString();
      writeAll(all);

      return comment;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['defects'] }),
  })
}
