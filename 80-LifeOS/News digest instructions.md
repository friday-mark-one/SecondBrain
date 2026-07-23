# News digest instructions (for Friday)

Newsletters arrive at the `+news` alias. You do the mail I/O via the AgentMail skill and
the extract/dedup/summarize; the helpers own timing and delivery.

## Once per heartbeat
1. `node 80-LifeOS/_scripts/email-state.js claim news 10` → if `{"open":false}`, stop (before
   10:00 local, or already ran today).
2. Via the AgentMail skill, list **unread** `+news` messages (filter by the `unread` label); collect their IDs.
3. `node 80-LifeOS/_scripts/email-state.js unseen news <ids…>` → the new IDs to process.
4. Read those emails and build the digest **body** (topic-grouped), writing it to a temp
   file (e.g. `/tmp/news-digest.md`):
   - Extract each story: headline, a short tldr, article link, source.
   - **Skip sponsored/ad items** ("SPONSORED", "Together with…", "Presented by…", "Ad", affiliate blurbs).
   - **Dedup**: merge the same story across newsletters into one bullet listing all sources; drop intra-source repeats.
   - **Link rules (CRITICAL):**
     * TLDR newsletters use tracking redirect links (`links.tldrnewsletter.com/xxxx`). **Use those as-is** —
       do NOT replace them with `https://tldr.tech` or any other generic fallback. The tracking links work
       (they 302-redirect to the real article).
     * If the email renders an explicit href/URL (e.g. `https://example.com/article`), use that.
     * If a story has no link at all, **omit** the `[headline]()` entirely — just write the headline as
       plain text. Never invent or substitute a placeholder URL.
   - Group by topic (choose topics from the content). Format each bullet:
     `- [headline](link) — tldr  (Source A, Source B)`. Use the source's own headline+blurb
     as-is when it has one; keep each tldr **between 3 & 10 lines**. No `📰`/date
     title line — `publish` adds those.
5. If there is at least one story: `node 80-LifeOS/_scripts/news.js publish /tmp/news-digest.md`.
   (Zero stories after filtering → skip publish; no empty digest.)
6. `node 80-LifeOS/_scripts/email-state.js seen news <processed ids…>`, then mark each processed message in AgentMail — remove the `unread` label and add a `processed` label (via the skill, or a PATCH per message). AgentMail labels are the durable dedup; the local `seen` file is the backup.
7. `node 80-LifeOS/_scripts/email-state.js done news` — mark today's news pass complete. Do
   this **last**, only after the steps above succeed (including a clean pass that found zero
   stories but still marked its messages processed). If anything errors before this, do **not**
   run `done` — leave the day open and the next heartbeat retries automatically. `claim` only
   checks the gate; `done` is what records the run, so a crashed or interrupted cycle no longer
   burns the whole day.
