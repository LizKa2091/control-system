import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const PORT = process.env.PORT || 3000;

type Role = 'engineer' | 'manager' | 'lead';

type User = {
  id: string
  email: string
  passwordHash: string
  role: Role
}

type PublicUser = Omit<User, 'passwordHash'>

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// In-memory store (replace with PostgreSQL + Prisma later)
const users = new Map<string, User>();
const passwordResetTokens = new Map<string, { userId: string; expiresAt: number }>();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = '1h';

function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...pub } = user;

  return pub;
}

async function hashPassword(plain: string) {
  const saltRounds = 10;

  return await bcrypt.hash(plain, saltRounds);
}

async function verifyPassword(plain: string, hash: string) {
  return await bcrypt.compare(plain, hash);
}

function authMiddleware(req: Request & { user?: PublicUser }, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = auth.slice('Bearer '.length);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.get(decoded.sub);

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = toPublicUser(user);
    next();
  } 
  catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body as { email?: string; password?: string; role?: Role };
    if (!email || !password) {
        return res.status(400).json({ message: 'email и password обязательны' });
    }

    const existing = Array.from(users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
        return res.status(409).json({ message: 'Пользователь уже существует' });
    }

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const user: User = { id, email, passwordHash, role: role || 'engineer' };
    users.set(id, user);

    const token = signToken({ sub: id, role: user.role });
    return res.status(201).json({ token, user: toPublicUser(user) });
  } 
  catch (e) {
    return res.status(500).json({ message: 'Ошибка регистрации' });
  }
})

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
        return res.status(400).json({ message: 'email и password обязательны' });
    }

    const user = Array.from(users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Неверные учетные данные' });

    const token = signToken({ sub: user.id, role: user.role });
    return res.json({ token, user: toPublicUser(user) });
  } 
  catch {
    return res.status(500).json({ message: 'Ошибка входа' });
  }
})

app.get('/api/auth/me', authMiddleware, (req: Request & { user?: PublicUser }, res: Response) => {
  return res.json({ user: req.user });
})

app.post('/api/auth/refresh', (req: Request, res: Response) => {
  try {
    const { token } = req.body as { token?: string };
    if (!token) {
        return res.status(400).json({ message: 'Токен обязателен' });
    }

    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as any;
    const user = users.get(decoded.sub)
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const newToken = signToken({ sub: user.id, role: user.role });
    return res.json({ token: newToken })
  } 
  catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
})

app.post('/api/auth/forgot', (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({ message: 'email обязателен' });
  }

  const user = Array.from(users.values()).find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    return res.status(200).json({ message: 'Если пользователь существует, письмо отправлено' });
  }

  const token = crypto.randomUUID();
  const expiresAt = Date.now() + 1000 * 60 * 15;
  passwordResetTokens.set(token, { userId: user.id, expiresAt });
  // В реальном приложении отправить email со ссылкой вида: https://app/reset?token=...
  return res.status(200).json({ message: 'Ссылка для сброса сгенерирована', token })
})

app.post('/api/auth/reset', async (req: Request, res: Response) => {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password) {
    return res.status(400).json({ message: 'token и password обязательны' });
  }

  const entry = passwordResetTokens.get(token);
  if (!entry || entry.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Токен недействителен' });
  }

  const user = users.get(entry.userId);
  if (!user) {
    return res.status(400).json({ message: 'Пользователь не найден' });
  }

  user.passwordHash = await hashPassword(password);
  passwordResetTokens.delete(token);
  return res.status(200).json({ message: 'Пароль обновлён' });
})

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
});