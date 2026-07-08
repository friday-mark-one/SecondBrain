// memory/_scripts/deals.js
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const DEALS_FILE = path.join(__dirname, "..", "Deals.md");

// Parse into [{date, bullets:[...]}], ignoring the title. Bullets stored without "- ".
function parseDeals(noteText) {
  const sections = [];
  let cur = null;
  for (const raw of (noteText || "").split("\n")) {
    const h = raw.match(/^##\s+(\d{4}-\d{2}-\d{2})\s*$/); // only ISO-date headers, so a stray `## X` line can't masquerade as a dated section
    if (h) { cur = { date: h[1].trim(), bullets: [] }; sections.push(cur); continue; }
    const b = raw.match(/^-\s+(.*\S)\s*$/);
    if (b && cur) cur.bullets.push(b[1]);
  }
  return sections;
}

function renderDeals(sections) {
  const parts = ["# Deals", ""];
  for (const s of sections) {
    parts.push(`## ${s.date}`);
    for (const b of s.bullets) parts.push(`- ${b}`);
    parts.push("");
  }
  return parts.join("\n").replace(/\n+$/, "\n");
}

function appendDeal(noteText, dateISO, bullet) {
  bullet = bullet.trim();
  const sections = parseDeals(noteText);
  let sec = sections.find((s) => s.date === dateISO);
  if (!sec) { sec = { date: dateISO, bullets: [] }; sections.unshift(sec); } // newest on top
  if (!sec.bullets.includes(bullet)) sec.bullets.push(bullet);
  return renderDeals(sections);
}

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const [cmd, bullet] = args;
  if (cmd !== "add" || !bullet || args.length > 2) { console.error('usage: deals.js add "<bullet>"  (quote the bullet)'); process.exit(1); }
  let text = "";
  if (fs.existsSync(DEALS_FILE)) text = fs.readFileSync(DEALS_FILE, "utf8"); // read errors surface, never silently overwrite history
  fs.writeFileSync(DEALS_FILE, appendDeal(text, todayISO(), bullet));
  console.log(`added to ${todayISO()}: ${bullet}`);
}

module.exports = { appendDeal };
