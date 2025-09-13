// SQLite schema (categories, items, items_volumes)
const Database = require('better-sqlite3');
const db = new Database('data.sqlite');

db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  category_id INTEGER NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS items_volumes (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  value   TEXT NOT NULL,
  price   REAL NOT NULL CHECK (price > 0),
  UNIQUE(item_id, price),
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);
`);

const seeded = db.prepare('SELECT COUNT(*) AS c FROM categories').get().c > 0;
if (!seeded) {
  const tx = db.transaction(() => {
    const insCat = db.prepare('INSERT INTO categories (name) VALUES (?);');
    const membershipsId = insCat.run('Memberships').lastInsertRowid;
    const punchcardsId  = insCat.run('Punch Cards').lastInsertRowid;

    const insItem = db.prepare('INSERT INTO items (name, category_id) VALUES (?, ?);');
    const insVol  = db.prepare('INSERT INTO items_volumes (item_id, value, price) VALUES (?, ?, ?);');

    const items = [
      { name: 'Gym Membership - Basic',   category_id: membershipsId,
        volumes: [['1 month', 129.00], ['3 months', 339.00], ['12 months', 999.00]] },
      { name: 'Gym Membership - Premium', category_id: membershipsId,
        volumes: [['1 month', 179.00], ['3 months', 479.00], ['12 months', 1399.00]] },
      { name: 'Family Membership',        category_id: membershipsId,
        volumes: [['12 months', 1899.00]] },
      { name: 'Student Membership',       category_id: membershipsId,
        volumes: [['1 month', 109.00], ['3 months', 299.00], ['12 months', 899.00]] },

      { name: 'Gym Access Punch Card',    category_id: punchcardsId,
        volumes: [['5 entries', 199.00], ['10 entries', 349.00], ['20 entries', 599.00]] },
      { name: 'Class Pass',               category_id: punchcardsId,
        volumes: [['5 entries', 179.00], ['10 entries', 329.00]] },
      { name: 'Personal Training',        category_id: punchcardsId,
        volumes: [['1 session', 180.00], ['5 sessions', 800.00]] },
      { name: 'Partner Training',         category_id: punchcardsId,
        volumes: [['1 session', 260.00], ['5 sessions', 1150.00]] },

      { name: 'Locker Rental',            category_id: membershipsId,
        volumes: [['1 month', 25.00], ['3 months', 60.00], ['12 months', 200.00]] },
      { name: 'Towel Service',            category_id: membershipsId,
        volumes: [['1 month', 15.00], ['12 months', 150.00]] },
    ];

    for (const it of items) {
      const itemId = insItem.run(it.name, it.category_id).lastInsertRowid;
      for (const [value, price] of it.volumes) {
        insVol.run(itemId, value, price);
      }
    }
  });
  tx();
}

module.exports = db;
