#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(__dirname, "..");
const profilesDir = path.join(repo, "profiles");

let errors = 0;
let warnings = 0;

function report(level, message) {
  if (level === "error") errors += 1;
  if (level === "warn") warnings += 1;
  const tag = { ok: "ok  ", warn: "warn", error: "FAIL" }[level];
  console.log(`[${tag}] ${message}`);
}

function has(cmd, args = ["--version"]) {
  try {
    return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split("\n")[0];
  } catch {
    return null;
  }
}

// Tools
const nodeMajor = Number(process.versions.node.split(".")[0]);
report(nodeMajor >= 20 ? "ok" : "error", `node ${process.versions.node}${nodeMajor >= 20 ? "" : " (need >= 20)"}`);
const git = has("git");
report(git ? "ok" : "error", git || "git not found");
const pi = has("pi");
report(pi ? "ok" : "error", pi ? `pi ${pi}` : "pi not found on PATH");

// Source manifest
const manifestPath = path.join(repo, "config", "source-extensions.json");
try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.sources)) {
    report("error", "source-extensions.json: unsupported schema");
  } else {
    const names = new Set();
    let bad = 0;
    for (const entry of manifest.sources) {
      const problems = [];
      for (const key of ["name", "repository", "commit", "subpath"]) {
        if (!entry[key]) problems.push(`missing ${key}`);
      }
      if (entry.commit && !/^[0-9a-f]{40}$/.test(entry.commit)) problems.push("commit is not a 40-char SHA");
      if (names.has(entry.name)) problems.push("duplicate name");
      names.add(entry.name);
      if (problems.length > 0) {
        bad += 1;
        report("error", `source ${entry.name || "?"}: ${problems.join(", ")}`);
      }
    }
    if (bad === 0) report("ok", `source manifest: ${manifest.sources.length} entries, all pinned by SHA`);
  }
} catch (error) {
  report("error", `source-extensions.json: ${error.message}`);
}

// Profiles
const names = fs.existsSync(profilesDir)
  ? fs.readdirSync(profilesDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && fs.existsSync(path.join(profilesDir, e.name, "profile.json")))
      .map((e) => e.name)
      .sort()
  : [];
if (names.length === 0) report("error", "no profiles found");

for (const name of names) {
  let rendered;
  try {
    rendered = JSON.parse(
      execFileSync(process.execPath, [path.join(__dirname, "render-profile.mjs"), name], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      })
    );
  } catch (error) {
    const detail = String(error.stderr || error.message).trim().split("\n").pop();
    report("error", `profile ${name}: cannot render (${detail})`);
    continue;
  }

  const problems = [];
  for (const pkg of rendered.packages) {
    if (typeof pkg === "string" && pkg.startsWith("npm:") && !/@\d/.test(pkg.slice(4).replace(/^@/, ""))) {
      problems.push(`unpinned package ${pkg}`);
    }
  }
  for (const ext of rendered.localExtensions) {
    if (!fs.existsSync(ext)) problems.push(`local extension missing: ${ext}`);
  }
  if (problems.length > 0) report("warn", `profile ${name}: ${problems.join("; ")}`);
  else report("ok", `profile ${name}: ${rendered.packages.length} packages, ${rendered.localExtensions.length} local extensions`);

  // Generated runtime state
  const generated = path.join(os.homedir(), ".pi", "profiles", name);
  if (!fs.existsSync(path.join(generated, "settings.json"))) {
    report("warn", `profile ${name}: not materialized yet (run pi-profile ${name})`);
    continue;
  }
  try {
    const settings = JSON.parse(fs.readFileSync(path.join(generated, "settings.json"), "utf8"));
    const missing = rendered.packages.filter((p) => !(settings.packages || []).includes(p));
    if (missing.length > 0) report("warn", `profile ${name}: generated settings out of date (missing ${missing.join(", ")})`);
  } catch {
    report("error", `profile ${name}: generated settings.json is not valid JSON`);
  }
}

console.log(`\n${errors} error(s), ${warnings} warning(s)`);
process.exit(errors > 0 ? 1 : 0);
