import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes.js';
import { animalsRouter } from './routes/animals.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { weightRouter } from './routes/weight.routes.js';
import { reproductionRouter } from './routes/reproduction.routes.js';
import { tasksRouter } from './routes/tasks.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';

dotenv.config({ path: '../../.env.local' });

const app = express();
const PORT = process.env.API_PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/animals', animalsRouter);
app.use('/api/health-records', healthRouter);
app.use('/api/weight-records', weightRouter);
app.use('/api/reproduction', reproductionRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/users', usersRouter);
app.use('/api/dashboard', dashboardRouter);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🐄 Ganasoft API running on http://localhost:${PORT}`);
});

export default app;
