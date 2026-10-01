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

test("launcher invoked through an install symlink still finds the repo", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  const linkDir = path.join(path.dirname(sb.root), "local-bin");
  fs.mkdirSync(linkDir);
  const link = path.join(linkDir, "pi-profile");
  fs.symlinkSync(path.join(sb.root, "bin", "pi-profile"), link);

  const listed = sb.run("/bin/bash", [link, "list"]);
  assert.equal(listed.status, 0, listed.stderr);
  assert.match(listed.stdout, /^pi$/m);
  assert.match(listed.stdout, /^pi-dev$/m);
  assert.doesNotMatch(listed.stderr, /Cannot find module/);

  const launched = sb.run("/bin/bash", [link, "pi", "--version"]);
  assert.equal(launched.status, 0, launched.stderr);
  assert.match(launched.stdout, /^pi --version$/m);
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
  const rendered = JSON.parse(
    sb.run(process.execPath, [path.join(sb.root, "scripts", "render-profile.mjs"), "pi"]).stdout
  );
  assert.deepEqual(after.packages, rendered.packages);

  const before = fs.statSync(file).mtimeMs;
  sb.cli("pi");
  assert.equal(fs.statSync(file).mtimeMs, before);
});
