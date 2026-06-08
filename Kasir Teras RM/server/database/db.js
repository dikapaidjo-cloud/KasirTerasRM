import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const dbPath = process.env.DB_PATH || path.resolve('server/database/teras-rm.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name TEXT NOT NULL,
      regular_price INTEGER DEFAULT 0,
      medium_price INTEGER DEFAULT 0,
      large_price INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE,
      payment_method TEXT,
      subtotal INTEGER,
      discount_type TEXT,
      discount_value INTEGER,
      discount_amount INTEGER DEFAULT 0,
      total INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transaction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER,
      menu_id INTEGER,
      menu_name TEXT,
      size TEXT,
      qty INTEGER,
      price INTEGER,
      total INTEGER,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
    );
  `);

  seedDefaults();
}

function seedDefaults() {
  const count = db.prepare('SELECT COUNT(*) AS total FROM categories').get().total;
  if (count > 0) return;

  const categories = ['Signature', 'Classic', 'Non Coffee', 'Food', 'Snack'];
  const insertCategory = db.prepare('INSERT INTO categories (name) VALUES (?)');
  const insertMenu = db.prepare(`
    INSERT INTO menus (category_id, name, regular_price, medium_price, large_price)
    VALUES (?, ?, ?, ?, ?)
  `);

  const seed = db.transaction(() => {
    const ids = Object.fromEntries(categories.map((name) => [name, insertCategory.run(name).lastInsertRowid]));
    [
      [ids.Signature, 'Es Kopi Susu Teras', 12000, 14000, 16000],
      [ids.Signature, 'Caramel Latte', 15000, 18000, 21000],
      [ids.Classic, 'Americano', 10000, 12000, 14000],
      [ids.Classic, 'Cafe Latte', 13000, 15000, 18000],
      [ids['Non Coffee'], 'Matcha Latte', 14000, 16000, 19000],
      [ids['Non Coffee'], 'Lemon Tea', 9000, 11000, 13000],
      [ids.Food, 'Nasi Goreng Teras', 18000, 0, 0],
      [ids.Food, 'Mie Goreng', 16000, 0, 0],
      [ids.Snack, 'Pisang Goreng', 10000, 0, 0],
      [ids.Snack, 'Kentang Goreng', 12000, 0, 0]
    ].forEach((row) => insertMenu.run(...row));
  });

  seed();
}
