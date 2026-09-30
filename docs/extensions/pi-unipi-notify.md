# @pi-unipi/notify

Pinned in `pi` as:

```text
npm:@pi-unipi/notify@2.20.5
```

## Role

Notifies you when an agent finishes or fails: native OS notifications, Gotify, Telegram, ntfy, routed per event type.

## Why it is in pi

Helps when running several sessions or long tasks on a VPS.

## Guardrails

- Its config (`~/.unipi/config/notify/config.json`) holds Gotify tokens and Telegram bot token/chat id. Never commit it; configure it per machine with `/unipi:notify-set-gotify`, `/unipi:notify-set-tg`, `/unipi:notify-settings`.
- Native OS notifications need no credentials and are the safest default.

## Provenance

Recommended from `mrgoonie/zuey-pi-setup` and `luongnv89/pi-extensions`. Version pinned from the npm registry on 2026-09-30.

Sources:

- https://www.npmjs.com/package/@pi-unipi/notify
