# Cookbook

Browse dishes grouped by meal. Tap ➕ next to a dish, then pick a day/slot to add
it to this week's plan. (View this note in Reading mode so the buttons work.)

```dataviewjs
const qa = app.plugins.plugins.quickadd?.api;
const recipes = dv.pages('"08-Food/Recipes"').where((p) => p.type === "recipe");
const groups = {};
for (const p of recipes) {
  const meals = Array.isArray(p.meal) ? p.meal : (p.meal ? [p.meal] : ["(untagged)"]);
  for (const meal of meals) (groups[meal] ??= []).push(p);
}
for (const meal of Object.keys(groups).sort()) {
  dv.header(2, meal);
  const sorted = groups[meal].sort((a, b) => a.file.name.localeCompare(b.file.name));
  for (const p of sorted) {
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
}
```
