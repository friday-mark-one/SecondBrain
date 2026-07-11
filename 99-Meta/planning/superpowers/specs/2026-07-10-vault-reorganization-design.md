# SecondBrain Vault Reorganization — Design

**Date:** 2026-07-10
**Status:** Approved design (rev 2), pending final spec review → implementation plan
**Vault:** `/Users/bgopalbaaskaran/workspace/projects/assistant/SecondBrain` (git-backed; Friday runs on a synced `openclaw` copy)

## 1. Goal & context

A large Notion export (~1300 markdown files + 36 `.base` databases) was imported into the
`Notion/` folder of an Obsidian vault that is **also an active AI-assistant workspace** (the
assistant is called **Friday**). The vault currently holds two disconnected worlds:

- **Friday's live system** — `agent-protocol/` (its constitution) and `memory/` (a working
  "life OS": capture.js router, Dataview-driven MOC, meal-plan engine, deals/news/expiry/returns
  automations, dated logs), *plus the user's actual data notes* (Todo, recipes, lists, etc.).
- **The Notion import** — dormant, deeply nested, no frontmatter, conceptually overlapping the
  above. The user does not actively touch most of it.

Plus loose clutter at the vault root: ~30 images/screenshots/PDFs (Notion attachments that landed
at root, embedded by notes via `![[…]]`) and a scratch-pad note.

**Objective:** design a single clean hierarchy for the *entire* corpus (nothing evicted, starting
fresh) that is easy for a human to navigate **and** safe for Friday to operate on — with a strict
separation between Friday's *engine* and the user's *data*.

## 2. Constraints & decisions (locked)

| Decision | Choice |
|---|---|
| Scope | Start fresh; reorganize everything. Evict nothing (all moves via `git mv`). |
| Organizing model | Hybrid: browse data by life-domain; one quarantined `90-Archive` (mirrored by domain) for the dormant import. |
| Naming | Numbered + shallow, **shell-safe** (no spaces/ampersands), ≤2 levels deep for active domains. |
| **Engine vs data** | **`80-LifeOS` holds ONLY Friday's engine** (protocols, scripts, instructions, templates, logs, config). All user data lives in domains `01`–`10`. |
| Engine rewire | **Central `paths.json`** in `_scripts/` maps logical names → vault-relative locations; scripts refactored to read it. |
| Capture behavior | `capture.js` scans the whole vault (minus `80/90/99/00`) for `type:`-tagged destinations; new-note creation + Inbox live under `01-Tasks`; logs stay in `80-LifeOS/logs`. |
| `agent-protocol/` | Moves into `80-LifeOS/`; `sync_workspace.sh` `MD_SOURCE` updated. |
| `.base` promotion | Promote **Reading List / Media** → `06-Learning` and **Health trackers** (BP readings, Top doctors) → `05-Health`. Archive the rest (functional). |
| Amazon work | **Promoted to live `03-Career`** (not archived). |
| Completed projects | **Promoted to live `07-Projects`** (not archived). |
| Task List import | Extract the **13 live tasks** (Status = To Do / Not started / Blocked) into `01-Tasks/Todo.md` as `- [ ]` items, deduped; the other 368 (Archive/Done/Not doing) stay in `90-Archive`. |
| Archive metadata | Folder-path exclusion; no mass-frontmatter injection. One `_index.md` per archive domain. |
| Attachments | All loose root images centralized to `99-Meta/Attachments`; wikilink embeds survive (filename-based). |
| Migration | On `main` directly. User pauses openclaw, transfers files to a mac mini, restarts it after. |

## 3. Target top-level structure

