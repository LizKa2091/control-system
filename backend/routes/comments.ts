import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/:defectId/comments', authMiddleware, async (req: Request, res: Response) => {
   try {
      const { defectId } = req.params;

      const comments = await prisma.comment.findMany({
         where: { defectId },
         include: { author: true },
         orderBy: { createdAt: 'asc' }
      });

      res.json(comments);
   } catch (err) {
      console.error('GET /comments error', err);
      res.status(500).json({ message: 'Server error' });
   }
});

router.post('/:defectId/comments', authMiddleware, async (req: Request, res: Response) => {
   try {
      const { defectId } = req.params;
      const { text } = req.body;
      const userId = req.authUser?.id;

      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      if (!text || !text.trim()) return res.status(400).json({ message: 'Текст комментария обязателен' });

      const comment = await prisma.comment.create({
         data: {
         text: text.trim(),
         defectId,
         authorId: userId
         },
         include: { author: true }
      });

      res.status(201).json(comment);
   } catch (err) {
      console.error('POST /comments error', err);
      res.status(500).json({ message: 'Server error' });
   }
});

export default router;