# Map of Content

Captured lists, checklists, and reference notes. This page maintains itself from each
note's frontmatter — a well-formed new note appears here automatically.

## 📌 Pinned

```dataview
TABLE category AS Category, hint AS "What goes here"
FROM "memory"
WHERE pinned = true
SORT category, file.name
```

## All destinations by category

```dataview
TABLE type AS Type, hint AS "What goes here"
FROM "memory"
WHERE (type = "list" OR type = "checklist" OR type = "reference")
SORT category, file.name
```
