import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cron from 'node-cron';
import { initDatabase } from '../database/db.js';
import categoryRoutes from '../routes/categories.js';
import menuRoutes from '../routes/menus.js';
import transactionRoutes from '../routes/transactions.js';
import reportRoutes from '../routes/reports.js';
import { exportReport } from '../exports/excel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3000);

initDatabase();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'Teras RM POS' }));
app.use('/api/categories', categoryRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));

cron.schedule('59 23 * * *', async () => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    await exportReport({ start: today, end: today });
    console.log(`Daily report generated for ${today}`);
  } catch (error) {
    console.error('Failed to generate daily report', error);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Teras RM POS running on http://0.0.0.0:${port}`);
});
