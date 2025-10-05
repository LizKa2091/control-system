import { Router } from 'express';
import prisma from '../prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/:defectId/comments', authMiddleware, async (req, res) => {
   const { defectId } = req.params;

   const comments = await prisma.comment.findMany({
      where: { defectId },
      include: { author: true },
      orderBy: { createdAt: 'asc' }
   });

   res.json(comments);
});

router.post('/:defectId/comments', authMiddleware, async (req, res) => {
   const { defectId } = req.params;
   const { text } = req.body;

   if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Текст комментария обязателен' });
   }

   const comment = await prisma.comment.create({
      data: {
         text: text.trim(),
         defectId,
         authorId: req.authUser?.id
      },
      include: { author: true }
   });

   res.json(comment);
});

export default router;
