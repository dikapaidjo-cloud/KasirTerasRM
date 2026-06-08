import { db } from '../database/db.js';

export function listCategories(_req, res) {
  res.json(db.prepare('SELECT * FROM categories ORDER BY id').all());
}

export function createCategory(req, res) {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ message: 'Nama kategori wajib diisi' });
  const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
  res.status(201).json(db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid));
}

export function updateCategory(req, res) {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ message: 'Nama kategori wajib diisi' });
  const result = db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, req.params.id);
  if (!result.changes) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
  res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id));
}

export function deleteCategory(req, res) {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.status(204).end();
}
