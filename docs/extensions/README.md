# Extensions

This directory documents every extension or Pi companion intentionally tracked by this setup.

## Active profiles

| Component | Type | `pi` | `pi-dev` | Status |
|---|---|---:|---:|---|
| [`statusline-pi`](./statusline-pi.md) | extension | yes | inherited | stable |
| [`@juicesharp/rpiv-ask-user-question`](./rpiv-ask-user-question.md) | extension | yes | inherited | stable |
| [`@99percentpeople/pi-todo`](./pi-todo.md) | extension | yes | inherited | stable |
| [`@pi-unipi/notify`](./pi-unipi-notify.md) | extension | yes | inherited | stable |
| [`@tmustier/pi-session-recap`](./pi-session-recap.md) | extension | yes | inherited | stable |
| [`pi-web-access`](./pi-web-access.md) | extension | yes | inherited | stable |
| [`pi-mcp-adapter`](./pi-mcp-adapter.md) | extension | no | yes | dev/optional |
| [`pi-goal-x`](./pi-goal-x.md) | extension | no | yes | dev/optional |
| [`pi-background-tasks`](./pi-background-tasks.md) | extension | no | yes | dev/optional |
| [`pi-simplify`](./pi-simplify.md) | extension | no | yes | dev/optional |
| [`@juicesharp/rpiv-btw`](./rpiv-btw.md) | extension | no | yes | dev/optional |
| [`timestamp-pi`](./timestamp-pi.md) | extension | no | yes | dev/optional |
| [`cache-warm`](./cache-warm.md) | extension | no | yes | dev/optional |
| [`advisor-pi`](./advisor-pi.md) | extension | no | yes | dev/optional |
| [`opencode-pi`](./opencode-pi.md) | extension | no | yes | dev/provider bridge |
| [`pi-multix`](./pi-multix.md) | extension + skill | no | yes | dev/multimodal |
| [`pi-subagents`](./pi-subagents.md) | extension + skills/prompts | no | yes | dev/orchestration |
| [`pi-model-fallback`](./pi-model-fallback.md) | extension | no | yes | dev/resilience |
| [`subagents-pi`](./subagents-pi.md) | extension | no | no | labs-only telemetry companion |
| [`pi-delegator`](./pi-delegator.md) | skill | no | no | labs-only |

The stable profile stays intentionally small. `pi-dev` is the place for provider bridges, multimodal tooling, optional orchestration, and failure-recovery behavior.

> `pi-subagents` overlaps with Herdr at the orchestration layer. It is enabled here intentionally for experiments where a Pi parent agent should spawn focused child Pi sessions. Prefer Herdr when orchestration must span multiple independent runtimes or tools.
