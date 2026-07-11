// Generates one single-function QuickAdd script per command from the canonical,
// tested mealplan.js. Each output file is self-contained (no require) so it runs
// directly in QuickAdd on desktop and mobile with no function-picker needed.
//
// Run: node build-commands.js   (from the _scripts/ folder)
const fs = require("node:fs");
const path = require("node:path");

const SRC = path.join(__dirname, "mealplan.js");
const OUT = path.join(__dirname, "commands");

const COMMANDS = [
  ["generate.js", "generateGroceryList"],
  ["toggle-detail.js", "toggleGroceryDetail"],
  ["add-dish.js", "addDishToPlan"],
  ["new-plan.js", "newWeeklyPlan"],
  ["archive.js", "archiveAndReset"],
];

const src = fs.readFileSync(SRC, "utf8");
// Drop the canonical module.exports block; we re-export a single function.
const body = src.slice(0, src.indexOf("\nmodule.exports = {")).trimEnd();

fs.mkdirSync(OUT, { recursive: true });
for (const [file, fn] of COMMANDS) {
  const header = `// GENERATED from ../mealplan.js by build-commands.js — do not edit by hand.\n`
    + `// Edit mealplan.js, then re-run: node build-commands.js\n\n`;
  const out = `${header}${body}\n\nmodule.exports = ${fn};\n`;
  fs.writeFileSync(path.join(OUT, file), out);
  console.log(`wrote commands/${file}  (exports ${fn})`);
}
