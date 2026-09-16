# Extension policy

This directory is reserved for local or source-based extensions used only by `pi-dev`.

The stable `pi` profile should prefer pinned npm packages in `config/base/settings.json`.
The `pi-dev` profile may add npm packages in `profiles/pi-dev/profile.json` and may also load source extensions from this directory.

## Enabled today

| Component | Profile | Install mode | Source |
|---|---|---|---|
| `statusline-pi@1.3.1` | `pi`, inherited by `pi-dev` | npm | https://github.com/luongnv89/pi-extensions/tree/main/extensions/statusline-pi |
| `advisor-pi@1.1.0` | `pi-dev` | npm | https://github.com/luongnv89/pi-extensions/tree/main/extensions/advisor-pi |
| `opencode-pi@1.3.0` | `pi-dev` | npm | https://github.com/luongnv89/pi-extensions/tree/main/extensions/opencode-pi |

## Labs-only / not enabled by default

- `subagents-pi`: fleet metrics companion for `@tintinweb/pi-subagents`.
- `pi-delegator`: skill for delegating scoped work to Pi subprocesses.

These are intentionally not auto-enabled in the daily profile because orchestration is handled elsewhere in the user's stack.

See [`docs/extensions/`](../docs/extensions/) for the local documentation and upstream references.
