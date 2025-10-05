import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash('Password123!', 10);

  const [engineer, manager, lead] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'engineer@example.com' },
      update: {},
      create: { email: 'engineer@example.com', name: 'Engineer User', passwordHash: pass, role: Role.engineer },
    }),
    prisma.user.upsert({
      where: { email: 'manager@example.com' },
      update: {},
      create: { email: 'manager@example.com', name: 'Manager User', passwordHash: pass, role: Role.manager },
    }),
    prisma.user.upsert({
      where: { email: 'lead@example.com' },
      update: {},
      create: { email: 'lead@example.com', name: 'Lead User', passwordHash: pass, role: Role.lead },
    }),
  ]);

  const project = await prisma.project.upsert({
    where: { id: '1', name: 'Жилой комплекс "Солнечный"' },
    update: {},
    create: {
      name: 'Жилой комплекс "Солнечный"',
      status: 'planned'
    },
  });

  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: engineer.id },
      { projectId: project.id, userId: manager.id },
    ],
    skipDuplicates: true,
  });

  await prisma.defect.createMany({
    data: [
      {
        id: '00000000-0000-0000-0000-000000000001',
        title: 'Трещина в фундаменте',
        description: 'Тестовый дефект',
        priority: 'high',
        status: 'new',
        projectId: project.id,
        createdById: engineer.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
    ],
  });

  console.log('Seed finished — users/project/defect created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
