import { combineRgb } from '@companion-module/base'
import type { CompanionPresetDefinitions, CompanionPresetSection, InstanceTypes } from '@companion-module/base'

const white = combineRgb(255, 255, 255)
const black = combineRgb(0, 0, 0)
const blue  = combineRgb(15, 52, 96)
const green = combineRgb(0, 180, 0)
const red   = combineRgb(200, 40, 40)

// Preset definitions — typed loosely so the compiler doesn't need the full TManifest
export const PRESET_DEFS: CompanionPresetDefinitions = {
  start_stop: {
    type: 'simple',
    name: 'Start / Stop (shows BPM)',
    style: { text: '$(bpm2osc:bpm)\nBPM', size: '18', color: white, bgcolor: black },
    steps: [{ down: [{ actionId: 'toggle', options: {} }], up: [] }],
    feedbacks: [
      { feedbackId: 'running', options: {}, style: { bgcolor: green } },
      { feedbackId: 'stopped', options: {}, style: { bgcolor: red } },
    ],
  },
  resync: {
    type: 'simple',
    name: 'Resync Beat',
    style: { text: 'RESYNC', size: '18', color: white, bgcolor: blue },
    steps: [{ down: [{ actionId: 'resync', options: {} }], up: [] }],
    feedbacks: [],
  },
  lock: {
    type: 'simple',
    name: 'Lock BPM',
    style: { text: 'LOCK', size: '18', color: white, bgcolor: black },
    steps: [{ down: [{ actionId: 'lock', options: {} }], up: [] }],
    feedbacks: [
      { feedbackId: 'locked',      options: {}, style: { bgcolor: red,  text: '🔒 LOCK' } },
      { feedbackId: 'auto_locked', options: {}, style: { bgcolor: blue, text: '🔒 AUTO', color: combineRgb(233, 69, 96) } },
    ],
  },
  div2: {
    type: 'simple',
    name: 'BPM ÷2',
    style: { text: '÷2', size: '24', color: white, bgcolor: blue },
    steps: [{ down: [{ actionId: 'div2', options: {} }], up: [] }],
    feedbacks: [{ feedbackId: 'factor_active', options: {}, style: { bgcolor: red } }],
  },
  mul2: {
    type: 'simple',
    name: 'BPM ×2',
    style: { text: '×2', size: '24', color: white, bgcolor: blue },
    steps: [{ down: [{ actionId: 'mul2', options: {} }], up: [] }],
    feedbacks: [{ feedbackId: 'factor_active', options: {}, style: { bgcolor: red } }],
  },
  tap: {
    type: 'simple',
    name: 'Tap Tempo',
    style: { text: 'TAP', size: '24', color: white, bgcolor: blue },
    steps: [{ down: [{ actionId: 'tap', options: {} }], up: [] }],
    feedbacks: [],
  },
  bpm_display: {
    type: 'simple',
    name: 'BPM Display',
    style: { text: '$(bpm2osc:bpm)\n$(bpm2osc:factor)', size: '18', color: white, bgcolor: blue },
    steps: [],
    feedbacks: [{ feedbackId: 'running', options: {}, style: { bgcolor: combineRgb(0, 60, 40) } }],
  },
  confidence: {
    type: 'simple',
    name: 'Confidence',
    style: { text: 'CONF\n$(bpm2osc:confidence)', size: '14', color: white, bgcolor: blue },
    steps: [],
    feedbacks: [
      { feedbackId: 'confidence_above', options: { threshold: 70 }, style: { bgcolor: green } },
    ],
  },
  preset_display: {
    type: 'simple',
    name: 'Active Preset',
    style: { text: '$(bpm2osc:preset)', size: '14', color: white, bgcolor: blue },
    steps: [],
    feedbacks: [],
  },
  bar_beat: {
    type: 'simple',
    name: 'Bar Beat Counter',
    style: { text: 'BEAT\n$(bpm2osc:bar_beat)', size: '18', color: white, bgcolor: blue },
    steps: [{ down: [{ actionId: 'resync', options: {} }], up: [] }],
    feedbacks: [],
  },
}

// Preset section structure (one section, one group with all presets)
export const PRESET_STRUCTURE: CompanionPresetSection<InstanceTypes>[] = [
  {
    id: 'bpm2osc',
    name: 'BPM2OSC',
    definitions: [
      {
        id: 'controls',
        type: 'simple',
        name: 'Controls',
        presets: ['start_stop', 'resync', 'lock', 'div2', 'mul2', 'tap'],
      },
      {
        id: 'display',
        type: 'simple',
        name: 'Display',
        presets: ['bpm_display', 'confidence', 'preset_display', 'bar_beat'],
      },
    ],
  },
]
