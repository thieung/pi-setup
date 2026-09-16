# opencode-pi

## Role in this setup

`opencode-pi` is enabled in `pi-dev` as a provider bridge.

Pinned package:

```text
npm:opencode-pi@1.3.0
```

## What it does

`opencode-pi` bridges models exposed by the local OpenCode CLI into Pi as a Pi provider. Upstream describes it as a way to use OpenCode CLI models from Pi without requiring an OpenCode login for the bridged free-model workflow.

This is useful for testing model/provider behavior without changing the stable Pi profile.

## Why it is in `pi-dev`

Provider bridges affect model discovery and runtime behavior, so they belong in the experimentation profile until intentionally promoted.

Typical uses:

- compare Pi behavior across model providers;
- try free OpenCode-backed models;
- test extension/provider compatibility;
- use a local CLI bridge without adding it to every Pi session.

## Installation

Managed through `profiles/pi-dev/profile.json`:

```json
{
  "packages": [
    "npm:opencode-pi@1.3.0"
  ]
}
```

Manual equivalent:

```bash
pi install npm:opencode-pi@1.3.0
```

After installation, select the registered provider/model through Pi's normal model picker or CLI flags.

## Requirements

The OpenCode CLI must be available locally for the bridge to be useful. Exact provider/model availability depends on the installed OpenCode version and its current model catalog.

Upstream package metadata for v1.3.0 requires Node.js >=18 and declares peer dependencies on Pi Coding Agent and Pi AI `^0.75.4`.

## Sources

- Upstream repository: https://github.com/luongnv89/pi-extensions
- Extension source: https://github.com/luongnv89/pi-extensions/tree/main/extensions/opencode-pi
- Package metadata: https://github.com/luongnv89/pi-extensions/blob/main/extensions/opencode-pi/package.json
- Catalog: https://github.com/luongnv89/pi-extensions#providers--use-external-models-in-pi
