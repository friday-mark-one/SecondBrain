# SecondBrain Vault Reorganization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the entire SecondBrain vault (Notion import + Friday's `memory/`) into one clean numbered hierarchy, separating Friday's engine from user data, without losing any note or breaking Friday.

**Architecture:** Ten numbered life-domains (`01`–`10`) hold user data; `80-LifeOS` holds only Friday's engine (scripts, protocols, instructions, templates, logs, config); `90-Archive` holds the dormant Notion import mirrored by domain (excluded from graph/search); `99-Meta` holds attachments. The engine's Node scripts are decoupled from data locations via a central `80-LifeOS/_scripts/paths.json`; the Obsidian meal-plan engine relocates via its one `BASE` constant.

**Tech Stack:** Obsidian, Node.js (`node:fs`/`node:test`, no external deps), Python 3, git, Dataview + Bases (Obsidian plugins).

## Global Constraints

- **Nothing is deleted.** Every move uses `git mv` to preserve history. Success requires `.md`+`.base` count before == after.
- **New top-level folder names are shell-safe:** `NN-Name`, no spaces/ampersands. `00-Dashboard 01-Tasks 02-Personal 03-Career 04-Finance 05-Health 06-Learning 07-Projects 08-Food 09-Shopping 10-Admin 80-LifeOS 90-Archive 99-Meta`.
- **Archived Notion subfolder names are preserved verbatim** (spaces/parentheses intact) so `.base` files keep resolving.
- **`80-LifeOS` contains no user data;** `01`–`10` contain no engine scripts.
- **Work on `main`.** The user pauses openclaw (Friday) before execution and restarts it after — so intermediate engine breakage between tasks is acceptable; the engine must work at the final verify (Task 17).
- **All paths are relative to the vault root** `/Users/bgopalbaaskaran/workspace/projects/assistant/SecondBrain` unless absolute. Commands below assume the shell's CWD is the vault root; every task starts by `cd`-ing there.
- **Data domain of each note is encoded by its folder;** Dataview MOCs query by folder path (`FROM "05-Health"`), so no mass frontmatter backfill is required in v1.

---

## File Structure

**New engine files (created):**
- `80-LifeOS/_scripts/paths.json` — logical-name → vault-relative-path map (single coupling point).
- `80-LifeOS/_scripts/paths.js` — loader/resolver used by every Node engine script.
- `80-LifeOS/_scripts/extract-tasklist.js` — one-shot: merge live Task-List items into Todo.
- `80-LifeOS/_scripts/test/paths.test.js` — unit test for `paths.js`.

**Engine files (moved `memory/` → `80-LifeOS/`, then edited):**
- `capture.js`, `deals.js`, `news.js`, `notify-expiring.js`, `notify-returns.js` — read locations from `paths.js`.
- `mealplan.js` — `BASE` constant repointed; `commands/*.js` regenerated via `build-commands.js`.
- `vault_sweeper.py` — reads `paths.json`.
- `sync_workspace.sh` — `MD_SOURCE` repointed.
- `agent-protocol/HEARTBEAT.md`, `agent-protocol/AGENTS.md`, `Capture/Meal plan/Deal triage/News digest instructions.md`, `MOC.md`, `.gitignore` — path-string updates.

**Data (moved into domains):** all `memory/` data notes/folders and the Notion import (per Tasks 5–13).

**Dashboards (created):** `00-Dashboard/Home.md` + `01`–`10` `_index.md` MOCs.

---

## Task 1: Safety checkpoint & baseline snapshot

**Files:**
- Create: `/tmp/reorg-baseline.txt` (scratch; not in vault — stable path so it survives across subagent sessions)

**Interfaces:**
- Produces: a git tag `pre-reorg` and a baseline snapshot file used by Task 17 for before/after comparison.

- [ ] **Step 1: cd to vault root and confirm clean tree**

Run:
```bash
cd /Users/bgopalbaaskaran/workspace/projects/assistant/SecondBrain
git status --short
```
Expected: only the untracked `docs/` plan/spec (if not yet committed) — no unexpected modifications. If other changes exist, stop and ask.

- [ ] **Step 2: Create rollback tag**

```bash
git tag pre-reorg
git tag --list pre-reorg
```
Expected: prints `pre-reorg`.

- [ ] **Step 3: Record baseline counts and capture routes**

```bash
{
  echo "md_count=$(find . -path ./.git -prune -o -name '*.md' -print | wc -l | tr -d ' ')"
  echo "base_count=$(find . -path ./.git -prune -o -name '*.base' -print | wc -l | tr -d ' ')"
  echo "--- capture routes (destination note names) ---"
  node memory/_scripts/capture.js routes | grep '"note"' | sort
} > /tmp/reorg-baseline.txt
cat /tmp/reorg-baseline.txt
```
Expected: `md_count` ≈ 1300+, `base_count=36`, and a sorted list of destination note names (Todo, Deals, News, Gems, Cold remedies, …). Keep this file; Task 17 diffs against it.

- [ ] **Step 4: Commit the spec/plan docs if still untracked**

```bash
git add docs/superpowers
git commit -q -m "docs: vault reorg spec + implementation plan" || echo "nothing to commit"
git log --oneline -1
```

---

## Task 2: Create the folder skeleton

**Files:**
- Create (directories): `00-Dashboard 01-Tasks/{Lists,Checklists,Reference} 02-Personal/{Travel,Media} 03-Career 04-Finance 05-Health 06-Learning 07-Projects 08-Food 09-Shopping 10-Admin/{Vehicles,Immigration,Insurance,Tech} 90-Archive/{Personal,Career,Finance,Health,Learning,Projects,Admin,Task-List} 99-Meta/{Attachments,planning}`

**Interfaces:**
- Produces: empty target tree. `80-LifeOS` is created by the `git mv` in Task 3, not here.

- [ ] **Step 1: Create all directories**

```bash
cd /Users/bgopalbaaskaran/workspace/projects/assistant/SecondBrain
mkdir -p 00-Dashboard \
  01-Tasks/Lists 01-Tasks/Checklists 01-Tasks/Reference \
  02-Personal/Travel 02-Personal/Media \
  03-Career 04-Finance 05-Health 06-Learning 07-Projects 08-Food 09-Shopping \
  10-Admin/Vehicles 10-Admin/Immigration 10-Admin/Insurance 10-Admin/Tech \
  90-Archive/Personal 90-Archive/Career 90-Archive/Finance 90-Archive/Health \
  90-Archive/Learning 90-Archive/Projects 90-Archive/Admin "90-Archive/Task-List" \
  99-Meta/Attachments 99-Meta/planning
```

- [ ] **Step 2: Add `.gitkeep` so empty dirs are trackable, and verify**

