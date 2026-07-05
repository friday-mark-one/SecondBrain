# News digest instructions (for Friday)

Newsletters arrive at the `+news` alias. You do the mail I/O via the AgentMail skill and
the extract/dedup/summarize; the helpers own timing and delivery.

## Once per heartbeat
1. `node memory/_scripts/email-state.js claim news 10` → if `{"open":false}`, stop (before
   10:00 local, or already ran today).
2. Via the AgentMail skill, list **unread** `+news` messages (filter by the `unread` label); collect their IDs.
3. `node memory/_scripts/email-state.js unseen news <ids…>` → the new IDs to process.
4. Read those emails and build the digest **body** (topic-grouped), writing it to a temp
   file (e.g. `/tmp/news-digest.md`):
   - Extract each story: headline, a short tldr, article link, source.
   - **Skip sponsored/ad items** ("SPONSORED", "Together with…", "Presented by…", "Ad", affiliate blurbs).
   - **Dedup**: merge the same story across newsletters into one bullet listing all sources; drop intra-source repeats.
   - Group by topic (choose topics from the content). Format each bullet:
     `- [headline](link) — tldr  (Source A, Source B)`. Use the source's own headline+blurb
     as-is when it has one; keep each tldr **< 7 lines**. Omit the link if none. No `📰`/date
     title line — `publish` adds those.
5. If there is at least one story: `node memory/_scripts/news.js publish /tmp/news-digest.md`.
   (Zero stories after filtering → skip publish; no empty digest.)
6. `node memory/_scripts/email-state.js seen news <processed ids…>`, then mark each processed message in AgentMail — remove the `unread` label and add a `processed` label (via the skill, or a PATCH per message). AgentMail labels are the durable dedup; the local `seen` file is the backup.
