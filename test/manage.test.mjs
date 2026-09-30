import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { makeSandbox } from "./helpers.mjs";

test("add creates a profile inheriting pi by default", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  assert.equal(sb.cli("add", "lab").status, 0);
  const obj = JSON.parse(fs.readFileSync(path.join(sb.root, "profiles/lab/profile.json"), "utf8"));
  assert.equal(obj.extends, "../pi/profile.json");
  assert.match(sb.cli("list").stdout, /^lab$/m);
});

test("add fails on existing name, bad name, reserved name, missing parent", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  assert.notEqual(sb.cli("add", "pi").status, 0);
  assert.notEqual(sb.cli("add", "Bad Name").status, 0);
  assert.match(sb.cli("add", "doctor").stderr, /reserved/);
  assert.match(sb.cli("add", "x", "--extends", "ghost").stderr, /does not exist/);
});

test("remove refuses protected profiles and profiles with dependents", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  assert.match(sb.cli("remove", "pi").stderr, /protected/);
  sb.cli("add", "parent");
  sb.cli("add", "child", "--extends", "parent");
  assert.match(sb.cli("remove", "parent").stderr, /extended by: child/);
  assert.equal(sb.cli("remove", "child").status, 0);
  assert.equal(sb.cli("remove", "parent").status, 0);
});
