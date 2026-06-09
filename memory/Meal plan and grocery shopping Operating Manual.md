This vault runs a deterministic meal-planning system, contained in the `memory/`
folder. Follow these procedures exactly. Prefer exact paths over searching. When a
request is ambiguous, STOP and ask — list the candidate files; never guess or
bulk-edit. All paths below are relative to the vault root.

## Layout
- `memory/Items/<Name>.md` — one note per ingredient/staple. Frontmatter:
  `type: item`, `store: <Costco|Fred Meyer|Indian Store|…>`, optional `category`.
- `memory/Recipes/<Dish>.md` — frontmatter `type: recipe` + a `## Ingredients`
  section of `- [[Item]] | amount` lines.
- `memory/Meal Plan/Current.md` — the single active plan (day → slot headings).
- `memory/Grocery List/Current.md` — generated; do not hand-edit except to tick boxes.
- `memory/Staples.md` — running list of non-recipe items to buy.
- `memory/_config.md` — store order, meal slots, default day count.
- `memory/_scripts/mealplan.js` — the engine. Pure helpers are unit-tested
  (`cd memory/_scripts && node --test`). Do not change behavior without updating
  tests. After editing it, run `node build-commands.js` to refresh `commands/`.

## Procedures
- **Add an item:** create `memory/Items/<Title Case Name>.md` from
  `memory/_templates/Item.md`; set `store`. Do NOT edit recipes.
- **Change an item's store:** edit only that one `memory/Items/<Name>.md` `store` field.
- **Add a staple:** append `- [[Item]] | amount` to `memory/Staples.md`. If the
  item note is missing, ask before creating `memory/Items/<Item>.md`.
- **Which recipes use an item:** `grep -rl "\[\[<Item>\]\]" memory/Recipes/`.
- **Never** run Generate or Archive by editing files by hand — those are the
  QuickAdd commands "Generate Grocery List" and "Archive And Reset".

## Ambiguity rule
"Remove onion" is ambiguous (delete the item note? remove from a recipe? from
staples?). List the matches and ask which one.
