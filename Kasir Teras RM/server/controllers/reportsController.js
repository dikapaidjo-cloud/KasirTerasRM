import { db } from '../database/db.js';
import { exportReport } from '../exports/excel.js';

export function dailyReport(req, res) {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const rows = db.prepare(`
    SELECT
      date(created_at) AS date,
      COUNT(*) AS transactions,
      COALESCE(SUM(subtotal), 0) AS subtotal,
      COALESCE(SUM(discount_amount), 0) AS discount,
      COALESCE(SUM(total), 0) AS total
    FROM transactions
    WHERE date(created_at) = date(?)
    GROUP BY date(created_at)
  `).all(date);
  res.json(rows[0] || { date, transactions: 0, subtotal: 0, discount: 0, total: 0 });
}

export async function exportReportController(req, res) {
  const start = req.query.start || new Date().toISOString().slice(0, 10);
  const end = req.query.end || start;
  const file = await exportReport({ start, end });
  res.download(file);
}
