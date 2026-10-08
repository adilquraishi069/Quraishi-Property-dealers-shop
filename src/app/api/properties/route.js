import { listProperties } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const sp = request.nextUrl.searchParams;
  const properties = listProperties({
    q: sp.get('q') || '',
    status: sp.get('status') || '',
    minPrice: sp.get('minPrice') || '',
    maxPrice: sp.get('maxPrice') || '',
  });
  return Response.json({ properties });
}
