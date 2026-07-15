## BPM2OSC

Real-time BPM detection — control and monitor [BPM2OSC](https://fblab.it) from Companion.

Requires BPM2OSC v2.6.3+ with the web server enabled (Settings → Web Server). Set **Host / IP** and **Port** to match.

### Actions

start, stop, toggle, resync, lock, div2 (÷2), mul2 (×2), tap, preset (apply a named engine preset).

### Variables

`bpm`, `running`, `locked`, `auto_locked`, `confidence`, `preset`, `factor`, `bar_beat`, `fix`.

### Feedbacks

`running`, `stopped`, `locked`, `auto_locked`, `factor_active`, `preset_active`, `beat_one`, `confidence_above`.

See the [README](https://github.com/bitfocus/companion-module-fblab-bpm2osc#readme) for full details.
