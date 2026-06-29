import { combineRgb, type CompanionPresetDefinitions } from '@companion-module/base'

const white = combineRgb(255, 255, 255)
const black = combineRgb(0, 0, 0)
const blue  = combineRgb(15, 52, 96)
const green = combineRgb(0, 180, 0)
const red   = combineRgb(200, 40, 40)

const BASE_PRESETS: CompanionPresetDefinitions = {
  start_stop: {
    type: 'button',
    category: 'Controls',
    name: 'Start / Stop',
    style: { text: 'START\nSTOP', size: '18', color: white, bgcolor: black },
    steps: [{ down: [{ actionId: 'toggle', options: {} }], up: [] }],
    feedbacks: [
      { feedbackId: 'running', options: {}, style: { bgcolor: green } },
      { feedbackId: 'stopped', options: {}, style: { bgcolor: red } },
    ],
  },
  resync: {
    type: 'button',
    category: 'Controls',
    name: 'Resync Beat',
    style: { text: 'RESYNC', size: '18', color: white, bgcolor: blue },
    steps: [{ down: [{ actionId: 'resync', options: {} }], up: [] }],
    feedbacks: [],
  },
  lock: {
    type: 'button',
    category: 'Controls',
    name: 'Lock BPM',
    style: { text: 'LOCK', size: '18', color: white, bgcolor: black },
    steps: [{ down: [{ actionId: 'lock', options: {} }], up: [] }],
    feedbacks: [
      { feedbackId: 'locked',      options: {}, style: { bgcolor: red,  text: '🔒 LOCK' } },
      { feedbackId: 'auto_locked', options: {}, style: { bgcolor: blue, text: '🔒 AUTO', color: combineRgb(233, 69, 96) } },
    ],
  },
  div2: {
    type: 'button',
    category: 'Controls',
    name: 'BPM ÷2',
    style: { text: '÷2', size: '24', color: white, bgcolor: blue },
    steps: [{ down: [{ actionId: 'div2', options: {} }], up: [] }],
    feedbacks: [{ feedbackId: 'factor_active', options: {}, style: { bgcolor: red } }],
  },
  mul2: {
    type: 'button',
    category: 'Controls',
    name: 'BPM ×2',
    style: { text: '×2', size: '24', color: white, bgcolor: blue },
    steps: [{ down: [{ actionId: 'mul2', options: {} }], up: [] }],
    feedbacks: [{ feedbackId: 'factor_active', options: {}, style: { bgcolor: red } }],
  },
  tap: {
    type: 'button',
    category: 'Controls',
    name: 'Tap Tempo',
    style: { text: 'TAP', size: '24', color: white, bgcolor: blue },
    steps: [{ down: [{ actionId: 'tap', options: {} }], up: [] }],
    feedbacks: [],
  },
  bpm_display: {
    type: 'button',
    category: 'Display',
    name: 'BPM Display (tap on press)',
    style: { text: '$(bpm2osc:bpm)\n$(bpm2osc:factor)', size: '18', color: white, bgcolor: blue },
    steps: [{ down: [{ actionId: 'tap', options: {} }], up: [] }],
    feedbacks: [{ feedbackId: 'running', options: {}, style: { bgcolor: combineRgb(0, 60, 40) } }],
  },
  confidence: {
    type: 'button',
    category: 'Display',
    name: 'Confidence',
    style: { text: 'CONF\n$(bpm2osc:confidence)', size: '14', color: white, bgcolor: blue },
    steps: [],
    feedbacks: [
      { feedbackId: 'confidence_above', options: { threshold: 70 }, style: { bgcolor: green } },
    ],
  },
  preset_display: {
    type: 'button',
    category: 'Display',
    name: 'Active Preset',
    style: { text: '$(bpm2osc:preset)', size: '14', color: white, bgcolor: blue },
    steps: [],
    feedbacks: [],
  },
  bar_beat: {
    type: 'button',
    category: 'Display',
    name: 'Bar Beat Counter',
    style: { text: 'BEAT\n$(bpm2osc:bar_beat)', size: '18', color: white, bgcolor: black },
    steps: [{ down: [{ actionId: 'resync', options: {} }], up: [] }],
    feedbacks: [
      { feedbackId: 'running',  options: {}, style: { bgcolor: green } },
      { feedbackId: 'beat_one', options: {}, style: { bgcolor: red } },
    ],
  },
}

export function generatePresets(presetNames: string[]): CompanionPresetDefinitions {
  const defs: CompanionPresetDefinitions = { ...BASE_PRESETS }

  for (const name of presetNames) {
    const key = `preset__${name.replace(/[^a-zA-Z0-9]/g, '_')}`
    defs[key] = {
      type: 'button',
      category: 'Presets',
      name,
      style: { text: name, size: '14', color: white, bgcolor: blue },
      steps: [{ down: [{ actionId: 'preset', options: { name } }], up: [] }],
      feedbacks: [
        {
          feedbackId: 'preset_active',
          options: { preset: name },
          style: { bgcolor: green, color: white },
        },
      ],
    }
  }

  return defs
}