```bash
find 00-Dashboard 01-Tasks 02-Personal 03-Career 04-Finance 05-Health 06-Learning \
  07-Projects 08-Food 09-Shopping 10-Admin 90-Archive 99-Meta -type d -empty \
  -exec touch {}/.gitkeep \;
ls -d [0-9]*/ 9*/
```
Expected: all target top-level folders listed.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -q -m "chore: scaffold reorganized vault skeleton"
```

---

## Task 3: Relocate the engine shell (`memory/` → `80-LifeOS/`, fold in `agent-protocol/`)

**Files:**
- Move: `memory/` → `80-LifeOS/`; `agent-protocol/` → `80-LifeOS/agent-protocol/`

**Interfaces:**
- Produces: `80-LifeOS/_scripts/*` at their final home. Scripts still use `__dirname/..` and data still lives inside `80-LifeOS`, so the engine must still work *before* any refactor — this proves the wholesale move is clean.

- [ ] **Step 1: Move the two directories with git**

```bash
cd /Users/bgopalbaaskaran/workspace/projects/assistant/SecondBrain
git mv memory 80-LifeOS
git mv agent-protocol 80-LifeOS/agent-protocol
```

- [ ] **Step 2: Verify the engine still resolves (pre-refactor smoke)**

```bash
node 80-LifeOS/_scripts/capture.js routes | grep -c '"note"'
node -e "require('./80-LifeOS/_scripts/mealplan.js'); console.log('mealplan loads OK')"
```
Expected: route count matches Task 1 baseline; `mealplan loads OK`.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -q -m "refactor: move memory/ and agent-protocol/ into 80-LifeOS/"
```

---

## Task 4: Add the central paths config + resolver

**Files:**
- Create: `80-LifeOS/_scripts/paths.json`, `80-LifeOS/_scripts/paths.js`, `80-LifeOS/_scripts/test/paths.test.js`

**Interfaces:**
- Produces: `paths.js` exporting `{ VAULT_ROOT, get(key), abs(rel), stagingDir(type), scanRoots(), CONFIG }`. `get` returns an absolute path for string values, or the raw value for objects/arrays. Consumed by Tasks 5, 8, 9, 10.

- [ ] **Step 1: Write `paths.json`**

Create `80-LifeOS/_scripts/paths.json`:
```json
{
  "todo": "01-Tasks/Todo.md",
  "inbox": "01-Tasks/Inbox.md",
  "captureStaging": { "list": "01-Tasks/Lists", "checklist": "01-Tasks/Checklists", "reference": "01-Tasks/Reference" },
  "logs": "80-LifeOS/logs",
  "recipes": "08-Food/Recipes",
  "mealPlan": "08-Food/Meal Plan",
  "items": "08-Food/Items",
  "buyList": "08-Food/Buy List.md",
  "expiringSoon": "08-Food/Expiring Soon.md",
  "deals": "09-Shopping/Deals.md",
  "shoppingResearch": "09-Shopping/Shopping research.md",
  "returns": "09-Shopping/Things to return.md",
  "shoppingTracker": "09-Shopping/Shopping Tracker.md",
  "news": "02-Personal/Media/News.md",
  "scanExclude": ["00-Dashboard", "80-LifeOS", "90-Archive", "99-Meta"],
  "scanSkipDirs": ["_scripts", "_templates", "logs", "Archive", "Items", "Recipes", "Meal Plan"]
}
```

- [ ] **Step 2: Write the failing test**

Create `80-LifeOS/_scripts/test/paths.test.js`:
```js
"use strict";
const test = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const paths = require("../paths.js");

test("VAULT_ROOT is two levels above _scripts", () => {
  assert.strictEqual(path.basename(paths.VAULT_ROOT), "SecondBrain");
});
test("get resolves a string key to an absolute vault path", () => {
  assert.strictEqual(paths.get("todo"), path.join(paths.VAULT_ROOT, "01-Tasks/Todo.md"));
});
test("get returns raw arrays/objects", () => {
  assert.ok(Array.isArray(paths.get("scanExclude")));
});
test("stagingDir maps a type to its staging folder", () => {
  assert.strictEqual(paths.stagingDir("checklist"), path.join(paths.VAULT_ROOT, "01-Tasks/Checklists"));
});
test("scanRoots excludes engine/archive/meta/dashboard dirs", () => {
  const roots = paths.scanRoots().map((p) => path.basename(p));
  assert.ok(roots.includes("05-Health"));
  assert.ok(!roots.includes("90-Archive"));
  assert.ok(!roots.includes("80-LifeOS"));
});
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
node --test 80-LifeOS/_scripts/test/paths.test.js
```
Expected: FAIL — `Cannot find module '../paths.js'`.

- [ ] **Step 4: Implement `paths.js`**

Create `80-LifeOS/_scripts/paths.js`:
```js
"use strict";
const fs = require("node:fs");
const path = require("node:path");

// _scripts/ lives in 80-LifeOS/_scripts → vault root is two levels up.
const VAULT_ROOT = path.join(__dirname, "..", "..");
const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, "paths.json"), "utf8"));

function get(key) {
  const v = CONFIG[key];
  if (v === undefined) throw new Error(`paths.json missing key: ${key}`);
  return typeof v === "string" ? path.join(VAULT_ROOT, v) : v;
}
function abs(rel) { return path.join(VAULT_ROOT, rel); }
function stagingDir(type) {
  const s = CONFIG.captureStaging[type];
  if (!s) throw new Error(`no staging dir for type: ${type}`);
  return path.join(VAULT_ROOT, s);
}
function scanRoots() {
  const exclude = new Set(CONFIG.scanExclude || []);
  return fs.readdirSync(VAULT_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith(".") && !exclude.has(e.name))
    .map((e) => path.join(VAULT_ROOT, e.name));
}
module.exports = { VAULT_ROOT, get, abs, stagingDir, scanRoots, CONFIG };
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
node --test 80-LifeOS/_scripts/test/paths.test.js
```
Expected: PASS (5 tests). `scanRoots` currently returns the domain folders created in Task 2.

- [ ] **Step 6: Commit**

```bash
git add 80-LifeOS/_scripts/paths.json 80-LifeOS/_scripts/paths.js 80-LifeOS/_scripts/test/paths.test.js
git commit -q -m "feat: add central paths.json config + resolver for engine scripts"
```

---

## Task 5: Move the meal-plan food subsystem → `08-Food` (+ repoint `mealplan.js`)

**Files:**
- Move: `80-LifeOS/{_config.md,Recipes,Meal Plan,Items,Buy List.md,Grocery List,Cookbook.md,Cooking References.md,Expiring Soon.md,Archive}` → `08-Food/…`
- Modify: `80-LifeOS/_scripts/mealplan.js:11`
- Regenerate: `80-LifeOS/_scripts/commands/*.js`

**Interfaces:**
- Consumes: nothing. Produces: the food data at `08-Food/*` and `mealplan.js` `BASE = "08-Food/"`.

- [ ] **Step 1: Move food data folders/files**

```bash
cd /Users/bgopalbaaskaran/workspace/projects/assistant/SecondBrain
git mv 80-LifeOS/Recipes "08-Food/Recipes"
git mv "80-LifeOS/Meal Plan" "08-Food/Meal Plan"
git mv 80-LifeOS/Items "08-Food/Items"
git mv "80-LifeOS/Buy List.md" "08-Food/Buy List.md"
git mv "80-LifeOS/Cookbook.md" "08-Food/Cookbook.md"
git mv "80-LifeOS/Cooking References.md" "08-Food/Cooking References.md"
git mv "80-LifeOS/Expiring Soon.md" "08-Food/Expiring Soon.md"
git mv 80-LifeOS/Archive "08-Food/Archive"                 # meal-plan grocery/buy-list snapshots
git mv "80-LifeOS/Grocery List" "08-Food/Grocery List"     # generated grocery list (BASE + "Grocery List/")
git mv "80-LifeOS/_config.md" "08-Food/_config.md"         # meal-plan config (BASE + "_config.md")
```

- [ ] **Step 2: Repoint the meal-plan BASE constant (byte-safe)**

`mealplan.js` carries one stray NUL byte, so git/grep treat it as binary. Edit it with a byte-safe stream replace (NOT a text editor) to avoid corrupting the file:
```bash
perl -0pi -e 's{const BASE = "memory/";}{const BASE = "08-Food/";}' 80-LifeOS/_scripts/mealplan.js
grep -a -n 'const BASE' 80-LifeOS/_scripts/mealplan.js
```
Expected: line 11 now reads `const BASE = "08-Food/";`. All `BASE + "..."` references (`_config.md`, `Items/`, `Meal Plan/`, `Recipes/`, `Buy List.md`, `Grocery List/`, `Archive/`) now resolve under `08-Food/`.

- [ ] **Step 3: Regenerate the QuickAdd command files**

```bash
node 80-LifeOS/_scripts/build-commands.js
grep -h 'const BASE' 80-LifeOS/_scripts/commands/*.js | sort -u
```
Expected: prints `const BASE = "08-Food/";` (one unique line — all 5 regenerated).

- [ ] **Step 4: Verify the engine module still loads and food data is in place**

```bash
node -e "require('./80-LifeOS/_scripts/mealplan.js'); console.log('mealplan loads OK')"
test -d "08-Food/Recipes" && test -d "08-Food/Items" && test -f "08-Food/Buy List.md" \
  && test -f "08-Food/_config.md" && test -f "08-Food/Grocery List/Current.md" && echo "food data OK"
find "08-Food/Items" -name '*.md' | wc -l   # expect 205
```
Expected: `mealplan loads OK`, `food data OK`, `205`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -q -m "refactor: relocate meal-plan subsystem to 08-Food; repoint BASE"
```

---

## Task 6: Distribute the remaining `80-LifeOS` data notes → domains

**Files:**
- Move: the `memory` top-level data notes + `Lists/`, `Checklists/`, `Reference/` contents (now under `80-LifeOS/`) to `01`–`10`.

**Interfaces:**
- Produces: `80-LifeOS` free of user data (only `_scripts _templates logs _config.md MOC.md agent-protocol` + `*instructions.md` remain).

- [ ] **Step 1: Tasks — Todo & Inbox → `01-Tasks`**

```bash
cd /Users/bgopalbaaskaran/workspace/projects/assistant/SecondBrain
git mv "80-LifeOS/Todo.md" "01-Tasks/Todo.md"
git mv "80-LifeOS/Inbox.md" "01-Tasks/Inbox.md"
```

- [ ] **Step 2: Shopping data → `09-Shopping`**

```bash
git mv "80-LifeOS/Deals.md" "09-Shopping/Deals.md"
git mv "80-LifeOS/Shopping research.md" "09-Shopping/Shopping research.md"
git mv "80-LifeOS/Things to return.md" "09-Shopping/Things to return.md"
for f in "Fancy things" "Laptop research" "Scents to try" "Snowboard research & buy" "Gift ideas"; do
  git mv "80-LifeOS/Lists/$f.md" "09-Shopping/$f.md" 2>/dev/null || git mv "80-LifeOS/Reference/$f.md" "09-Shopping/$f.md"
done
for f in "Black Friday buy" "Games to buy" "Too poor to buy"; do
  git mv "80-LifeOS/Checklists/$f.md" "09-Shopping/$f.md"
done
```

- [ ] **Step 3: Food-related list → `08-Food`**

```bash
git mv "80-LifeOS/Lists/Protein rich foods.md" "08-Food/Protein rich foods.md"
```

- [ ] **Step 4: Personal / Travel / Media → `02-Personal`**

```bash
git mv "80-LifeOS/News.md" "02-Personal/Media/News.md"
git mv "80-LifeOS/Lists/Gems.md" "02-Personal/Media/Gems.md"
git mv "80-LifeOS/Checklists/Movie & TV watchlist.md" "02-Personal/Media/Movie & TV watchlist.md"
for f in "India trip" "Portland trip" "Vegas to do" "Washington DC to do"; do
  git mv "80-LifeOS/Checklists/$f.md" "02-Personal/Travel/$f.md"
done
git mv "80-LifeOS/Reference/Before a trip.md" "02-Personal/Travel/Before a trip.md"
git mv "80-LifeOS/Checklists/Flight booking tips.md" "02-Personal/Travel/Flight booking tips.md"
git mv "80-LifeOS/Checklists/Adventure bucket list.md" "02-Personal/Adventure bucket list.md"
for f in "Life goals" "Ideal day" "Personal facts" "I will remember this"; do
  git mv "80-LifeOS/Reference/$f.md" "02-Personal/$f.md"
done
for f in "Habits to cultivate" "Midnight ideas" "Nothing to do list"; do
  git mv "80-LifeOS/Lists/$f.md" "02-Personal/$f.md"
done
git mv "80-LifeOS/Reference/Random notes.md" "02-Personal/Random notes.md"
```

- [ ] **Step 5: Health, Career, Finance, Learning, Projects, Admin lists → domains**

```bash
# Health
for f in "Cold remedies" "Hairfall remedies"; do git mv "80-LifeOS/Lists/$f.md" "05-Health/$f.md"; done
git mv "80-LifeOS/Checklists/Gyms to try.md" "05-Health/Gyms to try.md"
git mv "80-LifeOS/Reference/Blood tests taken.md" "05-Health/Blood tests taken.md"
# Career
git mv "80-LifeOS/Reference/Public speaking notes.md" "03-Career/Public speaking notes.md"
# Finance
git mv "80-LifeOS/Reference/Referral codes.md" "04-Finance/Referral codes.md"
# Learning
git mv "80-LifeOS/Syllabus.md" "06-Learning/Syllabus.md"
git mv "80-LifeOS/Lists/Piano scores to learn.md" "06-Learning/Piano scores to learn.md"
git mv "80-LifeOS/Checklists/Honorlock test prep.md" "06-Learning/Honorlock test prep.md"
# Projects
git mv "80-LifeOS/AI automation projects.md" "07-Projects/AI automation projects.md"
git mv "80-LifeOS/Hobby projects.md" "07-Projects/Hobby projects.md"
for f in "Project ideas" "Home automation" "Tech to watch" "Claude Code things to try"; do
  git mv "80-LifeOS/Lists/$f.md" "07-Projects/$f.md"
done
# Admin
git mv "80-LifeOS/Reference/Apartment addresses.md" "10-Admin/Apartment addresses.md"
git mv "80-LifeOS/Checklists/Car exploration.md" "10-Admin/Vehicles/Car exploration.md"
git mv "80-LifeOS/Reference/screen cheatsheet.md" "10-Admin/Tech/screen cheatsheet.md"
git mv "80-LifeOS/Reference/vim cheatsheet.md" "10-Admin/Tech/vim cheatsheet.md"
git mv "80-LifeOS/Checklists/Kodi addons.md" "10-Admin/Tech/Kodi addons.md"
```

- [ ] **Step 6: Verify no user data remains in `80-LifeOS` and the now-empty list dirs are gone**

```bash
ls 80-LifeOS
find "80-LifeOS/Lists" "80-LifeOS/Checklists" "80-LifeOS/Reference" -name '*.md' 2>/dev/null
```
Expected first line set: `_scripts _templates MOC.md agent-protocol logs` + the four `*instructions.md` (`_config.md` moved to `08-Food` in Task 5). Second command: **no output** (all list notes moved). If any `.md` remains, it was unaccounted-for — stop and categorize it before proceeding.

- [ ] **Step 7: Remove the emptied staging source folders (they are recreated empty in 01-Tasks) and commit**

```bash
rmdir "80-LifeOS/Lists" "80-LifeOS/Checklists" "80-LifeOS/Reference" 2>/dev/null || true
git add -A && git commit -q -m "refactor: distribute Friday's data notes from 80-LifeOS into domains"
```

---

## Task 7: Refactor `capture.js` to use `paths.js`

**Files:**
- Modify: `80-LifeOS/_scripts/capture.js`

**Interfaces:**
- Consumes: `paths.js` (`scanRoots`, `get("inbox")`, `get("logs")`, `stagingDir`, `CONFIG.scanSkipDirs`).
- Produces: `capture.js` that discovers destinations across `01`–`10`, creates new notes in `01-Tasks` staging, writes the inbox at `01-Tasks/Inbox.md`, and logs to `80-LifeOS/logs`.

- [ ] **Step 1: Verify capture is currently broken (data moved out)**

```bash
node 80-LifeOS/_scripts/capture.js routes | grep -c '"note"'
```
Expected: a number far smaller than baseline (destinations no longer under the old scan root) — confirms the refactor is needed.

- [ ] **Step 2: Add the require and switch the scan to config roots**

At the top of `capture.js`, after the existing `const path = require("node:path");`, add:
```js
const paths = require("./paths.js");
```
Replace the constant:
```js
const EXCLUDE_DIRS = new Set(["_scripts", "_templates", "logs", "Archive", "Items", "Recipes", "Meal Plan"]);
```
with:
```js
const EXCLUDE_DIRS = new Set(paths.CONFIG.scanSkipDirs);
```
Replace `scanRoutes`:
```js
function scanRoutes(vaultDir) {
  const routes = [];
  walkRoutes(vaultDir, routes);
  return routes;
}
```
with:
```js
function scanRoutes() {
  const routes = [];
  for (const root of paths.scanRoots()) walkRoutes(root, routes);
  return routes;
}
```

- [ ] **Step 3: Repoint destination-creation, logs, and inbox**

In `fileItem`, replace the route lookup call and the new-note directory:
```js
  const route = scanRoutes(vaultDir).find((r) => r.note.toLowerCase() === destination.toLowerCase());
```
→
```js
  const route = scanRoutes().find((r) => r.note.toLowerCase() === destination.toLowerCase());
```
and
```js
    const folder = TYPE_FOLDER[type];
    if (!folder) throw new Error(`Unknown type "${type}"; expected list, checklist, or reference.`);
    const dir = path.join(vaultDir, folder);
```
→
```js
    const dir = paths.stagingDir(type);
    if (!dir) throw new Error(`Unknown type "${type}"; expected list, checklist, or reference.`);
```
In `appendLedger`, replace:
```js
  const dir = path.join(vaultDir, "logs");
```
→
```js
  const dir = paths.get("logs");
```
In `inboxTake`, replace:
```js
  const p = path.join(vaultDir, "Inbox.md");
```
→
```js
  const p = paths.get("inbox");
```

- [ ] **Step 4: Drop the now-unused `vaultDir` plumbing**

Change `fileItem`'s signature from `function fileItem({ vaultDir, destination, item, type, category, hint, now })` to `function fileItem({ destination, item, type, category, hint, now })`, and `appendLedger(vaultDir, item, destination, now)` to `appendLedger(item, destination, now)` (update its definition to `function appendLedger(item, destination, now) {`). In the CLI block at the bottom, delete `const vaultDir = path.join(__dirname, "..");` and remove `vaultDir` / the `scanRoutes(vaultDir)`→`scanRoutes()`, `inboxTake(vaultDir)`→`inboxTake()`, and the `vaultDir,` property passed to `fileItem`. Update `inboxTake()` to take no argument. (The `TYPE_FOLDER` constant is now unused — delete it.)

- [ ] **Step 5: Verify routes are rediscovered from the domains**

```bash
node 80-LifeOS/_scripts/capture.js routes | grep '"note"' | sort > /tmp/routes-after.txt
grep '"note"' /tmp/routes-after.txt | wc -l
```
Expected: count matches the Task 1 baseline route count (all destinations found again, now in their domains). Spot-check that `"note": "Deals"`, `"note": "Cold remedies"`, `"note": "Gems"` appear.

- [ ] **Step 6: Verify a real capture files into the right domain note**

```bash
node 80-LifeOS/_scripts/capture.js file --note "Cold remedies" --item "ginger tea"
tail -3 "05-Health/Cold remedies.md"
tail -2 "80-LifeOS/logs/$(date +%m-%d-%y).md"
```
Expected: confirmation `✓ filed → [[Cold remedies]]`; the item appears in `05-Health/Cold remedies.md`; a ledger line appears in today's log. (Then remove the test item if desired.)

- [ ] **Step 7: Commit**

```bash
git add 80-LifeOS/_scripts/capture.js && git commit -q -m "refactor: capture.js discovers destinations across domains via paths.js"
```

---

## Task 8: Refactor `deals.js`, `news.js`, `notify-expiring.js`, `notify-returns.js`

**Files:**
- Modify: `80-LifeOS/_scripts/deals.js:6`, `news.js:7`, `notify-expiring.js:21`, `notify-returns.js:22`

**Interfaces:**
- Consumes: `paths.js` (`get("deals"|"news"|"items"|"returns")`).

- [ ] **Step 1: `deals.js`** — add `const paths = require("./paths.js");` near the other requires, then replace:
```js
const DEALS_FILE = path.join(__dirname, "..", "Deals.md");
```
→
```js
const DEALS_FILE = paths.get("deals");
```

- [ ] **Step 2: `news.js`** — add the require, then replace:
```js
const NEWS_FILE = path.join(__dirname, "..", "News.md");
```
→
```js
const NEWS_FILE = paths.get("news");
```

- [ ] **Step 3: `notify-expiring.js`** — add the require, then replace:
```js
const ITEMS_DIR = path.join(__dirname, "..", "Items");
```
→
```js
const ITEMS_DIR = paths.get("items");
```

- [ ] **Step 4: `notify-returns.js`** — add the require, then replace:
```js
const RETURNS_FILE = path.join(__dirname, "..", "Things to return.md");
```
→
```js
const RETURNS_FILE = paths.get("returns");
```

- [ ] **Step 5: Verify each module loads and resolves its data**

```bash
for s in deals news notify-expiring notify-returns; do
  node -e "require('./80-LifeOS/_scripts/$s.js'); console.log('$s loads OK')" 2>&1 | tail -1
done
node -e "const p=require('./80-LifeOS/_scripts/paths.js');
  const fs=require('fs');
  for (const k of ['deals','news','items','returns'])
    console.log(k, fs.existsSync(p.get(k)));"
```
Expected: four `… loads OK` lines; and `deals true`, `news true`, `items true`, `returns true` (all data resolvable at new homes).

- [ ] **Step 6: Commit**

```bash
git add 80-LifeOS/_scripts/deals.js 80-LifeOS/_scripts/news.js 80-LifeOS/_scripts/notify-expiring.js 80-LifeOS/_scripts/notify-returns.js
git commit -q -m "refactor: deals/news/notify scripts read data paths from paths.js"
```

---

## Task 9: Update `vault_sweeper.py` to read `paths.json`

**Files:**
- Modify: `80-LifeOS/_scripts/vault_sweeper.py:1-16` (CONFIG block) and `:123` (EXCLUDE_DIRS scope)

**Interfaces:**
- Consumes: `paths.json` (`shoppingTracker`, `logs`) + `scanRoots` semantics for checklist scanning.

- [ ] **Step 1: Replace the hardcoded CONFIG block**

Replace the top config block (the `import`s stay; the three absolute-path constants go) with:
```python
import os
import re
import json
import datetime

# ==========================================
# CONFIGURATION (from paths.json)
# ==========================================
_SCRIPTS = os.path.dirname(os.path.abspath(__file__))
_VAULT_ROOT = os.path.normpath(os.path.join(_SCRIPTS, "..", ".."))
with open(os.path.join(_SCRIPTS, "paths.json")) as _f:
    _CFG = json.load(_f)

def _p(rel):
    return os.path.join(_VAULT_ROOT, rel)

# 1. Shopping Tracker File
SHOPPING_FILE = _p(_CFG["shoppingTracker"])

# 2. Vault root to scan for checklist notes (frontmatter: type: checklist)
VAULT_ROOT = _VAULT_ROOT

# 3. The Hidden Log File
TRASH_LOG_FILE = os.path.join(_p(_CFG["logs"]), ".swept_tasks_log.md")
```

- [ ] **Step 2: Scope the checklist scan to live domains**

`find_checklist_notes` walks `VAULT_ROOT` (now the whole vault) pruning by folder name. Replace the hardcoded set at line ~123 so it also skips the archive/engine/meta/dashboard top-level dirs (matching capture's scope). Change:
```python
EXCLUDE_DIRS = {"_scripts", "_templates", "logs", "Archive", "Items", "Recipes", "Meal Plan"}
```
to:
```python
EXCLUDE_DIRS = set(_CFG["scanExclude"]) | set(_CFG["scanSkipDirs"])
```
This yields `{00-Dashboard, 80-LifeOS, 90-Archive, 99-Meta, _scripts, _templates, logs, Archive, Items, Recipes, Meal Plan}`, so the sweep never descends into the 1300-file archive.

- [ ] **Step 3: Verify it parses and scopes correctly (read-only — do NOT run a live sweep)**

The script has a `__main__` guard, so importing it does NOT sweep. Do not run `python3 vault_sweeper.py` here — that performs a live mutating sweep of checklists. Verify read-only:
```bash
python3 -c "import ast; ast.parse(open('80-LifeOS/_scripts/vault_sweeper.py').read()); print('syntax OK')"
python3 -c "import sys; sys.path.insert(0,'80-LifeOS/_scripts'); import vault_sweeper as v; \
f=v.find_checklist_notes(v.VAULT_ROOT); \
assert not any(('90-Archive' in p) or ('80-LifeOS' in p) or ('99-Meta' in p) for p in f), 'scanned excluded dir'; \
print('vault_sweeper OK: config resolves, scan scoped to', len(f), 'checklist notes (no archive/engine/meta)')"
```
Expected: `syntax OK`; then `vault_sweeper OK: config resolves, scan scoped to N checklist notes …`.

- [ ] **Step 4: Commit**

```bash
git add 80-LifeOS/_scripts/vault_sweeper.py && git commit -q -m "refactor: vault_sweeper.py reads paths.json; scope checklist scan to domains"
```

---

## Task 10: Promote live Notion content → domains (Amazon, projects, promoted DBs)

**Files:**
- Move: `Notion/Work/*`, `Notion/Projects/*`, promoted `.base` folders, and the other live Notion domains.

**Interfaces:**
- Produces: live content in `03-Career`, `07-Projects`, `05-Health`, `06-Learning`, `04-Finance`. Each `.base` moves with its whole folder so it keeps resolving.

- [ ] **Step 1: Career (Amazon live per decision) + Snap + interview prep**

```bash
cd /Users/bgopalbaaskaran/workspace/projects/assistant/SecondBrain
git mv "Notion/Work/Amazon" "03-Career/Amazon"
git mv "Notion/Work/Snap" "03-Career/Snap"
git mv "Notion/Personal Home/Interview prep/2020" "03-Career/Interview prep 2020"
git mv "Notion/Personal Home/Interview prep/2024" "03-Career/Interview prep 2024"
git mv "Notion/Personal Home/Misc/Amazon Interviewer" "03-Career/Amazon Interviewer"
```

- [ ] **Step 2: Projects (all live)**

```bash
git mv "Notion/Projects/Digital Quarantine" "07-Projects/Digital Quarantine"
git mv "Notion/Projects/Fintwit-bot" "07-Projects/Fintwit-bot"
git mv "Notion/Projects/URL shortener" "07-Projects/URL shortener"
```

- [ ] **Step 3: Finance, Health, Learning live + promoted bases (folder = base+rows unit)**

```bash
# Finance
git mv "Notion/Personal Home/ETF" "04-Finance/ETF"
git mv "Notion/Day trading" "04-Finance/Day trading"
git mv "InvestingAtAmazon.pdf" "04-Finance/InvestingAtAmazon.pdf"
# Health (workouts + promoted DBs)
git mv "Notion/Personal Home/Workouts" "05-Health/Workouts"
git mv "Notion/Personal Home/Doctors/Top doctors" "05-Health/Top doctors"
git mv "Notion/Personal Home/Misc/Blood Pressure" "05-Health/Blood Pressure"
# Learning (GaTech + promoted Media DB)
git mv "Notion/Academic/GaTech" "06-Learning/GaTech"
git mv "Notion/Reading List/Media" "06-Learning/Media"
```

- [ ] **Step 4: Admin live (vehicles, immigration, insurance, tech)**

```bash
git mv "Notion/Personal Home/Cars" "10-Admin/Vehicles/Cars"
git mv "Notion/Personal Home/International Transfer" "10-Admin/Immigration/International Transfer"
git mv "Notion/Personal Home/Misc/US visitors medical insurance" "10-Admin/Insurance/US visitors medical insurance"
git mv "Notion/Task List/iTerm2 configuration" "10-Admin/Tech/iTerm2 configuration"
git mv "Notion/Personal Home/Misc/Macbook setup" "10-Admin/Tech/Macbook setup"
git mv "Notion/Personal Home/Apartments/Apartment addresses"* "10-Admin/" 2>/dev/null || true
git mv "Notion/Passport renewal in Seattle.md" "10-Admin/Immigration/Passport renewal in Seattle.md"
```

- [ ] **Step 5: Verify promoted bases still resolve to their folders**

```bash
for b in "05-Health/Top doctors" "06-Learning/Media"; do
  echo "$b:"; find "$b" -name '*.base' -maxdepth 2
done
```
Expected: each prints its `.base` file inside the moved folder. Open one base in Obsidian later (Task 17 verify) to confirm rows render.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -q -m "refactor: promote live Notion content (Amazon, projects, DBs) into domains"
```

---

## Task 11: Extract live Task-List items → `01-Tasks/Todo.md`

**Files:**
- Create: `80-LifeOS/_scripts/extract-tasklist.js`
- Modify: `01-Tasks/Todo.md`

**Interfaces:**
- Consumes: `Notion/Task List/*.md` (frontmatter `Status`). Produces: appended `- [ ]` lines in `Todo.md`, deduped.

- [ ] **Step 1: Write the extraction script**

Create `80-LifeOS/_scripts/extract-tasklist.js`:
```js
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const paths = require("./paths.js");

const LIVE = new Set(["To Do", "Not started", "Blocked"]);
const SRC = paths.abs("Notion/Task List");
const TODO = paths.get("todo");

function statusOf(text) {
  const m = text.match(/^Status:\s*(.+)$/m);
  return m ? m[1].trim() : "";
}
function norm(s) { return s.replace(/^\s*[-*]\s*(\[[ xX]\]\s*)?/, "").trim().toLowerCase(); }

const existing = new Set(fs.readFileSync(TODO, "utf8").split("\n").map(norm).filter(Boolean));
const added = [];
for (const f of fs.readdirSync(SRC)) {
  if (!f.endsWith(".md")) continue;
  const status = statusOf(fs.readFileSync(path.join(SRC, f), "utf8"));
  if (!LIVE.has(status)) continue;
  const title = f.replace(/\.md$/, "");
  if (existing.has(norm(title))) continue;
  existing.add(norm(title));
  added.push(title);
}
if (added.length) {
  const body = fs.readFileSync(TODO, "utf8").replace(/\s*$/, "");
  fs.writeFileSync(TODO, body + "\n" + added.map((t) => `- [ ] ${t}`).join("\n") + "\n");
}
console.log(`added ${added.length} items:`, added);
```

- [ ] **Step 2: Dry-run count first (no write) to confirm the target is 11**

> Note: the `Task List.base` live rows are the TOP-LEVEL `.md` files only (the extractor reads them non-recursively). That count is **11** (9 `To Do` + 2 `Blocked`). An earlier draft said 13 from a *recursive* grep that wrongly included 2 `Not started` items belonging to the `iTerm2 configuration` sub-database — those were promoted to `10-Admin/Tech` in Task 10 and are not general to-dos.

```bash
node -e "const fs=require('fs'),p=require('./80-LifeOS/_scripts/paths.js');
const d=p.abs('Notion/Task List');let n=0;
for(const f of fs.readdirSync(d)){if(!f.endsWith('.md'))continue;
const m=fs.readFileSync(d+'/'+f,'utf8').match(/^Status:\s*(.+)$/m);
if(m&&['To Do','Not started','Blocked'].includes(m[1].trim()))n++;}
console.log('live tasks:',n);"
```
Expected: `live tasks: 11`.

- [ ] **Step 3: Run the extraction**

```bash
node 80-LifeOS/_scripts/extract-tasklist.js
```
Expected: `added N items: [ … ]` where N ≤ 11 (fewer if any duplicate existing Todo entries).

- [ ] **Step 4: Verify Todo has no duplicate lines**

```bash
grep -c '^- \[ \]' "01-Tasks/Todo.md"
grep '^- \[ \]' "01-Tasks/Todo.md" | sed 's/^- \[ \] //' | sort -f | uniq -d
```
Expected: a count ≈ 22 + N; the `uniq -d` line prints **nothing** (no duplicates).

- [ ] **Step 5: Commit**

```bash
git add 80-LifeOS/_scripts/extract-tasklist.js "01-Tasks/Todo.md"
git commit -q -m "feat: extract live Task-List items into Todo (deduped)"
```

---

## Task 12: Reshelve remaining Notion → `90-Archive` + flatten wrappers

**Files:**
- Move: everything left under `Notion/` → `90-Archive/<domain>/`.

**Interfaces:**
- Produces: an empty `Notion/` (removed) and all dormant content under `90-Archive`, preserving original subfolder names.

- [ ] **Step 1: Move remaining top-level Notion groups to archive domains**

```bash
cd /Users/bgopalbaaskaran/workspace/projects/assistant/SecondBrain
git mv "Notion/Task List" "90-Archive/Task-List/Task List"
git mv "Notion/Personal Home/Apartments" "90-Archive/Admin/Apartments"
git mv "Notion/Personal Home/Home inventory" "90-Archive/Admin/Home inventory"
git mv "Notion/Personal Home/Bills" "90-Archive/Finance/Bills"
git mv "Notion/Personal Home/Interview prep/GRE" "90-Archive/Learning/GRE"
git mv "Notion/Personal Home/B ❤️ M" "90-Archive/Personal/B ❤️ M"
git mv "Notion/Personal Home/Outfits" "90-Archive/Personal/Outfits"
git mv "Notion/Personal Home/Doctors" "90-Archive/Health/Doctors"   # remainder after Top doctors promoted
```

- [ ] **Step 2: Sweep any stragglers still under `Notion/` into the closest archive domain**

```bash
find Notion -mindepth 1 -maxdepth 2 -type d 2>/dev/null
find Notion -name '*.md' 2>/dev/null | head
```
For each remaining item, `git mv` it into the matching `90-Archive/<domain>/` (Personal Home leftovers → `90-Archive/Personal/`, Academic leftovers → `90-Archive/Learning/`, Reading List leftovers → `90-Archive/Learning/`, Work leftovers → `90-Archive/Career/`). Then:
```bash
git mv "Notion/Personal Home" "90-Archive/Personal/Personal Home" 2>/dev/null || true
git mv "Notion/Academic" "90-Archive/Learning/Academic" 2>/dev/null || true
git mv "Notion/Reading List" "90-Archive/Learning/Reading List" 2>/dev/null || true
git mv "Notion/Work" "90-Archive/Career/Work" 2>/dev/null || true
```

- [ ] **Step 3: Confirm `Notion/` is empty, then remove it**

```bash
find Notion -type f 2>/dev/null | head
rm -rf Notion   # only after the find above prints nothing
test ! -d Notion && echo "Notion removed"
```
Expected: the `find` prints nothing; `Notion removed`.

- [ ] **Step 4: Flatten Notion "New database" wrappers in the archive**

```bash
find 90-Archive -type d -name "New database" | while IFS= read -r d; do
  parent="$(dirname "$d")"; pname="$(basename "$parent")"
  # rename the .base to the parent's name, move contents up, drop the wrapper
  base="$(find "$d" -maxdepth 1 -name '*.base' | head -1)"
  [ -n "$base" ] && git mv "$base" "$parent/$pname.base" 2>/dev/null || true
  find "$d" -maxdepth 1 -mindepth 1 ! -name '*.base' -exec git mv {} "$parent"/ \; 2>/dev/null || true
  rmdir "$d" 2>/dev/null || true
done
find 90-Archive -type d -name "New database" | wc -l
```
Expected: final count `0` (all wrappers flattened). *(If a name collision blocks a move, leave that wrapper and note it — do not overwrite.)*

- [ ] **Step 5: Add archive `_index.md` orientation notes**

```bash
for d in Personal Career Finance Health Learning Projects Admin Task-List; do
  printf '# %s — Archive\n\nDormant Notion import. Excluded from graph/search. Nothing here is actively maintained.\n' "$d" > "90-Archive/$d/_index.md"
done
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -q -m "refactor: reshelve remaining Notion import into 90-Archive; flatten DB wrappers"
```

---

## Task 13: Centralize attachments → `99-Meta/Attachments`

**Files:**
- Move: loose root images/screenshots/PDFs → `99-Meta/Attachments/`
- Modify: `.obsidian/app.json` (attachment folder path)

**Interfaces:**
- Produces: a single attachments folder; wikilink embeds `![[name]]` continue to resolve by filename.

- [ ] **Step 1: Move loose root image/pdf files**

```bash
cd /Users/bgopalbaaskaran/workspace/projects/assistant/SecondBrain
shopt -s nullglob
for f in *.png *.jpg *.jpeg *.pdf; do git mv "$f" "99-Meta/Attachments/$f"; done
shopt -u nullglob
ls 99-Meta/Attachments | wc -l
```
Expected: ~30 files.

- [ ] **Step 2: Point Obsidian's default attachment location at the folder**

Edit `.obsidian/app.json` — set (add if absent) `"attachmentFolderPath": "99-Meta/Attachments"` and `"newLinkFormat": "shortest"`. Example resulting file:
```json
{
  "attachmentFolderPath": "99-Meta/Attachments",
  "newLinkFormat": "shortest"
}
```
(Preserve any other existing keys in that file.)

- [ ] **Step 3: Verify no embeds went unresolved**

```bash
# For each embedded basename, confirm exactly one file now exists in the vault.
grep -rhoE '!\[\[[^]|#]+' --include='*.md' . 2>/dev/null | sed 's/^!\[\[//' | sort -u | while IFS= read -r name; do
  [ -z "$name" ] && continue
  hits=$(find . -path ./.git -prune -o -name "$name" -print 2>/dev/null | wc -l | tr -d ' ')
  [ "$hits" = "0" ] && echo "MISSING: $name"
done
```
Expected: **no `MISSING:` lines** (every wikilink-embedded file resolves). Remote `https://…notion-static…` embeds are not matched by this check (external URLs).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -q -m "chore: centralize attachments into 99-Meta/Attachments"
```

---

## Task 14: Dashboards & MOCs

**Files:**
- Create: `00-Dashboard/Home.md`, `01`–`10` `_index.md` (11 files)
- Move: `Bharath's scratch pad.md` → `00-Dashboard/`; the planning docs → `99-Meta/planning/`

**Interfaces:**
- Produces: navigation entry points. MOCs use folder-scoped Dataview (no frontmatter backfill needed).

- [ ] **Step 1: Move the scratch pad and planning docs**

```bash
cd /Users/bgopalbaaskaran/workspace/projects/assistant/SecondBrain
git mv "Bharath's scratch pad.md" "00-Dashboard/Scratch pad.md"
git mv docs/superpowers "99-Meta/planning/superpowers"
rmdir docs 2>/dev/null || true
```

- [ ] **Step 2: Write the master dashboard**

Create `00-Dashboard/Home.md`:
```markdown
# 🏠 Home

## Domains
- [[01-Tasks/Todo|✅ Todo]] · [[01-Tasks/Inbox|📥 Inbox]]
- [[02-Personal]] · [[03-Career]] · [[04-Finance]] · [[05-Health]]
- [[06-Learning]] · [[07-Projects]] · [[08-Food]] · [[09-Shopping]] · [[10-Admin]]

## Friday (Life OS)
- [[08-Food/Meal Plan/Current|🍲 This week's meal plan]]
- Engine + protocols live in `80-LifeOS/` (do not reorganize).

## Recently modified
```dataview
TABLE file.mtime AS "Modified"
FROM "01-Tasks" OR "02-Personal" OR "05-Health" OR "07-Projects" OR "08-Food" OR "09-Shopping"
SORT file.mtime DESC
LIMIT 15
```
```

- [ ] **Step 3: Write one MOC per domain**

For each of `01-Tasks 02-Personal 03-Career 04-Finance 05-Health 06-Learning 07-Projects 08-Food 09-Shopping 10-Admin`, create `<domain>/_index.md`:
```bash
for d in 01-Tasks 02-Personal 03-Career 04-Finance 05-Health 06-Learning 07-Projects 08-Food 09-Shopping 10-Admin; do
  cat > "$d/_index.md" <<EOF
# ${d#*-}

\`\`\`dataview
LIST
FROM "$d"
WHERE file.name != "_index"
SORT file.name ASC
\`\`\`
EOF
done
```

- [ ] **Step 4: Verify files exist**

```bash
ls 00-Dashboard/Home.md; ls [0-9][0-9]-*/_index.md | wc -l
```
Expected: `Home.md` present; `10` index files.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -q -m "feat: add Home dashboard and per-domain MOCs; relocate scratch pad + planning docs"
```

