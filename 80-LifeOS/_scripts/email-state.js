// 80-LifeOS/_scripts/email-state.js
"use strict";
const fs = require("node:fs");
const path = require("node:path");

function shouldRunDaily({ today, lastRun }) {
  return lastRun !== today;
}

function shouldRunDailyAt({ hour, gateHour, today, lastRun }) {
  if (lastRun === today) return false;
  return gateHour == null || hour >= gateHour;
}

function filterUnseen(seenIds, ids) {
  const seen = new Set(seenIds);
  const out = [];
  const added = new Set();
  for (const id of ids) {
    if (seen.has(id) || added.has(id)) continue;
    added.add(id);
    out.push(id);
  }
  return out;
}

// ---- state files (beside this script) ----
function lastRunPath(tag) { return path.join(__dirname, `.${tag}_last_run`); }
function seenPath(tag) { return path.join(__dirname, `.${tag}_seen`); }
function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
function nowHour() { return new Date().getHours(); }
function readLastRun(tag) { try { return fs.readFileSync(lastRunPath(tag), "utf8").trim() || null; } catch { return null; } }
function writeLastRun(tag, today) { fs.writeFileSync(lastRunPath(tag), today + "\n"); }
function readSeen(tag) { try { return fs.readFileSync(seenPath(tag), "utf8").split("\n").map((s) => s.trim()).filter(Boolean); } catch { return []; } }
function appendSeen(tag, ids) { if (ids.length) fs.appendFileSync(seenPath(tag), ids.join("\n") + "\n"); }

if (require.main === module) {
  const [cmd, tag, ...ids] = process.argv.slice(2);
  if (!cmd || !tag) { console.error("usage: email-state.js claim|done|unseen|seen <tag> [ids...]"); process.exit(1); }
  if (cmd === "claim") {
    // Read-only gate check — does NOT record the run. The day is marked done
    // only by `done` (below), AFTER the work completes, so an interrupted or
    // failed cycle retries on the next heartbeat instead of burning the day.
    const gateHour = ids[0] != null ? Number(ids[0]) : null; // e.g. `claim news 10`
    const open = shouldRunDailyAt({ hour: nowHour(), gateHour, today: todayISO(), lastRun: readLastRun(tag) });
    console.log(JSON.stringify({ open }));
  } else if (cmd === "done") {
    // Record today's run as complete. Call ONLY after the full procedure
    // (publish + mark-read) succeeds; skip it on error so the day retries.
    writeLastRun(tag, todayISO());
    console.log(JSON.stringify({ done: true }));
  } else if (cmd === "unseen") {
    console.log(JSON.stringify(filterUnseen(readSeen(tag), ids)));
  } else if (cmd === "seen") {
    appendSeen(tag, ids);
  } else { console.error(`unknown command: ${cmd}`); process.exit(1); }
}

module.exports = { shouldRunDaily, shouldRunDailyAt, filterUnseen };
