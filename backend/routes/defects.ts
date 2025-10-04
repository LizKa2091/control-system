import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/', async (req, res) => {
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
   res.json(defects);
});

router.post('/', async (req, res) => {
   const { title, description, priority, projectId, assigneeId, attachments } =
      req.body;
   const userId = req.authUser?.id;

   const defect = await prisma.defect.create({
      data: {
         title,
         description,
         priority,
         projectId,
         assigneeId,
         createdById: userId,
         attachments: {
            create:
               attachments?.map((a: { name: string }) => ({ name: a.name })) ||
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

   res.status(201).json(defect);
});

router.put('/:id', async (req, res) => {
   const { id } = req.params;
   const { title, description, priority, assigneeId, projectId, status } =
      req.body;

   const defect = await prisma.defect.update({
      where: { id },
      data: { title, description, priority, assigneeId, projectId, status },
      include: {
         project: true,
         createdBy: true,
         assignee: true,
         attachments: true,
         comments: true
      }
   });

   res.json(defect);
});

router.delete('/:id', async (req, res) => {
   const { id } = req.params;
   await prisma.defect.delete({ where: { id } });
   res.json({ id });
});

router.post('/:id/comments', async (req, res) => {
   const { id } = req.params;
   const { text } = req.body;
   const userId = req.authUser?.id;

   const comment = await prisma.comment.create({
      data: {
         text,
         defectId: id,
         authorId: userId
      },
      include: { author: true }
   });

   res.status(201).json(comment);
});

router.put('/:id/advance', async (req, res) => {
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
            orderBy: { createdAt: 'asc' }
         }
      }
   });
   if (!defect) return res.status(404).json({ message: 'Defect not found' });

   const transitions: Record<string, string | null> = {
      new: 'in_progress',
      in_progress: 'review',
      review: 'closed',
      closed: null
   };

   const nextStatus = transitions[defect.status];
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

   res.json(updated);
});

export default router;
