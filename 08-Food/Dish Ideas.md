# Dish Ideas

824 vegetarian & vegan dishes from the [OG Nutrition dish library](https://theognutrition.com/dish-library) that I haven't cooked — names, macros, and diet tags only, no recipes yet. Browse here when bored of the usual rotation. These live in `08-Food/Dish Ideas/`, fully separate from [[Cookbook]] and my real recipes.

**Found one you like?** Cook it once, then promote it:

1. Move its note from `Dish Ideas/` into `08-Food/Recipes/`.
2. Change `type: dish-idea` → `type: recipe` and add `meal:` (e.g. `[lunch, dinner]`).
3. Fill in `## Ingredients` (wikilink pantry items like `[[Onion]]`) and `## Directions` with your own version.

It then appears in [[Cookbook]] automatically. Not interested after trying? Just delete the note.

> [!note] Data caveats
> Veg/vegan filtering was done from dish names and tags (the site barely labels diet type), so an occasional egg/meat dish may have slipped through — delete on sight. Names ending in "..." are truncated by the site itself. "Mayo" and baked-goods dishes may or may not be eggless — decide when you cook. Macros are OG Nutrition's numbers, not verified.

## 🎲 Six random ideas

Reopen this note (or switch to reading view) to reroll.

```dataviewjs
const all = dv.pages('"08-Food/Dish Ideas"').where(p => p.type === "dish-idea").array();
const pick = [...all].sort(() => Math.random() - 0.5).slice(0, 6);
dv.table(["Dish", "Protein", "Carbs", "Fats", "Kcals"],
  pick.map(p => [p.file.link, p.protein + "g", p.carbs + "g", p.fats + "g", p.kcals]));
```

## 💪 Top protein

```dataview
TABLE protein + "g" AS Protein, kcals AS Kcals, join(diet, ", ") AS Diet
FROM "08-Food/Dish Ideas"
WHERE type = "dish-idea"
SORT protein DESC
LIMIT 25
```

## 🪶 Light (under 250 kcal)

```dataview
TABLE kcals AS Kcals, protein + "g" AS Protein, join(diet, ", ") AS Diet
FROM "08-Food/Dish Ideas"
WHERE type = "dish-idea" AND kcals < 250
SORT kcals ASC
LIMIT 25
```

## 🌱 Tagged vegan

```dataview
TABLE protein + "g" AS Protein, kcals AS Kcals
FROM "08-Food/Dish Ideas"
WHERE type = "dish-idea" AND contains(diet, "Vegan")
SORT file.name ASC
```

## All ideas A–Z

```dataview
TABLE protein + "g" AS Protein, carbs + "g" AS Carbs, fats + "g" AS Fats, kcals AS Kcals
FROM "08-Food/Dish Ideas"
WHERE type = "dish-idea"
SORT file.name ASC
```
