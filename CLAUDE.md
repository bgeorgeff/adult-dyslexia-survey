# Adult Dyslexia Survey — Project Context for Claude

This file gives Claude full context about the project, decisions made, and history across all sessions. Read this at the start of every session.

**Claude instructions**: During every session, update this file whenever a deployment target changes, a bug is fixed, a new feature is added, or any architectural decision is made. Do not wait until the end — update as changes happen.

---

## What This App Is

**Adult Dyslexia Assessment Survey** is a static, frontend-only interactive survey that helps adults self-assess for signs of dyslexia. Built with accessibility-first design — every question has a speaker icon that reads the text aloud using the browser's Web Speech API, so users with reading difficulty can take the assessment by ear.

**Live URL:** Not yet deployed publicly (last active March 2026)
**GitHub repo:** https://github.com/bgeorgeff/adult-dyslexia-survey
**Local path:** `C:\Users\bg657\Documents\Claude\adult-dyslexia-survey`
**Origin:** Originally built on Replit; pulled local June 2026 to fold into the dyslexia.help ecosystem.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (no framework) |
| Text-to-speech | Browser Web Speech API |
| Local dev server | `server.py` (Python, for previewing locally) |
| Hosting | None yet — designed for any static host (Cloudflare Pages, Netlify, GitHub Pages) |
| Build step | None required |

---

## File Structure

**2026-07-21 restructure — the screener is now THE tool; Survey 1 is archived.**

```
adult-dyslexia-survey/
├── index.html              # THE screener (was ida-style-screener.html; promoted 2026-07-21)
├── ida-style.css           # Screener styling — warm cream/teal/coral; @font-face Lexend; comfort panel
├── ida-style.js            # Screener logic — TTS, scoring, Resend capture, evidence base, comfort toggle
├── functions/
│   └── api/subscribe.js    # Cloudflare Pages Function — POST /api/subscribe → Resend (key server-side)
├── fonts/                  # Self-hosted Lexend woff2 (400/600/700) — the "Easy-read" comfort font
├── archive/
│   ├── characteristics-survey.html  # Survey 1 (was index.html) — retired, unlinked
│   ├── styles.css                   # Survey 1 styling — purple/cyan/pink gradient
│   └── script.js                    # Survey 1 logic (has the old category-map bug)
├── DEPLOY.md               # Non-dev walkthrough: rotate Resend key, Cloudflare Pages, env var, test
├── EDITING.md              # Non-dev walkthrough: edit question wording in VS Code + git push
├── server.py               # Local Python dev server for preview
├── .claude/launch.json     # Preview-server config (python server.py, port 5000)
├── results_categories.png  # Reference screenshot of category breakdown
├── results_full.png        # Reference screenshot of full results page
├── replit.md               # Original Replit-generated project overview (kept for context)
├── attached_assets/        # Asset folder
└── CLAUDE.md               # This file
```

**2026-07-22 build (verified in browser):**
- **Resend lead capture wired.** `functions/api/subscribe.js` (Cloudflare Pages Function) receives the
  email and adds it to Resend via `POST https://api.resend.com/contacts` (global endpoint; optional
  `RESEND_AUDIENCE_ID` uses the older `/audiences/{id}/contacts`). Key lives ONLY in the Cloudflare
  env var `RESEND_API_KEY` (a Secret) — never in code/git/browser. Front end (`ida-style.js` email
  handler) POSTs to `/api/subscribe`, disables the button while sending, shows a friendly error on
  failure, and keeps a `localStorage` backup so no signup is lost. Locally (`python server.py`) capture
  always shows the error path — expected, since the Function only runs on Cloudflare.
- **Reading-comfort toggle.** A "Reading comfort" button opens a panel with four controls — Text size
  (Normal/Large/Largest → scales `html` font-size), Spacing (Normal/Relaxed), Font (Default/Easy-read =
  self-hosted **Lexend**), Background tint (Cream/Blue/Peach/Grey). Prefs are stored in `localStorage`
  (`dyslexiaComfortPrefs`) and applied as `data-*` attributes on `<html>` by a small inline `<head>`
  script BEFORE first paint (no flash). CSS drives everything off those attributes; `--app-font` var
  swaps the typeface. Verified: toggle opens, all four controls apply + persist across reload, Lexend
  woff2 files load 200, no console errors.
- **Action pending for Bob:** rotate the Resend key (it was pasted in chat), deploy this repo to
  Cloudflare Pages, and set `RESEND_API_KEY` there — full click-by-click steps are in DEPLOY.md.
  Capture only goes live after that.

