// Categories handlers: create with uniqueness, get-by-id with related items.
const { validationResult } = require('express-validator');
const db = require('../db');

exports.createCategory = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, code: 400, errors: errors.array() });
  }

  const trimmed = String(req.body.name || '').trim();
  try {
    const info = db.prepare('INSERT INTO categories (name) VALUES (?)').run(trimmed);
    return res.json({ success: true, code: 200, data: { id: info.lastInsertRowid, name: trimmed } });
  } catch (e) {
    const msg = String(e.message || '');
    if (msg.includes('UNIQUE') && msg.includes('categories.name')) {
      return res.status(400).json({ success: false, code: 400, message: 'Category name must be unique' });
    }
    return res.status(400).json({ success: false, code: 400, message: 'Bad request' });
  }
};

exports.getCategoryById = (req, res) => {
  const id = Number(req.params.id);
  const cat = db.prepare('SELECT id, name FROM categories WHERE id = ?').get(id);
  if (!cat) {
    return res.status(404).json({ success: false, code: 404, message: 'Category not found' });
  }
  const items = db.prepare('SELECT id, name FROM items WHERE category_id = ? ORDER BY id').all(id);
  return res.json({ success: true, code: 200, data: { category: { ...cat, items } } });
};
