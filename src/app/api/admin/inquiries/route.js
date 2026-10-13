import { deleteInquiry, listInquiries } from '../../../../lib/db';
import { isAdmin, unauthorized } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return Response.json({ inquiries: await listInquiries() });
}

export async function DELETE(request) {
  if (!(await isAdmin())) return unauthorized();
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 });
  await deleteInquiry(id);
  return Response.json({ ok: true });
}
