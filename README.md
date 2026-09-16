# pi-setup

Portable Pi Coding Agent setup for local machines and VPS, with profile switching.

Inspired by:

- `mrgoonie/zuey-pi-setup`: portable, diffable Pi configuration and package manifest.
- `thieung/pi-profile-manager`: profile isolation through `PI_CODING_AGENT_DIR` and `PI_CODING_AGENT_SESSION_DIR`.
- `luongnv89/pi-extensions`: primary extension source.

## Design

```text
config/base/settings.json
        │
        ▼
profiles/pi/profile.json          stable daily driver
        │
        └──────────────► profiles/pi-dev/profile.json
                          stable + experimental/local extensions
```

Profiles are materialized into:

```text
~/.pi/profiles/pi/
~/.pi/profiles/pi-dev/
```

The repo is the source of truth; generated profile directories are machine-local.

### Why overlay instead of duplicated configs?

`pi-dev` should differ from `pi` only by what is being tested. It inherits the stable profile and adds packages or local extension paths, so changes to the stable base do not have to be copied between profiles.

## Quick start

```bash
git clone git@github.com:thieung/pi-setup.git
cd pi-setup
./scripts/bootstrap.sh

pi-profile pi
pi-profile pi-dev
```

Pass normal Pi arguments after the profile:

```bash
pi-profile pi --provider openai-codex
pi-profile pi-dev --model <model>
```

## Add a stable extension

Add it to `config/base/settings.json`.

Pi can restore npm packages from the settings manifest on a new machine.

## Test an extension only in `pi-dev`

For an npm-published extension, add it to `profiles/pi-dev/profile.json` under `packages`.

For unpublished/source extensions, clone or symlink them under `extensions/`. `pi-dev` passes that directory to Pi as an extension overlay while `pi` remains clean.

## Machine portability

Keep these out of git:

- auth/provider credentials
- sessions/history
- caches
- machine-specific state
- extension configs containing tokens

The profile launcher controls Pi config/session directories. It is not an OS sandbox.

## Suggested next steps

1. Replace the sample package list with your actual stable extensions.
2. Add a pinned source-extension manifest for selected modules from `luongnv89/pi-extensions`.
3. Add `pi-profile sync`, `doctor`, and `diff`.
4. Add Linux/macOS CI that renders both profiles and checks inheritance.
5. Optionally absorb the useful parts of `pi-profile-manager` so there is only one profile layer.
