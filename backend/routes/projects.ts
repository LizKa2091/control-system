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

router.get('/:id', async (req, res) => {
   const { id } = req.params;

   const project = await prisma.project.findUnique({
      where: { id },
      include: {
         members: {
            include: {
               user: {
                  select: { id: true, name: true, email: true, role: true },
               },
            },
         },
         defects: true,
      },
   });

   if (!project) {
      return res.status(404).json({ error: 'Project not found' });
   }

   res.json({
      ...project,
      members: project.members.map((m) => m.user),
   });
});

router.put('/:id', async (req, res) => {
   const { id } = req.params;
   const { name, status, userId } = req.body;

   if (!userId) {
      return res.status(400).json({ error: 'userId is required to record project changes' });
   }

   const oldProject = await prisma.project.findUnique({ where: { id } });
   if (!oldProject) return res.status(404).json({ error: 'Project not found' });

   const updatedProject = await prisma.project.update({
      where: { id },
      data: { name, status },
   });

   const changes: any[] = [];
   if (oldProject.name !== updatedProject.name) {
      changes.push({
         projectId: id,
         userId,
         field: 'name',
         oldValue: oldProject.name,
         newValue: updatedProject.name,
      });
   }
   if (oldProject.status !== updatedProject.status) {
      changes.push({
         projectId: id,
         userId,
         field: 'status',
         oldValue: oldProject.status,
         newValue: updatedProject.status,
      });
   }

   if (changes.length > 0) {
      await prisma.projectChange.createMany({ data: changes });
   }

   res.json(updatedProject);
});

router.get('/:id/history', async (req, res) => {
   const { id } = req.params;
   const history = await prisma.projectChange.findMany({
      where: { projectId: id },
      orderBy: { changedAt: 'desc' },
      include: {
         user: { select: { id: true, name: true, email: true } },
      },
   });
   res.json(history);
});

router.delete('/:id', async (req, res) => {
   const { id } = req.params;
   await prisma.project.delete({ where: { id } });
   res.json({ id });
});

router.get('/:id/members', async (req, res) => {
   const { id } = req.params;

   const members = await prisma.projectMember.findMany({
      where: { projectId: id },
      include: {
         user: {
            select: { id: true, name: true, email: true, role: true },
         },
      },
   });

   res.json(members.map((m) => m.user));
});

router.post('/:id/members', async (req, res) => {
   const { id } = req.params;
   const { userId } = req.body;

   const existing = await prisma.projectMember.findUnique({
      where: {
         projectId_userId: {
            projectId: id,
            userId,
         },
      },
   });

   if (existing) {
      return res.status(400).json({ error: 'User already added to project' });
   }

   const newMember = await prisma.projectMember.create({
      data: { projectId: id, userId },
      include: {
         user: { select: { id: true, name: true, email: true, role: true } },
      },
   });

   res.status(201).json(newMember.user);
});

router.delete('/:id/members/:userId', async (req, res) => {
   const { id, userId } = req.params;

   await prisma.projectMember.delete({
      where: {
         projectId_userId: { projectId: id, userId },
      },
   });

   res.json({ success: true });
});

export default router;