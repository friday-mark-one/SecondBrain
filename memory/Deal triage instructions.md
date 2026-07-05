Promotions arrive in your AgentMail inbox at the `+deals` alias. You do the mail I/O via
the AgentMail skill and the summarizing/matching; the helper scripts own timing and dedup.

## Once per heartbeat
1. `node memory/_scripts/email-state.js claim deals` → if `{"open":false}`, stop (already ran today).
2. Via the AgentMail skill, list inbox messages and keep those whose recipient alias is
   `+deals`. Collect their message IDs.
3. `node memory/_scripts/email-state.js unseen deals <ids…>` → the new IDs to process.
4. For each new message (read it via the skill), one at a time:
   a. Write one bullet:
      `<Store> — <offer> — expires <when or "no date"> — <quick info: code / limits / link>`.
   b. Judge whether it matches `[[Buy List]]`, `[[Black Friday buy]]`, or `[[Gift ideas]]`.
      If it plausibly matches, append ` 🔔 [[<matched note>]]` to the bullet.
   c. `node memory/_scripts/deals.js add "<bullet>"`.
   d. If it matched, send me a Telegram message (store + offer + which list it matched).
   e. `node memory/_scripts/email-state.js seen deals <this message's id>` — **mark it seen immediately, before moving to the next message**, so a mid-run error never re-posts or re-pings the ones already done.

Keep bullets short and glanceable. Never guess a fake expiry — write "no date" if unknown.
If one message can never be read/parsed and re-errors every day, mark it seen manually
(`node memory/_scripts/email-state.js seen deals <id>`) so it stops blocking the day.
