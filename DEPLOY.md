# Deploying the screener + turning on email capture

Plain-English, click-by-click. You do this once. After that, every `git push` auto-updates the live site.

There are three jobs:
1. **Rotate your Resend API key** (the old one was pasted in chat, so it must be replaced).
2. **Put the site on Cloudflare Pages** (this gives it a live web address).
3. **Paste the new key into Cloudflare** so the "Join the list" box actually saves emails to Resend.

---

## 1. Rotate (replace) your Resend API key

Your old key is compromised. Kill it and make a new one.

1. Go to **https://resend.com** and log in.
2. In the left menu, click **API Keys**.
3. Find the old key in the list. Click the **⋯** (or trash-can) on its row → **Delete** / **Revoke** → confirm. It's now dead and can't be used by anyone.
4. Click **Create API Key** (top right).
   - **Name:** `dyslexia-screener`
   - **Permission:** choose **Full access** (adding contacts needs more than "Sending access").
   - Click **Add**.
5. Resend shows the new key **once** (starts with `re_...`). Click **Copy**.
   - ⚠️ **Do not paste it into chat or email.** The only place it goes is Cloudflare, in step 3. If you lose it, just delete it and make another — no harm done.

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
   - **Value:** paste the `re_...` key from step 1.
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
