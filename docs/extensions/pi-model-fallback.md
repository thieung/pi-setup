# pi-model-fallback

Pinned in `pi-dev` as:

```text
npm:pi-model-fallback@0.4.0
```

## Role

Automatically switches Pi to a configured fallback model after retryable provider failures such as rate limits and common 5xx failures.

Typical flow:

```text
primary model
   ↓ 429 / 5xx
fallback model
   ↓
continue task
```

## Why it is in pi-dev

This is a resilience feature for longer or unattended work. It changes runtime behavior automatically, so it belongs in the development profile first rather than stable `pi`.

## Guardrails

- Keep fallback mappings explicit.
- Prefer fallback models already enabled/authenticated in Pi.
- Treat auto-retry as runtime policy: when debugging provider behavior, remember that the active model may have changed.
- Machine/runtime state such as cooldowns should not be committed.
- Only portable fallback configuration belongs in Git.

## Provenance

The setup follows the `pi-model-fallback` package used by `mrgoonie/zuey-pi-setup`, currently recorded there at version `0.4.0`.

Sources:

- https://github.com/mrgoonie/zuey-pi-setup
- https://www.npmjs.com/package/pi-model-fallback
