import { db } from '../database/db.js';

const menuSelect = `
  SELECT menus.*, categories.name AS category_name
  FROM menus
  LEFT JOIN categories ON categories.id = menus.category_id
`;

export function listMenus(req, res) {
  const activeOnly = req.query.active !== 'false';
  const rows = db.prepare(`${menuSelect} ${activeOnly ? 'WHERE menus.is_active = 1' : ''} ORDER BY menus.name`).all();
  res.json(rows);
}

export function createMenu(req, res) {
  const payload = normalizeMenu(req.body);
  if (!payload.name) return res.status(400).json({ message: 'Nama menu wajib diisi' });
  const result = db.prepare(`
    INSERT INTO menus (category_id, name, regular_price, medium_price, large_price, is_active)
    VALUES (@category_id, @name, @regular_price, @medium_price, @large_price, @is_active)
  `).run(payload);
  res.status(201).json(db.prepare(`${menuSelect} WHERE menus.id = ?`).get(result.lastInsertRowid));
}

export function updateMenu(req, res) {
  const payload = normalizeMenu(req.body);
  if (!payload.name) return res.status(400).json({ message: 'Nama menu wajib diisi' });
  const result = db.prepare(`
    UPDATE menus
    SET category_id = @category_id,
        name = @name,
        regular_price = @regular_price,
        medium_price = @medium_price,
        large_price = @large_price,
        is_active = @is_active
    WHERE id = @id
  `).run({ ...payload, id: req.params.id });
  if (!result.changes) return res.status(404).json({ message: 'Menu tidak ditemukan' });
  res.json(db.prepare(`${menuSelect} WHERE menus.id = ?`).get(req.params.id));
}

export function deleteMenu(req, res) {
  db.prepare('DELETE FROM menus WHERE id = ?').run(req.params.id);
  res.status(204).end();
}

function normalizeMenu(body) {
  return {
    category_id: Number(body.category_id) || null,
    name: String(body.name || '').trim(),
    regular_price: Number(body.regular_price) || 0,
    medium_price: Number(body.medium_price) || 0,
    large_price: Number(body.large_price) || 0,
    is_active: body.is_active === false || body.is_active === 0 ? 0 : 1
  };
}
