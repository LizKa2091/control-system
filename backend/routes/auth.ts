import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = '1h';

function signToken(payload: object) {
   return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

router.post('/register', async (req: Request, res: Response) => {
   const { email, password, role } = req.body as { email?: string; password?: string; role?: string };
   if (!email || !password) return res.status(400).json({ message: 'email и password обязательны' });

   const existing = await prisma.user.findUnique({ where: { email } });
   if (existing) return res.status(409).json({ message: 'Пользователь уже существует' });

   const passwordHash = await bcrypt.hash(password, 10);
   const user = await prisma.user.create({
      data: { email, passwordHash, role: (role as any) || 'engineer' }
   });

   const token = signToken({ sub: user.id, role: user.role });
   const { passwordHash: _, ...publicUser } = user as any;
   return res.status(201).json({ token, user: publicUser });
});

router.post('/login', async (req: Request, res: Response) => {
   const { email, password } = req.body as { email?: string; password?: string };
   if (!email || !password) return res.status(400).json({ message: 'email и password обязательны' });

   const user = await prisma.user.findUnique({ where: { email } });
   if (!user) return res.status(401).json({ message: 'Неверные учетные данные' });

   const ok = await bcrypt.compare(password, user.passwordHash);
   if (!ok) return res.status(401).json({ message: 'Неверные учетные данные' });

   const token = signToken({ sub: user.id, role: user.role });
   const { passwordHash: _, ...publicUser } = user as any;
   return res.json({ token, user: publicUser });
});

router.get('/me', authMiddleware, (req: Request, res: Response) => {
   return res.json({ user: req.authUser });
});

export default router;