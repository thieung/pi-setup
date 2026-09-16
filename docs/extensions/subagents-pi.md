# subagents-pi

## Status in this setup

Labs-only. Not enabled in either `pi` or `pi-dev` by default.

## What it does

`subagents-pi` is a fleet metrics panel for managed Pi subagents. It shows active/queued agents and exposes runtime telemetry such as context usage, output TPS, duration/tool counts, thinking level, and model information.

It is not the subagent orchestrator itself. Upstream explicitly describes it as a companion to `@tintinweb/pi-subagents`, which provides spawning, FleetView, and the `Agent` tool.

## Why it is not enabled by default

The user's main multi-agent orchestration workflow is handled outside this setup. Enabling another subagent control layer in the daily profile would blur responsibilities between the Pi runtime and the existing orchestrator.

This extension remains useful for focused experiments where Pi-native subagents are intentionally being evaluated.

## Upstream installation

Upstream currently documents:

```bash
pi install npm:@tintinweb/pi-subagents
pi install npm:subagents-pi
```

The first package provides orchestration; the second provides the metrics panel.

## Commands

```text
/subagents-pi
/subagents-pi-refresh
```

## Use when

- testing Pi-native subagents;
- measuring per-agent context/TPS;
- comparing subagent models or thinking levels;
- debugging a Pi subagent fleet.

Do not enable it merely for normal Herdr-managed multi-agent work.

## Sources

- Upstream repository: https://github.com/luongnv89/pi-extensions
- Extension README: https://github.com/luongnv89/pi-extensions/blob/main/extensions/subagents-pi/README.md
- Source directory: https://github.com/luongnv89/pi-extensions/tree/main/extensions/subagents-pi
- Required orchestrator: https://www.npmjs.com/package/@tintinweb/pi-subagents
