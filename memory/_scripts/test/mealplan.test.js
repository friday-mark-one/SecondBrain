const test = require("node:test");
const assert = require("node:assert");
const M = require("../mealplan.js");

test("module loads", () => {
  assert.ok(Array.isArray(M.WEEKDAYS));
  assert.strictEqual(M.WEEKDAYS.length, 7);
});

// ---------- Task 4: parsing ----------

test("extractWikiLinks returns inner names in order", () => {
  assert.deepStrictEqual(
    M.extractWikiLinks("a [[Onion]] b [[Toor Dal|dal]] c"),
    ["Onion", "Toor Dal"]
  );
});

test("parsePlanDishes collects links under any heading", () => {
  const plan = "# Plan\n## Mon 06-08\n### Lunch\n- [[Idli]]\n### Dinner\n- [[Sambar]]\n";
  assert.deepStrictEqual(M.parsePlanDishes(plan), ["Idli", "Sambar"]);
});

test("parseItemLines parses item and amount", () => {
  const text = "- [[Onion]] | 1 medium\n- [[Tomato]]\nnot a line";
  assert.deepStrictEqual(M.parseItemLines(text), [
    { item: "Onion", amount: "1 medium" },
    { item: "Tomato", amount: "" },
  ]);
});

test("parseIngredients reads only the Ingredients section", () => {
  const recipe = "---\ntype: recipe\n---\n## Ingredients\n- [[Onion]] | 1\n\n## Directions\n1. [[NotAnIngredient]]\n";
  assert.deepStrictEqual(M.parseIngredients(recipe), [{ item: "Onion", amount: "1" }]);
});

// ---------- Task 5: aggregation + store grouping ----------

test("aggregate groups by item, first-seen order, keeps sources", () => {
  const rows = [
    { item: "Onion", amount: "1 medium", source: "Sambar" },
    { item: "Tomato", amount: "2", source: "Sambar" },
    { item: "Onion", amount: "1 small", source: "Chutney" },
  ];
  assert.deepStrictEqual(M.aggregate(rows), [
    { item: "Onion", sources: [
      { source: "Sambar", amount: "1 medium" },
      { source: "Chutney", amount: "1 small" },
    ] },
    { item: "Tomato", sources: [{ source: "Sambar", amount: "2" }] },
  ]);
});

test("renderBreakdown formats sources with and without amounts", () => {
  assert.strictEqual(
    M.renderBreakdown([{ source: "Sambar", amount: "1 cup" }, { source: "Staples", amount: "" }]),
    "Sambar (1 cup), Staples"
  );
});

test("groupByStore splits known, missing-note, and needs-store", () => {
  const items = [
    { item: "Onion", sources: [] },
    { item: "Toor Dal", sources: [] },
    { item: "Tamarind", sources: [] },   // entry exists but empty store
    { item: "Ghee", sources: [] },        // no entry at all
  ];
  const idx = {
    Onion: { store: "Costco", category: "Produce" },
    "Toor Dal": { store: "Indian Store", category: "Lentils" },
    Tamarind: { store: "", category: "" },
  };
  const r = M.groupByStore(items, idx, ["Costco", "Fred Meyer", "Indian Store"]);
  assert.deepStrictEqual(r.stores, ["Costco", "Indian Store"]);
  assert.strictEqual(r.grouped["Costco"][0].item, "Onion");
  assert.deepStrictEqual(r.needsStore.map((i) => i.item), ["Tamarind"]);
  assert.deepStrictEqual(r.missingItemNote.map((i) => i.item), ["Ghee"]);
});

// ---------- Task 6: rendering + check preservation ----------

