import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { makeSandbox } from "./helpers.mjs";

test("launcher runs a profile with no local extensions (empty array, bash 3.2 safe)", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  const r = sb.cli("pi", "--version");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^pi --version$/m);
});

test("launcher passes -e for local extensions", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  const r = sb.cli("pi-dev", "--version");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /-e .*extensions --version/);
});

test("launcher rejects unknown profile", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  const r = sb.cli("ghost");
  assert.equal(r.status, 2);
  assert.match(r.stderr, /unknown profile/);
});

test("materialize preserves user-set keys, resets managed packages, skips no-op writes", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  sb.cli("pi");
  const file = path.join(sb.home, ".pi/profiles/pi/settings.json");
  const settings = JSON.parse(fs.readFileSync(file, "utf8"));
  settings.defaultModel = "keep-me";
  settings.packages = ["stale"];
  fs.writeFileSync(file, JSON.stringify(settings));
  sb.cli("pi");
  const after = JSON.parse(fs.readFileSync(file, "utf8"));
  assert.equal(after.defaultModel, "keep-me");
  assert.deepEqual(after.packages, ["npm:statusline-pi@1.3.1"]);

  const before = fs.statSync(file).mtimeMs;
  sb.cli("pi");
  assert.equal(fs.statSync(file).mtimeMs, before);
});