---

## Task 15: Update engine docs, `.gitignore`, and sync script paths

**Files:**
- Modify: `80-LifeOS/agent-protocol/HEARTBEAT.md`, `80-LifeOS/agent-protocol/AGENTS.md`, `80-LifeOS/Capture instructions.md`, `80-LifeOS/Meal plan instructions.md`, `80-LifeOS/Deal triage instructions.md`, `80-LifeOS/News digest instructions.md`, `80-LifeOS/MOC.md`, `.gitignore`, `80-LifeOS/_scripts/sync_workspace.sh`

**Interfaces:**
- Produces: docs/config with correct `80-LifeOS/…` paths so Friday operates cleanly after openclaw restarts.

- [ ] **Step 1: Rewrite `~/SecondBrain/memory/` → `~/SecondBrain/80-LifeOS/` across the 6 docs**

```bash
cd /Users/bgopalbaaskaran/workspace/projects/assistant/SecondBrain
for f in "80-LifeOS/agent-protocol/HEARTBEAT.md" "80-LifeOS/agent-protocol/AGENTS.md" \
  "80-LifeOS/Capture instructions.md" "80-LifeOS/Meal plan instructions.md" \
  "80-LifeOS/Deal triage instructions.md" "80-LifeOS/News digest instructions.md"; do
  perl -0pi -e 's{~/SecondBrain/memory/}{~/SecondBrain/80-LifeOS/}g' "$f"
done
```

