# Clippings instructions (for Friday)

Engine: `80-LifeOS/_scripts/clip.js`. You classify and summarize; the engine does all
file writes, fetching, and state. Folder: `Clippings/` (also the target of the user's
Obsidian Web Clipper — clipper notes and Telegram saves live side by side; any note
without `status: digested` counts as unread).

## Saving a link (Telegram)

When a message is a bare URL, or "save/clip `<url>` [comment]", or "watch later `<url>`":

1. `node 80-LifeOS/_scripts/clip.js save --url "<url>" [--note "<their comment>"]`
   - The engine fetches page content (or YouTube title/channel + auto-caption
     transcript via yt-dlp) into the note at save time.
2. Relay the engine's confirmation line verbatim (`✓ clipped → [[title]]` /
   `duplicate: already clipped → [[…]]`).
3. If the save errors (paywall, dead link), say so and ask if they want a bare-link
   stub anyway — `save` on an unreachable URL fails rather than writing an empty note.

Do NOT route URLs through the capture.js inbox flow — links are clippings, not todos.

## Weekly digest (heartbeat, self-gating)

1. `node 80-LifeOS/_scripts/clip.js digest-claim` → `{"open":false}` → stop silently.
   (Opens Saturdays ≥ 09:00 local, once per day.)
2. `node 80-LifeOS/_scripts/clip.js list` → unread clippings as JSON. Empty list →
   run `digest-done`, stop silently (no empty digests, no message).
3. Read each listed note in full (content/transcript is already inside the note; only
   fetch the URL yourself if a note says no content was extracted).
4. Prepend ONE dated section to `Clippings/Clippings digest.md`, directly under the
   callout block (newest on top). Format per item:
   - `### [[<clip note name>]]` then one line `— <source domain> · saved <date> · <type>`
   - 2–4 sentence summary of the actual content (never just the title).
   - One verdict line: `**Worth a full read?** yes/no/skim — <because…>`.
   - If the user left a "Why saved" note, address it ("you saved this asking X — the answer is…").
5. `node 80-LifeOS/_scripts/clip.js mark --all` (or pass specific files if you
   deliberately skipped one — say why in the digest).
6. `node 80-LifeOS/_scripts/clip.js digest-done` — LAST, only after the note is written.
   An error before this leaves the day open and the next heartbeat retries.
7. Telegram: send the section's TL;DR — one line per item (title + verdict), plus
   "Full digest: Clippings digest".

## On demand

- "summarize my clippings" → run steps 2–7 immediately (skip the claim; don't run
  `digest-done` unless it's Saturday — an on-demand run mid-week shouldn't eat
  Saturday's gate, and `mark` already prevents double-processing).
- "summarize <url or clip name>" → summarize that one item in more depth (5–10
  sentences + key takeaways) straight to Telegram; mark it digested only if asked.

## Notes

- yt-dlp must be installed on this machine for YouTube transcripts
  (`brew install yt-dlp`). Without it, video clips save as link stubs and the digest
  should say "no transcript — needs a watch" instead of pretending to summarize.
- Never edit clip note bodies (they're the user's source material); the engine owns
  frontmatter status flips.
- The digest note is excluded from `list` by name — don't rename it.
