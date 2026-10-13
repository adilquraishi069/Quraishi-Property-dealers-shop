import crypto from 'crypto';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

function b64url(str) {
  return Buffer.from(str).toString('base64url');
}

function isConfigured() {
  return Boolean(
    process.env.GOOGLE_SHEETS_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );
}

// Appends one row (array of values) to the configured Google Sheet using a
// service-account JWT. Returns { skipped: true } when credentials are missing.
export async function appendInquiryRow(values) {
  if (!isConfigured()) return { skipped: true };

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  }));
  const key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const signature = b64url(
    crypto.createSign('RSA-SHA256').update(`${header}.${payload}`).sign(key)
  );

  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${payload}.${signature}`,
    }),
  });
  if (!tokenRes.ok) throw new Error(`Google token request failed (${tokenRes.status})`);
  const { access_token } = await tokenRes.json();

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [values] }),
    }
  );
  if (!appendRes.ok) throw new Error(`Google Sheets append failed (${appendRes.status})`);
  return { skipped: false };
}
