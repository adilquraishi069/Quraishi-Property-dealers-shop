import { createProperty, listProperties } from '../../../../lib/db';
import { isAdmin, unauthorized } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return Response.json({ properties: listProperties() });
}

export async function POST(request) {
  if (!(await isAdmin())) return unauthorized();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const p = body || {};
  if (!p.title || !String(p.title).trim()) return Response.json({ error: 'Title is required.' }, { status: 400 });
  if (!p.city || !String(p.city).trim()) return Response.json({ error: 'City is required.' }, { status: 400 });
  if (!p.price || Number(p.price) <= 0) return Response.json({ error: 'Price must be a positive number.' }, { status: 400 });

  const property = createProperty({
    title: String(p.title).trim().slice(0, 200),
    type: ['house', 'apartment', 'land', 'shop', 'commercial'].includes(p.type) ? p.type : 'house',
    status: p.status === 'rent' ? 'rent' : 'sale',
    price: Math.round(Number(p.price)),
    city: String(p.city).trim().slice(0, 120),
    address: String(p.address || '').trim().slice(0, 200),
    bedrooms: Math.max(0, Number(p.bedrooms) || 0),
    bathrooms: Math.max(0, Number(p.bathrooms) || 0),
    area: Math.max(0, Number(p.area) || 0),
    image_url: String(p.image_url || '').trim().slice(0, 500),
    description: String(p.description || '').trim().slice(0, 3000),
  });

  return Response.json({ ok: true, property });
}
