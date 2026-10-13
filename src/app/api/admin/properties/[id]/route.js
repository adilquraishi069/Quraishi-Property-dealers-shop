import { deleteProperty, updateProperty } from '../../../../../lib/db';
import { isAdmin, unauthorized } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';

function buildPayload(p = {}) {
  return {
    title: String(p.title || '').trim().slice(0, 200),
    type: ['house', 'apartment', 'land', 'shop', 'commercial'].includes(p.type) ? p.type : 'house',
    status: p.status === 'rent' ? 'rent' : 'sale',
    price: Math.max(0, Math.round(Number(p.price) || 0)),
    city: String(p.city || '').trim().slice(0, 120),
    address: String(p.address || '').trim().slice(0, 200),
    bedrooms: Math.max(0, Number(p.bedrooms) || 0),
    bathrooms: Math.max(0, Number(p.bathrooms) || 0),
    area: Math.max(0, Number(p.area) || 0),
    image_url: String(p.image_url || '').trim().slice(0, 500),
    description: String(p.description || '').trim().slice(0, 3000),
  };
}

export async function PUT(request, { params }) {
  if (!(await isAdmin())) return unauthorized();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const property = await updateProperty(params.id, buildPayload(body));
  if (!property) return Response.json({ error: 'Property not found' }, { status: 404 });
  return Response.json({ ok: true, property });
}

export async function DELETE(_request, { params }) {
  if (!(await isAdmin())) return unauthorized();
  await deleteProperty(params.id);
  return Response.json({ ok: true });
}
