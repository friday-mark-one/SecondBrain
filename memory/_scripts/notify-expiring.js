// Expiry notifier ("Friday"). Runs on the Mac mini — NOT on mobile — so it may
// use require/fs/fetch freely. It reuses the tested `expiringSoon` helper from
// mealplan.js so this push and the in-vault "Expiring Soon" view always agree.
//
// SELF-GATING: run it every heartbeat cycle. The script enforces the schedule
// itself — it does nothing before 19:00 local and runs at most once per calendar
// day, recording its last-run date in `.expiry_last_run` (beside this file). The
// caller MUST NOT track timing or write any state/log files; the AI improvising
// that bookkeeping is what caused duplicate-file drift before.
//
// Setup (one-time, on the mini):
//   1. Create a Telegram bot via @BotFather; note the bot token.
//   2. Get your chat id (message the bot, then open
//      https://api.telegram.org/bot<token>/getUpdates and read chat.id).
//   3. Write ~/.openclaw/telegram.json :  { "bot_token": "...", "chat_id": "..." }
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const M = require("./mealplan.js");

const ITEMS_DIR = path.join(__dirname, "..", "Items");
const CRED_PATH = path.join(os.homedir(), ".openclaw", "telegram.json");
const STATE_PATH = path.join(__dirname, ".expiry_last_run");

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function nowHour() { return new Date().getHours(); }

function readLastRun() {
  try { return fs.readFileSync(STATE_PATH, "utf8").trim() || null; }
  catch { return null; }
}

function writeLastRun(today) { fs.writeFileSync(STATE_PATH, today + "\n"); }

// Pure run-gate decision: only in the evening (>= gateHour local) and at most
// once per calendar day. lastRun is the YYYY-MM-DD of the previous run, or null.
function shouldRun({ hour, today, lastRun, gateHour = 19 }) {
  if (hour < gateHour) return false;   // too early in the day
  if (lastRun === today) return false; // already ran today
  return true;
}

function collectItems() {
  const items = [];
  for (const name of fs.readdirSync(ITEMS_DIR)) {
    if (!name.endsWith(".md")) continue;
    const text = fs.readFileSync(path.join(ITEMS_DIR, name), "utf8");
    if (M.readFrontmatterField(text, "shelf_life_days") == null) continue; // not tracked
    const expires = M.readFrontmatterField(text, "expires");
    if (!expires) continue; // never bought yet
    const headsUp = parseInt(M.readFrontmatterField(text, "heads_up_days"), 10) || 0;
    items.push({ name: name.replace(/\.md$/, ""), expires, headsUp });
  }
  return items;
}

function formatMessage(due) {
  const when = (n) => (n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`);
  const lines = due.map((i) => `• ${i.name} — ${when(i.daysLeft)} (${i.expires})`);
  return `🥗 Expiring soon:\n${lines.join("\n")}`;
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
  // Self-gate: silent no-op until evening, and only once per calendar day.
  if (!shouldRun({ hour: nowHour(), today, lastRun: readLastRun() })) return;
  const due = M.expiringSoon(collectItems(), today);
  if (due.length) {
    await sendTelegram(formatMessage(due));
    console.log(`Notified ${due.length} item(s) expiring soon.`);
  }
  // Record today only after a clean run. A Telegram failure throws above, so we
  // don't record it — the next cycle retries and re-alerts.
  writeLastRun(today);
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { shouldRun };
