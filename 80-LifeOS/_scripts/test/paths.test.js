"use strict";
const test = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const paths = require("../paths.js");

test("VAULT_ROOT is two levels above _scripts", () => {
  assert.strictEqual(path.basename(paths.VAULT_ROOT), "SecondBrain");
});
test("get resolves a string key to an absolute vault path", () => {
  assert.strictEqual(paths.get("todo"), path.join(paths.VAULT_ROOT, "01-Tasks/Todo.md"));
});
test("get returns raw arrays/objects", () => {
  assert.ok(Array.isArray(paths.get("scanExclude")));
});
test("stagingDir maps a type to its staging folder", () => {
  assert.strictEqual(paths.stagingDir("checklist"), path.join(paths.VAULT_ROOT, "01-Tasks/Checklists"));
});
test("scanRoots excludes engine/archive/meta/dashboard dirs", () => {
  const roots = paths.scanRoots().map((p) => path.basename(p));
  assert.ok(roots.includes("05-Health"));
  assert.ok(!roots.includes("90-Archive"));
  assert.ok(!roots.includes("80-LifeOS"));
});
