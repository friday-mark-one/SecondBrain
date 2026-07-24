# 🏠 Home

> [!todo] Today
> [[01-Tasks/Todo|✅ Todo]] · [[01-Tasks/Inbox|📥 Inbox]] · [[00-Dashboard/Scratch pad|📝 Scratch pad]]

> [!tip] Kitchen
> [[08-Food/Meal Plan/Current|🍲 This week's plan]] · [[08-Food/Buy List|🛒 Buy List]] · [[08-Food/Expiring Soon|⏳ Expiring soon]] · [[Restaurants.base|🍽️ Restaurants]]

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
