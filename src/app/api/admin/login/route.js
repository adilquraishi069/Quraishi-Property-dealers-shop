import { checkPassword, setSession } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!checkPassword(body?.password)) {
    return Response.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  await setSession();
  return Response.json({ ok: true });
}
