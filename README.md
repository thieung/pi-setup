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
- npm extensions stay declarative in `settings.json` so Pi can reinstall them on another machine.
- credentials, sessions, caches, and machine-specific state stay outside Git.

The setup is inspired by three useful patterns:

- [`mrgoonie/zuey-pi-setup`](https://github.com/mrgoonie/zuey-pi-setup): treat Pi configuration and the package list as a portable, diffable setup manifest.
- [`thieung/pi-profile-manager`](https://github.com/thieung/pi-profile-manager): isolate profiles with `PI_CODING_AGENT_DIR` and `PI_CODING_AGENT_SESSION_DIR`.
- [`luongnv89/pi-extensions`](https://github.com/luongnv89/pi-extensions): primary source for Pi extensions used in this setup.

## Current profiles

| Profile | Purpose | Inherits | Extra extensions |
|---|---|---|---|
| `pi` | Stable daily work | Base config | None by default |
| `pi-dev` | Extension development and testing | `pi` | Local/source extensions from `extensions/` |

The important design rule is:

> `pi-dev = pi + experimental overlay`

`pi-dev` is not a separate copy of the stable configuration. That keeps the two profiles from drifting apart.

## Architecture

```text
                         Git repository

                  config/base/settings.json
                            │
                            ▼
                  profiles/pi/profile.json
                            │
                   stable daily profile
                            │
                            ▼
               profiles/pi-dev/profile.json
                            │
                  experimental overlay
                            │
             ┌──────────────┴──────────────┐
             ▼                             ▼
~/.pi/profiles/pi/              ~/.pi/profiles/pi-dev/
 settings.json                   settings.json
 sessions/                       sessions/
 .pi-setup.json                  .pi-setup.json
```

At runtime the launcher sets:

```bash
PI_PROFILE=<profile>
PI_CODING_AGENT_DIR="$HOME/.pi/profiles/<profile>"
PI_CODING_AGENT_SESSION_DIR="$HOME/.pi/profiles/<profile>/sessions"
```

This isolates Pi configuration and sessions between profiles.

It is **not** an OS-level sandbox. Profiles still share the same filesystem, repositories, credentials available to the process, ports, containers, and other machine resources.

## Repository layout

```text
pi-setup/
├── README.md
├── .gitignore
├── bin/
│   └── pi-profile                 profile launcher
├── config/
│   └── base/
│       └── settings.json          stable Pi package/config manifest
├── extensions/
│   └── README.md                  local/experimental extension area
├── profiles/
│   ├── pi/
│   │   └── profile.json           stable profile definition
│   └── pi-dev/
│       └── profile.json           development overlay
└── scripts/
    ├── bootstrap.sh               first-time machine setup
    ├── install.sh                 installs the launcher
    ├── render-profile.mjs         resolves profile inheritance
    └── materialize-profile.mjs    writes runtime profile config
```

## Requirements

Current implementation targets macOS and Linux/VPS environments with:

- Git
- Bash
- Node.js
- Pi Coding Agent installed and available as `pi`

The bootstrap script intentionally does not own Node or Pi installation yet. This keeps the repository focused on Pi configuration and profile management rather than becoming a full machine-provisioning system.

## Quick start

### 1. Install Pi

Install Pi using its normal installation method and confirm:

```bash
pi --version
```

### 2. Clone this repository

SSH:

```bash
git clone git@github.com:thieung/pi-setup.git
cd pi-setup
```

or HTTPS:

```bash
git clone https://github.com/thieung/pi-setup.git
cd pi-setup
```

### 3. Bootstrap the profiles

```bash
./scripts/bootstrap.sh
```

Bootstrap does three things:

1. checks that `node` and `pi` are available;
2. installs the `pi-profile` launcher into `~/.local/bin`;
3. materializes both `pi` and `pi-dev` under `~/.pi/profiles/`.

If `~/.local/bin` is not already in your shell `PATH`, add:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

For a permanent Bash setup:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

On macOS with zsh:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 4. Launch Pi

Stable profile:

```bash
pi-profile pi
```

Development profile:

```bash
pi-profile pi-dev
```

Any remaining arguments are forwarded to Pi:

```bash
pi-profile pi --provider openai-codex
pi-profile pi --model <model>
pi-profile pi-dev --provider <provider> --model <model>
```

List the profiles supported by the current launcher:

```bash
pi-profile list
```

## How profile inheritance works

### Base configuration

`config/base/settings.json` is the shared stable Pi manifest.

Current sample:

```json
{
  "packages": [
    "npm:statusline-pi",
    "npm:advisor-pi",
    "npm:timestamp-pi"
  ]
}
```

These packages are examples, not yet the final personal extension set.

### Stable profile

`profiles/pi/profile.json` points at the base configuration:

```json
{
  "name": "pi",
  "description": "Stable daily-driver profile",
  "extends": "../../config/base/settings.json",
  "packages": [],
  "localExtensions": []
}
```

### Development profile

`profiles/pi-dev/profile.json` inherits `pi`:

```json
{
  "name": "pi-dev",
  "description": "Development profile: stable base plus experimental/local extensions",
  "extends": "../pi/profile.json",
  "packages": [],
  "localExtensions": [
    "../../extensions"
  ]
}
```

The renderer recursively resolves `extends`, merges package arrays, removes duplicates, and resolves local extension paths.

Conceptually:

```text
base packages
    +
pi packages
    +
pi-dev packages
    +
pi-dev local extensions
    =
rendered pi-dev profile
```

## What gets generated on each machine

Running a profile calls `materialize-profile.mjs` before launching Pi.

For example:

```text
~/.pi/profiles/pi/
├── settings.json
├── sessions/
└── .pi-setup.json
```

and:

```text
~/.pi/profiles/pi-dev/
├── settings.json
├── sessions/
└── .pi-setup.json
```

`settings.json` is generated from the repository definitions. `.pi-setup.json` contains lightweight metadata about which repository/profile generated that directory.

The generated directories are runtime artifacts. The Git repository remains the source of truth.

## Adding extensions

There are two useful categories.

### 1. Stable npm extension

If an extension is trusted and should be available on every machine, add it to:

```text
config/base/settings.json
```

Example:

```json
{
  "packages": [
    "npm:statusline-pi",
    "npm:advisor-pi",
    "npm:timestamp-pi",
    "npm:opencode-pi"
  ]
}
```

Then commit the change:

```bash
git add config/base/settings.json
git commit -m "feat: add opencode-pi to stable profile"
git push
```

On another machine:

```bash
cd pi-setup
git pull
pi-profile pi
```

The launcher materializes the new profile before starting Pi.

### 2. Experimental npm extension

If an npm extension should be tested without touching the stable profile, add it only to:

```text
profiles/pi-dev/profile.json
```

For example:

```json
{
  "name": "pi-dev",
  "extends": "../pi/profile.json",
  "packages": [
    "npm:some-experimental-extension"
  ],
  "localExtensions": [
    "../../extensions"
  ]
}
```

Now:

```bash
pi-profile pi
```

does not include it, while:

```bash
pi-profile pi-dev
```

does.

### 3. Local or unpublished source extension

Use `extensions/` for code that is under development or not published to npm.

Typical examples from `luongnv89/pi-extensions` are extensions that are intended to run from source with Pi's `-e` option.

You can clone or symlink source into this directory, for example:

```text
extensions/
├── my-extension/
└── another-experiment/
```

`pi-dev` currently adds the configured local extension path when launching Pi. The stable `pi` profile does not.

A future revision should make this more deterministic by introducing a source-extension manifest with repository URL + commit/tag instead of relying on manually populated local directories.

## Recommended workflow

### Daily work

Use:

```bash
pi-profile pi
```

Only promote extensions/configuration here after they are considered stable enough for normal work.

### Extension development or evaluation

Use:

```bash
pi-profile pi-dev
```

This is where you can:

- test extensions before adding them to the stable package list;
- run unpublished source extensions;
- modify extension code and reload Pi;
- experiment with provider bridges or UI extensions;
- test configuration changes without polluting the daily profile.

### Promote an extension from `pi-dev` to `pi`

Once an extension is proven stable:

1. remove it from the `pi-dev`-specific package list if present;
2. add it to `config/base/settings.json`;
3. commit and push;
4. launch both profiles and verify behavior.

This makes the stable setup auditable through Git history.

## Using the repo on a VPS

The intended VPS flow is intentionally the same as local setup:

```bash
git clone https://github.com/thieung/pi-setup.git
cd pi-setup
./scripts/bootstrap.sh
pi-profile pi
```

For headless environments, keep in mind that some Pi extensions may depend on local applications, a browser, desktop permissions, notification systems, or other machine capabilities. Such extensions should either be avoided on VPS instances or eventually placed behind machine-specific overlays.

A likely future profile structure is:

```text
pi
├── stable shared configuration
├── local overlay
└── vps overlay
```

but machine-specific overlays are not implemented yet.

## Updating an existing machine

Pull repository changes:

```bash
cd ~/path/to/pi-setup
git pull
```

Then simply launch the profile again:

```bash
pi-profile pi
```

or:

```bash
pi-profile pi-dev
```

Profiles are materialized before Pi starts, so there is no separate manual render step required for normal use.

You can also explicitly inspect the merged profile without launching Pi:

```bash
node scripts/render-profile.mjs pi
node scripts/render-profile.mjs pi-dev
```

## Inspecting generated profiles

Stable profile:

```bash
cat ~/.pi/profiles/pi/settings.json
```

Development profile:

```bash
cat ~/.pi/profiles/pi-dev/settings.json
```

Generation metadata:

```bash
cat ~/.pi/profiles/pi/.pi-setup.json
cat ~/.pi/profiles/pi-dev/.pi-setup.json
```

This is useful when diagnosing whether a problem comes from the repository definition or from Pi/runtime state.

## Secrets and sensitive state

Do **not** put these in this repository:

- provider API keys;
- OAuth tokens;
- `auth.json` or equivalent credential stores;
- sessions/conversation history;
- extension configuration containing passwords or tokens;
- machine-specific absolute paths unless they are explicitly templated;
- caches or generated package directories;
- local application credentials.

Authentication should be performed separately on each machine unless a dedicated secure secret-management mechanism is added later.

This separation is intentional: the repo should be safe to clone onto another machine without also copying identity/authentication state.

## What profile isolation does and does not isolate

Profile isolation currently covers Pi-level configuration and sessions via:

```text
PI_CODING_AGENT_DIR
PI_CODING_AGENT_SESSION_DIR
```

This is useful for testing because `pi-dev` can have its own Pi state without overwriting `pi`.

It does **not** isolate:

- the current Git repository;
- filesystem writes performed by the agent;
- environment variables inherited from the shell;
- ports and background processes;
- Docker containers;
- SSH credentials;
- external CLI configuration;
- cloud accounts;
- OS-level permissions.

If stronger isolation is required, use containers, VMs, separate OS users, worktrees, or another sandboxing layer in addition to profiles.

## Why not just copy `~/.pi/agent`?

Copying the entire Pi directory mixes several different concerns:

```text
configuration
+ installed package state
+ generated files
+ cache
+ sessions
+ credentials
+ machine-local state
```

This repo tries to keep only the first concern in Git and regenerate the rest where possible.

Benefits:

- easier review through Git diffs;
- fewer machine-specific paths;
- lower chance of committing credentials;
- simpler laptop/VPS migration;
- reproducible extension lists;
- cleaner stable-vs-development separation.

## Relationship with pi-profile-manager

[`thieung/pi-profile-manager`](https://github.com/thieung/pi-profile-manager) already contains broader profile-management patterns, including profile-specific `PI_CODING_AGENT_DIR` and session directories.

This repository currently has a narrower purpose:

```text
pi-profile-manager
    broader runtime/profile management

pi-setup
    personal, portable Pi configuration source of truth
```

Over time, useful functionality such as `doctor`, `diff`, inventory, validation, and safer profile lifecycle management can be absorbed here or shared with `pi-profile-manager` to avoid maintaining overlapping logic.

## Troubleshooting

### `pi: command not found`

Install Pi first and verify:

```bash
which pi
pi --version
```

Then rerun:

```bash
./scripts/bootstrap.sh
```

### `pi-profile: command not found`

Check whether the launcher exists:

```bash
ls -l ~/.local/bin/pi-profile
```

Then ensure `~/.local/bin` is in `PATH`:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

### Profile changes are not showing up

Check the rendered result:

```bash
node scripts/render-profile.mjs pi-dev
```

Then launch again:

```bash
pi-profile pi-dev
```

Materialization happens on every launch.

### Stable and dev sessions appear mixed

Verify environment values from the launcher logic and inspect:

```bash
ls ~/.pi/profiles/pi/sessions
ls ~/.pi/profiles/pi-dev/sessions
```

Each profile should use a different session directory.

### An extension works locally but not on VPS

Check whether the extension depends on:

- a desktop application;
- a local CLI not installed on the VPS;
- browser/GUI permissions;
- an external config file outside `PI_CODING_AGENT_DIR`;
- environment variables or credentials;
- a manually cloned source directory under `extensions/`.

Portable profile configuration does not automatically make every extension portable.

## Current limitations

This repository is still early-stage. Current limitations include:

- only `pi` and `pi-dev` are wired into the launcher;
- the stable extension list is still a sample set;
- source extensions are not yet pinned by repository commit/tag;
- no `sync`, `doctor`, or `diff` commands yet;
- no machine-specific overlays for local vs VPS;
- no Windows-native setup flow;
- no CI validation yet;
- bootstrap expects Node and Pi to already exist;
- external extension configs are not yet modeled declaratively.

## Roadmap

Near-term improvements:

- [ ] Replace sample packages with the actual stable extension set.
- [ ] Add selected extensions from `luongnv89/pi-extensions`.
- [ ] Add a pinned source-extension manifest (`repo`, `ref`, `path`).
- [ ] Add `pi-profile sync`.
- [ ] Add `pi-profile doctor`.
- [ ] Add `pi-profile diff`.
- [ ] Add profile inventory/status output.
- [ ] Add CI to render and validate every profile.
- [ ] Add local/VPS machine overlays where required.
- [ ] Define a safe pattern for external extension config files.
- [ ] Reuse or consolidate relevant logic from `pi-profile-manager`.

A possible later structure:

```text
config/
├── base/
├── machines/
│   ├── local/
│   └── vps/
└── extensions/

profiles/
├── pi/
├── pi-dev/
└── custom-profile/
```

The important constraint should remain the same: profiles compose from shared layers instead of duplicating complete Pi directories.

## Design principles

1. **Git is the configuration source of truth.**
2. **Runtime state stays outside the repository.**
3. **Stable and experimental profiles should not drift.**
4. **Prefer declarative package manifests over copied package directories.**
5. **Do not store secrets in the repo.**
6. **A new machine should require as few manual steps as practical.**
7. **Development overlays should be disposable.**
8. **Promoting a tested extension to stable should be a small Git diff.**

## References

- Pi setup portability pattern: https://github.com/mrgoonie/zuey-pi-setup
- Pi extensions used as the primary extension source: https://github.com/luongnv89/pi-extensions
- Existing profile-management patterns: https://github.com/thieung/pi-profile-manager

## Status

The basic profile system is working:

```text
pi       = stable base
pi-dev   = pi + experimental/local extension overlay
```

The next major step is to replace the sample package list with the real daily setup and make source-extension installation reproducible across local machines and VPS hosts.
