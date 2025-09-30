import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma';

declare global {
   namespace Express {
      interface Request {
         authUser?: { id: string; email: string; role: string };
      }
   }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
   const auth = req.headers.authorization;
   if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

   const token = auth.slice(7);
   try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      req.authUser = { id: user.id, email: user.email, role: user.role };
      next();
   } catch (e) {
      return res.status(401).json({ message: 'Unauthorized' });
   }
}