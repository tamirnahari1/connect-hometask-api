// Items handlers: transactional create/update, replace volumes, and clean error mapping.

const { validationResult } = require('express-validator');
const db = require('../db');

exports.createOrUpdateItem = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, code: 400, errors: errors.array() });

  const { id, name, categoryId, volumes } = req.body;

  try {
    const cat = db.prepare('SELECT id FROM categories WHERE id = ?').get(categoryId);
    if (!cat) return res.status(400).json({ success: false, code: 400, message: 'Category not found' });

    const tx = db.transaction(() => {
      let itemId = id;

      if (!itemId) {
        const info = db.prepare('INSERT INTO items (name, category_id) VALUES (?, ?)').run(name, categoryId);
        itemId = info.lastInsertRowid;
      } else {
        const exists = db.prepare('SELECT id FROM items WHERE id = ?').get(itemId);
        if (!exists) throw new Error('Item not found');
        db.prepare('UPDATE items SET name = ?, category_id = ? WHERE id = ?').run(name, categoryId, itemId);
        db.prepare('DELETE FROM items_volumes WHERE item_id = ?').run(itemId);
      }

      const insVol = db.prepare('INSERT INTO items_volumes (item_id, value, price) VALUES (?, ?, ?)');
      for (const v of volumes) {
        if (typeof v?.value !== 'string' || !v.value.trim()) throw new Error('Invalid volume.value');
        if (typeof v?.price !== 'number' || !(v.price > 0)) throw new Error('Invalid volume.price');
        insVol.run(itemId, v.value.trim(), v.price);
      }
      return itemId;
    });

    const newId = tx();
    const out = db.prepare('SELECT value, price FROM items_volumes WHERE item_id = ? ORDER BY id').all(newId);
    return res.json({ success: true, code: 200, data: { id: newId, name, volumes: out } });
  } catch (e) {
    const msg = String(e.message || '');
    if (msg === 'Item not found') {
      return res.status(404).json({ success: false, code: 404, message: 'Item not found' });
    }
    if (msg.includes('UNIQUE') && msg.includes('items.name')) {
      return res.status(400).json({ success: false, code: 400, message: 'Item name must be unique' });
    }
    if (msg.includes('UNIQUE') && msg.includes('items_volumes')) {
      return res.status(400).json({ success: false, code: 400, message: 'Volume price must be unique per item' });
    }
    return res.status(400).json({ success: false, code: 400, message: 'Bad request' });
  }
};

exports.listItems = (req, res) => {
  const q = (req.query.q || '').trim();
  const sql = q
    ? 'SELECT id, name, category_id FROM items WHERE name LIKE ? ORDER BY id'
    : 'SELECT id, name, category_id FROM items ORDER BY id';
  const params = q ? [`%${q}%`] : [];
  const items = db.prepare(sql).all(...params);
  return res.json({ success: true, code: 200, data: { items } });
};

exports.getItemById = (req, res) => {
  const id = Number(req.params.id);
  const item = db.prepare('SELECT id, name, category_id FROM items WHERE id = ?').get(id);
  if (!item) return res.status(404).json({ success: false, code: 404, message: 'Item not found' });
  const volumes = db.prepare('SELECT value, price FROM items_volumes WHERE item_id = ? ORDER BY id').all(id);
  return res.json({ success: true, code: 200, data: { ...item, volumes } });
};

exports.searchItemsAndCategories = (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ success: false, code: 400, message: 'q is required' });
  const categories = db.prepare('SELECT id, name FROM categories WHERE name LIKE ? ORDER BY id').all(`%${q}%`);
  const items = db.prepare('SELECT id, name, category_id FROM items WHERE name LIKE ? ORDER BY id').all(`%${q}%`);
  return res.json({ success: true, code: 200, data: { categories, items } });
};
