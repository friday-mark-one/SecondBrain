# Capture instructions (for Friday)

Engine: `memory/_scripts/capture.js`. You classify; the engine does all file writes.

## On any captured thought
1. Run `node memory/_scripts/capture.js routes` to get current destinations
   (note, type, category, hint, pinned). Prefer `pinned` notes; match on `hint`.
2. Decide the destination:
   - Grocery / recipe / meal items → use the meal-plan flow (see
     `memory/Meal plan instructions.md`), NOT capture.js.
   - Returns → `memory/Things to return.md`, under the store/carrier heading, as
     `- [ ] <item> @YYYY-MM-DD` (the last day it can be returned). Compute the absolute
     date if I give a window ("bought today, 30-day return").
   - Otherwise pick the best existing note. Only create a new one when nothing fits.
4. File it:
   - Existing: `node memory/_scripts/capture.js file --note "<Note>" --item "<text>"`
   - New: add `--type list|checklist|reference --category "<Cat>" --hint "<what goes here>"`
5. Relay the engine's confirmation line on Telegram, e.g.
   `✓ filed → [[Gyms to try]]. reply 'no' to move it`.
   - On `duplicate`, say it's already there. On `created`, mention the new note.
1. If you cannot confidently classify: do NOT guess. Ask one short question.

## Undo
If I reply "no" to your last confirmation, re-file that item to the corrected
note (file it to the new note; the old line can be removed by editing the note).

## Inbox sweep (heartbeat)
1. `node memory/_scripts/capture.js inbox-take` → returns and clears all Inbox lines.
2. Route + file each line per the steps above.
3. For any line you cannot classify, append it back to `memory/Inbox.md` and ask about
   it on Telegram.
4. Send one Telegram summary: "Filed N from Inbox: …".