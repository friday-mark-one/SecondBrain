# Cookbook

Browse dishes by category. Tap ➕ next to a dish, then pick a day/slot to add it
to this week's plan. (View this note in Reading mode so the buttons work.)

```dataviewjs
const qa = app.plugins.plugins.quickadd?.api;
const CATEGORIES = [
  "Breakfast",
  "Tiffin",
  "Sides",
  "South Indian",
  "Poriyal",
  "North Indian",
  "Italian",
  "Chinese",
  "Japanese",
  "Snacks",
  "Dessert",
];

const recipes = dv.pages('"08-Food/Recipes"').where((p) => p.type === "recipe");
const groups = new Map(CATEGORIES.map((c) => [c, []]));
const uncategorized = [];

for (const p of recipes) {
  const cats = Array.isArray(p.category) ? p.category : (p.category ? [p.category] : []);
  const known = cats.filter((c) => groups.has(c));
  if (known.length === 0) uncategorized.push(p);
  for (const c of known) groups.get(c).push(p);
}

function renderDish(p) {
  const row = dv.el("div", "");
  const btn = row.createEl("button", { text: "➕" });
  btn.style.marginRight = "8px";
  btn.onclick = async () => {
    if (!qa) { new Notice("QuickAdd API unavailable"); return; }
    await qa.executeChoice("Add Dish To Plan", { dish: p.file.name });
  };
  const link = row.createEl("a", { text: p.file.name, href: p.file.path });
  link.classList.add("internal-link");
}

for (const cat of CATEGORIES) {
  dv.header(2, cat);
  const items = groups.get(cat).sort((a, b) => a.file.name.localeCompare(b.file.name));
  if (items.length === 0) {
    dv.el("div", "No dishes yet.");
    continue;
  }
  for (const p of items) renderDish(p);
}

if (uncategorized.length) {
  dv.header(2, "Uncategorized");
  uncategorized.sort((a, b) => a.file.name.localeCompare(b.file.name)).forEach(renderDish);
}
```
