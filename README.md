# companion-module-fblab-bpm2osc

[Bitfocus Companion](https://bitfocus.io/companion) module for **BPM2OSC** — real-time BPM detection control and monitoring from your Companion surface.

Connects to the BPM2OSC web server via SSE (Server-Sent Events) and REST API. State updates arrive at up to 50 Hz; all controls respond immediately.

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE).

---

## Requirements

- **BPM2OSC** v2.6.3 or later (web server must be enabled in Settings → Web Server)
- **Bitfocus Companion** v4.3+
- Node.js 22+ (handled automatically by Companion)

---

## Getting started (development)

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by Companion.

While developing the module, use `yarn dev` to run the compiler in watch mode and recompile on change.

To produce a packaged `.tgz` for distribution, run `yarn package`.

---

## Installation (end user)

1. Add a new connection in Companion: search for **BPM2OSC**.
2. Set **Host / IP** and **Port** to match the BPM2OSC web server settings (default: `127.0.0.1 : 5000`).

The module connects automatically. The status indicator turns green when the SSE stream is live.

---

## Configuration

| Field | Default | Notes |
|-------|---------|-------|
| Host / IP | `127.0.0.1` | IP address of the machine running BPM2OSC |
| Port | `5000` | Web server port — must match BPM2OSC Settings → Web Server |

---

## Actions

| Action | ID | Description |
|--------|----|-------------|
| Start Engine | `start` | Start BPM detection |
| Stop Engine | `stop` | Stop BPM detection |
| Toggle Start / Stop | `toggle` | Start if stopped, stop if running |
| Resync Beat | `resync` | Force metronome phase realignment |
| Toggle Lock BPM | `lock` | Toggle manual BPM freeze |
| BPM ÷2 | `div2` | Halve the detected BPM |
| BPM ×2 | `mul2` | Double the detected BPM |
| Tap Tempo | `tap` | Send a tap tempo pulse |
| Apply Preset | `preset` | Load a named engine preset (exact, case-sensitive) |

---

## Variables

Reference in button labels as `$(fblab-bpm2osc:<id>)`.

| Variable | ID | Example value |
|----------|----|---------------|
| Current BPM | `bpm` | `124.3` / `--.-` |
| Engine Running | `running` | `true` / `false` |
| BPM Locked (manual) | `locked` | `true` / `false` |
| BPM Auto-Locked | `auto_locked` | `true` / `false` |
| Detection Confidence | `confidence` | `87%` |
| Active Preset Name | `preset` | `Dance / House` |
| BPM Factor | `factor` | `1` / `÷2` / `×2` |
| Current Beat in Bar | `bar_beat` | `1` – `4` / `—` |
| Octave Fix Badge | `fix` | `÷2` / `×2` / `4:3` / `` |

`bpm` shows `--.-` when the engine has no confident reading (silence, speech, or low confidence).
`bar_beat` counts 1–4 within each bar; `—` when the engine is not running.
`fix` reflects the active octave correction applied internally by the engine.

---

## Feedbacks

All feedbacks are **boolean** (highlight the button when the condition is true).

| Feedback | ID | Default highlight | Condition |
|----------|----|-------------------|-----------|
| Engine Running | `running` | Green bg | Engine is active |
| Engine Stopped | `stopped` | Dark red bg | Engine is not running |
| BPM Locked (manual) | `locked` | Red bg | Manual lock is active |
| BPM Auto-Locked | `auto_locked` | Blue bg / pink text | Auto-lock is active (not manual) |
| BPM Factor Active | `factor_active` | Orange bg | A ÷2 or ×2 factor is applied |
| Specific Preset Active | `preset_active` | Blue bg / teal text | The named preset is currently selected |
| Beat 1 (downbeat) | `beat_one` | Red bg | Current beat in bar is 1 |
| Confidence Above Threshold | `confidence_above` | Green bg | Detection confidence ≥ threshold (default 70%) |

`auto_locked` is true only when the engine auto-froze BPM due to low confidence, and the manual lock is off.

---

## Built-in presets

Ready-made buttons available under **BPM2OSC** in the Companion preset panel, plus one auto-generated button per BPM2OSC preset (Section **Presets**).

### Controls

| Preset | Function |
|--------|----------|
| Start / Stop | Toggle engine; green when running, dark red when stopped |
| Resync Beat | Send resync pulse |
| Lock BPM | Toggle manual lock; shows 🔒 LOCK when locked, 🔒 AUTO when auto-locked |
| BPM ÷2 | Halve tempo; highlights red when any factor is active |
| BPM ×2 | Double tempo; highlights red when any factor is active |
| Tap Tempo | Send a tap pulse |

### Display

| Preset | Shows |
|--------|-------|
| BPM Display | `$(fblab-bpm2osc:bpm)` + `$(fblab-bpm2osc:factor)`; dark green bg when running |
| Confidence | `$(fblab-bpm2osc:confidence)`; green bg when ≥ 70% |
| Active Preset | `$(fblab-bpm2osc:preset)` |
| Bar Beat Counter | `$(fblab-bpm2osc:bar_beat)`; tap also sends resync |

---

## How it works

The module opens a persistent SSE connection to `/api/stream` on the BPM2OSC web server.
The server pushes a full JSON state object at up to 50 Hz; the module updates all variables and re-evaluates all feedbacks on every message.
On connection loss the module retries automatically every 3 seconds and sets the Companion status to **Connection Failure** until the stream is restored.

Control actions are fired as HTTP POST requests to `/api/<command>` and return immediately (5 s timeout).

---

## Project structure

```
src/
  main.ts       — InstanceBase subclass, SSE connection
  config.ts     — module config type and config fields
  actions.ts    — action definitions
  feedbacks.ts  — feedback definitions
  variables.ts  — variable definitions and update logic
  presets.ts    — built-in preset definitions and section structure
  types.ts      — BPM2OSC server state (BPM2OSCState) type
  upgrades.ts   — Companion upgrade scripts
companion/
  manifest.json — Companion module manifest
  HELP.md       — in-app help shown to users
```

---

## Credits

Made with ❤ by **FBLab.it di Fabrizio Borelli**

---

*This software is provided free of charge. The author assumes no responsibility for improper use or any damage arising from its use. Use at your own risk.*
