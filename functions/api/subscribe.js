// Cloudflare Pages Function — POST /api/subscribe
// Receives an email from the screener's results page and adds it to Resend as a
// contact. The Resend API key stays server-side and is never sent to the browser.
//
// Set these in Cloudflare Pages → your project → Settings → Variables and Secrets:
//   RESEND_API_KEY      (required, "Secret")  – a Resend API key with Full access
//   RESEND_AUDIENCE_ID  (optional, plain var) – if set, adds the contact to that
//                                               audience; otherwise the account-wide
//                                               /contacts endpoint is used.
//
// Local note: this only runs on Cloudflare (or `npx wrangler pages dev`). The plain
// `python server.py` preview does NOT execute it, so a local submit will show the
// error path — that's expected until it's deployed.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.RESEND_API_KEY) {
    return json({ ok: false, error: 'server_not_configured' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  const email = (body && typeof body.email === 'string') ? body.email.trim() : '';
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'invalid_email' }, 422);
  }

  const audienceId = env.RESEND_AUDIENCE_ID;
  const url = audienceId
    ? 'https://api.resend.com/audiences/' + audienceId + '/contacts'
    : 'https://api.resend.com/contacts';

  let resp;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email, unsubscribed: false })
    });
  } catch (e) {
    return json({ ok: false, error: 'upstream_unreachable' }, 502);
  }

  if (resp.ok) {
    return json({ ok: true });
  }

  // Treat "already a contact" as success so a repeat submit isn't shown as an error.
  let detail = '';
  try { detail = JSON.stringify(await resp.json()); } catch (e) { /* ignore */ }
  if (resp.status === 409 || (resp.status === 422 && /already|exist/i.test(detail))) {
    return json({ ok: true, already: true });
  }

  return json({ ok: false, error: 'upstream_error' }, 502);
}
