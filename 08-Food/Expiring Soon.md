
Perishables you've bought, sorted by how soon they expire. An item shows here
only within its own heads-up window (`heads_up_days` before `expires`, default
the expiry day itself). Items past their expiry drop off automatically.

Tracking is opt-in: an item appears only if its note has `shelf_life_days`.
`expires` is stamped automatically when you check the item off and run After Shopping.

```dataviewjs
const today = window.moment().startOf("day");
const rows = [];
for (const p of dv.pages('"08-Food/Items"').where((p) => p.type === "item" && p.shelf_life_days != null && p.expires)) {
  const exp = window.moment(String(p.expires), "YYYY-MM-DD").startOf("day");
  const daysLeft = exp.diff(today, "days");
  const headsUp = Number(p.heads_up_days) || 0;
  if (daysLeft < 0 || daysLeft > headsUp) continue;       // overdue or not yet in window
  rows.push([p.file.link, daysLeft, exp.format("YYYY-MM-DD"), p.store || ""]);
}
rows.sort((a, b) => a[1] - b[1]);
if (rows.length === 0) {
  dv.paragraph("Nothing expiring soon. ✅");
} else {
  dv.table(["Item", "Days left", "Expires", "Store"], rows);
}
```
