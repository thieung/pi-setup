#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(__dirname, "..");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function uniq(xs) {
  return [...new Set(xs)];
}

function loadProfile(file, seen = new Set()) {
  const abs = path.resolve(file);
  if (seen.has(abs)) throw new Error(`circular profile inheritance: ${abs}`);
  seen.add(abs);

  const obj = readJson(abs);
  let base = { settings: {}, packages: [], localExtensions: [] };

  if (obj.extends) {
    const parent = path.resolve(path.dirname(abs), obj.extends);
    if (parent.endsWith("profile.json")) {
      base = loadProfile(parent, seen);
    } else {
      const settings = readJson(parent);
      base.settings = settings;
      base.packages = settings.packages || [];
    }
  }

  const mergedSettings = {
    ...base.settings,
    ...(obj.settings || {}),
    packages: uniq([...(base.packages || []), ...(obj.packages || [])]),
  };

  return {
    name: obj.name,
    description: obj.description,
    settings: mergedSettings,
    packages: mergedSettings.packages || [],
    localExtensions: uniq([
      ...(base.localExtensions || []),
      ...((obj.localExtensions || []).map(p => path.resolve(path.dirname(abs), p))),
    ]),
  };
}

const profile = process.argv[2];
if (!profile) {
  console.error("usage: render-profile.mjs <profile>");
  process.exit(2);
}

const profileFile = path.join(repo, "profiles", profile, "profile.json");
if (!fs.existsSync(profileFile)) {
  console.error(`unknown profile: ${profile}`);
  process.exit(1);
}

process.stdout.write(JSON.stringify(loadProfile(profileFile), null, 2) + "\n");
