# Map of Content

Captured lists, checklists, and reference notes. This page maintains itself from each
note's frontmatter — a well-formed new note appears here automatically.

## 📌 Pinned

```dataview
TABLE category AS Category, hint AS "What goes here"
FROM "01-Tasks" OR "02-Personal" OR "03-Career" OR "04-Finance" OR "05-Health" OR "06-Learning" OR "07-Projects" OR "08-Food" OR "09-Shopping" OR "10-Admin"
WHERE pinned = true
SORT category, file.name
```

## All destinations by category

```dataview
TABLE type AS Type, hint AS "What goes here"
FROM "01-Tasks" OR "02-Personal" OR "03-Career" OR "04-Finance" OR "05-Health" OR "06-Learning" OR "07-Projects" OR "08-Food" OR "09-Shopping" OR "10-Admin"
WHERE (type = "list" OR type = "checklist" OR type = "reference")
SORT category, file.name
```
