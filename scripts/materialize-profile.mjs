#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(__dirname, "..");
const profile = process.argv[2];
if (!profile) {
  console.error("usage: materialize-profile.mjs <profile>");
  process.exit(2);
}

const rendered = JSON.parse(
  execFileSync(process.execPath, [path.join(repo, "scripts/render-profile.mjs"), profile], {
    encoding: "utf8",
  })
);

const target = path.join(os.homedir(), ".pi", "profiles", profile);
fs.mkdirSync(target, { recursive: true });
fs.mkdirSync(path.join(target, "sessions"), { recursive: true });
// Pi writes user choices (defaultModel, /settings changes) into settings.json,
// so merge managed keys over the existing file instead of overwriting it.
const settingsFile = path.join(target, "settings.json");
let existing = {};
try {
  existing = JSON.parse(fs.readFileSync(settingsFile, "utf8"));
} catch {}
const merged = JSON.stringify({ ...existing, ...rendered.settings }, null, 2) + "\n";
let current = null;
try {
  current = fs.readFileSync(settingsFile, "utf8");
} catch {}
if (current !== merged) fs.writeFileSync(settingsFile, merged);

const meta = {
  profile,
  generatedAt: new Date().toISOString(),
  sourceRepo: repo,
  localExtensions: rendered.localExtensions,
};
fs.writeFileSync(path.join(target, ".pi-setup.json"), JSON.stringify(meta, null, 2) + "\n");

console.log(target);
