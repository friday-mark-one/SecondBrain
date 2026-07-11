// Returns deadline notifier. Runs on the Mac mini — NOT on mobile — so it may
// use require/fs/fetch freely. Reads `09-Shopping/Things to return.md` and pushes
// a Telegram reminder for items whose last-return date is within 5 days or
// overdue.
//
// SELF-GATING: run it every heartbeat cycle. The script enforces the schedule
// itself — it does nothing before 19:00 local and runs at most once per calendar
// day, recording its last-run date in `.returns_last_run` (beside this file).
// The caller MUST NOT track timing or write any state/log files; the AI
// improvising that bookkeeping is what caused duplicate-file drift before.
//
// Setup (one-time, on the mini):
//   1. Create a Telegram bot via @BotFather; note the bot token.
//   2. Get your chat id (message the bot, then open
//      https://api.telegram.org/bot<token>/getUpdates and read chat.id).
//   3. Write ~/.openclaw/telegram.json :  { "bot_token": "...", "chat_id": "..." }
"use strict";
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const paths = require("./paths.js");

const RETURNS_FILE = paths.get("returns");
const CRED_PATH = path.join(os.homedir(), ".openclaw", "telegram.json");
const STATE_PATH = path.join(__dirname, ".returns_last_run");
const LEAD_DAYS = 5;
const GATE_HOUR = 19;

const DATE_RE = /@(\d{4}-\d{2}-\d{2})/;

function parseReturns(noteText) {
  const dated = [];
  const dateless = [];
  let store = "";
  for (const line of noteText.split("\n")) {
    const h = line.match(/^#{2,3}\s+(.+?)\s*$/);
    if (h) { store = h[1].trim(); continue; }
    const m = line.match(/^\s*[-*]\s+\[ \]\s+(.+?)\s*$/); // unchecked, non-empty
    if (!m) continue;
    const content = m[1].trim();
    const d = content.match(DATE_RE);
    if (d) {
      dated.push({ store, item: content.replace(DATE_RE, "").replace(/\s+/g, " ").trim(), returnBy: d[1] });
    } else {
      dateless.push({ store, item: content });
    }
  }
  return { dated, dateless };
}

function daysUntil(returnBy, today) {
  const [ry, rm, rd] = returnBy.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  return Math.round((Date.UTC(ry, rm - 1, rd) - Date.UTC(ty, tm - 1, td)) / 86400000);
}

function dueReturns(parsed, today, leadDays) {
  return parsed.dated
    .map((r) => ({ ...r, daysLeft: daysUntil(r.returnBy, today) }))
    .filter((r) => Number.isFinite(r.daysLeft) && r.daysLeft <= leadDays)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

function describeDays(daysLeft) {
  if (daysLeft < 0) { const m = -daysLeft; return `OVERDUE by ${m} day${m === 1 ? "" : "s"}`; }
  if (daysLeft === 0) return "TODAY — LAST DAY";
  if (daysLeft === 1) return "tomorrow";
  return `in ${daysLeft} days`;
}

function formatReturnsMessage(due, dateless) {
  if (!due.length && !dateless.length) return "";
  const blocks = [];
  if (due.length) {
    const byStore = [];
    for (const r of due) {
      let g = byStore.find((x) => x.store === r.store);
      if (!g) { g = { store: r.store, lines: [] }; byStore.push(g); }
      g.lines.push(`• ${r.item} — ${describeDays(r.daysLeft)} (${r.returnBy})`);
    }
    blocks.push(...byStore.map((g) => `${g.store}\n${g.lines.join("\n")}`));
  }
  if (dateless.length) {
    blocks.push("⚠️ No deadline set (add @YYYY-MM-DD):\n" +
      dateless.map((d) => `• ${d.store} — ${d.item}`).join("\n"));
  }
  const header = due.length ? "🔁 Returns due:" : "🔁 Returns reminder:";
  return header + "\n\n" + blocks.join("\n\n");
}

function shouldRun({ hour, today, lastRun, gateHour = GATE_HOUR }) {
  if (hour < gateHour) return false;
  if (lastRun === today) return false;
  return true;
}

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
function nowHour() { return new Date().getHours(); }
function readLastRun() { try { return fs.readFileSync(STATE_PATH, "utf8").trim() || null; } catch { return null; } }
function writeLastRun(today) { fs.writeFileSync(STATE_PATH, today + "\n"); }

function collectReturns() {
  if (!fs.existsSync(RETURNS_FILE)) return { dated: [], dateless: [] };
  return parseReturns(fs.readFileSync(RETURNS_FILE, "utf8"));
}

async function sendTelegram(text) {
  const { bot_token, chat_id } = JSON.parse(fs.readFileSync(CRED_PATH, "utf8"));
  const res = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text }),
  });
  if (!res.ok) throw new Error(`Telegram API ${res.status}: ${await res.text()}`);
}

async function main() {
  const today = todayISO();
  if (!shouldRun({ hour: nowHour(), today, lastRun: readLastRun(), gateHour: GATE_HOUR })) return;
  const parsed = collectReturns();
  const due = dueReturns(parsed, today, LEAD_DAYS);
  const msg = formatReturnsMessage(due, parsed.dateless);
  if (msg) {
    await sendTelegram(msg);
    console.log(`Notified: ${due.length} due, ${parsed.dateless.length} dateless.`);
  }
  writeLastRun(today); // only after a clean run; Telegram failure throws above
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { parseReturns, daysUntil, dueReturns, describeDays, formatReturnsMessage, shouldRun };
