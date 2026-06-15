"use strict";
const fs = require("node:fs");
const path = require("node:path");

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split("\n")) {
    const mm = line.match(/^([A-Za-z_]\w*):\s*(.*)$/);
    if (!mm) continue;
    let v = mm[2].trim();
    if (v === "true") v = true;
    else if (v === "false") v = false;
    out[mm[1]] = v;
  }
  return out;
}

function formatItem(text, shape) {
  const t = text.trim();
  return shape === "checklist" ? `- [ ] ${t}` : `- ${t}`;
}

function normalizeItem(s) {
  return s.replace(/^\s*[-*]\s*(\[[ xX]\]\s*)?/, "").trim().toLowerCase();
}

function isDuplicate(body, item) {
  const target = normalizeItem(item);
  if (!target) return false;
  return body.split("\n").some((l) => normalizeItem(l) === target);
}

function appendItem(body, item, shape) {
  if (isDuplicate(body, item)) return body;
  const line = formatItem(item, shape);
  const trimmed = body.replace(/\s*$/, "");
  // Empty body (fresh note) → leading blank line separates items from frontmatter.
  return trimmed.length ? `${trimmed}\n${line}\n` : `\n${line}\n`;
}

function newNote({ type, category, hint }) {
  return `---\ntype: ${type}\ncategory: ${category}\nhint: ${hint}\npinned: false\n---\n\n`;
}

function logLine(item, destination, isoDateTime) {
  const hhmm = isoDateTime.slice(11, 16);
  return `- [${hhmm}] "${item.trim()}" → [[${destination}]]`;
}

const EXCLUDE_DIRS = new Set(["_scripts", "_templates", "logs", "Archive", "Items", "Recipes", "Meal Plan"]);
const DEST_TYPES = new Set(["list", "checklist", "reference"]);

function walkRoutes(dir, routes) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      walkRoutes(path.join(dir, entry.name), routes);
    } else if (entry.name.endsWith(".md")) {
      const full = path.join(dir, entry.name);
      const fm = parseFrontmatter(fs.readFileSync(full, "utf8"));
      if (DEST_TYPES.has(fm.type)) {
        routes.push({
          note: entry.name.replace(/\.md$/, ""),
          type: fm.type,
          category: fm.category || "",
          hint: fm.hint || "",
          pinned: fm.pinned === true,
          path: full,
        });
      }
    }
  }
}

function scanRoutes(vaultDir) {
  const routes = [];
  walkRoutes(vaultDir, routes);
  return routes;
}

const TYPE_FOLDER = { list: "Lists", checklist: "Checklists", reference: "Reference" };

function pad2(n) { return String(n).padStart(2, "0"); }

function logFileName(d) { return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}-${String(d.getFullYear()).slice(-2)}.md`; }

function isoLocal(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function appendLedger(vaultDir, item, destination, now) {
  const dir = path.join(vaultDir, "logs");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, logFileName(now));
  fs.appendFileSync(file, logLine(item, destination, isoLocal(now)) + "\n");
}

function buildConfirmation(status, destination) {
  if (status === "duplicate") return `already on [[${destination}]]`;
  if (status === "created") return `🆕 created [[${destination}]] and filed it`;
  return `✓ filed → [[${destination}]]`;
}

function fileItem({ vaultDir, destination, item, type, category, hint, now }) {
  const route = scanRoutes(vaultDir).find((r) => r.note.toLowerCase() === destination.toLowerCase());
  let notePath, shape, status;
  if (route) {
    notePath = route.path;
    shape = route.type;
    status = "filed";
  } else {
    if (!type) throw new Error(`Note "${destination}" not found; pass type/category/hint to create it.`);
    shape = type;
    const folder = TYPE_FOLDER[type];
    if (!folder) throw new Error(`Unknown type "${type}"; expected list, checklist, or reference.`);
    const dir = path.join(vaultDir, folder);
    fs.mkdirSync(dir, { recursive: true });
    notePath = path.join(dir, `${destination}.md`);
    fs.writeFileSync(notePath, newNote({ type, category: category || "", hint: hint || "" }));
    status = "created";
  }

  const raw = fs.readFileSync(notePath, "utf8");
  const fmMatch = raw.match(/^(---\n[\s\S]*?\n---\n)([\s\S]*)$/);
  const head = fmMatch ? fmMatch[1] : "";
  const content = fmMatch ? fmMatch[2] : raw;

  if (status === "filed" && isDuplicate(content, item)) {
    return { status: "duplicate", confirmation: buildConfirmation("duplicate", destination) };
  }

  fs.writeFileSync(notePath, head + appendItem(content, item, shape));
  appendLedger(vaultDir, item, destination, now);
  return { status, confirmation: buildConfirmation(status, destination) };
}

function inboxTake(vaultDir) {
  const p = path.join(vaultDir, "Inbox.md");
  if (!fs.existsSync(p)) return [];
  const lines = fs.readFileSync(p, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length && !l.startsWith("#"))
    .map((l) => l.replace(/^[-*]\s*(\[[ xX]\]\s*)?/, "").trim()) // tolerate pasted bullets
    .filter((l) => l.length);
  fs.writeFileSync(p, "");
  return lines;
}

module.exports = { parseFrontmatter, formatItem, isDuplicate, appendItem, newNote, logLine, scanRoutes, fileItem, inboxTake };

function parseFlags(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!argv[i].startsWith("--")) continue;
    if (i + 1 >= argv.length || argv[i + 1].startsWith("--")) {
      throw new Error(`Flag ${argv[i]} requires a value`);
    }
    o[argv[i].slice(2)] = argv[i + 1];
  }
  return o;
}

if (require.main === module) {
  const [cmd, ...rest] = process.argv.slice(2);
  const vaultDir = path.join(__dirname, "..");
  try {
    if (cmd === "routes") {
      console.log(JSON.stringify(scanRoutes(vaultDir), null, 2));
    } else if (cmd === "inbox-take") {
      console.log(JSON.stringify(inboxTake(vaultDir)));
    } else if (cmd === "file") {
      const f = parseFlags(rest);
      const res = fileItem({
        vaultDir,
        destination: f.note,
        item: f.item,
        type: f.type,
        category: f.category,
        hint: f.hint,
        now: new Date(),
      });
      console.log(res.confirmation);
    } else {
      console.error("usage: capture.js routes | file --note X --item Y [--type --category --hint] | inbox-take");
      process.exit(1);
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
