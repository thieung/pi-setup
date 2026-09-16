# pi-setup

Portable, reproducible Pi Coding Agent setup for multiple machines and multiple profiles.

The goal is simple: keep one Git repository as the source of truth for Pi configuration, clone it onto a laptop, workstation, or VPS, and switch between stable, development, or custom profiles without duplicating the whole setup.

## What this repo solves

A Pi setup usually grows over time: packages, extensions, model/provider preferences, local extensions, themes, and machine-specific state. Copying `~/.pi/agent` between machines is convenient at first, but it also risks carrying caches, sessions, absolute paths, generated files, and credentials.

This repo takes a different approach:

- Git stores only portable configuration and profile definitions.
- Pi runtime data is materialized per profile under `~/.pi/profiles/`.
- `pi` is the stable daily-driver profile.
- `pi-dev` inherits `pi` and adds experimental/local extensions.
- custom profiles can be added dynamically and inherit any existing profile.
- npm extensions are pinned in profile manifests so another machine can reproduce the same setup.
- source extensions are pinned by Git commit in `config/source-extensions.json`.
- credentials, sessions, caches, and machine-specific state stay outside Git.

## Current profiles

| Profile | Purpose | Inherits | Enabled extensions |
|---|---|---|---|
| `pi` | Stable daily work | Base config | `statusline-pi@1.3.1` |
| `pi-dev` | Extension/provider testing | `pi` | stable set + `advisor-pi@1.1.0`, `opencode-pi@1.3.0`, optional source overlay |
| custom profiles | Purpose-specific variants | any existing profile | defined per profile |

The important default rule is:

> `pi-dev = pi + experimental overlay`

Custom profiles follow the same inheritance model rather than copying full settings.

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

Launch a profile:

```bash
pi-profile pi
pi-profile pi-dev
```

## Profile management

List all profiles dynamically:

```bash
pi-profile list
```

Create a profile. The default parent is `pi`:

```bash
pi-profile add pi-lab
```

This creates:

```text
profiles/pi-lab/profile.json
```

with an inheritance relationship to `pi`.

Create a profile inheriting another profile:

```bash
pi-profile add pi-review --extends pi-dev
```

Run it exactly like a built-in profile:

```bash
pi-profile pi-review
```

Remove a custom profile:

```bash
pi-profile remove pi-review
```

Safety behavior:

- `pi` and `pi-dev` are protected and cannot be removed by the CLI;
- removal is blocked if another profile inherits the target profile;
- adding an existing profile name fails instead of overwriting it;
- profile names must match `^[a-z0-9][a-z0-9._-]*$`.

Because profile definitions live inside this Git repo, adding/removing profiles changes the working tree. Commit those changes if you want the same profiles on other machines.

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

## Source extension commands

```bash
pi-profile sync
pi-profile sync --dry-run
pi-profile sync --all
```

Source-based extensions are declared in `config/source-extensions.json` and pinned to exact Git commit SHAs. Synced source lives under `.local/sources/`, which is ignored by Git.

## Profile runtime

Every profile gets its own generated Pi directory:

```text
pi-profile <name>
   ├─ PI_CODING_AGENT_DIR=~/.pi/profiles/<name>
   └─ PI_CODING_AGENT_SESSION_DIR=~/.pi/profiles/<name>/sessions
```

The launcher resolves any profile that has `profiles/<name>/profile.json`; profile names are no longer hard-coded into the launcher.

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
pi-profile <profile> [pi args...]
pi-profile list
pi-profile add <name> [--extends <profile>]
pi-profile remove <name>
pi-profile sync [--all] [--dry-run]
```

Examples:

```bash
pi-profile pi
pi-profile pi-dev --model <model>
pi-profile add pi-lab
pi-profile add pi-review --extends pi-dev
pi-profile list
pi-profile remove pi-review
pi-profile sync --dry-run
```

## Roadmap

Next useful commands:

1. `pi-profile doctor` — validate Pi, Node, Git, manifests, source pins, optional CLIs, and generated profiles.
2. `pi-profile diff` — show effective differences between any two profiles.
3. CI validation for profile rendering and source manifest schema.
4. Optional source-extension promotion helper.
5. Better macOS/Linux/VPS bootstrap behavior.

## Design principles

1. **Git is the source of truth.**
2. **Stable stays boring.** Daily Pi contains only proven extensions.
3. **Experiments are overlays.** Profiles inherit instead of duplicating config.
4. **Profiles are data, not hard-coded commands.** Any `profiles/<name>/profile.json` can be launched.
5. **npm versions are pinned.**
6. **source revisions are pinned by commit SHA.**
7. **Secrets never belong in the setup repo.**
8. **Do not stack orchestration layers accidentally.**
9. **Generated runtime and synced source state are disposable.**

## References

- Pi Coding Agent: https://github.com/earendil-works/pi-coding-agent
- zuey-pi-setup: https://github.com/mrgoonie/zuey-pi-setup
- pi-profile-manager: https://github.com/thieung/pi-profile-manager
- luongnv89/pi-extensions: https://github.com/luongnv89/pi-extensions
- pinned upstream source commit: https://github.com/luongnv89/pi-extensions/commit/ca99973d1e9d3e030657adac9519fe2a80bf0699
