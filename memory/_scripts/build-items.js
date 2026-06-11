// Creates one memory/Items/<Name>.md note per line under a store heading in
// memory/Items-draft.md. Run AFTER you've reviewed/edited the draft:
//   cd memory/_scripts && node build-items.js
// Re-runnable: existing item notes are never overwritten (only new ones created).
//
// A "store heading" is any "## Heading" EXCEPT the review/excluded/help sections.
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");                 // memory/
const DRAFT = path.join(ROOT, "Items-draft.md");
const ITEMS = path.join(ROOT, "Items");

const SKIP_HEADING = /⚠️|🚫|suspected|conflict|needs a store|excluded|out-of-scope/i;

function cleanName(line) {
  let s = line.replace(/^[-*]\s+/, "");
  s = s.split(/\s{2,}\(/)[0];          // drop "  (seen: ...)" annotations
  s = s.replace(/\s*\(seen[^)]*\)\s*$/i, "");
  return s.trim();
}
function safeFile(name) {
  // Obsidian/file-system illegal characters -> "-"
  return name.replace(/[\\/:*?"<>|]/g, "-").trim();
}

if (!fs.existsSync(DRAFT)) { console.error("No Items-draft.md found at " + DRAFT); process.exit(1); }
fs.mkdirSync(ITEMS, { recursive: true });

const lines = fs.readFileSync(DRAFT, "utf8").split("\n");
let store = null;
const created = [], skipped = [], renamed = [];
for (const raw of lines) {
  const h = raw.match(/^##\s+(.+?)\s*$/);
  if (h) { store = SKIP_HEADING.test(h[1]) ? null : h[1].trim(); continue; }
  if (!store) continue;
  if (!/^[-*]\s+/.test(raw)) continue;
  const name = cleanName(raw);
  if (!name) continue;
  const file = safeFile(name);
  if (file !== name) renamed.push(`${name} -> ${file}`);
  const p = path.join(ITEMS, `${file}.md`);
  if (fs.existsSync(p)) { skipped.push(file); continue; }
  fs.writeFileSync(p, `---\ntype: item\nstore: ${store}\ncategory: \n---\n`);
  created.push(`${file}  [${store}]`);
}

console.log(`Created ${created.length} item notes:`);
created.forEach(x => console.log("  +", x));
if (skipped.length) console.log(`\nSkipped ${skipped.length} (already existed): ${skipped.join(", ")}`);
if (renamed.length) console.log(`\nRenamed (illegal filename chars):\n  ${renamed.join("\n  ")}`);
