# Source extensions

`config/source-extensions.json` tracks Pi extensions that are tested directly from source instead of installed from npm.

The goal is reproducibility: a source extension is identified by repository URL, exact commit SHA, and subpath. `pi-profile sync` checks out exactly that revision into `.local/sources/`, which is intentionally gitignored.

## Manifest schema

```json
{
  "schemaVersion": 1,
  "sources": [
    {
      "name": "9router-pi",
      "enabled": false,
      "repository": "https://github.com/luongnv89/pi-extensions.git",
      "commit": "ca99973d1e9d3e030657adac9519fe2a80bf0699",
      "subpath": "extensions/9router-pi"
    }
  ]
}
```

Fields:

- `name`: stable local identifier.
- `enabled`: whether normal `pi-profile sync` should fetch it.
- `repository`: Git clone URL.
- `commit`: exact 40-character Git commit SHA. Do not use `main`, tags, or floating branches when reproducibility matters.
- `subpath`: extension directory inside the repository.

## Commands

Sync only enabled entries:

```bash
pi-profile sync
```

Preview without changing disk:

```bash
pi-profile sync --dry-run
```

Prefetch all entries, including disabled/labs entries:

```bash
pi-profile sync --all
```

Each source is stored under:

```text
.local/sources/<name>/repo/      pinned checkout
.local/sources/<name>/current    symlink to the configured subpath
.local/sources/<name>/source.json
```

## Enabling a source extension in pi-dev

1. Set `enabled: true` in `config/source-extensions.json`.
2. Run `pi-profile sync`.
3. Add the resolved path to `profiles/pi-dev/profile.json`:

```json
{
  "localExtensions": [
    "../../.local/sources/9router-pi/current"
  ]
}
```

Keep source extensions out of `pi` until they have been tested and intentionally promoted.

## Seeded labs entries

The manifest currently includes two disabled examples pinned to `luongnv89/pi-extensions` commit `ca99973d1e9d3e030657adac9519fe2a80bf0699`:

- `9router-pi` — source-only provider bridge in the upstream catalog.
- `subagents-pi` — subagent fleet telemetry; kept disabled to avoid stacking orchestration layers accidentally.

Source commit: https://github.com/luongnv89/pi-extensions/commit/ca99973d1e9d3e030657adac9519fe2a80bf0699
