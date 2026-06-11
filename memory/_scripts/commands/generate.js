// GENERATED from ../mealplan.js by build-commands.js — do not edit by hand.
// Edit mealplan.js, then re-run: node build-commands.js

// Deterministic meal-planning engine.
// Pure helpers are unit-tested with node:test (see test/mealplan.test.js).
// Adapter functions (generate/add/new-plan/archive) use the Obsidian `app`
// API via QuickAdd. They reference Obsidian only inside their bodies, so this
// module still loads cleanly under Node for testing.

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Vault subfolder this system lives in. "" = vault root. Must end with "/".
// Used only by the Obsidian adapters below (not by the pure helpers).
const BASE = "memory/";

// ---------- Pure helpers ----------

function extractWikiLinks(text) {
  const out = [];
  const re = /\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/g;
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[1].trim());
  return out;
}

function parsePlanDishes(planText) {
  return extractWikiLinks(planText);
}

function parseItemLines(text) {
  const rows = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("-")) continue;
    const links = extractWikiLinks(line);
    if (links.length === 0) continue;
    const bar = line.indexOf("|");
    const amount = bar === -1 ? "" : line.slice(bar + 1).trim();
    rows.push({ item: links[0], amount });
  }
  return rows;
}

function parseIngredients(recipeText) {
  const lines = recipeText.split("\n");
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,6}\s+ingredients\s*$/i.test(lines[i].trim())) { start = i + 1; break; }
  }
  if (start === -1) return [];
  let end = lines.length;
  for (let i = start; i < lines.length; i++) {
    if (/^#{1,6}\s+/.test(lines[i])) { end = i; break; }
  }
  return parseItemLines(lines.slice(start, end).join("\n"));
}

function aggregate(rows) {
  const map = new Map();
  for (const { item, amount, source } of rows) {
    if (!map.has(item)) map.set(item, { item, sources: [] });
    map.get(item).sources.push({ source, amount });
  }
  return [...map.values()];
}

function renderBreakdown(sources) {
  return sources
    .map((s) => (s.amount ? `${s.source} (${s.amount})` : s.source))
    .join(", ");
}

function groupByStore(items, storeIndex, storeOrder) {
  const grouped = {};
  const missingItemNote = [];
  const needsStore = [];
  for (const it of items) {
    const meta = storeIndex[it.item];
    if (!meta) { missingItemNote.push(it); continue; }
    if (!meta.store) { needsStore.push(it); continue; }
    (grouped[meta.store] ||= []).push(it);
  }
  const stores = [
    ...storeOrder.filter((s) => grouped[s]),
    ...Object.keys(grouped).filter((s) => !storeOrder.includes(s)).sort(),
  ];
  return { grouped, stores, missingItemNote, needsStore };
}

function renderGroceryList({ date, grouped, stores, missingItemNote, needsStore, detail = "full" }) {
  const fmt = (it) => detail === "off"
    ? `- [ ] ${it.item}`
    : `- [ ] ${it.item} — ${renderBreakdown(it.sources)}`;
  const lines = [`# Grocery List — ${date}`, ""];
  for (const store of stores) {
    lines.push(`## ${store}`);
    for (const it of grouped[store]) lines.push(fmt(it));
    lines.push("");
  }
  if (needsStore.length) {
    lines.push("## ⚠️ Needs a store assigned");
    for (const it of needsStore) lines.push(fmt(it));
    lines.push("");
  }
  if (missingItemNote.length) {
    lines.push("## ⚠️ Missing item note");
    for (const it of missingItemNote) lines.push(fmt(it));
    lines.push("");
  }
  return lines.join("\n").trimEnd() + "\n";
}

function extractCheckedItems(listText) {
  const set = new Set();
  for (const raw of (listText || "").split("\n")) {
    const m = raw.match(/^- \[x\]\s+(.+?)(?:\s+—.*)?\s*$/i);
    if (m) set.add(m[1].trim());
  }
  return set;
}

function preserveChecks(newText, oldText) {
  const checked = extractCheckedItems(oldText);
  return newText.split("\n").map((line) => {
    const m = line.match(/^- \[ \]\s+(.+?)(?:\s+—.*)?\s*$/);
    if (m && checked.has(m[1].trim())) return line.replace("- [ ]", "- [x]");
    return line;
  }).join("\n");
}

