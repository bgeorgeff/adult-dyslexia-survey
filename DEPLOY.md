# Deploying the screener + turning on email capture

Plain-English, click-by-click. You do this once. After that, every `git push` auto-updates the live site.

There are three jobs:
1. **Rotate your Resend API key** (the old one was pasted in chat, so it must be replaced).
2. **Put the site on Cloudflare Pages** (this gives it a live web address).
3. **Paste the new key into Cloudflare** so the "Join the list" box actually saves emails to Resend.

---

## 1. Rotate your Resend API key — and split it into two

Your old key is compromised. It also turned out to be the **only** key on the account, shared by
this survey AND the **Learn Anything** app's two notification emails (`notify-new-user`,
`send-feedback` — see that project's `CLAUDE.md`). One shared key means rotating it for one project
silently breaks the other. Fix that now by creating **two** keys instead of one:

1. Go to **https://resend.com** and log in → **API Keys** (left menu).
2. Delete the old key (⋯ or trash-can on its row → **Delete**/**Revoke** → confirm). *(If you already
   did this, skip to step 3.)*
3. Click **Create API Key** → make **Key 1**:
   - **Name:** `dyslexia-screener`
   - **Permission:** **Full access** (this survey adds people to Resend Contacts, which needs more
     than "Sending access").
   - Click **Add**, then **Copy**. This one goes into **Cloudflare** (step 3 below) — not urgent
     until you've done step 2 and have a Cloudflare project to paste it into.
4. Click **Create API Key** again → make **Key 2**:
   - **Name:** `learn-anything`
   - **Permission:** **Sending access** (Learn Anything only sends emails — never touches Contacts —
     so this narrower, safer permission is enough).
   - **Domain:** leave as **All Domains** (Learn Anything sends from two different addresses, and
     restricting to one could silently break the other).
   - Click **Add**, then **Copy**. This one goes into **Supabase**, for the Learn Anything project —
     see that project's `CLAUDE.md` for the exact steps (Settings → Edge Functions → Secrets →
     `RESEND_API_KEY`). Do this one **soon**, since Learn Anything is live and its notification
     emails go silent until it's updated.
   - ⚠️ **Neither key goes in chat or email — ever.** Paste each one only into its own dashboard
     (Cloudflare or Supabase). If you ever lose one, just delete it and make another.

---

## 2. Put the site on Cloudflare Pages

First the code needs to be on GitHub (it lives at https://github.com/bgeorgeff/adult-dyslexia-survey). If your latest changes aren't pushed yet, see [EDITING.md](EDITING.md) for how to commit + push (or ask Claude to do it).

1. Go to **https://dash.cloudflare.com** → left menu **Workers & Pages**.
2. Click **Create** → **Pages** tab → **Connect to Git**.
3. Pick the **adult-dyslexia-survey** repository → **Begin setup**.
4. Build settings — this is a plain static site, so leave them empty:
   - **Framework preset:** `None`
   - **Build command:** *(leave blank)*
   - **Build output directory:** `/`
5. Click **Save and Deploy**. In ~1 minute you get a live address like `https://adult-dyslexia-survey.pages.dev`.

*(Later, to put it on `dyslexia.help/dyslexia-test-for-adults` for SEO, we move these files into your Astro site — that's a separate step. The `.pages.dev` address is perfect for testing capture right now.)*

---

## 3. Paste the key into Cloudflare (this switches capture on)

1. Still in Cloudflare: **Workers & Pages** → click your new **adult-dyslexia-survey** project.
2. Click **Settings** → **Variables and secrets** (older dashboards call it "Environment variables").
3. Click **Add**.
   - **Type:** **Secret** (encrypted — important for an API key)
   - **Variable name:** `RESEND_API_KEY`  ← type it exactly, all caps
   - **Value:** paste **Key 1** (`dyslexia-screener`) from step 1. Do NOT use Key 2 here — that one's
     for Learn Anything/Supabase, not this project.
   - Make sure it's applied to **Production** (and Preview if offered).
   - Click **Save**.
4. **Redeploy so the key takes effect:** go to the **Deployments** tab → on the latest deployment click **⋯** → **Retry deployment** (or just push any commit).

> Optional: if you want these signups grouped into a specific Resend **Audience**, create one in Resend, copy its ID, and add a second Cloudflare variable named `RESEND_AUDIENCE_ID` (this one can be a plain variable, not a secret). If you skip it, contacts still land in your Resend account's Contacts list.

---

## 4. Test it end-to-end

1. Open your live `.pages.dev` address.
2. Complete the screener, reach the results page, type an email into **Join the list**, click it.
3. You should see **"You're on the list!"**
4. In **Resend → Contacts**, confirm the email appears.

If you instead see *"Sorry — something went wrong,"* it's almost always one of: the key wasn't saved as `RESEND_API_KEY` (check spelling), or you didn't redeploy after adding it (step 3.4). Fix and retry.

---

## How the pieces fit (for reference)

- `functions/api/subscribe.js` — a tiny Cloudflare function that receives the email and calls Resend. **Your key lives only in Cloudflare's settings; it is never in the code or the browser.**
- `ida-style.js` — the results page sends the email to `/api/subscribe` and also keeps a local backup, so a signup is never lost even if the network hiccups.
- Locally (`python server.py`) the capture will always show the error message — that's expected, because the Cloudflare function only runs once the site is on Cloudflare.
