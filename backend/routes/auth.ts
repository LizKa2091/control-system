import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'dev_refresh_secret';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

function signAccessToken(payload: object) {
   return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}
function signRefreshToken(payload: object) {
   return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

function setRefreshCookie(res: Response, token: string) {
   res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
   });
}

router.post('/register', async (req: Request, res: Response) => {
   const { email, password, role } = req.body;
   if (!email || !password)
      return res.status(400).json({ message: 'email и password обязательны' });

   const existing = await prisma.user.findUnique({ where: { email } });
   if (existing)
      return res.status(409).json({ message: 'Пользователь уже существует' });

   const passwordHash = await bcrypt.hash(password, 10);
   const user = await prisma.user.create({
      data: { email, passwordHash, role: (role as any) || 'engineer' }
   });

   const accessToken = signAccessToken({ sub: user.id, role: user.role });
   const refreshToken = signRefreshToken({ sub: user.id });

   setRefreshCookie(res, refreshToken);

   const { passwordHash: _, ...publicUser } = user as any;
   return res.status(201).json({ accessToken, user: publicUser });
});

router.post('/login', async (req: Request, res: Response) => {
   const { email, password } = req.body;
   if (!email || !password)
      return res.status(400).json({ message: 'email и password обязательны' });

   const user = await prisma.user.findUnique({ where: { email } });
   if (!user)
      return res.status(401).json({ message: 'Неверные учетные данные' });

   const ok = await bcrypt.compare(password, user.passwordHash);
   if (!ok) return res.status(401).json({ message: 'Неверные учетные данные' });

   const accessToken = signAccessToken({ sub: user.id, role: user.role });
   const refreshToken = signRefreshToken({ sub: user.id });

   setRefreshCookie(res, refreshToken);

   const { passwordHash: _, ...publicUser } = user as any;
   return res.json({ accessToken, user: publicUser });
});

router.post('/refresh', async (req: Request, res: Response) => {
   const token = req.cookies?.refreshToken;
   if (!token) return res.status(401).json({ message: 'Нет refresh токена' });

   try {
      const payload = jwt.verify(token, REFRESH_SECRET) as any;
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user)
         return res.status(401).json({ message: 'Пользователь не найден' });

      const newAccessToken = signAccessToken({ sub: user.id, role: user.role });
      return res.json({ accessToken: newAccessToken });
   } catch (err) {
      return res
         .status(401)
         .json({ message: 'Неверный или просроченный refresh токен' });
   }
});

router.post('/logout', (req: Request, res: Response) => {
   res.clearCookie('refreshToken');
   return res.json({ ok: true });
});

router.get('/me', authMiddleware, (req: Request, res: Response) => {
   return res.json({ user: req.authUser });
});

export default router