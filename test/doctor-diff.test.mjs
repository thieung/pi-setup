import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { makeSandbox, writeProfile } from "./helpers.mjs";

test("doctor passes on the repo as shipped", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  const r = sb.cli("doctor");
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /0 error/);
});

test("doctor fails on circular profiles and unpinned source commits", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  writeProfile(sb, "x", { extends: "../y/profile.json" });
  writeProfile(sb, "y", { extends: "../x/profile.json" });
  const manifest = path.join(sb.root, "config/source-extensions.json");
  const json = JSON.parse(fs.readFileSync(manifest, "utf8"));
  json.sources[0].commit = "main";
  fs.writeFileSync(manifest, JSON.stringify(json));
  const r = sb.cli("doctor");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /profile x: cannot render/);
  assert.match(r.stdout, /not a 40-char SHA/);
});

test("doctor warns about unpinned npm packages", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  writeProfile(sb, "loose", { extends: "../pi/profile.json", packages: ["npm:some-ext", "npm:@scope/pinned@1.0.0"] });
  const r = sb.cli("doctor");
  assert.equal(r.status, 0);
  assert.match(r.stdout, /unpinned package npm:some-ext/);
  assert.doesNotMatch(r.stdout, /unpinned package npm:@scope/);
});

test("diff shows what pi-dev adds over pi and reports identical profiles", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  const d = sb.cli("diff", "pi", "pi-dev");
  assert.equal(d.status, 0);
  assert.match(d.stdout, /\+ npm:pi-multix@/);
  assert.doesNotMatch(d.stdout, /^\s+- npm:/m);
  assert.match(sb.cli("diff", "pi", "pi").stdout, /identical/);
  assert.notEqual(sb.cli("diff", "pi", "ghost").status, 0);
});
