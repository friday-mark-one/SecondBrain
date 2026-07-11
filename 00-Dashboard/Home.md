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
FROM "01-Tasks" OR "02-Personal" OR "03-Career" OR "04-Finance" OR "05-Health" OR "06-Learning" OR "07-Projects" OR "08-Food" OR "09-Shopping" OR "10-Admin"
SORT file.mtime DESC
LIMIT 15
```
