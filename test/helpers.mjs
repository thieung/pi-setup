import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Copy the runnable parts of the repo into a temp dir so tests can add/remove
// profiles and materialize into a fake HOME without touching the real ones.
export function makeSandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pi-setup-test-"));
  const root = path.join(dir, "repo");
  const home = path.join(dir, "home");
  const fakebin = path.join(dir, "fakebin");
  for (const part of ["bin", "scripts", "profiles", "config", "extensions"]) {
    fs.cpSync(path.join(repo, part), path.join(root, part), { recursive: true });
  }
  fs.mkdirSync(home);
  fs.mkdirSync(fakebin);
  fs.writeFileSync(path.join(fakebin, "pi"), '#!/bin/sh\necho "pi $@"\n', { mode: 0o755 });

  const env = { ...process.env, HOME: home, PATH: `${fakebin}${path.delimiter}${process.env.PATH}` };
  const run = (cmd, args, opts = {}) =>
    spawnSync(cmd, args, { encoding: "utf8", env, cwd: root, ...opts });
  const shell = fs.existsSync("/bin/bash") ? "/bin/bash" : "bash"; // macOS ships bash 3.2
  const cli = (...args) => run(shell, [path.join(root, "bin", "pi-profile"), ...args]);
  const cleanup = () => fs.rmSync(dir, { recursive: true, force: true });
  return { root, home, cli, run, cleanup };
}

export function writeProfile(sandbox, name, body) {
  const dir = path.join(sandbox.root, "profiles", name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "profile.json"), JSON.stringify({ name, ...body }, null, 2));
}
