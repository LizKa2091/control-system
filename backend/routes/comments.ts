import { Router, Request, Response } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/project/:projectId', async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const comments = await prisma.comment.findMany({
    where: { projectId },
    include: {
      author: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(comments);
});

router.post('/', async (req: Request, res: Response) => {
  const { projectId, defectId, userId, text, content } = req.body as {
    projectId?: string;
    defectId?: string;
    userId?: string;
    text?: string;
    content?: string;
  };

  const bodyText = typeof text === 'string' && text.trim().length
    ? text.trim()
    : typeof content === 'string' && content.trim().length
      ? content.trim()
      : null;

  if (!bodyText) {
    return res.status(400).json({ error: 'Text is required (field "text" or "content")' });
  }
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const data: any = {
      text: bodyText,
      author: { connect: { id: userId } },
      user: { connect: { id: userId } },
    };

    if (projectId) {
      data.project = { connect: { id: projectId } };
    }
    if (defectId) {
      data.defect = { connect: { id: defectId } };
    }

    const comment = await prisma.comment.create({
      data,
      include: {
        author: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        defect: { select: { id: true, title: true } },
      },
    });

    return res.status(201).json(comment);
  } catch (err) {
    console.error('Failed to create comment:', err);
    return res.status(500).json({
      error: 'Failed to create comment',
      ...(err instanceof Error ? { details: err.message } : {}),
    });
  }
});

export default router;