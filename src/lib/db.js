import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Remote database (Turso / libSQL) when DATABASE_URL is set, local SQLite otherwise.
// The same exports serve both backends; every function is async.
const REMOTE_URL = process.env.DATABASE_URL || '';
const remote = REMOTE_URL.startsWith('libsql://');
const client = remote
  ? createClient({ url: REMOTE_URL, authToken: process.env.DATABASE_AUTH_TOKEN })
  : null;

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!remote) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const local = remote
  ? null
  : (() => {
      const db = new Database(path.join(DATA_DIR, 'shop.db'));
      db.pragma('journal_mode = WAL');
      db.pragma('foreign_keys = ON');
      db.exec(SCHEMA);
      return db;
    })();

const SCHEMA = `
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
`;

// No demo seed data — the shop owner adds real listings via the admin dashboard (/admin).

let schemaReady = null;
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = client
      .executeMultiple(SCHEMA)
      .then(() => {})
      .catch((err) => {
        schemaReady = null;
        throw err;
      });
  }
  return schemaReady;
}

function rowToObject(row, columns) {
  if (Array.isArray(row)) return Object.fromEntries(columns.map((c, i) => [c, row[i]]));
  if (row instanceof Map) return Object.fromEntries(row);
  return { ...row };
}

export async function listProperties({ q = '', status = '', minPrice = '', maxPrice = '' } = {}) {
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
  if (remote) {
    await ensureSchema();
    const res = await client.execute({ sql, args });
    return res.rows.map((r) => rowToObject(r, res.columns));
  }
  return local.prepare(sql).all(...args);
}

export async function getProperty(id) {
  if (remote) {
    await ensureSchema();
    const res = await client.execute({ sql: 'SELECT * FROM properties WHERE id = ?', args: [id] });
    return res.rows.length ? rowToObject(res.rows[0], res.columns) : null;
  }
  return local.prepare('SELECT * FROM properties WHERE id = ?').get(id);
}

export async function createProperty(p) {
  const sql = `
    INSERT INTO properties (title, type, status, price, city, address, bedrooms, bathrooms, area, image_url, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const args = [p.title, p.type, p.status, p.price, p.city, p.address, p.bedrooms, p.bathrooms, p.area, p.image_url, p.description];
  if (remote) {
    await ensureSchema();
    const res = await client.execute({ sql, args });
    return getProperty(res.lastInsertRowid);
  }
  const info = local.prepare(sql).run(...args);
  return getProperty(info.lastInsertRowid);
}

export async function updateProperty(id, p) {
  const sql = `
    UPDATE properties SET title = ?, type = ?, status = ?, price = ?, city = ?,
      address = ?, bedrooms = ?, bathrooms = ?, area = ?, image_url = ?, description = ?
    WHERE id = ?
  `;
  const args = [p.title, p.type, p.status, p.price, p.city, p.address, p.bedrooms, p.bathrooms, p.area, p.image_url, p.description, id];
  if (remote) {
    await ensureSchema();
    await client.execute({ sql, args });
    return getProperty(id);
  }
  local.prepare(sql).run(...args);
  return getProperty(id);
}

export async function deleteProperty(id) {
  if (remote) {
    await ensureSchema();
    await client.execute({ sql: 'DELETE FROM properties WHERE id = ?', args: [id] });
    return;
  }
  local.prepare('DELETE FROM properties WHERE id = ?').run(id);
}

export async function createInquiry({ propertyId, name, phone, email = '', message = '' }) {
  const sql = 'INSERT INTO inquiries (property_id, name, phone, email, message) VALUES (?, ?, ?, ?, ?)';
  const args = [propertyId, name, phone, email, message];
  if (remote) {
    await ensureSchema();
    const res = await client.execute({ sql, args });
    return res.lastInsertRowid;
  }
  return local.prepare(sql).run(...args).lastInsertRowid;
}

export async function listInquiries() {
  const sql = `
    SELECT i.*, p.title AS property_title
    FROM inquiries i LEFT JOIN properties p ON p.id = i.property_id
    ORDER BY i.created_at DESC, i.id DESC
  `;
  if (remote) {
    await ensureSchema();
    const res = await client.execute(sql);
    return res.rows.map((r) => rowToObject(r, res.columns));
  }
  return local.prepare(sql).all();
}

export async function deleteInquiry(id) {
  if (remote) {
    await ensureSchema();
    await client.execute({ sql: 'DELETE FROM inquiries WHERE id = ?', args: [id] });
    return;
  }
  local.prepare('DELETE FROM inquiries WHERE id = ?').run(id);
}

export default local;