```
00-Dashboard/   Home + per-domain MOCs (navigation only)
01-Tasks/       Todo.md, Inbox.md, capture staging (Lists/ Checklists/ Reference/)
02-Personal/    identity, relationship, outfits, gifts + Travel/ + Media/ (movies, games, news, links)
03-Career/      work (Amazon + Snap, both LIVE), interview prep, public speaking
04-Finance/     ETF, day trading, bills, referral codes, comp
05-Health/      workouts, doctors ⭐, blood pressure ⭐, remedies, gyms, blood tests
06-Learning/    GaTech, reading + Media.base ⭐, GRE, piano, syllabus, test prep
07-Projects/    side projects (all LIVE), project ideas, AI/home automation, tech-to-watch
08-Food/        Recipes/, Meal Plan/, Items/ (pantry ×205), Buy List, Cookbook, cooking refs, Expiring Soon
09-Shopping/    Deals, shopping research, returns, wishlists (Black Friday, scents, snowboard…), gift ideas
10-Admin/       Housing, Vehicles, Immigration, Insurance, Tech/ (cheatsheets, setup)
80-LifeOS/      ENGINE ONLY — agent-protocol/, _scripts/, _templates/, logs/, _config.md, *instructions.md, MOC.md
90-Archive/     dormant Notion, mirrored by domain (Amazon + completed projects pulled OUT to live)
99-Meta/        Attachments/, planning/
```

Rules: ≤2 levels deep in active domains; ⭐ = promoted-live database. `80-LifeOS` keeps its own
internal structure but contains **no user data**.

## 4. Content mapping

### 4a. Notion import → domains / archive
| Current | New home |
|---|---|
| `Work/Amazon/*` (Bye, Ka11y, Neo, YJFL100) | **`03-Career` (live)** |
| `Work/Snap/H1B transfer`, `Interview prep/2020,2024`, `Misc/Amazon Interviewer` | `03-Career` |
| `Projects/*` (Digital Quarantine, Fintwit-bot, URL shortener) | **`07-Projects` (live)** |
| `Personal Home/ETF`, `Day trading`, `InvestingAtAmazon.pdf` | `04-Finance` |
| `Personal Home/Workouts` | `05-Health` |
| `Doctors/Top doctors` DB (base+rows) | `05-Health` ⭐ |
| `Misc/Blood Pressure` readings DBs (base+rows) | `05-Health` ⭐ |
| `Academic/GaTech` (+ Masters tasks.base) | `06-Learning` |
| `Reading List/Media` DB (base+rows) | `06-Learning` ⭐ |
| `Personal Home/B ❤️ M` (wedding/honeymoon), `Outfits`, personal `Misc` | `02-Personal` (MOC); bulk → `90-Archive/Personal` |
| `Cars/Genesis`, `Task List/Car` | `10-Admin/Vehicles` / archive |
| `International Transfer/L1B`, `US arrival`, `Passport renewal`, `US visitors medical insurance` | `10-Admin` (Immigration/, Insurance/); cross-link ← `03-Career` |
| `Task List/iTerm2`, `Misc/Macbook setup` | `10-Admin/Tech` |
| `Personal Home/Apartments` (4 rounds), `Home inventory` DB, `Bills` DB, `Interview prep/GRE` DB | `90-Archive/*` (done) |
| `Task List/*` — 13 live tasks (To Do/Not started/Blocked) | → `01-Tasks/Todo.md` (deduped) |
| `Task List/*` — remaining 368 (Archive/Done/Not doing) + `Task List.base` | `90-Archive` |

### 4b. Friday's `memory/` **data** → domains (engine machinery stays in `80-LifeOS`)
| Item(s) | New home |
|---|---|
| `Todo.md`, `Inbox.md` | `01-Tasks` |
| `Recipes/`, `Meal Plan/`, `Items/`, `Buy List.md`, `Cookbook.md`, `Cooking References.md`, `Expiring Soon.md`, `Protein rich foods` | `08-Food` |
| `Deals.md`, `Shopping research.md`, `Things to return.md`, `Fancy things`, `Laptop research`, `Scents to try`, `Snowboard research & buy`, `Gift ideas`, `Black Friday buy`, `Games to buy`, `Too poor to buy` | `09-Shopping` |
| `News.md`, `Gems` (watch-later links), `Movie & TV watchlist`, trips (India/Portland/Vegas/DC), `Before a trip`, `Flight booking tips`, `Adventure bucket list`, `Life goals`, `Ideal day`, `Personal facts`, `I will remember this`, `Habits to cultivate`, `Midnight ideas`, `Nothing to do`, `Random notes` | `02-Personal` (Travel/, Media/) |
| `Syllabus.md`, `Piano scores to learn`, `Honorlock test prep` | `06-Learning` |
| `AI automation projects`, `Hobby projects`, `Project ideas`, `Home automation`, `Tech to watch`, `Claude Code things to try` | `07-Projects` |
| `Blood tests taken`, `Cold remedies`, `Hairfall remedies`, `Gyms to try` | `05-Health` |
| `Public speaking notes` | `03-Career` |
| `Referral codes` | `04-Finance` |
| `Apartment addresses`, `Car exploration`, `screen`/`vim cheatsheet`, `Kodi addons` | `10-Admin` |

