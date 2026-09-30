# pi-goal-x

Pinned in `pi-dev` as:

```text
npm:pi-goal-x@0.31.9
```

## Role

`/goal`: goal planning, durable progress, and an auditor that checks whether the goal is complete.

## Why it is in pi-dev

Changes how long tasks are driven, and overlaps partly with `pi-todo` and `pi-subagents`. Kept in `pi-dev` until it proves useful.

## Guardrails

- Reference setup had to patch a stale-context crash in this package (`zuey-pi-setup/scripts/pi-setup-patch-extensions.mjs`); watch for it on long sessions.

## Provenance

Recommended from `mrgoonie/zuey-pi-setup` and `luongnv89/pi-extensions`. Version pinned from the npm registry on 2026-09-30.

Sources:

- https://www.npmjs.com/package/pi-goal-x
