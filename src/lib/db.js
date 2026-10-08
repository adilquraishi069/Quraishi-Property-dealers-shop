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

const SAMPLES = [
  { title: '4-Bedroom Family House, Wazir Akbar Khan', type: 'house', status: 'sale', price: 95000000, city: 'Kabul', address: 'Wazir Akbar Khan, District 10', bedrooms: 4, bathrooms: 3, area: 320, image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80', description: 'Spacious family house in one of Kabul\u2019s most desirable neighborhoods. Private courtyard, generator backup and secure parking.' },
  { title: 'Modern 2-Bedroom Apartment, Shahr-e-Naw', type: 'apartment', status: 'sale', price: 42000000, city: 'Kabul', address: 'Shahr-e-Naw, District 4', bedrooms: 2, bathrooms: 2, area: 110, image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80', description: 'Bright, newly finished apartment with modern kitchen, elevator access and 24/7 water supply.' },
  { title: 'Commercial Shop, Chicken Street', type: 'shop', status: 'rent', price: 35000, city: 'Kabul', address: 'Chicken Street, District 1', bedrooms: 0, bathrooms: 1, area: 60, image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80', description: 'Prime street-front shop on the famous Chicken Street. Ideal for handicrafts, retail or a small showroom. Monthly rent.' },
  { title: 'Garden Villa, Karte Se', type: 'house', status: 'sale', price: 68000000, city: 'Kabul', address: 'Karte Se, District 5', bedrooms: 5, bathrooms: 4, area: 400, image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80', description: 'Elegant villa with a large walled garden, separate guest quarters and mountain views.' },
  { title: 'Furnished Office Space, Shahr-e-Naw', type: 'commercial', status: 'rent', price: 60000, city: 'Kabul', address: 'Shahr-e-Naw, District 4', bedrooms: 0, bathrooms: 2, area: 180, image_url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&q=80', description: 'Ready-to-use furnished office with meeting room, internet and staff parking. Monthly rent.' },
  { title: 'Residential Plot, Paghman Road', type: 'land', status: 'sale', price: 12000000, city: 'Kabul', address: 'Paghman Road, District 9', bedrooms: 0, bathrooms: 0, area: 600, image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80', description: 'Flat, build-ready plot with clear deed documents on a fast-developing road. Great long-term investment.' },
  { title: 'Renovated 3-Bed House, Taimani', type: 'house', status: 'sale', price: 55000000, city: 'Kabul', address: 'Taimani, District 3', bedrooms: 3, bathrooms: 2, area: 200, image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80', description: 'Fully renovated home close to markets and schools. New wiring, plumbing and insulation throughout.' },
  { title: 'Cozy Studio Apartment, Kabul University Road', type: 'apartment', status: 'rent', price: 18000, city: 'Kabul', address: 'Kabul University Road, District 6', bedrooms: 1, bathrooms: 1, area: 45, image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80', description: 'Compact furnished studio, perfect for students or young professionals. Utilities included in rent.' },
];

function seed() {
  const insert = db.prepare(`
    INSERT INTO properties (title, type, status, price, city, address, bedrooms, bathrooms, area, image_url, description)
    VALUES (@title, @type, @status, @price, @city, @address, @bedrooms, @bathrooms, @area, @image_url, @description)
  `);
  const run = db.transaction(() => {
    for (const p of SAMPLES) insert.run(p);
  });
  run();
}

if (db.prepare('SELECT COUNT(*) AS n FROM properties').get().n === 0) seed();

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
