import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db/prisma';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth';
import { authMiddleware } from './middleware/auth';
import defectsRouter from './routes/defects';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);

app.use('/api/defects', authMiddleware, defectsRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   console.log(`API listening on http://localhost:${PORT}`);
});