**Why Survey 1 was retired:** its 32 items came from a Davis-style "Common Characteristics"
handout (not a validated instrument) — poor discriminant validity (video games, athletic,
"street smarts", sensitive to others' emotions) plus unfalsifiable "either X or the opposite"
items that inflate every score. It also had a real bug: `script.js` category map was misaligned
with the HTML and dropped the whole "Time and Spatial Awareness" category, so its results
breakdown was wrong. Kept in `archive/` for reference, not deleted.

### The Screener (`index.html`) — the single public tool

Originally the "IDA-style Quick Screener" (Survey 2, added June 2026); promoted to `index.html`
and expanded 2026-07-21. **No published test's wording is copied — every item is original.**
Item design mirrors the domains of validated adult self-report instruments (ARHQ, Vinegrad,
Tamboer & Vorst) and the phonological-deficit literature.

- **22 scored items across 7 domains** (reading history, phonological/"sounding out",
  orthographic, word retrieval, working memory, written expression, time/direction), 4-point
  Likert (Rarely/Sometimes/Often/Almost Always). 0-indexed scoring so all-"Rarely" = 0% and
  all-"Almost Always" = 100%. Bands: **Few Signs ≤30%, Some Signs 31–65%, Many Signs ≥66%.**
- **2026-07-21 additions:** a phoneme-manipulation item ("play with the sounds in a word…") —
  the core dyslexia deficit and a deliberate tie-in to the **pp-assessment** app; a navigation
  item in Time and Direction; and an **optional family-history background item**
  (`name="familyHistory"`, Yes/Not sure/No) that is **NOT scored** (excluded from progress via
  `input[name^="q"]`) but surfaced as context on the results page (dyslexia is strongly
  hereditary). `totalQuestions = 22` and the `categories` map in `ida-style.js` were updated to match.
- **Evidence-base footer** (`<footer class="evidence">`, always visible/crawlable): "The research
  behind this screener" + a collapsible reference list with **verified links** — IDA 2025
  definition, BDA adult signs, Lefly & Pennington 2000 (ARHQ), Tamboer & Vorst 2015,
  Melby-Lervåg et al. 2012 — plus a medical disclaimer. Good for user trust AND for the E-E-A-T
  signals Google needs to rank health-adjacent (YMYL) content.
- **Email capture** is still the `localStorage` placeholder (`INTEGRATION POINT` in `ida-style.js`).
  Next step: wire to **Resend** (decided 2026-07-21 — see Strategic Role).
- Verified end-to-end in the browser 2026-07-21: real clicks advance progress, scoring + all 7
  category percentages compute correctly, family-history note + evidence footer render, no console errors.

---

## Key Architecture Decisions

- **Frontend only, no backend** — no user data ever leaves the browser. Privacy is part of the value prop for adults nervous about a dyslexia self-assessment.
- **Vanilla JS, no framework** — small bundle, direct DOM control for screen-reader compatibility, no build pipeline.
- **TTS on click, not hover** — earlier versions used hover-to-speak; switched to click because hover triggered TTS accidentally while users were reading.
- **Sticky header with title + subtitle visible at all times** — orientation aid for dyslexic users so they always know where they are.
- **Cache-busting headers** — `server.py` and `index.html` both have anti-caching directives so updates show immediately.
- **Color-coded results page** with a key and tuned score thresholds.

---

## Deployment

No deploy pipeline yet. To preview locally:
```bash
cd "C:\Users\bg657\Documents\Claude\adult-dyslexia-survey"
python server.py
```

To push code changes to GitHub:
```bash
git add -A
git commit -m "your message"
git push
```

---

## Strategic Role

This is part of the **dyslexia.help ecosystem**. Same playbook as Multi-Clipboard and CheckPlease — a free, useful tool that drives traffic to dyslexia.help and feeds the email list.

**Decisions locked 2026-07-21 (planning session):**
- **Lead with the screener**, retire Survey 1 (done).
- **Align items to validated instruments + cite them** (done — see evidence-base footer).
- **Lead capture via Resend** (Bob already has it, with dyslexia.help verified as sender). Plan:
  a Cloudflare Pages Function `functions/api/subscribe.js` holds the key server-side and adds the
  contact to a Resend Audience (optionally mirror to Supabase). Front end POSTs to `/api/subscribe`.
  **The Resend API key must NEVER be committed** — it lives only in the Cloudflare env var
  `RESEND_API_KEY`. Key was pasted in chat 2026-07-21; Bob advised to rotate it and put the fresh
  one only in Cloudflare's secret field.
- **SEO deploy plan (both dyslexia apps):** one domain, two **subdirectory** pages with distinct,
  keyword-matched slugs, interlinked — NOT separate sites (splits authority), NOT one shared page
  (keyword cannibalization), NOT subdomains (weaker link-equity flow). Recommended:
  - Screener → `dyslexia.help/dyslexia-test-for-adults` (targets "do I have dyslexia" / "adult dyslexia test")
  - pp-assessment → `dyslexia.help/phonemic-awareness-test` (targets "phonemic/phonological awareness test")
  Each is a content-rich Astro landing page that launches the tool; the screener's medium/high
  results link to the PP app as the next step. Apps can be separate deploys served under
  dyslexia.help paths via Cloudflare routing — "same domain" ≠ "same codebase".

**Remaining TODO:**
- Wire Resend capture (replace the `localStorage` placeholder) + add Cloudflare Web Analytics.
- Deploy the screener into the dyslexia.help Astro site at `/dyslexia-test-for-adults`.
- Phase 2: one-question-at-a-time flow, reading-comfort toggle (font/size/spacing/tint),
  personalized results PDF (the lead magnet) + Resend nurture/LTD sequence, SEO support articles + schema.
- Full plan file: `C:\Users\bg657\.claude\plans\look-over-this-survey-indexed-backus.md`

---

## Bob's Preferences & Notes

- **Non-developer** — prefers plain English, step-by-step instructions
- Project was on **Replit** originally; the `replit.md` file is leftover context from there
- Bob's GitHub username: `bgeorgeff`
