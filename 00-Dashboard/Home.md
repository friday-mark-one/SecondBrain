# 🏠 Home

> [!todo] Today
> [[01-Tasks/Todo|✅ Todo]] · [[01-Tasks/Inbox|📥 Inbox]] · [[00-Dashboard/Scratch pad|📝 Scratch pad]]

> [!tip] Kitchen
> [[08-Food/Meal Plan/Current|🍲 Meal plan]] · [[08-Food/Buy List|🛒 Buy List]] · [[Restaurants.base|🍽️ Restaurants]]

## 🍲 Today's meals
```dataviewjs
const path = "08-Food/Meal Plan/Current.md";
const today = window.moment().format("MM-DD");
let content = "";
try { content = await dv.io.load(path); } catch (e) { content = ""; }
const lines = (content || "").split("\n");

let start = -1;
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^##\s+\S+\s+(\d{2}-\d{2})\s*$/);   // e.g. "## Thu 07-09"
  if (m && m[1] === today) { start = i; break; }
}

if (start === -1) {
  dv.paragraph("No plan for today — [[08-Food/Meal Plan/Current|open the meal plan]].");
} else {
  const order = [], meals = {};
  let meal = null, any = false;
  for (let j = start + 1; j < lines.length; j++) {
    if (/^##\s/.test(lines[j])) break;                         // next day
    const t = lines[j].trim();
    if (/^###\s/.test(t)) { meal = t.replace(/^###\s+/, ""); meals[meal] = []; order.push(meal); }
    else if (t && meal) { meals[meal].push(t.replace(/^-\s+/, "")); any = true; }
  }
  if (!any) {
    dv.paragraph("Nothing planned today — [[08-Food/Meal Plan/Current|open the meal plan]].");
  } else {
    for (const name of order) {
      if (!meals[name].length) continue;
      dv.header(4, name);
      dv.list(meals[name]);
    }
  }
}
```

![[08-Food/Expiring Soon]]

## Areas
- [[01-Tasks/_index|✅ Tasks]] · [[02-Personal/_index|🏡 Personal]] · [[03-Career/_index|💼 Career]] · [[04-Finance/_index|💰 Finance]] · [[05-Health/_index|🩺 Health]]
- [[06-Learning/_index|📚 Learning]] · [[07-Projects/_index|🛠️ Projects]] · [[08-Food/_index|🍴 Food]] · [[09-Shopping/_index|🛍️ Shopping]] · [[10-Admin/_index|🗂️ Admin]]

## Friday (Life OS)
- [[80-LifeOS/MOC|🗺️ Map of Content]] — captured lists, checklists, references
- Engine + protocols live in `80-LifeOS/` — don't reorganize.

## Recently modified
```dataview
TABLE file.mtime AS "Modified"
FROM "01-Tasks" OR "02-Personal" OR "03-Career" OR "04-Finance" OR "05-Health" OR "06-Learning" OR "07-Projects" OR "08-Food" OR "09-Shopping" OR "10-Admin"
SORT file.mtime DESC
LIMIT 15
```
