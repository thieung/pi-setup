# advisor-pi

## Role in this setup

`advisor-pi` is enabled only in `pi-dev`.

Pinned package:

```text
npm:advisor-pi@1.1.0
```

It is intentionally not part of the stable daily profile.

## What it does

`advisor-pi` registers an `advisor` tool. The active executor model can ask another configured model for strategic guidance while retaining control of the actual tools and file edits.

Typical uses include:

- architecture or implementation-plan review;
- course correction during a difficult coding task;
- asking a stronger model for a second opinion without handing over the whole session;
- comparing strategy while keeping the executor responsible for changes.

## Why it is in `pi-dev`

Each advisor request is an extra model call and may add latency or cost. It also changes the reasoning workflow compared with plain Pi, so this setup treats it as an optional development tool rather than baseline behavior.

## Installation

Managed through `profiles/pi-dev/profile.json`:

```json
{
  "packages": [
    "npm:advisor-pi@1.1.0"
  ]
}
```

Manual equivalent:

```bash
pi install npm:advisor-pi@1.1.0
```

## Commands

Upstream currently documents commands including:

```text
/advisor-pi status
/advisor-pi enable
/advisor-pi disable
/advisor-pi model <provider>/<model>
/advisor-pi max-uses <number>
/advisor-pi cache <none|short|long>
/advisor-pi reset
```

## Operational notes

- Advisor consultations are separate model calls.
- Executor streaming pauses while the advisor responds.
- The advisor returns guidance; the executor remains responsible for tool use and edits.
- Cache preferences are provider-dependent.

## Compatibility

Upstream package metadata for v1.1.0 declares peer dependencies on `@earendil-works/pi-agent-core`, `@earendil-works/pi-ai`, and `@earendil-works/pi-coding-agent` `^0.75.4`, plus `typebox`.

## Sources

- Upstream repository: https://github.com/luongnv89/pi-extensions
- Extension source: https://github.com/luongnv89/pi-extensions/tree/main/extensions/advisor-pi
- Package metadata: https://github.com/luongnv89/pi-extensions/blob/main/extensions/advisor-pi/package.json
- Catalog: https://github.com/luongnv89/pi-extensions#tools--automation
