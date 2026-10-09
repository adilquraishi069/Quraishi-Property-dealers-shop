import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'shop.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'house',
    status TEXT NOT NULL DEFAULT 'sale',
    price INTEGER NOT NULL,
    city TEXT NOT NULL,
    address TEXT DEFAULT '',
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    area INTEGER DEFAULT 0,
    image_url TEXT DEFAULT '',
    description TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    message TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// No demo seed data — the shop owner adds real listings via the admin dashboard (/admin).

export function listProperties({ q = '', status = '', minPrice = '', maxPrice = '' } = {}) {
  const where = [];
  const args = [];
  if (q) {
    const like = `%${q}%`;
    where.push('(title LIKE ? OR city LIKE ? OR address LIKE ?)');
    args.push(like, like, like);
  }
  if (status === 'sale' || status === 'rent') {
    where.push('status = ?');
    args.push(status);
  }
  if (minPrice !== '' && minPrice !== undefined && minPrice !== null) {
    where.push('price >= ?');
    args.push(Number(minPrice));
  }
  if (maxPrice !== '' && maxPrice !== undefined && maxPrice !== null) {
    where.push('price <= ?');
    args.push(Number(maxPrice));
  }
  const sql = `SELECT * FROM properties ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC, id DESC`;
  return db.prepare(sql).all(...args);
}

export function getProperty(id) {
  return db.prepare('SELECT * FROM properties WHERE id = ?').get(id);
}

export function createProperty(p) {
  const info = db.prepare(`
    INSERT INTO properties (title, type, status, price, city, address, bedrooms, bathrooms, area, image_url, description)
    VALUES (@title, @type, @status, @price, @city, @address, @bedrooms, @bathrooms, @area, @image_url, @description)
  `).run(p);
  return getProperty(info.lastInsertRowid);
}

export function updateProperty(id, p) {
  db.prepare(`
    UPDATE properties SET title = @title, type = @type, status = @status, price = @price, city = @city,
      address = @address, bedrooms = @bedrooms, bathrooms = @bathrooms, area = @area, image_url = @image_url, description = @description
    WHERE id = @id
  `).run({ ...p, id });
  return getProperty(id);
}

export function deleteProperty(id) {
  db.prepare('DELETE FROM properties WHERE id = ?').run(id);
}

export function createInquiry({ propertyId, name, phone, email = '', message = '' }) {
  const info = db.prepare(
    'INSERT INTO inquiries (property_id, name, phone, email, message) VALUES (?, ?, ?, ?, ?)'
  ).run(propertyId, name, phone, email, message);
  return info.lastInsertRowid;
}

export function listInquiries() {
  return db.prepare(`
    SELECT i.*, p.title AS property_title
    FROM inquiries i LEFT JOIN properties p ON p.id = i.property_id
    ORDER BY i.created_at DESC, i.id DESC
  `).all();
}

export function deleteInquiry(id) {
  db.prepare('DELETE FROM inquiries WHERE id = ?').run(id);
}

export default db;
