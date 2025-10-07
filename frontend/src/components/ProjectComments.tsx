import { useState, type FC } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface IComment {
   id: string;
   text: string;
   createdAt: string;
   author?: { id: string; name: string } | null;
   project?: { id: string; name: string } | null;
}

interface IProjectCommentsProps {
   projectId: string;
   currentUserId: string;
}

export const ProjectComments: FC<IProjectCommentsProps> = ({ projectId, currentUserId }) => {
   const queryClient = useQueryClient();
   const [text, setText] = useState<string>('');

   const { data: comments } = useQuery({
      queryKey: ['comments', projectId],
      queryFn: async () => (await api.get(`/comments/project/${projectId}`)).data,
      enabled: !!projectId
   });

   const addComment = useMutation({
      mutationFn: async () =>
         (await api.post('/comments', { projectId, userId: currentUserId, content: text })).data,
      onSuccess: () => {
         setText('');
         queryClient.invalidateQueries({ queryKey: ['comments', projectId] });
      },
   });

   return (
      <div>
         <h3>Комментарии</h3>
         <ul>
            {comments?.map((c: IComment) => (
               <li key={c.id}>
                  <strong>{c.author?.name ?? 'Неизвестный'}</strong>: {c.text}
               </li>
            ))}
         </ul>
         <textarea value={text} rows={3} onChange={(e) => setText(e.target.value)} />
         <button onClick={() => addComment.mutate()} disabled={!text.trim()}>
            Добавить
         </button>
      </div>
   );
}