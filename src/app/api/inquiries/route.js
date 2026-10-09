import { createInquiry, getProperty } from '../../../lib/db';
import { appendInquiryRow } from '../../../lib/googleSheets';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { propertyId, name, phone, email = '', message = '' } = body || {};
  if (!propertyId || !getProperty(propertyId)) {
    return Response.json({ error: 'Property not found' }, { status: 400 });
  }
  if (!name || !String(name).trim() || !phone || !String(phone).trim()) {
    return Response.json({ error: 'Name and phone are required.' }, { status: 400 });
  }

  const id = createInquiry({
    propertyId: Number(propertyId),
    name: String(name).trim().slice(0, 120),
    phone: String(phone).trim().slice(0, 40),
    email: String(email).trim().slice(0, 120),
    message: String(message).trim().slice(0, 2000),
  });

  // Fire-and-forget Google Sheets lead tracking — never blocks the inquiry.
  try {
    const property = getProperty(Number(propertyId));
    await appendInquiryRow([
      new Date().toISOString(),
      property?.title || `#${propertyId}`,
      String(name).trim(),
      String(phone).trim(),
      String(email).trim(),
      String(message).trim(),
      `/property/${propertyId}`,
    ]);
  } catch (err) {
    console.error('Google Sheets sync failed:', err.message);
  }

  return Response.json({ ok: true, id });
}
