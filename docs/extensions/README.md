# Extensions

This directory documents every extension or Pi companion intentionally tracked by this setup.

## Active profiles

| Component | Type | `pi` | `pi-dev` | Status |
|---|---|---:|---:|---|
| [`statusline-pi`](./statusline-pi.md) | extension | yes | inherited | stable |
| [`advisor-pi`](./advisor-pi.md) | extension | no | yes | dev/optional |
| [`opencode-pi`](./opencode-pi.md) | extension | no | yes | dev/provider bridge |
| [`pi-multix`](./pi-multix.md) | extension + skill | no | yes | dev/multimodal |
| [`subagents-pi`](./subagents-pi.md) | extension | no | no | labs-only |
| [`pi-delegator`](./pi-delegator.md) | skill | no | no | labs-only |

The setup intentionally keeps the stable profile small. Experimental provider bridges, multimodal tools, advisory tools, subagent telemetry, and delegated-agent helpers stay out of the default daily profile unless explicitly promoted.
