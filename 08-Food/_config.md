---
store_order:
  - Costco
  - Fred Meyer
  - Indian Store
  - Trader Joes
  - Bath & Body works
meal_slots:
  - Lunch
  - Dinner
default_plan_days: 7
grocery_detail: full
grocery_preferred: on
---

# Config

Settings for the meal-planning engine. `store_order` controls grocery-list
section order. `meal_slots` are the per-day headings created in a new plan.
Add `Breakfast` to `meal_slots` if you ever want it.

`grocery_detail` (full/off) controls the "— recipe (amount)" breakdown.
`grocery_preferred` (on/off) shows each item's `preferred` variety on the list.
Both are flipped by the matching QuickAdd toggle commands.
