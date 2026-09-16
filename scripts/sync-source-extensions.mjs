#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "config", "source-extensions.json");
const sourceRoot = path.join(root, ".local", "sources");
const args = new Set(process.argv.slice(2));
const syncAll = args.has("--all");
const dryRun = args.has("--dry-run");

function run(cmd, argv, cwd) {
  const printable = [cmd, ...argv].join(" ");
  if (dryRun) {
    console.log(`[dry-run] ${printable}${cwd ? ` (cwd=${cwd})` : ""}`);
    return "";
  }
  return execFileSync(cmd, argv, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
}

if (!fs.existsSync(manifestPath)) {
  console.error(`missing manifest: ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.sources)) {
  console.error("unsupported source extension manifest");
  process.exit(1);
}

if (!dryRun) fs.mkdirSync(sourceRoot, { recursive: true });
let selected = 0;

for (const entry of manifest.sources) {
  if (!syncAll && !entry.enabled) continue;
  selected++;
  for (const key of ["name", "repository", "commit", "subpath"]) {
    if (!entry[key]) throw new Error(`source entry missing ${key}: ${JSON.stringify(entry)}`);
  }

  const repoDir = path.join(sourceRoot, entry.name, "repo");
  const resolvedDir = path.join(sourceRoot, entry.name, "current");

  if (!fs.existsSync(path.join(repoDir, ".git"))) {
    if (!dryRun) fs.mkdirSync(path.dirname(repoDir), { recursive: true });
    run("git", ["clone", "--filter=blob:none", "--no-checkout", entry.repository, repoDir]);
  } else {
    run("git", ["remote", "set-url", "origin", entry.repository], repoDir);
  }

  run("git", ["fetch", "--depth=1", "origin", entry.commit], repoDir);
  run("git", ["checkout", "--detach", entry.commit], repoDir);
  const actual = dryRun ? entry.commit : run("git", ["rev-parse", "HEAD"], repoDir);
  if (!dryRun && actual !== entry.commit) {
    throw new Error(`${entry.name}: expected ${entry.commit}, got ${actual}`);
  }

  const sourcePath = path.join(repoDir, entry.subpath);
  if (!dryRun && !fs.existsSync(sourcePath)) {
    throw new Error(`${entry.name}: subpath not found: ${entry.subpath}`);
  }

  if (dryRun) {
    console.log(`[dry-run] link ${resolvedDir} -> ${sourcePath}`);
  } else {
    fs.rmSync(resolvedDir, { recursive: true, force: true });
    fs.symlinkSync(sourcePath, resolvedDir, "dir");
    fs.writeFileSync(path.join(sourceRoot, entry.name, "source.json"), JSON.stringify({
      name: entry.name,
      repository: entry.repository,
      commit: entry.commit,
      subpath: entry.subpath,
      resolvedPath: resolvedDir
    }, null, 2) + "\n");
    console.log(`${entry.name}: ${entry.commit.slice(0, 12)} -> ${resolvedDir}`);
  }
}

if (selected === 0) {
  console.log(syncAll ? "no source extensions configured" : "no enabled source extensions; use --all to prefetch disabled/labs entries");
}
