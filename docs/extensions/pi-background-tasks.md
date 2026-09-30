# pi-background-tasks

Pinned in `pi-dev` as:

```text
npm:pi-background-tasks@2.6.8
```

## Role

Background shell tasks, read-only delegated agents, attested runs, and Fusion workflows.

## Why it is in pi-dev

Adds an orchestration layer that overlaps with `pi-subagents`. Enabled in `pi-dev` for experiments only.

## Guardrails

- Do not stack it with other orchestration layers on the same task.
- Background processes outlive a single prompt; check them before closing a session.

## Provenance

Recommended from `mrgoonie/zuey-pi-setup` and `luongnv89/pi-extensions`. Version pinned from the npm registry on 2026-09-30.

Sources:

- https://www.npmjs.com/package/pi-background-tasks
