// End-to-end pipeline test using the real bundle seed files.
// Mirrors what generateGroceryList does, but reads via fs instead of the
// Obsidian API, so it runs under plain Node.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const M = require("../mealplan.js");

const VAULT = path.join(__dirname, "..", "..");
const read = (p) => fs.readFileSync(path.join(VAULT, p), "utf8");

// Minimal frontmatter store/category reader (mirrors metadataCache lookups).
function buildStoreIndexFromDisk() {
  const index = {};
  for (const name of fs.readdirSync(path.join(VAULT, "Items"))) {
    if (!name.endsWith(".md")) continue;
    const txt = read(`Items/${name}`);
    // [ \t]* (not \s*) so an empty value doesn't swallow the next line.
    const store = (txt.match(/^store:[ \t]*(.*)$/m) || [, ""])[1].trim();
    const category = (txt.match(/^category:[ \t]*(.*)$/m) || [, ""])[1].trim();
    index[name.replace(/\.md$/, "")] = { store, category };
  }
  return index;
}

function generateFromDisk(planText, staplesText) {
  const rows = [];
  const unknown = [];
  for (const dish of M.parsePlanDishes(planText)) {
    const p = `Recipes/${dish}.md`;
    if (!fs.existsSync(path.join(VAULT, p))) { unknown.push(dish); continue; }
    for (const ing of M.parseIngredients(read(p))) rows.push({ ...ing, source: dish });
  }
  for (const s of M.parseItemLines(staplesText)) rows.push({ ...s, source: "Staples" });
  const g = M.groupByStore(M.aggregate(rows), buildStoreIndexFromDisk(), [
    "Costco", "Fred Meyer", "Indian Store",
  ]);
  return { out: M.renderGroceryList({ date: "2026-06-08", ...g }), unknown };
}

test("full pipeline produces a correct grocery list from seed data", () => {
  const plan = "# Plan\n## Mon 06-08\n### Lunch\n- [[Tomato Chutney]]\n### Dinner\n- [[Sambar]]\n";
  const staples = "# Staples\n- [[Tissue Paper]] | 2 packs\n";
  const { out } = generateFromDisk(plan, staples);

  // de-dupe: each item appears on exactly one line
  assert.strictEqual((out.match(/^- \[ \] Onion —/gm) || []).length, 1, "Onion de-duped");
  // per-dish breakdown array carries both dishes (order = plan order)
  assert.match(out, /- \[ \] Onion — .*Tomato Chutney \(1 small\)/);
  assert.match(out, /- \[ \] Onion — .*Sambar \(1 medium\)/);
  assert.match(out, /- \[ \] Tomato — .*Sambar \(2\)/);
  assert.match(out, /- \[ \] Tomato — .*Tomato Chutney \(3\)/);
  // staple merged under its store
  assert.match(out, /- \[ \] Tissue Paper — Staples/);
  // store grouping + order
  const costco = out.indexOf("## Costco");
  const fred = out.indexOf("## Fred Meyer");
  const indian = out.indexOf("## Indian Store");
  assert.ok(costco >= 0 && fred >= 0 && indian >= 0);
  assert.ok(costco < fred && fred < indian, "stores in configured order");
  // store-less item flagged
  assert.match(out, /## ⚠️ Needs a store assigned[\s\S]*Tamarind/);
});

test("unknown dish is reported, not crashed on", () => {
  const plan = "## Mon\n### Lunch\n- [[Nonexistent Dish]]\n";
  const { out, unknown } = generateFromDisk(plan, "");
  assert.deepStrictEqual(unknown, ["Nonexistent Dish"]);
  assert.ok(typeof out === "string");
});