### 4c. Root & misc
| Current | New home |
|---|---|
| loose root images/screenshots/PDFs + Notion attachments | `99-Meta/Attachments` |
| `Bharath's scratch pad.md` | `00-Dashboard` |
| `docs/superpowers/specs/` (this doc) | `99-Meta/planning/` |

Anything not explicitly curated defaults to its domain under `90-Archive`. Nothing is deleted.

## 5. `80-LifeOS` — engine only, and the rewire

`80-LifeOS/` contains: `agent-protocol/` (moved in), `_scripts/` (+`commands/`), `_templates/`,
`logs/`, `_config.md`, `MOC.md`, and the instruction docs (`Capture`, `Meal plan`, `Deal triage`,
`News digest`). **No user data.**

### 5a. Central paths config
New `80-LifeOS/_scripts/paths.json`, resolved against the vault root (`__dirname/../..`), e.g.:
```jsonc
{
  "todo": "01-Tasks/Todo.md",
  "inbox": "01-Tasks/Inbox.md",
  "captureStaging": { "list": "01-Tasks/Lists", "checklist": "01-Tasks/Checklists", "reference": "01-Tasks/Reference" },
  "logs": "80-LifeOS/logs",
  "recipes": "08-Food/Recipes", "mealPlan": "08-Food/Meal Plan", "items": "08-Food/Items",
  "buyList": "08-Food/Buy List.md", "expiringSoon": "08-Food/Expiring Soon.md",
  "deals": "09-Shopping/Deals.md", "shoppingResearch": "09-Shopping/Shopping research.md",
  "returns": "09-Shopping/Things to return.md", "shoppingTracker": "09-Shopping/Shopping Tracker.md",
  "news": "02-Personal/Media/News.md",
  "scanExclude": ["80-LifeOS", "90-Archive", "99-Meta", "00-Dashboard", ".obsidian", ".git"]
}
```
A tiny `paths.js` helper loads it and resolves absolute paths; each script `require`s it.

### 5b. Per-script changes
- **`capture.js`** — scan root = vault root; walk domains, skip `scanExclude`; `Inbox` + new-note
  creation folders + `logs` come from config. (Real but bounded refactor; unit-testable via `routes`.)
- **`mealplan.js`** (+`commands/`) — `recipes`/`mealPlan`/`items`/`buyList` from config.
- **`deals.js`** — `deals` from config. **`news.js`** — `news` from config.
- **`notify-expiring.js`** — `items` from config. **`notify-returns.js`** — `returns` from config.
- **`vault_sweeper.py`** — read the same `paths.json` (`shoppingTracker`, scan root, log dir).
- **6 docs** (`agent-protocol/HEARTBEAT.md`, `AGENTS.md`, 4 `*instructions.md`) — update every
  `~/SecondBrain/memory/...` reference to the new `~/SecondBrain/80-LifeOS/...` and data-domain paths.
- **`MOC.md`** — `FROM "memory"` → `FROM "80-LifeOS"` (or switch to `WHERE type = …` vault-wide).
- **`.gitignore`** — `memory/_scripts/...` → `80-LifeOS/_scripts/...`.
- **`sync_workspace.sh`** — `MD_SOURCE` → `/Users/openclaw/SecondBrain/80-LifeOS/agent-protocol/`.

## 6. Archive strategy (`90-Archive/`)
- Reshelve into `90-Archive/{Personal,Career,Finance,Health,Learning,Projects,Admin,Task-List}/`.
- Flatten Notion's `*/New database/New database.base` wrappers → `.base` renamed to parent context.
- Excluded from graph + search (Obsidian "Excluded files" + graph filter) and from capture's scan.
- One `_index.md` per archive domain. No frontmatter injected into archived notes.
- **Shell-safe naming applies only to new top-level folders.** Archived Notion subfolder names
  (spaces/parens) are preserved as-is so `.base` files don't break.

