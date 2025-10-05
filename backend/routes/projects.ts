import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/', async (_req, res) => {
   const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
   });
   res.json(projects);
});

router.post('/', async (req, res) => {
   const { name, status } = req.body;

   const project = await prisma.project.create({
      data: { name, status }
   });

   res.status(201).json(project);
});

router.put('/:id', async (req, res) => {
   const { id } = req.params;
   const { name, status } = req.body;

   const project = await prisma.project.update({
      where: { id },
      data: { name, status }
   });

   res.json(project);
});

router.delete('/:id', async (req, res) => {
   const { id } = req.params;
   await prisma.project.delete({ where: { id } });
   res.json({ id });
});

export default router;