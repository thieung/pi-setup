# pi-delegator

## Status in this setup

Labs-only. This is a Pi-related skill, not a Pi extension package, and it is not installed automatically by the `pi` or `pi-dev` manifests.

## What it does

`pi-delegator` lets another AI agent delegate a clearly scoped coding task to a separate Pi subprocess, monitor progress, and collect exact session metrics.

Its upstream workflow keeps the parent agent as orchestrator: capture intent, choose a model, preview the run, obtain explicit approval, launch Pi, monitor events, and summarize the result.

## Why it is not enabled by default

The user's primary orchestration stack already has an external multi-agent layer. Installing delegation helpers globally would create overlapping responsibility for spawning and coordinating agents.

Keep this skill for explicit experiments with Pi-as-a-subprocess delegation.

## Upstream behavior worth preserving

The upstream skill includes several useful safety/operational rules:

- sync the target Git repository before delegated edits;
- require explicit user approval before launching Pi;
- keep the task prompt bounded and tool permissions explicit;
- report actual collected metrics rather than estimating them;
- prefer free OpenCode-backed models where available, unless the user chooses otherwise.

## Prerequisites

Upstream expects at least:

```bash
which pi
python3 --version
```

Its helper script handles model discovery, execution, event monitoring, and metrics collection.

## Sources

- Upstream repository: https://github.com/luongnv89/pi-extensions
- Skill definition: https://github.com/luongnv89/pi-extensions/blob/main/skills/pi-delegator/SKILL.md
- Skill directory: https://github.com/luongnv89/pi-extensions/tree/main/skills/pi-delegator
