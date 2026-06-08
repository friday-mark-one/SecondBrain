# Vault Operating Manual (for Claude Code)

This vault runs a deterministic meal-planning system. Follow these procedures
exactly. Prefer exact paths over searching. When a request is ambiguous, STOP and
ask — list the candidate files; never guess or bulk-edit.

## Layout
- `Items/<Name>.md` — one note per ingredient/staple. Frontmatter: `type: item`,
  `store: <Costco|Fred Meyer|Indian Store|…>`, optional `category`.
- `Recipes/<Dish>.md` — frontmatter `type: recipe` + a `## Ingredients` section
  of `- [[Item]] | amount` lines.
- `Meal Plan/Current.md` — the single active plan (day → slot headings).
- `Grocery List/Current.md` — generated; do not hand-edit except to tick boxes.
- `Staples.md` — running list of non-recipe items to buy.
- `_config.md` — store order, meal slots, default day count.
- `_scripts/mealplan.js` — the engine. Pure helpers are unit-tested
  (`cd _scripts && node --test`). Do not change behavior without updating tests.

## Procedures
- **Add an item:** create `Items/<Title Case Name>.md` from `_templates/Item.md`;
  set `store`. Do NOT edit recipes.
- **Change an item's store:** edit only that one `Items/<Name>.md` `store` field.
- **Add a staple:** append `- [[Item]] | amount` to `Staples.md`. If the item note
  is missing, ask before creating `Items/<Item>.md`.
- **Which recipes use an item:** `grep -rl "\[\[<Item>\]\]" Recipes/`.
- **Never** run Generate or Archive by editing files by hand — those are the
  QuickAdd commands "Generate Grocery List" and "Archive And Reset".

## Ambiguity rule
"Remove onion" is ambiguous (delete the item note? remove from a recipe? from
staples?). List the matches and ask which one.