- [ ] **Step 2: Fix data-note references that moved OUT of the engine**

The docs also mention specific data notes now in domains. Update these references:
- In `AGENTS.md` and any instruction file: `80-LifeOS/Inbox.md` → `01-Tasks/Inbox.md`; the meal-plan/grocery references (`Recipes`, `Meal Plan`, `Items`, `Buy List`) → under `08-Food/`; `Deals.md` → `09-Shopping/Deals.md`; `News.md` → `02-Personal/Media/News.md`; `Things to return.md` → `09-Shopping/`.

```bash
for f in "80-LifeOS/agent-protocol/AGENTS.md" "80-LifeOS/agent-protocol/HEARTBEAT.md" \
  "80-LifeOS/Capture instructions.md" "80-LifeOS/Meal plan instructions.md" \
  "80-LifeOS/Deal triage instructions.md" "80-LifeOS/News digest instructions.md"; do
  perl -0pi -e 's{80-LifeOS/Inbox\.md}{01-Tasks/Inbox.md}g;
                 s{80-LifeOS/Deals\.md}{09-Shopping/Deals.md}g;
                 s{80-LifeOS/News\.md}{02-Personal/Media/News.md}g;
                 s{80-LifeOS/Things to return\.md}{09-Shopping/Things to return.md}g;
                 s{80-LifeOS/(Recipes|Meal Plan|Items|Buy List|Expiring Soon|Cookbook|Cooking References)}{08-Food/$1}g;
                 s{80-LifeOS/Todo\.md}{01-Tasks/Todo.md}g' "$f"
done
grep -rn "80-LifeOS/\(Inbox\|Deals\|News\|Todo\|Recipes\|Items\|Meal Plan\|Buy List\)" 80-LifeOS/agent-protocol 80-LifeOS/*instructions.md
```
Expected: the final `grep` prints **nothing** (no stale data-note paths remain under `80-LifeOS/`). Read each of the 6 docs once to confirm remaining `80-LifeOS/_scripts/...` and `80-LifeOS/logs` references are correct.

