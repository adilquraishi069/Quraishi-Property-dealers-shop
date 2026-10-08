import crypto from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'quraishi_admin';

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || '';
}

export function expectedToken() {
  return crypto.createHash('sha256').update(`${adminPassword()}|quraishi-property-dealers`).digest('hex');
}

export function checkPassword(pw) {
  const real = adminPassword();
  if (!real) return false;
  return typeof pw === 'string' && pw === real;
}

export async function isAdmin() {
  const store = cookies();
  return store.get(COOKIE_NAME)?.value === expectedToken();
}

export async function setSession() {
  const store = cookies();
  store.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const store = cookies();
  store.delete(COOKIE_NAME);
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
