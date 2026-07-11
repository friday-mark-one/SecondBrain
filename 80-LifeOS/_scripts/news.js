// 80-LifeOS/_scripts/news.js
"use strict";
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const paths = require("./paths.js");

const NEWS_FILE = paths.get("news");
const CRED_PATH = path.join(os.homedir(), ".openclaw", "telegram.json");
const TELEGRAM_LIMIT = 4096;

// ---- pure helpers ----
function parseNews(noteText) {
  const sections = [];
  let cur = null;
  for (const raw of (noteText || "").split("\n")) {
    const h = raw.match(/^##\s+(\d{4}-\d{2}-\d{2})\s*$/); // only ISO-date headers, so `## Topic` lines in a body stay body
    if (h) { cur = { date: h[1].trim(), lines: [] }; sections.push(cur); continue; }
    if (cur) cur.lines.push(raw);
  }
  return sections.map((s) => ({ date: s.date, body: s.lines.join("\n").replace(/^\n+|\n+$/g, "") }));
}

function renderNews(sections) {
  const parts = ["# News", ""];
  for (const s of sections) {
    parts.push(`## ${s.date}`, "");
    if (s.body) parts.push(s.body, "");
    else parts.push("");
  }
  return parts.join("\n").replace(/\n+$/, "\n");
}

function insertDigest(noteText, dateISO, digestBody) {
  const body = String(digestBody).replace(/^\n+|\n+$/g, "");
  const sections = parseNews(noteText);
  const existing = sections.find((s) => s.date === dateISO);
  if (existing) existing.body = body;
  else sections.unshift({ date: dateISO, body });
  return renderNews(sections);
}

function splitForTelegram(text, limit = TELEGRAM_LIMIT) {
  const chunks = [];
  let cur = "";
  const flush = () => { if (cur) { chunks.push(cur); cur = ""; } };
  const addLine = (line) => {
    const cand = cur ? cur + "\n" + line : line;
    if (cand.length <= limit) { cur = cand; return; }
    flush();
    cur = line; // a single over-limit line becomes its own chunk on next flush
  };
  for (const block of text.split(/\n\n+/)) {
    const cand = cur ? cur + "\n\n" + block : block;
    if (cand.length <= limit) { cur = cand; continue; }
    flush();
    if (block.length <= limit) { cur = block; continue; }
    for (const line of block.split("\n")) addLine(line);
  }
  flush();
  return chunks;
}

function mdLinksToTelegramHtml(text) {
  const B = "@@B@@", CB = "@@/B@@";
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Convert ## and ### headings to bold (use sentinels to survive esc())
  text = text.replace(/^##\s+(.+)$/gm, B + "$1" + CB);
  text = text.replace(/^###\s+(.+)$/gm, B + "$1" + CB);
  let out = "", last = 0, m;
  const re = /\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;
  while ((m = re.exec(text)) !== null) {
    out += esc(text.slice(last, m.index));
    const url = m[2].replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    out += `<a href="${url}">${esc(m[1])}</a>`;
    last = m.index + m[0].length;
  }
  return (out + esc(text.slice(last))).replace(/@@B@@/g, "<b>").replace(/@@\/B@@/g, "</b>");
}

// ---- I/O + CLI ----
function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

async function sendTelegram(html) {
  const { bot_token, chat_id } = JSON.parse(fs.readFileSync(CRED_PATH, "utf8"));
  const res = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text: html, parse_mode: "HTML", disable_web_page_preview: true }),
  });
  if (!res.ok) throw new Error(`Telegram API ${res.status}: ${await res.text()}`);
}

async function main() {
  const [file, dateArg] = process.argv.slice(2);
  if (!file) { console.error("usage: news.js publish <digest-file> [dateISO]  (first arg after `publish`)"); process.exit(1); }
  const date = dateArg || todayISO();
  const body = fs.readFileSync(file, "utf8").replace(/^\n+|\n+$/g, "");

  const note = fs.existsSync(NEWS_FILE) ? fs.readFileSync(NEWS_FILE, "utf8") : "";
  fs.writeFileSync(NEWS_FILE, insertDigest(note, date, body));

  const message = `📰 Morning digest — ${date}\n\n${body}`;
  for (const chunk of splitForTelegram(message)) {
    await sendTelegram(mdLinksToTelegramHtml(chunk));
  }
  console.log(`published digest for ${date} (${body.length} chars)`);
}

if (require.main === module) {
  const cmd = process.argv[2];
  if (cmd !== "publish") { console.error('usage: news.js publish <digest-file> [dateISO]'); process.exit(1); }
  process.argv.splice(2, 1); // drop "publish" so main() reads <file> [dateISO]
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { insertDigest, splitForTelegram, mdLinksToTelegramHtml };
