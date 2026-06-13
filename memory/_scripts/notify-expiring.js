// Nightly expiry notifier ("Openclaw"). Runs on the Mac mini via cron — NOT on
// mobile — so it may use require/fs/fetch freely. It reuses the tested
// `expiringSoon` helper from mealplan.js so this push and the in-vault
// "Expiring Soon" view always agree.
//
// Setup (one-time, on the mini):
//   1. Create a Telegram bot via @BotFather; note the bot token.
//   2. Get your chat id (message the bot, then open
//      https://api.telegram.org/bot<token>/getUpdates and read chat.id).
//   3. Write ~/.openclaw/telegram.json :  { "bot_token": "...", "chat_id": "..." }
//   4. Cron (e.g. 7pm daily):
//      0 19 * * *  /usr/bin/node /path/to/vault/memory/_scripts/notify-expiring.js
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const M = require("./mealplan.js");

const ITEMS_DIR = path.join(__dirname, "..", "Items");
const CRED_PATH = path.join(os.homedir(), ".openclaw", "telegram.json");

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
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
  const due = M.expiringSoon(collectItems(), todayISO());
  if (due.length === 0) return; // quiet on empty days
  await sendTelegram(formatMessage(due));
  console.log(`Notified ${due.length} item(s) expiring soon.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
