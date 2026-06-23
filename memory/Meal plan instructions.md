# Vault Operating Manual

This vault runs a deterministic meal-planning + grocery system, contained in the
`memory/` folder. There is no separate database or import file. Follow these procedures 
exactly. Prefer exact paths over searching. When a request is ambiguous, 
STOP and ask — list the candidate files; never guess or bulk-edit. 
All paths below are relative to the vault root `~/SecondBrain/`


## Layout
- `memory/Items/<Name>.md` — one note per ingredient/staple/item. Frontmatter:
  `type: item`, `store: <Costco|Fred Meyer|Indian Store|Trader Joes|Bath & Body works>`
  (or any new store mentioned other than these), optional `category`. 
  The note name IS the `[[wikilink]]` recipes or buy list items use.
  - `store` may be a single value OR a list, e.g. `store: [Fred Meyer, Costco]`, for
    an item sold at several stores. It then appears under EACH of those stores on the
    grocery list, so you can pick it up at whichever store you visit.
  - Optional expiry fields (opt-in, perishables only): `shelf_life_days` (int —
    its presence is what makes the item tracked), `heads_up_days` (int, days
    before expiry to start warning; absent ⇒ 0 = warn on expiry day only).
- `memory/Recipes/<Dish>.md` — `type: recipe` + `meal`/`cuisine`/`protein_heavy`/
  `fodmap_friendly` + a `## Ingredients` section of `- [[Item]] | amount` lines +
  `## Directions`.
- `memory/Buy List.md` — non-recipe items, in two sections (lines MUST contain a
  `[[Item]]` link or they're ignored). If the item doesn't exist, create it first in 
  `memory/Items/<Item>.md` with the necessary frontmatter as mentioned previously.
  - `## One-off` — throwaway items; by default add all shopping list items here.
  - `## Regulars` — a persistent menu of `- [ ] [[Item]]` checkboxes; add items only
  if they are mentioned as staples or regular items.
- `memory/Cooking References.md` — rice/upma ratios, Instapot timings (NOT recipes).

## Procedures
- **Add an item:** Create `Items/<Title Case Name>.md` from `_templates/Item.md`; set its `store`.
- **Change an item's store(s):** edit only that one `Items/<Name>.md` `store` field
  (a single store, or a `[A, B]` list for an item sold at several).
- **Add / edit a recipe:** Edit the `Recipes/<Dish>.md` note directly. 
  Ingredients are `- [[Item]] | amount` lines; create any missing item note first so the link resolves.
- **Buy a one-off item this week:** append `- [[Item]] | amount` under
  `## One-off` in `Buy List.md`.
- **Add a recurring item to the menu:** append `- [ ] [[Item]] | amount` under
  `## Regulars` in `Buy List.md` (unticked).
- **Track an item's expiry:** add `shelf_life_days` (and optionally
  `heads_up_days`) to that perishable's `Items/<Name>.md`. Don't edit `expires` field
- **Which recipes use an item:** `grep -rl "\[\[<Item>\]\]" memory/Recipes/`.
- Keep one spelling per item; the note name is the exact link recipes use.

## Ambiguity rule
"Remove onion" is ambiguous (delete the item note? remove from a recipe? from
staples?). List the matches and ask which one. Same for "change pepper" (powder
vs peppercorns), "fenugreek" (seeds vs kasuri methi), etc.
