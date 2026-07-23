// GENERATED from ../restaurants.js — do not edit by hand.
// Edit restaurants.js, then recompile:
//   node /path/to/scratchpad/gen-restaurant-cmd.js  (see chat), or inline the same slice+append.

// Restaurants journal — QuickAdd "Add to Restaurants" command engine.
// Pure helpers are unit-tested with node:test (see test/restaurants.test.js).
// The adapter (addRestaurantEntry) uses the Obsidian `app` + QuickAdd API; it
// references those only inside its body, so this module loads under Node.

// Vault subfolder the restaurants DB lives in. Must end with "/".
const BASE = "08-Food/";
const DIR = BASE + "Restaurants/";
const VEGAN_VALUES = ["good-options", "dedicated", "limited"];

// ---------- Pure helpers ----------

// Filesystem-safe note basename (only "/" is illegal in Obsidian note names).
function restaurantFileName(name) {
  return String(name).trim().replace(/\//g, "-");
}

// One dish -> a markdown table row. Blanks allowed; "|" escaped so it can't
// break the table.
function dishRow({ item, mira, bharath, notes }) {
  const cell = (v) => String(v == null ? "" : v).replace(/\|/g, "\\|").trim();
  return `| ${cell(item)} | ${cell(mira)} | ${cell(bharath)} | ${cell(notes)} |`;
}

// A fresh restaurant note: frontmatter + empty dish table (header + separator).
function buildRestaurantNote({ name, cuisine, location, vegan }) {
  return [
    "---",
    "type: restaurant",
    `cuisine: ${cuisine || ""}`,
    `location: ${location || ""}`,
    `vegan: ${vegan || "good-options"}`,
    "---",
    "",
    `# ${name}`,
    "",
    "| Dish | Mira | Bharath | Notes |",
    "| --- | --- | --- | --- |",
    "",
  ].join("\n");
}

// Insert a dish row after the last table line (any line starting with "|"),
// leaving a "## Tips" section or trailing content untouched. If the note has no
// table (malformed), append a fresh one.
function appendDishRow(noteText, row) {
  const lines = noteText.split("\n");
  let last = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trimStart().startsWith("|")) last = i;
  }
  if (last === -1) {
    const table = ["", "| Dish | Mira | Bharath | Notes |", "| --- | --- | --- | --- |", row];
    return noteText.replace(/\s*$/, "") + "\n" + table.join("\n") + "\n";
  }
  lines.splice(last + 1, 0, row);
  return lines.join("\n");
}

// ---------- Obsidian adapter (run via QuickAdd; not unit-tested) ----------

async function addRestaurantEntry(params) {
  const { quickAddApi } = params;
  const A = app.vault.adapter;

  const existing = app.vault.getMarkdownFiles()
    .filter((f) => f.path.startsWith(DIR))
    .map((f) => f.basename)
    .sort((a, b) => a.localeCompare(b));

  const NEW = "➕ New restaurant…";
  const choice = await quickAddApi.suggester([NEW, ...existing], [NEW, ...existing]);
  if (!choice) return;

  let name;
  if (choice === NEW) {
    name = (await quickAddApi.inputPrompt("Restaurant name") || "").trim();
    if (!name) { new Notice("Cancelled — no name given."); return; }
    const path = DIR + restaurantFileName(name) + ".md";
    if (await A.exists(path)) {
      new Notice(`"${name}" already exists — adding to it.`);
    } else {
      const cuisine = (await quickAddApi.inputPrompt("Cuisine") || "").trim();
      const location = (await quickAddApi.inputPrompt("Location (city/area)") || "").trim();
      const vegan = (await quickAddApi.suggester(VEGAN_VALUES, VEGAN_VALUES)) || "good-options";
      await A.write(path, buildRestaurantNote({ name, cuisine, location, vegan }));
      new Notice(`Created ${name}.`);
    }
  } else {
    name = choice;
  }

  const path = DIR + restaurantFileName(name) + ".md";
  let added = 0;
  for (;;) {
    const item = (await quickAddApi.inputPrompt(`Dish at ${name} (blank to finish)`) || "").trim();
    if (!item) break;
    const mira = (await quickAddApi.inputPrompt(`Mira's score for "${item}"`) || "").trim();
    const bharath = (await quickAddApi.inputPrompt(`Bharath's score for "${item}"`) || "").trim();
    const notes = (await quickAddApi.inputPrompt(`Notes for "${item}"`) || "").trim();
    const text = await A.read(path);
    await A.write(path, appendDishRow(text, dishRow({ item, mira, bharath, notes })));
    added++;
    new Notice(`✓ ${item} → ${name}`);
    const more = await quickAddApi.suggester(["Add another dish", "Done"], ["more", "done"]);
    if (more !== "more") break;
  }
  new Notice(added ? `Done — ${added} dish(es) added to ${name}.` : "No dishes added.");
}

module.exports = addRestaurantEntry;
