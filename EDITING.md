# Editing the screener yourself (question wording, etc.)

You asked the right question. Yes — you can open the project, type your changes, and push them. Here's the safe way to do it.

Use **VS Code** (the free lightweight editor: https://code.visualstudio.com). If you have the big **"Visual Studio"** instead, the steps are similar but the menus differ — honestly, for these plain web files VS Code is simpler, and the terminal commands at the bottom work no matter which editor you use.

---

## Where the question wording lives

All questions are in **`index.html`**. Each question appears in **two places you must keep in sync**:

```html
<svg class="question-speaker" onclick="speakText('I read more slowly than most people I know.')" ...>
    ...
</svg>
<span>I read more slowly than most people I know.</span>
```

- The **`<span>…</span>`** is what people **read** on screen.
- The **`speakText('…')`** is what the **read-aloud voice** says.

Change **both** so the screen and the audio match.

### ⚠️ The one rule that will bite you: no apostrophes inside `speakText('…')`

The read-aloud text is wrapped in single quotes `'…'`. An apostrophe (`'`) inside it ends the text early and breaks that question. So in the **speakText** version, spell it out:

- write **`I cannot tell`** (not `I can't tell`)
- write **`the word I am reaching for`** (not `I'm reaching for`)

The on-screen **`<span>`** is fine with apostrophes — `can't`, `I'm`, etc. all work there. This is why you'll see the two versions worded slightly differently on purpose.

### What NOT to touch
- Don't change `name="q5"` or `value="1"` on the answer buttons — those drive the scoring.
- Don't change the number of answer options.
- Just change the words inside `<span>…</span>` and inside `speakText('…')`.

*(If you want to add or remove a whole question, or change the scoring, that's a bigger change — better to ask Claude, because the question numbers and the category list in `ida-style.js` have to line up.)*

---

## Step by step in VS Code

1. **Open the folder:** VS Code → **File → Open Folder…** → pick
   `C:\Users\bg657\Documents\Claude\adult-dyslexia-survey`.
2. In the file list on the left, click **`index.html`**.
3. **Find your question:** press **Ctrl+F**, type a few words of it, Enter.
4. Edit the **`<span>`** text and the matching **`speakText('…')`** text (remember: no apostrophes in speakText).
5. **Save:** **Ctrl+S**.

### See your change before publishing
- Open **Terminal → New Terminal** in VS Code and run:
  ```bash
  python server.py
  ```
- Open **http://localhost:5000** in your browser and check it reads and looks right. Press **Ctrl+C** in the terminal to stop the server when done.

---

## Getting your change into the repo (and live)

### Easiest — VS Code's Source Control panel (buttons, no typing commands)
1. Click the **Source Control** icon in the left bar (three dots joined by lines / a branch icon). You'll see your changed files.
2. Type a short message in the box at the top, e.g. *"Reword the reading-speed question."*
3. Click **✓ Commit**. If it asks to stage changes, say **Yes**.
4. Click **Sync Changes** (or **Push**) to send it to GitHub.

### Or — the terminal (works in any editor)
```bash
git add -A
git commit -m "Reword the reading-speed question"
git push
```

Once it's on GitHub, if the site is connected to Cloudflare Pages (see [DEPLOY.md](DEPLOY.md)), your change goes **live automatically in about a minute**. Nothing else to do.

---

## If something looks broken after an edit
- A question's audio does nothing → you probably left an apostrophe inside `speakText('…')`. Find it and spell the word out.
- The page looks unstyled → you may have accidentally changed the top `<link rel="stylesheet" …>` line or a filename. Undo with **Ctrl+Z**.
- When in doubt, you can always undo everything you haven't pushed and start over — or ask Claude to take a look.
