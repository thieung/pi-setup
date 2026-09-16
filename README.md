# pi-setup

Portable, reproducible Pi Coding Agent setup for multiple machines and multiple profiles.

The goal is simple: keep one Git repository as the source of truth for Pi configuration, clone it onto a laptop, workstation, or VPS, and switch between a stable daily profile and an experimental development profile without duplicating the whole setup.

## What this repo solves

A Pi setup usually grows over time: packages, extensions, model/provider preferences, local extensions, themes, and machine-specific state. Copying `~/.pi/agent` between machines is convenient at first, but it also risks carrying caches, sessions, absolute paths, generated files, and credentials.

This repo takes a different approach:

- Git stores only portable configuration and profile definitions.
- Pi runtime data is materialized per profile under `~/.pi/profiles/`.
- `pi` is the stable daily-driver profile.
- `pi-dev` inherits `pi` and adds experimental/local extensions.
- npm extensions are pinned in profile manifests so another machine can reproduce the same setup.
- credentials, sessions, caches, and machine-specific state stay outside Git.

The setup is inspired by three useful patterns:

- [`mrgoonie/zuey-pi-setup`](https://github.com/mrgoonie/zuey-pi-setup): treat Pi configuration and the package list as a portable, diffable setup manifest.
- [`thieung/pi-profile-manager`](https://github.com/thieung/pi-profile-manager): isolate profiles with `PI_CODING_AGENT_DIR` and `PI_CODING_AGENT_SESSION_DIR`.
- [`luongnv89/pi-extensions`](https://github.com/luongnv89/pi-extensions): primary source for extensions used in this setup.

## Current profiles

| Profile | Purpose | Inherits | Enabled extensions |
|---|---|---|---|
| `pi` | Stable daily work | Base config | `statusline-pi@1.3.1` |
| `pi-dev` | Extension/provider testing | `pi` | stable set + `advisor-pi@1.1.0`, `opencode-pi@1.3.0`, local source overlay |

The important design rule is:

> `pi-dev = pi + experimental overlay`

`pi-dev` is not a separate copy of the stable configuration. That keeps the two profiles from drifting apart.

## Extension policy

The enabled package set is intentionally small and pinned:

```text
pi
└── statusline-pi@1.3.1

pi-dev
├── inherits pi
├── advisor-pi@1.1.0
├── opencode-pi@1.3.0
└── extensions/        local/source experiments
```

Two additional components are tracked but not enabled by default:

- `subagents-pi` — Pi subagent fleet telemetry; labs-only because the main orchestration workflow is handled elsewhere.
- `pi-delegator` — delegation skill for launching monitored Pi subprocesses; labs-only for the same reason.

Detailed documentation and upstream sources:

- [`statusline-pi`](docs/extensions/statusline-pi.md)
- [`advisor-pi`](docs/extensions/advisor-pi.md)
- [`opencode-pi`](docs/extensions/opencode-pi.md)
- [`subagents-pi`](docs/extensions/subagents-pi.md)
- [`pi-delegator`](docs/extensions/pi-delegator.md)
- [Extension index](docs/extensions/README.md)

## Architecture

```text
                         Git repository
                              │
                     config/base/settings.json
                              │
                              ▼
                    profiles/pi/profile.json
                      stable daily profile
                              │
                              ▼
                  profiles/pi-dev/profile.json
                    experimental overlay
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              npm packages         extensions/
                                   local/source
                                   experiments
```

At runtime:

```text
pi-profile pi
   │
   ├─ PI_CODING_AGENT_DIR=~/.pi/profiles/pi
   └─ PI_CODING_AGENT_SESSION_DIR=~/.pi/profiles/pi/sessions

pi-profile pi-dev
   │
   ├─ PI_CODING_AGENT_DIR=~/.pi/profiles/pi-dev
   ├─ PI_CODING_AGENT_SESSION_DIR=~/.pi/profiles/pi-dev/sessions
   └─ source extension overlay from ./extensions
```

## Repository structure

```text
pi-setup/
├── README.md
├── bin/
│   └── pi-profile
├── config/
│   └── base/
│       └── settings.json
├── docs/
│   └── extensions/
│       ├── README.md
│       ├── statusline-pi.md
│       ├── advisor-pi.md
│       ├── opencode-pi.md
│       ├── subagents-pi.md
│       └── pi-delegator.md
├── extensions/
│   └── README.md
├── profiles/
│   ├── pi/
│   │   └── profile.json
│   └── pi-dev/
│       └── profile.json
└── scripts/
    ├── bootstrap.sh
    ├── install.sh
    ├── materialize-profile.mjs
    └── render-profile.mjs
```

## Requirements

Current scripts expect:

- macOS or Linux
- Bash
- Node.js
- Pi Coding Agent installed and available as `pi`
- Git

For `opencode-pi`, install the OpenCode CLI on machines where you want to use that provider bridge.

## Quick start

```bash
git clone git@github.com:thieung/pi-setup.git
cd pi-setup
./scripts/bootstrap.sh
```

If `~/.local/bin` is not already on `PATH`:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Then launch either profile:

```bash
pi-profile pi
pi-profile pi-dev
```

Pass normal Pi arguments after the profile name:

```bash
pi-profile pi --provider openai-codex
pi-profile pi-dev --model <model>
```

List profiles:

```bash
pi-profile list
```

## What bootstrap does

`./scripts/bootstrap.sh` verifies that `node` and `pi` exist, installs the `pi-profile` launcher into `~/.local/bin`, then materializes both profiles.

Generated runtime directories:

```text
~/.pi/profiles/pi/
├── settings.json
├── .pi-setup.json
└── sessions/

~/.pi/profiles/pi-dev/
├── settings.json
├── .pi-setup.json
└── sessions/
```

These directories are generated machine state. Do not commit them back into the repository.

## Profile inheritance

The stable profile points to the base settings:

```json
{
  "name": "pi",
  "extends": "../../config/base/settings.json",
  "packages": [],
  "localExtensions": []
}
```

The development profile extends `pi` and adds only its differences:

```json
{
  "name": "pi-dev",
  "extends": "../pi/profile.json",
  "packages": [
    "npm:advisor-pi@1.1.0",
    "npm:opencode-pi@1.3.0"
  ],
  "localExtensions": [
    "../../extensions"
  ]
}
```

The renderer merges package lists and removes duplicates.

## Adding or promoting extensions

### Stable extension

Add a pinned package to `config/base/settings.json`:

```json
{
  "packages": [
    "npm:statusline-pi@1.3.1",
    "npm:some-extension@x.y.z"
  ]
}
```

After testing, materialize again or restart through `pi-profile`.

### Dev-only npm extension

Add it only to `profiles/pi-dev/profile.json`.

### Local or unpublished source extension

Place or symlink it under:

```text
extensions/
```

`pi-dev` loads that directory as an extension overlay; `pi` does not.

### Promotion workflow

Use this flow:

```text
source/local experiment
        ↓
     pi-dev
        ↓
 test behavior / compatibility
        ↓
 pin a released version
        ↓
 config/base/settings.json
        ↓
       pi
```

This keeps experimental changes away from the daily profile until they are intentionally promoted.

## New machine / VPS

```bash
git clone git@github.com:thieung/pi-setup.git
cd pi-setup
./scripts/bootstrap.sh
pi-profile pi
```

Provider credentials and OAuth/API login state are intentionally not copied by this repository. Authenticate providers separately on each machine.

To update an existing machine:

```bash
cd ~/path/to/pi-setup
git pull --ff-only
./scripts/bootstrap.sh
```

## Inspect a profile without launching Pi

Render the merged profile:

```bash
node scripts/render-profile.mjs pi
node scripts/render-profile.mjs pi-dev
```

Materialize explicitly:

```bash
node scripts/materialize-profile.mjs pi
node scripts/materialize-profile.mjs pi-dev
```

Inspect generated settings:

```bash
cat ~/.pi/profiles/pi/settings.json
cat ~/.pi/profiles/pi-dev/settings.json
```

## Secrets and machine-specific state

Do not commit:

- provider credentials or auth files;
- OAuth tokens or API keys;
- session history;
- caches;
- generated package directories;
- absolute machine paths;
- extension configuration containing tokens;
- per-machine runtime state.

This repository manages configuration, not secrets.

## What profile isolation means

Each profile receives separate Pi config and session directories, so package manifests, profile-generated config, and session history do not need to collide.

It is not an OS/process sandbox. Profiles may still share:

- the same Git working tree;
- environment variables;
- provider credentials outside the Pi profile directory;
- ports;
- Docker daemon/containers;
- SSH agent;
- filesystem permissions;
- external CLI configuration.

## Relationship to pi-profile-manager

[`thieung/pi-profile-manager`](https://github.com/thieung/pi-profile-manager) remains a useful reference for stronger lifecycle management and profile isolation patterns.

This repo intentionally starts smaller. Its primary job is to make the actual Pi configuration portable and Git-managed while preserving the simple `pi` / `pi-dev` model.

Useful ideas that can later be absorbed here include:

- `doctor` checks;
- inventory/status output;
- managed updates;
- stronger cross-platform support;
- ownership receipts and safer executable replacement.

## Troubleshooting

### `pi-profile: command not found`

Add the install directory to `PATH`:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Then add the same line to your shell startup file.

### `pi is not installed`

Install Pi first and verify:

```bash
command -v pi
pi --version
```

Then rerun:

```bash
./scripts/bootstrap.sh
```

### Profile changes do not appear

Relaunch through the wrapper:

```bash
pi-profile pi
# or
pi-profile pi-dev
```

You can also inspect the renderer directly:

```bash
node scripts/render-profile.mjs pi-dev
```

### `opencode-pi` provider is unavailable

Verify the OpenCode CLI exists on the machine and works independently. The Pi extension is a bridge; it cannot expose models if its backing CLI is missing or unavailable.

### A local extension should not affect stable Pi

Keep it under `extensions/` and use `pi-profile pi-dev`. The stable profile has no local-extension overlay.

## Current limitations

This is intentionally a small first version:

- macOS/Linux first;
- no automatic Git clone/update for source extensions yet;
- no `sync`, `doctor`, or `diff` subcommands yet;
- no credentials migration;
- no automatic promotion from dev to stable;
- no CI profile validation yet.

## Roadmap

Planned improvements:

1. `pi-profile sync` — refresh pinned source dependencies.
2. `pi-profile doctor` — validate Pi, Node, paths, manifests, and optional CLIs.
3. `pi-profile diff` — show effective differences between `pi` and `pi-dev`.
4. Source-extension manifest with Git repository + commit pinning.
5. CI validation for profile inheritance and generated settings.
6. Better macOS/Linux/VPS bootstrap behavior.
7. Selectively absorb mature lifecycle patterns from `pi-profile-manager`.

## Design principles

1. **Git is the source of truth.**
2. **Stable stays boring.** Daily Pi should contain only proven extensions.
3. **Experiments are overlays.** `pi-dev` inherits stable configuration.
4. **Versions are pinned.** Reproducibility matters across machines.
5. **Secrets never belong in the setup repo.**
6. **Do not duplicate config.** Shared settings belong in the base.
7. **Do not stack orchestration layers accidentally.** Subagent/delegation tooling stays explicit and labs-only unless deliberately promoted.
8. **Generated runtime state is disposable.** Rebuild it from the repository.

## Upstream references

- Pi Coding Agent: https://github.com/earendil-works/pi-coding-agent
- zuey-pi-setup: https://github.com/mrgoonie/zuey-pi-setup
- pi-profile-manager: https://github.com/thieung/pi-profile-manager
- luongnv89/pi-extensions: https://github.com/luongnv89/pi-extensions
