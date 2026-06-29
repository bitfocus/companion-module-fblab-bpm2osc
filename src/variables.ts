import { type CompanionVariableDefinition } from '@companion-module/base'
import type { BPM2OSCInstance } from './main.js'

export const VARIABLE_DEFS: CompanionVariableDefinition[] = [
  { variableId: 'bpm',         name: 'Current BPM' },
  { variableId: 'running',     name: 'Engine Running (true/false)' },
  { variableId: 'locked',      name: 'BPM Locked (true/false)' },
  { variableId: 'auto_locked', name: 'BPM Auto-Locked (true/false)' },
  { variableId: 'confidence',  name: 'Detection Confidence (0–100%)' },
  { variableId: 'preset',      name: 'Active Preset Name' },
  { variableId: 'factor',      name: 'BPM Factor (1 / ÷2 / ×2)' },
  { variableId: 'bar_beat',    name: 'Current Beat in Bar (1–4)' },
  { variableId: 'fix',         name: 'Octave Fix Badge' },
]

export function updateVariables(instance: BPM2OSCInstance): void {
  const s = instance.state
  instance.setVariableValues({
    bpm:         s.bpm !== null ? s.bpm.toFixed(2) : '--.--',
    running:     String(s.running),
    locked:      String(s.locked),
    auto_locked: String(s.auto_locked),
    confidence:  `${Math.round(s.conf * 100)}%`,
    preset:      s.preset || '—',
    factor:      s.factor === 0.5 ? '÷2' : s.factor === 2 ? '×2' : '1',
    bar_beat:    s.bar_beat >= 0 ? String(s.bar_beat + 1) : '—',
    fix:         s.fix || '',
  })
}
