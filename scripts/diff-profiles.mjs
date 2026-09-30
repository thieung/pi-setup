#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const [a, b] = process.argv.slice(2);
if (!a || !b) {
  console.error("usage: diff-profiles.mjs <profile-a> <profile-b>");
  process.exit(2);
}

function render(name) {
  try {
    return JSON.parse(
      execFileSync(process.execPath, [path.join(__dirname, "render-profile.mjs"), name], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      })
    );
  } catch (error) {
    console.error(String(error.stderr || error.message).trim());
    process.exit(1);
  }
}

const left = render(a);
const right = render(b);
let differences = 0;

function diffList(title, xs, ys) {
  const onlyLeft = xs.filter((x) => !ys.includes(x));
  const onlyRight = ys.filter((y) => !xs.includes(y));
  if (onlyLeft.length === 0 && onlyRight.length === 0) return;
  console.log(`${title}:`);
  for (const x of onlyLeft) console.log(`  - ${x}`);
  for (const y of onlyRight) console.log(`  + ${y}`);
  differences += onlyLeft.length + onlyRight.length;
}

diffList("packages", left.packages, right.packages);
diffList("localExtensions", left.localExtensions, right.localExtensions);

const keys = [...new Set([...Object.keys(left.settings), ...Object.keys(right.settings)])]
  .filter((k) => k !== "packages")
  .sort();
const settingLines = [];
for (const key of keys) {
  const x = JSON.stringify(left.settings[key]);
  const y = JSON.stringify(right.settings[key]);
  if (x === y) continue;
  if (x !== undefined) settingLines.push(`  - ${key}: ${x}`);
  if (y !== undefined) settingLines.push(`  + ${key}: ${y}`);
}
if (settingLines.length > 0) {
  console.log("settings:");
  for (const line of settingLines) console.log(line);
  differences += settingLines.length;
}

if (differences === 0) console.log(`${a} and ${b} are effectively identical`);
else console.log(`\n(- only in ${a}, + only in ${b})`);
