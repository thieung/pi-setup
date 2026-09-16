#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(__dirname, "..");
const profilesDir = path.join(repo, "profiles");
const protectedProfiles = new Set(["pi", "pi-dev"]);
const namePattern = /^[a-z0-9][a-z0-9._-]*$/;

function profileFile(name) {
  return path.join(profilesDir, name, "profile.json");
}

function listProfiles() {
  if (!fs.existsSync(profilesDir)) return [];
  return fs.readdirSync(profilesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(profileFile(entry.name)))
    .map((entry) => entry.name)
    .sort();
}

function assertValidName(name) {
  if (!name || !namePattern.test(name)) {
    throw new Error("profile name must match /^[a-z0-9][a-z0-9._-]*$/");
  }
}

function assertExists(name) {
  if (!fs.existsSync(profileFile(name))) {
    throw new Error(`profile does not exist: ${name}`);
  }
}

function relativeExtends(fromName, baseName) {
  const fromDir = path.dirname(profileFile(fromName));
  const baseFile = profileFile(baseName);
  let rel = path.relative(fromDir, baseFile);
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel.replaceAll(path.sep, "/");
}

function addProfile(args) {
  const name = args[0];
  assertValidName(name);

  let base = "pi";
  for (let i = 1; i < args.length; i += 1) {
    if (args[i] === "--extends") {
      base = args[i + 1];
      i += 1;
    } else {
      throw new Error(`unknown add option: ${args[i]}`);
    }
  }

  assertValidName(base);
  assertExists(base);

  if (fs.existsSync(profileFile(name))) {
    throw new Error(`profile already exists: ${name}`);
  }

  const dir = path.join(profilesDir, name);
  fs.mkdirSync(dir, { recursive: true });
  const profile = {
    name,
    description: `Custom profile inheriting ${base}`,
    extends: relativeExtends(name, base),
    packages: [],
    localExtensions: [],
  };
  fs.writeFileSync(profileFile(name), JSON.stringify(profile, null, 2) + "\n");
  console.log(`created ${name} (extends ${base})`);
}

function removeProfile(args) {
  const name = args[0];
  assertValidName(name);
  if (protectedProfiles.has(name)) {
    throw new Error(`refusing to remove protected profile: ${name}`);
  }
  assertExists(name);

  const dependents = listProfiles().filter((candidate) => {
    if (candidate === name) return false;
    const obj = JSON.parse(fs.readFileSync(profileFile(candidate), "utf8"));
    if (!obj.extends) return false;
    const target = path.resolve(path.dirname(profileFile(candidate)), obj.extends);
    return target === profileFile(name);
  });

  if (dependents.length > 0) {
    throw new Error(`profile ${name} is extended by: ${dependents.join(", ")}`);
  }

  fs.rmSync(path.join(profilesDir, name), { recursive: true, force: false });
  console.log(`removed ${name}`);
}

const [command, ...args] = process.argv.slice(2);

try {
  switch (command) {
    case "list":
      for (const name of listProfiles()) console.log(name);
      break;
    case "add":
      addProfile(args);
      break;
    case "remove":
      removeProfile(args);
      break;
    default:
      console.error("usage: manage-profiles.mjs <list|add|remove> ...");
      process.exit(2);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