test("renderGroceryList renders stores, breakdowns, and warning sections", () => {
  const grouped = {
    Costco: [{ item: "Onion", sources: [{ source: "Sambar", amount: "1 medium" }] }],
  };
  const out = M.renderGroceryList({
    date: "2026-06-08",
    grouped,
    stores: ["Costco"],
    needsStore: [{ item: "Tamarind", sources: [{ source: "Sambar", amount: "lemon-sized" }] }],
    missingItemNote: [],
  });
  assert.match(out, /# Grocery List — 2026-06-08/);
  assert.match(out, /## Costco/);
  assert.match(out, /- \[ \] Onion — Sambar \(1 medium\)/);
  assert.match(out, /## ⚠️ Needs a store assigned/);
  assert.match(out, /- \[ \] Tamarind — Sambar \(lemon-sized\)/);
});

test("extractCheckedItems finds ticked item names", () => {
  const list = "## Costco\n- [x] Onion — Sambar (1)\n- [ ] Tomato — Sambar (2)\n";
  const set = M.extractCheckedItems(list);
  assert.ok(set.has("Onion"));
  assert.ok(!set.has("Tomato"));
});

test("preserveChecks re-applies checks for items still present", () => {
  const oldList = "## Costco\n- [x] Onion — Sambar (1)\n";
  const newList = "## Costco\n- [ ] Onion — Sambar (1), Chutney (1)\n- [ ] Tomato — Chutney (3)\n";
  const merged = M.preserveChecks(newList, oldList);
  assert.match(merged, /- \[x\] Onion —/);
  assert.match(merged, /- \[ \] Tomato —/);
});

// ---------- Task 7: slots, insertion, skeleton ----------

const SKELETON = "# Meal Plan — week of 2026-06-08\n\n## Mon 06-08\n### Lunch\n### Dinner\n\n## Tue 06-09\n### Lunch\n### Dinner\n";

test("listSlots returns composite labels per day+slot", () => {
  const slots = M.listSlots(SKELETON);
  assert.deepStrictEqual(slots.map((s) => s.label), [
    "Mon 06-08 › Lunch", "Mon 06-08 › Dinner",
    "Tue 06-09 › Lunch", "Tue 06-09 › Dinner",
  ]);
});

test("insertDishUnderSlot adds dish under the right day+slot", () => {
  const out = M.insertDishUnderSlot(SKELETON, "Mon 06-08", "Dinner", "Sambar");
  assert.match(out, /### Dinner\n- \[\[Sambar\]\]/);
  const out2 = M.insertDishUnderSlot(out, "Mon 06-08", "Dinner", "Beans");
  assert.match(out2, /### Dinner\n- \[\[Sambar\]\]\n- \[\[Beans\]\]/);
});

test("insertDishUnderSlot targets the correct day's slot, not the first match", () => {
  const out = M.insertDishUnderSlot(SKELETON, "Tue 06-09", "Lunch", "Idli");
  assert.match(out, /## Tue 06-09\n### Lunch\n- \[\[Idli\]\]/);
  // Mon Lunch must remain empty
  assert.match(out, /## Mon 06-08\n### Lunch\n### Dinner/);
});

test("buildPlanSkeleton generates N day headings with slots, UTC-deterministic", () => {
  const out = M.buildPlanSkeleton("2026-06-08", 2, ["Lunch", "Dinner"]);
  assert.match(out, /## Mon 06-08\n### Lunch\n### Dinner/);
  assert.match(out, /## Tue 06-09\n### Lunch\n### Dinner/);
});

test("buildPlanSkeleton rolls over month boundaries", () => {
  const out = M.buildPlanSkeleton("2026-06-30", 2, ["Lunch"]);
  assert.match(out, /## Tue 06-30\n### Lunch/);
  assert.match(out, /## Wed 07-01\n### Lunch/);
});

// ---------- Task 8: staples archive split ----------

test("archiveStaplesSplit separates bought from kept, preserves non-item lines", () => {
  const staples = "# Staples\n\n- [[Tissue Paper]] | 2 packs\n- [[Drinking Water]] | 1 case\n";
  const checked = new Set(["Tissue Paper"]); // bought tissue, water out of stock
  const { bought, kept } = M.archiveStaplesSplit(staples, checked);
  assert.deepStrictEqual(bought, ["- [[Tissue Paper]] | 2 packs"]);
  assert.ok(kept.includes("- [[Drinking Water]] | 1 case"));
  assert.ok(kept.includes("# Staples"));
  assert.ok(!kept.includes("- [[Tissue Paper]] | 2 packs"));
});
