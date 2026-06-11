# Vault Operating Manual (for Claude Code)

This vault runs a deterministic meal-planning + grocery system, contained in the
`memory/` folder. Follow these procedures exactly. Prefer exact paths over
searching. When a request is ambiguous, STOP and ask — list the candidate files;
never guess or bulk-edit. All paths below are relative to the vault root.

## Source files vs generated files

**Edit these (sources):**
- `memory/Items-draft.md` — canonical inventory list, grouped by `## Store`
  headings. Source for `Items/`.
- `memory/_scripts/build-recipes.js` — the recipe **data lives inside this
  script** (a `recipes` array). Source for `Recipes/` + `Cooking References.md`.
- `memory/_scripts/mealplan.js` — the engine (pure helpers + adapters). Source
  for `_scripts/commands/`.
- `memory/_config.md`, `memory/Staples.md`.

**Do NOT hand-edit these (generated — changes get overwritten):**
- `memory/Recipes/*.md` ← `build-recipes.js`
- `memory/_scripts/commands/*.js` ← `build-commands.js`
- `memory/Grocery List/Current.md` ← the Generate command
- `memory/Items/*.md` ← `build-items.js` **(exception: editing an existing
  item's `store` by hand is safe — `build-items.js` never overwrites existing
  notes. Use this for a one-off store change.)**

Regenerate commands (run in `memory/_scripts/`):
- `node build-items.js`    — creates missing `Items/*.md` from `Items-draft.md`
- `node build-recipes.js`  — writes all `Recipes/*.md` + `Cooking References.md`
- `node build-commands.js` — refreshes `commands/*.js` from `mealplan.js`
- `node --test`            — runs the unit/integration suite (must stay green)

## Layout
- `memory/Items/<Name>.md` — one note per ingredient/staple. Frontmatter:
  `type: item`, `store: <Costco|Fred Meyer|Indian Store|Trader Joes|Bath & Body works>`,
  optional `category`.
- `memory/Recipes/<Dish>.md` — `type: recipe` + `meal`/`cuisine`/`protein_heavy`/
  `fodmap_friendly` + a `## Ingredients` section of `- [[Item]] | amount` lines.
- `memory/Meal Plan/Current.md` — the single active plan (day → slot headings).
- `memory/Grocery List/Current.md` — generated checklist; only ever tick boxes.
- `memory/Staples.md` — running buy list; lines MUST be `- [[Item]] | amount`
  (a plain line with no `[[ ]]` link is silently ignored by the generator).
- `memory/Cooking References.md` — rice/upma ratios, Instapot timings (NOT recipes).
- `memory/_config.md` — `store_order`, `meal_slots`, `default_plan_days`,
  `grocery_detail` (`full` | `off`).

## QuickAdd commands (the only way to run the engine)
- **Generate Grocery List** · **Toggle Grocery Detail** (Full↔Off) ·
  **Add Dish To Plan** (Cookbook ➕) · **New Weekly Plan** · **Archive And Reset**.
- Never reproduce these by hand-editing files.

## Procedures
- **Add / edit a recipe:** edit the `recipes` array in
  `_scripts/build-recipes.js`, then `node build-recipes.js`. (A single manual
  recipe can also be made with the QuickAdd "New Recipe" command.)
- **Add an item:** add a line under the right `## Store` in `Items-draft.md`,
  then `node build-items.js`. Or create `Items/<Title Case Name>.md` directly.
- **Change an item's store:** edit only that one `Items/<Name>.md` `store` field.
- **Add a staple:** append `- [[Item]] | amount` to `Staples.md`. If the item
  note is missing, ask before creating `Items/<Item>.md`.
- **Change engine behavior:** edit `mealplan.js`, update/add tests, run
  `node --test`, then `node build-commands.js`.
- **Which recipes use an item:** `grep -rl "\[\[<Item>\]\]" memory/Recipes/`.

## Naming & ingredient conventions
- Ingredient/staple line format: `- [[Item]] | amount` (amount optional, free-form).
- **Skip salt & water** as ingredients. Keep named oils.
- Generic/unspecified cooking oil → **`[[Groundnut oil]]`** (the default).
- Whole pepper → **`[[Peppercorns]]`**; ground → **`[[Pepper powder]]`**.
- Fenugreek **seeds** → **`[[Fenugreek seeds]]`**; dried fenugreek **leaves** →
  **`[[Kasuri methi]]`** (distinct items).
- Garlic is **`[[Garlic]]`** (not "Peeled Garlic"); roasted gram is
  **`[[Roasted gram]]`** (not "Odachakadalai").
- Item note name = the exact `[[wikilink]]` recipes use; keep one spelling per item.

## Engine behaviors (for reference, don't reimplement)
- Grocery list de-dupes ingredients, groups by `store_order`, and shows a per-dish
  breakdown. A dish planned N times collapses to `Dish (amount) ×N`.
- `grocery_detail: off` hides the breakdown (just `- [ ] Item`); Toggle flips it.
- Regenerating the list preserves existing checkmarks.
- Missing item note / blank store / unknown dish are surfaced in ⚠️ sections,
  never silently dropped.

## Ambiguity rule
"Remove onion" is ambiguous (delete the item note? remove from a recipe? from
staples?). List the matches and ask which one. Same for "change pepper" (powder
vs peppercorns), "fenugreek" (seeds vs kasuri methi), etc.
