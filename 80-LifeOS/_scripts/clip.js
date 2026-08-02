#!/usr/bin/env node
/* Clippings engine — Friday classifies, this does all file writes.
 * See 80-LifeOS/Clippings instructions.md for the workflow.
 *
 *   node clip.js save --url <url> [--note "comment"]   fetch + file a clipping
 *   node clip.js list                                   unread clippings as JSON
 *   node clip.js mark <file...> | mark --all            flip status -> digested
 *   node clip.js digest-claim [--force]                 weekly gate (Sat >= 09:00, once)
 *   node clip.js digest-done                            record a completed digest run
 *
 * Content is captured at save time (pages rot; the note must stay summarizable).
 * YouTube: title/channel via oEmbed; auto-caption transcript via yt-dlp when
 * installed (brew install yt-dlp) — degrades gracefully to a link stub without it.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const VAULT = path.resolve(__dirname, "..", "..");
const CLIP_DIR = path.join(VAULT, "Clippings");
const DIGEST_NAME = "Clippings digest.md";
const STATE = path.join(__dirname, ".clip-state.json");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const MAX_CONTENT = 20000;

// ---------- small utils ----------

// Local date, not UTC — the Saturday gate uses local time; mixing the two
// would re-open a completed digest day once UTC rolls past midnight.
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE, "utf8")); } catch { return {}; }
}
const saveState = (s) => fs.writeFileSync(STATE, JSON.stringify(s, null, 2) + "\n");

function decodeEntities(s) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
                  mdash: "—", ndash: "–", hellip: "…", rsquo: "’", lsquo: "‘",
                  rdquo: "”", ldquo: "“", copy: "©", trade: "™", reg: "®" };
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => named[n.toLowerCase()] ?? m);
}

function sanitizeName(t) {
  const clean = t.replace(/[\\/:*?"<>|#^[\]{}]/g, " ").replace(/\s+/g, " ").trim();
  return (clean || "Untitled clip").slice(0, 80).trim();
}

async function fetchText(url) {
  const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
  if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${url}`);
  return await r.text();
}

// ---------- HTML -> title + readable text ----------

function htmlTitle(html) {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  if (og) return decodeEntities(og[1]).trim();
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return t ? decodeEntities(t[1]).replace(/\s+/g, " ").trim() : null;
}

function htmlToText(html) {
  let h = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|iframe|form|nav|header|footer|aside)[\s\S]*?<\/\1>/gi, " ");
  const main = h.match(/<article[\s\S]*?<\/article>/i) || h.match(/<main[\s\S]*?<\/main>/i);
  if (main) h = main[0];
  h = h
    .replace(/<\/(p|div|section|h[1-6]|li|tr|blockquote|pre)>/gi, "\n")
    .replace(/<(br|hr)[^>]*>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(h)
    .split("\n").map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter((l, i, a) => l || (a[i - 1] || "").trim())
    .join("\n").replace(/\n{3,}/g, "\n\n").trim()
    .slice(0, MAX_CONTENT);
}

// ---------- YouTube ----------

function ytId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?[^#]*v=|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : null;
}

async function ytMeta(url) {
  const j = JSON.parse(await fetchText(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`));
  return { title: j.title, channel: j.author_name };
}

function vttToText(vtt) {
  const seen = new Set();
  const out = [];
  for (let line of vtt.split("\n")) {
    line = line.replace(/<[^>]+>/g, "").trim();
    if (!line || line === "WEBVTT" || /^\d+$/.test(line)) continue;
    if (/-->/.test(line) || /^(Kind|Language|NOTE|STYLE|Region):?/i.test(line)) continue;
    if (seen.has(line)) continue;       // auto-captions repeat rolling lines
    seen.add(line);
    out.push(line);
  }
  return out.join(" ").replace(/\s+/g, " ").trim().slice(0, MAX_CONTENT);
}

function ytTranscript(url) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "clip-"));
  try {
    let err = null;
    try {
      // en + en-orig only: an "en.*" glob also matches auto-TRANSLATED tracks
      // (en-de-DE, en-ja, ...) — 7 downloads and a guaranteed 429 from YouTube.
      execFileSync("yt-dlp",
        ["--skip-download", "--write-subs", "--write-auto-subs", "--sub-langs",
         "en,en-orig", "--sub-format", "vtt", "-o", path.join(tmp, "t"), url],
        { stdio: "pipe", timeout: 180000 });
    } catch (e) {
      err = e;  // partial failures still leave .vtt files behind — harvest before giving up
    }
    const vtts = fs.readdirSync(tmp).filter((x) => x.endsWith(".vtt"))
      .map((f) => ({ f, size: fs.statSync(path.join(tmp, f)).size }))
      .sort((a, b) => (a.f === "t.en.vtt" ? -1 : b.f === "t.en.vtt" ? 1 : b.size - a.size));
    if (!vtts.length) {
      if (err) console.error("yt-dlp: " + String(err.stderr || err.message)
        .trim().split("\n").slice(-3).join(" | ").slice(0, 300));
      return null;                      // yt-dlp missing, or video truly has no captions
    }
    return vttToText(fs.readFileSync(path.join(tmp, vtts[0].f), "utf8"));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// ---------- clipping files ----------

function clipFiles() {
  if (!fs.existsSync(CLIP_DIR)) return [];
  return fs.readdirSync(CLIP_DIR)
    .filter((f) => f.endsWith(".md") && f !== DIGEST_NAME)
    .map((f) => path.join(CLIP_DIR, f));
}

function frontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  const out = {};
  if (!m) return out;
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].replace(/^"(.*)"$/, "$1").trim();
  }
  return out;
}

function findByUrl(url) {
  for (const f of clipFiles()) {
    const fm = frontmatter(fs.readFileSync(f, "utf8"));
    if (fm.url === url || fm.source === url) return f;
  }
  return null;
}

function uniquePath(name) {
  let p = path.join(CLIP_DIR, `${name}.md`);
  for (let i = 2; fs.existsSync(p); i++) p = path.join(CLIP_DIR, `${name} ${i}.md`);
  return p;
}

// ---------- commands ----------

async function cmdSave(url, note) {
  fs.mkdirSync(CLIP_DIR, { recursive: true });
  const dup = findByUrl(url);
  if (dup) {
    console.log(`duplicate: already clipped → [[${path.basename(dup, ".md")}]]`);
    return;
  }
  let title, extra = "", body = "", type = "article";
  if (ytId(url)) {
    type = "youtube";
    let meta = { title: null, channel: null };
    try { meta = await ytMeta(url); } catch { /* oEmbed can fail; keep going */ }
    title = meta.title || `YouTube ${ytId(url)}`;
    if (meta.channel) extra += `channel: "${meta.channel}"\n`;
    const tr = ytTranscript(url);
    extra += `transcript: ${tr ? "yes" : "none"}\n`;
    body = tr
      ? `## Transcript (auto-captions)\n\n${tr}\n`
      : "_No transcript captured (yt-dlp missing or video has no captions). Summarize from the link._\n";
  } else {
    const html = await fetchText(url);
    title = htmlTitle(html) || new URL(url).hostname;
    const text = htmlToText(html);
    body = text
      ? `## Content (auto-extracted)\n\n${text}\n`
      : "_No readable content extracted. Summarize from the link._\n";
  }
  const name = sanitizeName(title);
  const file = uniquePath(name);
  fs.writeFileSync(file, `---
title: "${title.replace(/"/g, "'")}"
url: ${url}
saved: ${today()}
via: telegram
type: ${type}
${extra}status: unread
---
${note ? `\n> [!note] Why saved\n> ${note}\n` : ""}
${body}`);
  console.log(`✓ clipped → [[${path.basename(file, ".md")}]]${type === "youtube" ? (extra.includes("transcript: yes") ? " (with transcript)" : " (no transcript)") : ""}`);
}

