# statusline-pi

## Role in this setup

`statusline-pi` is the only extension enabled in the stable `pi` profile. It is inherited automatically by `pi-dev`.

Pinned package:

```text
npm:statusline-pi@1.3.1
```

## What it does

It replaces Pi's default footer with a compact project statusline that surfaces useful session context while coding. Upstream documents directory, git branch/change state, PR number, remaining context, token speed, cost/CPU/memory-related status, and provider/model information.

This makes it a good fit for the stable profile because it improves observability without changing orchestration behavior.

## Why it is stable

- UI/observability only.
- No extra agent orchestration layer.
- Useful on both local machines and VPS sessions.
- Safe to inherit into `pi-dev`.

## Installation

Managed by this repo through `config/base/settings.json`:

```json
{
  "packages": [
    "npm:statusline-pi@1.3.1"
  ]
}
```

Manual equivalent:

```bash
pi install npm:statusline-pi@1.3.1
```

Reload Pi after changing extensions:

```text
/reload
```

## Commands

Upstream currently documents:

```text
/statusline-pi
/statusline-refresh
```

The first toggles the custom footer; the second refreshes git/PR data.

## Compatibility

Upstream package metadata for v1.3.1 declares peer dependencies on Pi Coding Agent and Pi TUI `^0.75.4`.

## Sources

- Upstream repository: https://github.com/luongnv89/pi-extensions
- Extension source: https://github.com/luongnv89/pi-extensions/tree/main/extensions/statusline-pi
- Package metadata: https://github.com/luongnv89/pi-extensions/blob/main/extensions/statusline-pi/package.json
- Catalog: https://github.com/luongnv89/pi-extensions#status--ui
