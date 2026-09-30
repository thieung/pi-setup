# cache-warm

Pinned in `pi-dev` as:

```text
npm:cache-warm@0.3.0
```

## Role

Opt-in keep-alive pings that avoid prompt-cache misses.

## Why it is in pi-dev

Sends extra requests (cost) to keep a cache warm, so it stays in `pi-dev` and is opt-in.

## Guardrails

- Keep-alive pings spend tokens; enable only for sessions where cache misses are expensive.

## Provenance

Recommended from `mrgoonie/zuey-pi-setup` and `luongnv89/pi-extensions`. Version pinned from the npm registry on 2026-09-30.

Sources:

- https://www.npmjs.com/package/cache-warm