function listSlots(planText) {
  const lines = planText.split("\n");
  const slots = [];
  let day = null;
  for (let i = 0; i < lines.length; i++) {
    const dm = lines[i].match(/^##\s+(.+?)\s*$/);
    if (dm) { day = dm[1].trim(); continue; }
    const sm = lines[i].match(/^###\s+(.+?)\s*$/);
    if (sm && day) {
      const slot = sm[1].trim();
      slots.push({ day, slot, label: `${day} › ${slot}`, lineIndex: i });
    }
  }
  return slots;
}

function insertDishUnderSlot(planText, day, slot, dish) {
  const lines = planText.split("\n");
  let i = 0;
  for (; i < lines.length; i++) {
    const dm = lines[i].match(/^##\s+(.+?)\s*$/);
    if (dm && dm[1].trim() === day) { i++; break; }
  }
  for (; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) break;
    const sm = lines[i].match(/^###\s+(.+?)\s*$/);
    if (sm && sm[1].trim() === slot) { i++; break; }
  }
  let insertAt = i;
  for (let j = i; j < lines.length; j++) {
    if (/^#{2,3}\s+/.test(lines[j])) break;
    if (lines[j].trim().startsWith("-")) insertAt = j + 1;
  }
  lines.splice(insertAt, 0, `- [[${dish}]]`);
  return lines.join("\n");
}

function buildPlanSkeleton(startDateISO, days, slots) {
  const [y, mo, d] = startDateISO.split("-").map(Number);
  const out = [`# Meal Plan — week of ${startDateISO}`, ""];
  for (let k = 0; k < days; k++) {
    const dt = new Date(Date.UTC(y, mo - 1, d + k));
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    out.push(`## ${WEEKDAYS[dt.getUTCDay()]} ${mm}-${dd}`);
    for (const s of slots) out.push(`### ${s}`);
    out.push("");
  }
  return out.join("\n").trimEnd() + "\n";
}

function archiveStaplesSplit(staplesText, checkedSet) {
  const bought = [];
  const kept = [];
  for (const raw of staplesText.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    const links = extractWikiLinks(line);
    if (line.trim().startsWith("-") && links.length) {
      (checkedSet.has(links[0]) ? bought : kept).push(line);
    } else {
      kept.push(line);
    }
  }
  return { bought, kept };
}

// ---------- Obsidian adapters (run via QuickAdd; not unit-tested) ----------

function readConfig() {
  const f = app.vault.getAbstractFileByPath(BASE + "_config.md");
  const fm = (f && app.metadataCache.getFileCache(f)?.frontmatter) || {};
  return {
    storeOrder: fm.store_order || ["Costco", "Fred Meyer", "Indian Store"],
    mealSlots: fm.meal_slots || ["Lunch", "Dinner"],
    defaultDays: fm.default_plan_days || 7,
  };
}

function buildStoreIndex() {
  const index = {};
  for (const f of app.vault.getMarkdownFiles()) {
    if (!f.path.startsWith(BASE + "Items/")) continue;
    const fm = app.metadataCache.getFileCache(f)?.frontmatter || {};
    if (fm.type !== "item") continue;
    index[f.basename] = { store: fm.store || "", category: fm.category || "" };
  }
  return index;
}

// Read grocery_detail straight from the _config.md text (robust right after a
// toggle write, when metadataCache may still be stale). Defaults to "full".
function detailFromConfigText(text) {
  return (text.match(/^grocery_detail:\s*(\w+)/m) || [, "full"])[1];
}

async function buildAndWriteList(detail) {
  const cfg = readConfig();
  const A = app.vault.adapter;
  const plan = await A.read(BASE + "Meal Plan/Current.md");
  const dishes = parsePlanDishes(plan);

  const rows = [];
  const unknownDishes = [];
  for (const dish of dishes) {
    const path = `${BASE}Recipes/${dish}.md`;
    if (!(await A.exists(path))) { unknownDishes.push(dish); continue; }
    for (const ing of parseIngredients(await A.read(path))) rows.push({ ...ing, source: dish });
  }
  if (await A.exists(BASE + "Staples.md")) {
    for (const s of parseItemLines(await A.read(BASE + "Staples.md"))) rows.push({ ...s, source: "Staples" });
  }

  const g = groupByStore(aggregate(rows), buildStoreIndex(), cfg.storeOrder);
  const date = window.moment().format("YYYY-MM-DD");
  let out = renderGroceryList({ date, ...g, detail });
  if (unknownDishes.length) {
    out += "\n## ⚠️ Unknown dish\n" + unknownDishes.map((d) => `- [ ] ${d}`).join("\n") + "\n";
  }

  const listPath = BASE + "Grocery List/Current.md";
  const old = (await A.exists(listPath)) ? await A.read(listPath) : "";
  await A.write(listPath, preserveChecks(out, old));
}

async function generateGroceryList(params) {
  const text = await app.vault.adapter.read(BASE + "_config.md");
  await buildAndWriteList(detailFromConfigText(text));
  new Notice("Grocery list generated.");
}

// Flip grocery_detail between "full" and "off", then regenerate (checkmarks kept).
async function toggleGroceryDetail(params) {
  const A = app.vault.adapter;
  const p = BASE + "_config.md";
  let text = await A.read(p);
  const next = detailFromConfigText(text) === "off" ? "full" : "off";
  text = /^grocery_detail:/m.test(text)
    ? text.replace(/^grocery_detail:.*$/m, `grocery_detail: ${next}`)
    : text.replace(/^---\n/, `---\ngrocery_detail: ${next}\n`);
  await A.write(p, text);
  await buildAndWriteList(next);
  new Notice(`Grocery detail: ${next.toUpperCase()}`);
}

async function addDishToPlan(params) {
  const dish = params?.variables?.dish;
  if (!dish) { new Notice("No dish provided."); return; }
  const A = app.vault.adapter;
  const planPath = BASE + "Meal Plan/Current.md";
  const plan = await A.read(planPath);
  const slots = listSlots(plan);
  if (!slots.length) { new Notice('No slots. Run "New Weekly Plan" first.'); return; }
  const choice = await params.quickAddApi.suggester(slots.map((s) => s.label), slots);
  if (!choice) return;
  await A.write(planPath, insertDishUnderSlot(plan, choice.day, choice.slot, dish));
  new Notice(`Added ${dish} to ${choice.label}.`);
}

async function newWeeklyPlan(params) {
  const cfg = readConfig();
  const A = app.vault.adapter;
  const daysStr = await params.quickAddApi.inputPrompt(`How many days? (default ${cfg.defaultDays})`);
  const days = parseInt(daysStr, 10) || cfg.defaultDays;
  const start = window.moment().format("YYYY-MM-DD");
  await A.write(BASE + "Meal Plan/Current.md", buildPlanSkeleton(start, days, cfg.mealSlots));
  new Notice("New weekly plan created.");
}

async function archiveAndReset(params) {
  const cfg = readConfig();
  const A = app.vault.adapter;
  const date = window.moment().format("YYYY-MM-DD");
  const listPath = BASE + "Grocery List/Current.md";
  const planPath = BASE + "Meal Plan/Current.md";

  const listText = (await A.exists(listPath)) ? await A.read(listPath) : "";
  const checked = extractCheckedItems(listText);

  if (await A.exists(BASE + "Staples.md")) {
    const { bought, kept } = archiveStaplesSplit(await A.read(BASE + "Staples.md"), checked);
    if (bought.length) {
      await A.write(`${BASE}Archive/${date} Staples Bought.md`, `# Staples bought — ${date}\n\n` + bought.join("\n") + "\n");
    }
    await A.write(BASE + "Staples.md", kept.join("\n").replace(/\s+$/, "") + "\n");
  }

  if (await A.exists(planPath)) await A.write(`${BASE}Archive/${date} Meal Plan.md`, await A.read(planPath));
  if (listText) await A.write(`${BASE}Archive/${date} Grocery List.md`, listText);
  if (await A.exists(listPath)) await A.remove(listPath);

  const start = window.moment().format("YYYY-MM-DD");
  await A.write(planPath, buildPlanSkeleton(start, cfg.defaultDays, cfg.mealSlots));
  new Notice("Archived and reset.");
}

module.exports = generateGroceryList;