- [ ] **Step 3: `MOC.md` Dataview source + `.gitignore` + sync script**

```bash
perl -0pi -e 's{FROM "memory"}{FROM "80-LifeOS"}g' "80-LifeOS/MOC.md"
perl -0pi -e 's{^memory/_scripts/}{80-LifeOS/_scripts/}gm' ".gitignore"
perl -0pi -e 's{/Users/openclaw/SecondBrain/agent-protocol/}{/Users/openclaw/SecondBrain/80-LifeOS/agent-protocol/}g' "80-LifeOS/_scripts/sync_workspace.sh"
grep -n "memory" .gitignore "80-LifeOS/_scripts/sync_workspace.sh" "80-LifeOS/MOC.md" || echo "no stale memory refs"
```
Expected: `no stale memory refs` (or only unrelated matches you verify).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -q -m "docs: repoint engine docs/gitignore/sync from memory/ to 80-LifeOS/ + data domains"
```

---

## Task 16: Exclude `90-Archive` from graph & search

**Files:**
- Modify: `.obsidian/app.json` (userIgnoreFilters), `.obsidian/graph.json`

**Interfaces:**
- Produces: archive hidden from search + graph; capture already skips it via `paths.json scanExclude`.

- [ ] **Step 1: Add search/quick-switcher exclusion**

In `.obsidian/app.json`, add the key:
```json
"userIgnoreFilters": ["90-Archive/"]
```
(Merge into the existing JSON object created in Task 13, keeping prior keys.)

- [ ] **Step 2: Add a graph-view filter that hides the archive**

In `.obsidian/graph.json`, set the `"search"` field to exclude the archive:
```json
"search": "-path:90-Archive"
```

- [ ] **Step 3: Verify JSON validity**

```bash
python3 -c "import json; json.load(open('.obsidian/app.json')); json.load(open('.obsidian/graph.json')); print('obsidian config valid')"
```
Expected: `obsidian config valid`.

- [ ] **Step 4: Commit**

```bash
git add .obsidian/app.json .obsidian/graph.json
git commit -q -m "chore: exclude 90-Archive from Obsidian search and graph"
```

---

## Task 17: Final verification against success criteria

**Files:** none (verification + final commit)

**Interfaces:** Consumes the Task 1 baseline snapshot.

- [ ] **Step 1: No notes lost — counts match baseline**

```bash
cd /Users/bgopalbaaskaran/workspace/projects/assistant/SecondBrain
echo "now md=$(find . -path ./.git -prune -o -name '*.md' -print | wc -l | tr -d ' ') base=$(find . -path ./.git -prune -o -name '*.base' -print | wc -l | tr -d ' ')"
grep -E 'md_count|base_count' /tmp/reorg-baseline.txt
```
Expected: `now md` ≥ baseline `md_count` (baseline + new MOCs/_index files; the 11 extracted Task-List lines append to Todo.md and add no files; MOCs do), and `base` count unchanged at 36. Crucially, no *decrease* — reconcile any drop against `git status`/`git log` before proceeding.

- [ ] **Step 2: Engine works — capture discovers every destination**

```bash
node 80-LifeOS/_scripts/capture.js routes | grep '"note"' | sort > /tmp/routes-now.txt
diff <(grep '"note"' /tmp/reorg-baseline.txt | sort) /tmp/routes-now.txt && echo "ROUTES MATCH BASELINE"
```
Expected: `ROUTES MATCH BASELINE` (same destination set, now sourced from domains).

- [ ] **Step 3: Engine works — every script loads & resolves data**

```bash
node --test 80-LifeOS/_scripts/test/paths.test.js
for s in capture deals news notify-expiring notify-returns mealplan; do
  node -e "require('./80-LifeOS/_scripts/$s.js'); console.log('$s OK')" 2>&1 | tail -1
