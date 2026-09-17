# pi-multix

## Role in this setup

`pi-multix` is enabled in `pi-dev` and pinned to:

```text
npm:pi-multix@0.1.5
```

It is not enabled in the stable `pi` profile yet because it adds a broad multimodal tool surface and provider-backed generation capabilities. The development profile is the right place to validate provider setup, output behavior, and operational fit before promotion.

## What it does

`pi-multix` integrates the [`multix`](https://github.com/mrgoonie/multix-cli) multimodal CLI into Pi. The package bundles `@mrgoonie/multix`, so a separate global multix installation is not required.

The extension exposes tools for:

- image generation and image-to-image editing;
- text-to-video and image-to-video generation;
- text-to-speech, transcription, music, sound effects, and voice cloning;
- local media processing with `ffmpeg` or ImageMagick;
- document conversion and structured extraction;
- direct access to additional multix CLI commands through an argv-based tool.

It also ships a `multix` skill so the agent can choose providers and workflows using upstream guidance instead of guessing.

## Tools

Upstream currently documents these tools:

| Tool | Purpose |
|---|---|
| `multix_check` | Detect available provider keys, `ffmpeg`, and ImageMagick |
| `multix_models` | Inspect providers/models and manage key metadata without passing secrets through tool arguments |
| `multix_image` | Image generation and editing |
| `multix_video` | Text/image-to-video and async status |
| `multix_audio` | TTS, transcription, music, sound effects, voice cloning |
| `multix_media` | Local `ffmpeg`/ImageMagick optimization, resize, split |
| `multix_doc` | Document conversion, analysis, structured extraction |
| `multix_run` | Access other multix commands through an explicit argv array |

## Requirements

- Node.js 20 or newer.
- Provider API keys for provider-backed operations.
- `ffmpeg` or ImageMagick on `PATH` for local `multix_media` operations.

The package metadata for `pi-multix@0.1.5` declares `@mrgoonie/multix ^0.5.2` as a dependency and Pi packages as optional peer dependencies.

## Provider environment variables

Upstream currently supports keys including:

```text
OPENAI_API_KEY
GEMINI_API_KEY
MINIMAX_API_KEY
OPENROUTER_API_KEY
LEONARDO_API_KEY
BYTEPLUS_API_KEY / ARK_API_KEY
ELEVENLABS_API_KEY
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

Some Cloudflare video paths also require:

```text
CLOUDFLARE_AI_GATEWAY_ID
REPLICATE_API_TOKEN
```

Keys are read by multix from environment variables, `<cwd>/.env`, or `~/.multix/.env`.

## Secret handling

Do not place provider keys in this Git repository and do not paste them into Pi prompts/tool arguments.

Upstream explicitly avoids accepting secret values in `multix_models` arguments because Pi session logs and model context may persist tool arguments. Prefer environment variables or a local `~/.multix/.env` file with restricted permissions.

Example local setup:

```bash
mkdir -p ~/.multix
chmod 700 ~/.multix
# add secrets locally; never commit ~/.multix/.env
```

Then verify availability from Pi with:

```text
multix_check
```

## Output behavior

Generated output defaults to:

```text
./multix-output/
```

Override it with:

```text
MULTIX_OUTPUT_DIR
```

The extension also supports `MULTIX_BIN` to override the bundled CLI with another multix executable.

Important upstream behaviors:

- provider output format is detected from file contents rather than assumed from the requested extension;
- unsupported provider parameters fail explicitly instead of being silently ignored;
- `extraArgs` is treated as an argv array, not a shell string;
- long video/3D jobs may require a larger timeout;
- command execution uses `execFile` rather than shell interpolation.

## Installation

Managed by `profiles/pi-dev/profile.json`:

```json
{
  "packages": [
    "npm:pi-multix@0.1.5"
  ]
}
```

Manual equivalent:

```bash
pi install npm:pi-multix@0.1.5
```

No separate `multix` global install is needed for the default setup.

## Useful verification flow

After updating the profile:

```bash
pi-profile pi-dev
```

Then inside Pi:

```text
multix_check
```

Start with local/no-key operations or a single configured provider before enabling additional providers.

## Promotion criteria

Consider moving `pi-multix` into stable `pi` only after:

- Node >=20 is guaranteed on all target machines/VPS;
- required provider keys are configured outside Git;
- output directories and generated media are excluded from project repos where appropriate;
- local `ffmpeg`/ImageMagick behavior is verified on target hosts;
- the broad multimodal tool surface is desirable in normal daily Pi sessions.

## Sources

- Upstream repository: https://github.com/bestagentkits/pi-multix
- Upstream README: https://github.com/bestagentkits/pi-multix/blob/main/README.md
- Package metadata: https://github.com/bestagentkits/pi-multix/blob/main/package.json
- multix CLI: https://github.com/mrgoonie/multix-cli
- npm install command documented upstream: `pi install npm:pi-multix`
