import fs from 'node:fs';
import path from 'node:path';
import ExcelJS from 'exceljs';
import { db } from '../database/db.js';

const reportsDir = process.env.REPORTS_DIR || path.resolve('reports');

export async function exportReport({ start, end }) {
  fs.mkdirSync(reportsDir, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Teras RM POS';
  workbook.created = new Date();

  addTransactionsSheet(workbook, start, end);
  addRevenueSheet(workbook, start, end);
  addBestSellerSheet(workbook, start, end);
  addPaymentSheet(workbook, start, end);

  const safeRange = start === end ? start : `${start}_to_${end}`;
  const filePath = path.join(reportsDir, `report-${safeRange}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

function addTransactionsSheet(workbook, start, end) {
  const sheet = workbook.addWorksheet('Transactions');
  sheet.columns = [
    { header: 'Time', key: 'time', width: 20 },
    { header: 'Invoice', key: 'invoice_number', width: 18 },
    { header: 'Menu', key: 'menu_name', width: 24 },
    { header: 'Size', key: 'size', width: 10 },
    { header: 'Qty', key: 'qty', width: 8 },
    { header: 'Harga', key: 'price', width: 12 },
    { header: 'Diskon', key: 'discount', width: 12 },
    { header: 'Total', key: 'total', width: 12 },
    { header: 'Pembayaran', key: 'payment_method', width: 14 }
  ];

  const rows = db.prepare(`
    SELECT
      t.created_at AS time,
      t.invoice_number,
      i.menu_name,
      i.size,
      i.qty,
      i.price,
      t.discount_amount AS discount,
      i.total,
      t.payment_method
    FROM transaction_items i
    JOIN transactions t ON t.id = i.transaction_id
    WHERE date(t.created_at) BETWEEN date(?) AND date(?)
    ORDER BY datetime(t.created_at), i.id
  `).all(start, end);

  rows.forEach((row) => sheet.addRow(row));
  styleSheet(sheet);
}

function addRevenueSheet(workbook, start, end) {
  const sheet = workbook.addWorksheet('Revenue Summary');
  sheet.columns = [
    { header: 'Tanggal', key: 'date', width: 14 },
    { header: 'Transaksi', key: 'transactions', width: 12 },
    { header: 'Subtotal', key: 'subtotal', width: 14 },
    { header: 'Diskon', key: 'discount', width: 14 },
    { header: 'Total', key: 'total', width: 14 }
  ];
  db.prepare(`
    SELECT
      date(created_at) AS date,
      COUNT(*) AS transactions,
      SUM(subtotal) AS subtotal,
      SUM(discount_amount) AS discount,
      SUM(total) AS total
    FROM transactions
    WHERE date(created_at) BETWEEN date(?) AND date(?)
    GROUP BY date(created_at)
    ORDER BY date(created_at)
  `).all(start, end).forEach((row) => sheet.addRow(row));
  styleSheet(sheet);
}

function addBestSellerSheet(workbook, start, end) {
  const sheet = workbook.addWorksheet('Best Seller');
  sheet.columns = [
    { header: 'Menu', key: 'menu_name', width: 28 },
    { header: 'Qty', key: 'qty', width: 10 },
    { header: 'Total', key: 'total', width: 14 }
  ];
  db.prepare(`
    SELECT i.menu_name, SUM(i.qty) AS qty, SUM(i.total) AS total
    FROM transaction_items i
    JOIN transactions t ON t.id = i.transaction_id
    WHERE date(t.created_at) BETWEEN date(?) AND date(?)
    GROUP BY i.menu_name
    ORDER BY qty DESC, total DESC
  `).all(start, end).forEach((row) => sheet.addRow(row));
  styleSheet(sheet);
}

function addPaymentSheet(workbook, start, end) {
  const sheet = workbook.addWorksheet('Cash vs QRIS');
  sheet.columns = [
    { header: 'Pembayaran', key: 'payment_method', width: 16 },
    { header: 'Transaksi', key: 'transactions', width: 12 },
    { header: 'Total', key: 'total', width: 14 }
  ];
  db.prepare(`
    SELECT payment_method, COUNT(*) AS transactions, SUM(total) AS total
    FROM transactions
    WHERE date(created_at) BETWEEN date(?) AND date(?)
    GROUP BY payment_method
    ORDER BY payment_method
  `).all(start, end).forEach((row) => sheet.addRow(row));
  styleSheet(sheet);
}

function styleSheet(sheet) {
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9C7A8' } };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
}
