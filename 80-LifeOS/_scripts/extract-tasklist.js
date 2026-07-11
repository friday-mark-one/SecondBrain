"use strict";
const fs = require("node:fs");
const path = require("node:path");
const paths = require("./paths.js");

const LIVE = new Set(["To Do", "Not started", "Blocked"]);
const SRC = paths.abs("Notion/Task List");
const TODO = paths.get("todo");

function statusOf(text) {
  const m = text.match(/^Status:\s*(.+)$/m);
  return m ? m[1].trim() : "";
}
function norm(s) { return s.replace(/^\s*[-*]\s*(\[[ xX]\]\s*)?/, "").trim().toLowerCase(); }

const existing = new Set(fs.readFileSync(TODO, "utf8").split("\n").map(norm).filter(Boolean));
const added = [];
for (const f of fs.readdirSync(SRC)) {
  if (!f.endsWith(".md")) continue;
  const status = statusOf(fs.readFileSync(path.join(SRC, f), "utf8"));
  if (!LIVE.has(status)) continue;
  const title = f.replace(/\.md$/, "");
  if (existing.has(norm(title))) continue;
  existing.add(norm(title));
  added.push(title);
}
if (added.length) {
  const body = fs.readFileSync(TODO, "utf8").replace(/\s*$/, "");
  fs.writeFileSync(TODO, body + "\n" + added.map((t) => `- [ ] ${t}`).join("\n") + "\n");
}
console.log(`added ${added.length} items:`, added);
