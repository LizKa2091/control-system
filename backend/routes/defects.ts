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

export default router;
