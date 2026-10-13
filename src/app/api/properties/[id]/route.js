import { getProperty } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const property = await getProperty(params.id);
  if (!property) return Response.json({ error: 'Property not found' }, { status: 404 });
  return Response.json({ property });
}
