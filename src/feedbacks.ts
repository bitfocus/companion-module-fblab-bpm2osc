import { combineRgb } from '@companion-module/base'
import type { BPM2OSCInstance } from './main.js'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getFeedbackDefinitions(instance: BPM2OSCInstance) {
  return {
    running: {
      name: 'Engine Running',
      description: 'Highlights when the BPM detection engine is active',
      type: 'boolean' as const,
      defaultStyle: { bgcolor: combineRgb(0, 180, 0), color: combineRgb(255, 255, 255) },
      options: [],
      callback: () => instance.state.running,
    },
    stopped: {
      name: 'Engine Stopped',
      description: 'Highlights when the engine is NOT running',
      type: 'boolean' as const,
      defaultStyle: { bgcolor: combineRgb(80, 0, 0), color: combineRgb(255, 255, 255) },
      options: [],
      callback: () => !instance.state.running,
    },
    locked: {
      name: 'BPM Locked (manual)',
      description: 'Highlights when BPM is manually locked',
      type: 'boolean' as const,
      defaultStyle: { bgcolor: combineRgb(200, 40, 40), color: combineRgb(255, 255, 255) },
      options: [],
      callback: () => instance.state.locked,
    },
    auto_locked: {
      name: 'BPM Auto-Locked',
      description: 'Highlights when BPM is auto-locked by confidence (not manually locked)',
      type: 'boolean' as const,
      defaultStyle: { bgcolor: combineRgb(15, 52, 96), color: combineRgb(233, 69, 96) },
      options: [],
      callback: () => instance.state.auto_locked && !instance.state.locked,
    },
    factor_active: {
      name: 'BPM Factor Active (÷2 or ×2)',
      description: 'Highlights when a tempo factor is applied',
      type: 'boolean' as const,
      defaultStyle: { bgcolor: combineRgb(200, 100, 0), color: combineRgb(255, 255, 255) },
      options: [],
      callback: () => instance.state.factor !== 1,
    },
    preset_active: {
      name: 'Specific Preset Active',
      description: 'Highlights when a particular preset is selected',
      type: 'boolean' as const,
      defaultStyle: { bgcolor: combineRgb(15, 52, 96), color: combineRgb(0, 212, 170) },
      options: [
        {
          type: 'textinput' as const,
          id: 'preset',
          label: 'Preset name (exact, case-sensitive)',
          default: '',
        },
      ],
      callback: (feedback: { options: Record<string, unknown> }) =>
        instance.state.preset === String(feedback.options['preset'] ?? ''),
    },
    beat_one: {
      name: 'Beat 1 (downbeat)',
      description: 'True on beat 1 of the bar',
      type: 'boolean' as const,
      defaultStyle: { bgcolor: combineRgb(200, 40, 40), color: combineRgb(255, 255, 255) },
      options: [],
      callback: () => instance.state.bar_beat === 0,
    },
    confidence_above: {
      name: 'Confidence Above Threshold',
      description: 'Highlights when detection confidence exceeds a given percentage',
      type: 'boolean' as const,
      defaultStyle: { bgcolor: combineRgb(0, 140, 80), color: combineRgb(255, 255, 255) },
      options: [
        {
          type: 'number' as const,
          id: 'threshold',
          label: 'Threshold (%)',
          default: 70,
          min: 0,
          max: 100,
        },
      ],
      callback: (feedback: { options: Record<string, unknown> }) =>
        Math.round(instance.state.conf * 100) >= Number(feedback.options['threshold'] ?? 70),
    },
  }
}
