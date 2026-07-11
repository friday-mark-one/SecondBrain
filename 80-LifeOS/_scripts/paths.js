"use strict";
const fs = require("node:fs");
const path = require("node:path");

// _scripts/ lives in 80-LifeOS/_scripts → vault root is two levels up.
const VAULT_ROOT = path.join(__dirname, "..", "..");
const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, "paths.json"), "utf8"));

function get(key) {
  const v = CONFIG[key];
  if (v === undefined) throw new Error(`paths.json missing key: ${key}`);
  return typeof v === "string" ? path.join(VAULT_ROOT, v) : v;
}
function abs(rel) { return path.join(VAULT_ROOT, rel); }
function stagingDir(type) {
  const s = CONFIG.captureStaging[type];
  if (!s) throw new Error(`no staging dir for type: ${type}`);
  return path.join(VAULT_ROOT, s);
}
function scanRoots() {
  const exclude = new Set(CONFIG.scanExclude || []);
  return fs.readdirSync(VAULT_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith(".") && !exclude.has(e.name))
    .map((e) => path.join(VAULT_ROOT, e.name));
}
module.exports = { VAULT_ROOT, get, abs, stagingDir, scanRoots, CONFIG };