done
python3 -c "import sys; sys.path.insert(0,'80-LifeOS/_scripts'); import vault_sweeper as v; v.find_checklist_notes(v.VAULT_ROOT); print('sweeper OK (import + scoped scan, no live sweep)')"
node -e "const p=require('./80-LifeOS/_scripts/paths.js');const fs=require('fs');
['todo','inbox','deals','news','items','returns','recipes','mealPlan','buyList'].forEach(k=>{
  if(!fs.existsSync(p.get(k))) throw new Error('MISSING '+k); }); console.log('all data paths resolve');"
```
Expected: paths tests PASS; six `… OK` lines; `sweeper OK`; `all data paths resolve`.

- [ ] **Step 4: No stale `memory/` references anywhere in tracked files**

```bash
grep -rn --include='*.md' --include='*.js' --include='*.py' --include='*.sh' --include='*.json' \
  -e 'SecondBrain/memory' -e '"memory"' -e "'memory/" . 2>/dev/null | grep -v '.git/'
```
Expected: no output (all references migrated). Investigate any hit.

- [ ] **Step 5: `80-LifeOS` holds only engine; `90-Archive` excluded; no unresolved embeds**

```bash
echo "--- 80-LifeOS top level (engine only) ---"; ls 80-LifeOS
grep -q '90-Archive' .obsidian/app.json && echo "archive excluded in search config"
grep -rhoE '!\[\[[^]|#]+' --include='*.md' . 2>/dev/null | sed 's/^!\[\[//' | sort -u | while IFS= read -r n; do
  [ -z "$n" ] && continue
  [ "$(find . -path ./.git -prune -o -name "$n" -print 2>/dev/null | wc -l | tr -d ' ')" = "0" ] && echo "MISSING EMBED: $n"
done
```
Expected: `80-LifeOS` lists only `_scripts _templates logs _config.md MOC.md agent-protocol` + the four `*instructions.md`; `archive excluded in search config`; **no `MISSING EMBED:` lines**.

- [ ] **Step 6: Final commit + summary**

```bash
git add -A && git commit -q -m "chore: finalize vault reorganization" || echo "clean"
git log --oneline pre-reorg..HEAD
```
Report the task-by-task commit list and the before/after counts to the user. If everything passes, the user can transfer to the mac mini and restart openclaw.

---

## Post-migration (user)
1. Transfer the updated vault to the mac mini; restart openclaw.
2. Watch Friday's next heartbeat: confirm capture/inbox-sweep, expiry & returns notifiers, deal/news triage, and meal-plan commands all run against the new paths.
3. Rollback if needed: `git reset --hard pre-reorg`.