## 7. `.base` databases (36)
- **Promoted live:** `Media` → `06-Learning`; `Blood Pressure` readings + `Top doctors` → `05-Health`.
- **Archived (functional):** the remaining ~33 (incl. Bills, Home inventory, apartments, GRE).
- Each base + its rows move as a **unit** so the base doesn't break.

## 8. Metadata schema (active notes only)
Superset-compatible with `capture.js` (`type`/`category`/`hint`/`pinned`):
```yaml
---
domain: tasks|personal|career|finance|health|learning|projects|food|shopping|admin
type:   note|list|checklist|reference|project|log
status: active|someday|done      # optional
tags: []
created: YYYY-MM-DD
---
```
Domain MOCs query by the `domain:` field, not folder path.

## 9. Dashboards (`00-Dashboard/`)
- `Home.md` — master map → each domain + key live notes (`Todo`, `Inbox`, `Meal Plan`).
- One index note per domain (Dataview `WHERE domain = "…"`).
- Friday's self-maintaining index moves to `80-LifeOS/MOC.md`.

## 10. Attachments (`99-Meta/Attachments/`)
- Centralize all ~30 loose root images/screenshots/PDFs here; repoint Obsidian's default location.
- Wikilink embeds `![[name.png]]` resolve by filename → survive the move (names are unique).
  Verify zero unresolved `![[…]]` after.
- Remote `notion-static.com` embeds are external URLs (may expire); nothing to move.

## 11. Migration plan (phased, on `main`)
**Pre-flight (user):** pause openclaw so Friday isn't writing concurrently.
1. **Checkpoint** — commit/tag for one-command rollback.
2. **Build skeleton** — create `00`–`10`, `80`, `90`, `99` folders.
3. **Engine** — `git mv memory 80-LifeOS`; move `agent-protocol` in; add `paths.json` + `paths.js`;
   apply §5 refactors and doc/gitignore/sync edits. Move engine's non-data files only.
4. **Data → domains** — `git mv` each `memory` data note/folder to its §4b home; `git mv` Notion
   content per §4a (Amazon + projects to live).
5. **Task extraction** — pull the 13 live Task-List items into `01-Tasks/Todo.md`, dedupe.
6. **Archive** — reshelve remaining Notion → `90-Archive`; flatten wrappers; move promoted `.bases`.
7. **Domains polish** — create `01`–`10` MOCs + `00-Dashboard`; add frontmatter to curated notes.
8. **Attachments** — move root images → `99-Meta/Attachments`; fix Obsidian config.
9. **Exclusion** — hide `90-Archive` from graph/search.
10. **Verify** (below), then commit.

**Post-flight (user):** transfer files to the mac mini, restart openclaw, confirm the next heartbeat runs clean.

### Success criteria
- Engine works after rewire: `node 80-LifeOS/_scripts/capture.js routes` lists all destinations
  from their new locations; a test capture files into the right domain note; `mealplan`/`deals`/
  `news`/`notify-expiring`/`notify-returns`/`vault_sweeper` all resolve paths via `paths.json`.
- 13 Task-List items merged into `Todo.md` with no duplicates.
- Zero notes lost: `.md`/`.base` count before == after.
- Images render (no unresolved `![[…]]`); `90-Archive` absent from the graph.

### Rollback
`git reset --hard <checkpoint-tag>` restores the pre-migration state.

## 12. Open items / risks
- **Capture staging vs domain routing:** new captured notes land in `01-Tasks/{Lists,Checklists,Reference}`
  staging; existing named destinations are found wherever they live. A future enhancement could route
  new notes to a domain by `category`. Out of scope for v1.
- **`paths.json` is the single coupling point** — every script must load it; the verify step must
  exercise each script, not just capture.
- **Immigration is cross-cutting** (Career vs Admin): filed under `10-Admin/Immigration`, cross-linked
  from `03-Career`.
- **`.base` internal folder refs:** verify each promoted base opens after its unit-move.
