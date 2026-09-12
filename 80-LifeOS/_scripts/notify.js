// 80-LifeOS/_scripts/notify.js
// Generic Telegram sender for Friday's scripts/prompts.
// Usage:
//   node notify.js <group|dm> "<text>"
//   node notify.js <group|dm> --file <path>
//   echo "text" | node notify.js <group|dm>
//   add --dry-run to print the resolved target + text without sending.
"use strict";
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const CRED_PATH = path.join(os.homedir(), ".openclaw", "telegram.json");
const TELEGRAM_LIMIT = 4096;

function resolveChat(creds, target) {
  if (target === "group") return creds.group_chat_id || creds.chat_id;
  if (target === "dm") return creds.chat_id;
  throw new Error(`unknown target "${target}" (use: group|dm)`);
}

// Split long text into <=limit chunks on paragraph/line boundaries.
function splitForTelegram(text, limit = TELEGRAM_LIMIT) {
  const chunks = [];
  let cur = "";
  const flush = () => { if (cur) { chunks.push(cur); cur = ""; } };
  const addLine = (line) => {
    const cand = cur ? cur + "\n" + line : line;
    if (cand.length <= limit) { cur = cand; return; }
    flush();
    cur = line;
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

async function sendTelegram(chatId, text) {
  const { bot_token } = JSON.parse(fs.readFileSync(CRED_PATH, "utf8"));
  const res = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  if (!res.ok) throw new Error(`Telegram API ${res.status}: ${await res.text()}`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const argv = args.filter((a) => a !== "--dry-run");
  const target = argv.shift();
  if (!target) { console.error('usage: notify.js <group|dm> "<text>" | --file <path> [--dry-run]'); process.exit(1); }

  let text;
  if (argv[0] === "--file") {
    if (!argv[1]) { console.error("--file needs a path"); process.exit(1); }
    text = fs.readFileSync(argv[1], "utf8");
  } else if (argv.length) {
    text = argv.join(" ");
  } else {
    text = fs.readFileSync(0, "utf8"); // stdin
  }
  text = String(text).replace(/^\n+|\n+$/g, "");
  if (!text) { console.error("empty message; nothing sent"); process.exit(1); }

  const creds = JSON.parse(fs.readFileSync(CRED_PATH, "utf8"));
  const chatId = resolveChat(creds, target);

  if (dryRun) {
    console.log(`[dry-run] target=${target} chat_id=${chatId} chars=${text.length}`);
    console.log(text);
    return;
  }
  for (const chunk of splitForTelegram(text)) await sendTelegram(chatId, chunk);
  console.log(`sent ${text.length} chars to ${target} (${chatId})`);
}

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });

module.exports = { resolveChat, splitForTelegram };
