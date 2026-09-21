# pi-subagents

Pinned in `pi-dev` as:

```text
npm:pi-subagents@0.70.0
```

Upstream: https://github.com/nicobailon/pi-subagents

## Role

Adds a `subagent` delegation layer to Pi. A parent Pi session can spawn focused child sessions for scouting, research, implementation, review, second opinions, parallel audits, and background jobs.

Built-in roles include `scout`, `researcher`, `evidence-auditor`, `worker`, `reviewer`, `oracle`, and `delegate`.

## Why it is in pi-dev

Use this when orchestration should happen *inside* one Pi workflow:

```text
Pi parent
├── scout
├── worker
└── reviewer
```

This is different from Herdr, which orchestrates independent runtimes:

```text
Herdr
├── Pi
├── Claude Code
└── Codex
```

Both can coexist, but avoid unnecessary nested orchestration. Use Herdr for cross-runtime coordination; use `pi-subagents` for short-lived child work owned by a Pi parent.

## Useful commands

```text
/subagents-doctor
/subagents-fleet
/subagents-guide
```

The package also provides FleetView, background runs, steering/stopping, saved workflows, missions, and an extension API.

## Notes

- The package can run foreground and background child sessions.
- Web-research child roles may require `pi-web-access` inside the child.
- Keep recursion and spawn limits bounded.
- Do not assume child agents inherit every parent extension; verify required child capabilities explicitly.

## Sources

- https://github.com/nicobailon/pi-subagents
- https://www.npmjs.com/package/pi-subagents
