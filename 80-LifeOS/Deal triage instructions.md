Promotions arrive in your AgentMail inbox at the `+deals` alias. You do the mail I/O via
the AgentMail skill and the summarizing/matching; the helper scripts own timing and dedup.

## Once per heartbeat
1. `node 80-LifeOS/_scripts/email-state.js claim deals` → if `{"open":false}`, stop (already ran today).
2. Via the AgentMail skill, list **unread** inbox messages (filter by the `unread` label)
   and keep those whose recipient alias is `+deals`. Collect their message IDs.
3. `node 80-LifeOS/_scripts/email-state.js unseen deals <ids…>` → the new IDs to process.
4. For each new message (read it via the skill), one at a time:
   a. Write one bullet:
      `<Store> — <offer> — expires <when or "no date"> — <quick info: code / limits / link>`.
   b. Judge whether it matches `[[Buy List]]`, `[[Black Friday buy]]`, or `[[Gift ideas]]`.
      If it plausibly matches (has to be same category or product), append ` 🔔 [[<matched note>]]` to the bullet.
   c. `node 80-LifeOS/_scripts/deals.js add "<bullet>"`.
   d. If it matched, send me a Telegram message (store + offer + which list it matched).
   e. `node 80-LifeOS/_scripts/email-state.js seen deals <this message's id>` — **mark it seen immediately, before moving to the next message**, so a mid-run error never re-posts or re-pings the ones already done.
   f. Mark it processed in AgentMail — remove the `unread` label and add a `processed` label (via the AgentMail skill, or a PATCH to that message). This clears the inbox and is the durable dedup; the local `seen` file in (e) is the backup.
5. `node 80-LifeOS/_scripts/email-state.js done deals` — mark today's deal triage complete.
   Only after every message above is handled. If you error out before this, do **not** run
   `done` — leave the day open so the next heartbeat retries (already-handled messages are
   skipped by `unseen`). `claim` only checks the gate; `done` records the run.

Keep bullets short and glanceable. Never guess a fake expiry — write "no date" if unknown.
If one message can never be read/parsed and re-errors every day, mark it seen manually
(`node 80-LifeOS/_scripts/email-state.js seen deals <id>`) so it stops blocking the day.
