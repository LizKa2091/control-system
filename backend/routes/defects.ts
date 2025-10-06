import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { authMiddleware } from '../middleware/auth';
import { stringify } from 'csv-stringify/sync';
import ExcelJS from 'exceljs';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
   try {
      const defects = await prisma.defect.findMany({
         include: {
         project: true,
         createdBy: true,
         assignee: true,
         attachments: true,
         comments: {
            include: { author: true }
         }
         },
         orderBy: { createdAt: 'desc' }
      });
      return res.json(defects);
   } catch (err) {
      console.error('GET /defects error', err);
      return res.status(500).json({ message: 'Server error' });
   }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
   try {
      const { title, description, priority, projectId, assigneeId, attachments } = req.body;
      const userId = req.authUser?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      if (!title || !priority) return res.status(400).json({ message: 'title и priority обязательны' });

      const defect = await prisma.defect.create({
         data: {
         title,
         description,
         priority,
         projectId: projectId || null,
         assigneeId: assigneeId || null,
         createdById: userId,
         attachments: {
            create:
               attachments?.map((a: { name: string }) => ({ name: a.name })) ??
               []
         }
         },
         include: {
         project: true,
         createdBy: true,
         assignee: true,
         attachments: true,
         comments: true
         }
      });

      return res.status(201).json(defect);
   } catch (err) {
      console.error('POST /defects error', err);
      return res.status(500).json({ message: 'Server error' });
   }
});

router.get('/:id', async (req: Request, res: Response) => {
   try {
      const { id } = req.params;
      const defect = await prisma.defect.findUnique({
         where: { id },
         include: {
         project: true,
         createdBy: true,
         assignee: true,
         attachments: true,
         comments: {
            include: { author: true },
            orderBy: { createdAt: 'asc' } as any
         }
         }
      });

      if (!defect) return res.status(404).json({ message: 'Defect not found' });
      return res.json(defect);
   } catch (err) {
      console.error('GET /defects/:id error', err);
      return res.status(500).json({ message: 'Server error' });
   }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
   try {
      const { id } = req.params;
      const { title, description, priority, assigneeId, projectId, status } = req.body;

      const defect = await prisma.defect.update({
         where: { id },
         data: {
         title,
         description,
         priority,
         assigneeId: assigneeId || null,
         projectId: projectId || null,
         ...(status ? { status } : {})
         },
         include: {
         project: true,
         createdBy: true,
         assignee: true,
         attachments: true,
         comments: true
         }
      });

      return res.json(defect);
   } catch (err) {
      console.error('PUT /defects/:id error', err);
      return res.status(500).json({ message: 'Server error' });
   }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
   try {
      const { id } = req.params;
      await prisma.defect.delete({ where: { id } });
      return res.json({ id });
   } catch (err) {
      console.error('DELETE /defects/:id error', err);
      return res.status(500).json({ message: 'Server error' });
   }
});

router.post('/:id/comments', authMiddleware, async (req: Request, res: Response) => {
   try {
      const { id } = req.params;
      const { text } = req.body;
      const userId = req.authUser?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      if (!text) return res.status(400).json({ message: 'text обязательен' });

      const comment = await prisma.comment.create({
         data: {
         text,
         defectId: id,
         authorId: userId!
         },
         include: { author: true }
      });

      return res.status(201).json(comment);
   } catch (err) {
      console.error('POST /defects/:id/comments error', err);
      return res.status(500).json({ message: 'Server error' });
   }
});

router.put('/:id/advance', authMiddleware, async (req: Request, res: Response) => {
   try {
      const { id } = req.params;

      const defect = await prisma.defect.findUnique({
         where: { id },
         include: {
         project: true,
         assignee: true,
         createdBy: true,
         attachments: true,
         comments: {
            include: { author: true },
            orderBy: { createdAt: 'asc' } as any
         }
         }
      });
      if (!defect) return res.status(404).json({ message: 'Defect not found' });

      type DS = 'new' | 'in_progress' | 'review' | 'closed';
      const transitions: Record<DS, DS | null> = {
         new: 'in_progress',
         in_progress: 'review',
         review: 'closed',
         closed: null
      };

      const nextStatus = transitions[defect.status as DS];
      if (!nextStatus) {
         return res.status(400).json({ message: 'Defect is already closed' });
      }

      const updated = await prisma.defect.update({
         where: { id },
         data: { status: nextStatus },
         include: {
         project: true,
         createdBy: true,
         assignee: true,
         attachments: true,
         comments: { include: { author: true } }
         }
      });

      return res.json(updated);
   } catch (err) {
      console.error('PUT /defects/:id/advance error', err);
      return res.status(500).json({ message: 'Server error' });
   }
});

router.get('/export/csv', async (_req: Request, res: Response) => {
  try {
    const defects = await prisma.defect.findMany({
      include: {
        project: true,
        createdBy: true,
        assignee: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = defects.map((d) => ({
      ID: d.id,
      Заголовок: d.title,
      Описание: d.description || '',
      Приоритет: d.priority,
      Статус: d.status,
      Проект: d.project?.name || '',
      Автор: d.createdBy?.name || '',
      Исполнитель: d.assignee?.name || '',
      ДатаСоздания: d.createdAt.toISOString(),
    }));

    const csv = stringify(rows, { header: true, delimiter: ';' });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="defects.csv"');
    res.send(csv);
  } catch (err) {
    console.error('GET /defects/export/csv error', err);
    res.status(500).json({ message: 'Ошибка экспорта CSV' });
  }
});

router.get('/export/xlsx', async (_req: Request, res: Response) => {
  try {
    const defects = await prisma.defect.findMany({
      include: {
        project: true,
        createdBy: true,
        assignee: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Defects');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Заголовок', key: 'title', width: 30 },
      { header: 'Описание', key: 'description', width: 50 },
      { header: 'Приоритет', key: 'priority', width: 12 },
      { header: 'Статус', key: 'status', width: 15 },
      { header: 'Проект', key: 'project', width: 20 },
      { header: 'Автор', key: 'createdBy', width: 20 },
      { header: 'Исполнитель', key: 'assignee', width: 20 },
      { header: 'Дата создания', key: 'createdAt', width: 20 },
    ];

    defects.forEach((d) =>
      sheet.addRow({
        id: d.id,
        title: d.title,
        description: d.description || '',
        priority: d.priority,
        status: d.status,
        project: d.project?.name || '',
        createdBy: d.createdBy?.name || '',
        assignee: d.assignee?.name || '',
        createdAt: d.createdAt.toISOString().split('T')[0],
      })
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="defects.xlsx"'
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('GET /defects/export/xlsx error', err);
    res.status(500).json({ message: 'Ошибка экспорта Excel' });
  }
});

export default router;