function cmdList() {
  const items = [];
  for (const f of clipFiles()) {
    const fm = frontmatter(fs.readFileSync(f, "utf8"));
    if ((fm.status || "unread") === "digested") continue;
    items.push({ file: path.relative(VAULT, f), title: fm.title || path.basename(f, ".md"),
                 url: fm.url || fm.source || null, type: fm.type || "article",
                 saved: fm.saved || fm.created || null });
  }
  console.log(JSON.stringify(items, null, 2));
}

function cmdMark(args) {
  const targets = args.includes("--all")
    ? clipFiles().filter((f) => (frontmatter(fs.readFileSync(f, "utf8")).status || "unread") !== "digested")
    : args.map((a) => path.isAbsolute(a) ? a : path.join(VAULT, a));
  let n = 0;
  for (const f of targets) {
    if (!fs.existsSync(f)) { console.error(`missing: ${f}`); continue; }
    let md = fs.readFileSync(f, "utf8");
    if (/^---\n[\s\S]*?\n---/.test(md)) {
      md = /^\s*status:/m.test(md.match(/^---\n([\s\S]*?)\n---/)[1])
        ? md.replace(/^(status:).*$/m, `$1 digested`)
        : md.replace(/^---\n/, `---\nstatus: digested\n`);
      if (!/^digested:/m.test(md)) md = md.replace(/^(status: digested)$/m, `$1\ndigested: ${today()}`);
    } else {
      md = `---\nstatus: digested\ndigested: ${today()}\n---\n\n` + md;
    }
    fs.writeFileSync(f, md);
    n++;
  }
  console.log(`marked ${n} digested`);
}

function cmdClaim(force) {
  const now = new Date();
  const state = loadState();
  const open = force || (now.getDay() === 6 && now.getHours() >= 9
                         && state.lastDigest !== today());
  console.log(JSON.stringify({ open }));
}

function cmdDone() {
  const state = loadState();
  state.lastDigest = today();
  saveState(state);
  console.log("recorded");
}

// ---------- main ----------

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const opt = (name) => {
    const i = rest.indexOf(`--${name}`);
    return i >= 0 ? rest[i + 1] : null;
  };
  if (cmd === "save") {
    const url = opt("url");
    if (!url) { console.error("save requires --url"); process.exit(1); }
    await cmdSave(url, opt("note"));
  } else if (cmd === "list") cmdList();
  else if (cmd === "mark") cmdMark(rest);
  else if (cmd === "digest-claim") cmdClaim(rest.includes("--force"));
  else if (cmd === "digest-done") cmdDone();
  else { console.error("commands: save | list | mark | digest-claim | digest-done"); process.exit(1); }
}

main().catch((e) => { console.error(`error: ${e.message}`); process.exit(1); });
