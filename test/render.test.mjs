import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { makeSandbox, writeProfile } from "./helpers.mjs";

function render(sb, name) {
  const r = sb.run(process.execPath, [path.join(sb.root, "scripts", "render-profile.mjs"), name]);
  return { ...r, json: r.status === 0 ? JSON.parse(r.stdout) : null };
}

test("pi-dev inherits pi packages and adds its own", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  const pi = render(sb, "pi").json;
  const dev = render(sb, "pi-dev").json;
  for (const pkg of pi.packages) assert.ok(dev.packages.includes(pkg));
  assert.ok(dev.packages.length > pi.packages.length);
  assert.equal(dev.localExtensions.length, 1);
});

test("packages are deduplicated across inheritance", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  writeProfile(sb, "dup", { extends: "../pi/profile.json", packages: ["npm:statusline-pi@1.3.1"] });
  const dup = render(sb, "dup").json;
  assert.equal(dup.packages.filter((p) => p === "npm:statusline-pi@1.3.1").length, 1);
});

test("child settings override parent settings", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  writeProfile(sb, "a", { extends: "../pi/profile.json", settings: { theme: "dark" } });
  writeProfile(sb, "b", { extends: "../a/profile.json", settings: { theme: "light" } });
  assert.equal(render(sb, "a").json.settings.theme, "dark");
  assert.equal(render(sb, "b").json.settings.theme, "light");
});

test("circular inheritance is rejected", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  writeProfile(sb, "x", { extends: "../y/profile.json" });
  writeProfile(sb, "y", { extends: "../x/profile.json" });
  const r = render(sb, "x");
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /circular/);
});

test("unknown profile fails", (t) => {
  const sb = makeSandbox();
  t.after(sb.cleanup);
  const r = render(sb, "nope");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /unknown profile/);
});
