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
- source extensions are pinned by Git commit in `config/source-extensions.json`.
- credentials, sessions, caches, and machine-specific state stay outside Git.

The setup is inspired by three useful patterns:

- [`mrgoonie/zuey-pi-setup`](https://github.com/mrgoonie/zuey-pi-setup): treat Pi configuration and the package list as a portable, diffable setup manifest.
- [`thieung/pi-profile-manager`](https://github.com/thieung/pi-profile-manager): isolate profiles with `PI_CODING_AGENT_DIR` and `PI_CODING_AGENT_SESSION_DIR`.
- [`luongnv89/pi-extensions`](https://github.com/luongnv89/pi-extensions): primary source for extensions used in this setup.

## Current profiles

| Profile | Purpose | Inherits | Enabled extensions |
|---|---|---|---|
| `pi` | Stable daily work | Base config | `statusline-pi@1.3.1` |
| `pi-dev` | Extension/provider testing | `pi` | stable set + `advisor-pi@1.1.0`, `opencode-pi@1.3.0`, optional source overlay |

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
└── optional pinned source extensions
```

Detailed extension docs live under [`docs/extensions/`](docs/extensions/README.md). Source-extension lifecycle is documented in [`docs/source-extensions.md`](docs/source-extensions.md).

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

Launch either profile:

```bash
pi-profile pi
pi-profile pi-dev
```

List profiles:

```bash
pi-profile list
```

Sync enabled source extensions:

```bash
pi-profile sync
```

Preview source sync:

```bash
pi-profile sync --dry-run
```

Prefetch labs/disabled entries too:

```bash
pi-profile sync --all
```

## Source extension manifest

Source-based extensions are declared in:

```text
config/source-extensions.json
```

Each entry pins:

- repository URL;
- exact commit SHA;
- extension subpath;
- whether it is enabled for normal sync.

Synced source lives under `.local/sources/`, which is machine-local and ignored by Git.

This avoids floating `main` checkouts and makes local/VPS environments reproduce the same source revision.

See [`docs/source-extensions.md`](docs/source-extensions.md) for the schema and promotion workflow.

## Profile runtime

```text
pi-profile pi
   ├─ PI_CODING_AGENT_DIR=~/.pi/profiles/pi
   └─ PI_CODING_AGENT_SESSION_DIR=~/.pi/profiles/pi/sessions

pi-profile pi-dev
   ├─ PI_CODING_AGENT_DIR=~/.pi/profiles/pi-dev
   └─ PI_CODING_AGENT_SESSION_DIR=~/.pi/profiles/pi-dev/sessions
```

## New machine / VPS

```bash
git clone git@github.com:thieung/pi-setup.git
cd pi-setup
./scripts/bootstrap.sh
pi-profile sync
pi-profile pi
```

Provider credentials and OAuth/API login state are intentionally not copied by this repository. Authenticate providers separately on each machine.

To update an existing machine:

```bash
cd ~/path/to/pi-setup
git pull --ff-only
./scripts/bootstrap.sh
pi-profile sync
```

## Secrets and machine-specific state

Do not commit provider credentials, OAuth tokens, API keys, sessions, caches, generated package directories, absolute machine paths, or extension config containing tokens.

This repository manages configuration and reproducible source pins, not secrets.

## Current commands

```text
pi-profile pi [pi args...]
pi-profile pi-dev [pi args...]
pi-profile list
pi-profile sync [--all] [--dry-run]
```

## Roadmap

Next useful commands:

1. `pi-profile doctor` — validate Pi, Node, Git, manifests, source pins, optional CLIs, and generated profiles.
2. `pi-profile diff` — show effective differences between `pi` and `pi-dev`.
3. CI validation for profile rendering and source manifest schema.
4. Optional source-extension promotion helper.
5. Better macOS/Linux/VPS bootstrap behavior.

## Design principles

1. **Git is the source of truth.**
2. **Stable stays boring.** Daily Pi contains only proven extensions.
3. **Experiments are overlays.** `pi-dev` inherits stable configuration.
4. **npm versions are pinned.**
5. **source revisions are pinned by commit SHA.**
6. **Secrets never belong in the setup repo.**
7. **Do not duplicate config.**
8. **Do not stack orchestration layers accidentally.**
9. **Generated runtime and synced source state are disposable.**

## References

- Pi Coding Agent: https://github.com/earendil-works/pi-coding-agent
- zuey-pi-setup: https://github.com/mrgoonie/zuey-pi-setup
- pi-profile-manager: https://github.com/thieung/pi-profile-manager
- luongnv89/pi-extensions: https://github.com/luongnv89/pi-extensions
- pinned upstream source commit: https://github.com/luongnv89/pi-extensions/commit/ca99973d1e9d3e030657adac9519fe2a80bf0699
