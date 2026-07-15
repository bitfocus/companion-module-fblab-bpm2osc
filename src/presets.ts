import { combineRgb, type CompanionPresetDefinitions, type CompanionPresetSection } from '@companion-module/base'
import type { ModuleSchema } from './main.js'
import type ModuleInstance from './main.js'

const white = combineRgb(255, 255, 255)
const black = combineRgb(0, 0, 0)
const blue = combineRgb(15, 52, 96)
const green = combineRgb(0, 180, 0)
const red = combineRgb(200, 40, 40)

const BASE_PRESETS: CompanionPresetDefinitions<ModuleSchema> = {
	start_stop: {
		type: 'simple',
		name: 'Start / Stop',
		style: { text: 'START\nSTOP', size: '18', color: white, bgcolor: black },
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
			{ feedbackId: 'locked', options: {}, style: { bgcolor: red, text: '🔒 LOCK' } },
			{
				feedbackId: 'auto_locked',
				options: {},
				style: { bgcolor: blue, text: '🔒 AUTO', color: combineRgb(233, 69, 96) },
			},
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
		name: 'BPM Display (tap on press)',
		style: { text: '$(fblab-bpm2osc:bpm)\n$(fblab-bpm2osc:factor)', size: '18', color: white, bgcolor: blue },
		steps: [{ down: [{ actionId: 'tap', options: {} }], up: [] }],
		feedbacks: [{ feedbackId: 'running', options: {}, style: { bgcolor: combineRgb(0, 60, 40) } }],
	},
	confidence: {
		type: 'simple',
		name: 'Confidence',
		style: { text: 'CONF\n$(fblab-bpm2osc:confidence)', size: '14', color: white, bgcolor: blue },
		steps: [],
		feedbacks: [{ feedbackId: 'confidence_above', options: { threshold: 70 }, style: { bgcolor: green } }],
	},
	preset_display: {
		type: 'simple',
		name: 'Active Preset',
		style: { text: '$(fblab-bpm2osc:preset)', size: '14', color: white, bgcolor: blue },
		steps: [],
		feedbacks: [],
	},
	bar_beat: {
		type: 'simple',
		name: 'Bar Beat Counter',
		style: { text: 'BEAT\n$(fblab-bpm2osc:bar_beat)', size: '18', color: white, bgcolor: black },
		steps: [{ down: [{ actionId: 'resync', options: {} }], up: [] }],
		feedbacks: [
			{ feedbackId: 'running', options: {}, style: { bgcolor: green } },
			{ feedbackId: 'beat_one', options: {}, style: { bgcolor: red } },
		],
	},
}

// Companion interpolates "$(connection:variable)" in button text — a preset
// named that way would otherwise have its literal name replaced by a variable
// lookup. Breaking up the "$(" sequence with a zero-width space keeps the
// name visually intact while making it inert.
function escapeVariableSyntax(text: string): string {
	return text.replace(/\$\(/g, '$​(')
}

export function UpdatePresets(self: ModuleInstance): void {
	const presetNames = self.state.presets ?? []
	const presets: CompanionPresetDefinitions<ModuleSchema> = { ...BASE_PRESETS }
	const dynamicKeys: string[] = []
	const usedKeys = new Set<string>()

	for (const name of presetNames) {
		const base = `preset__${name.replace(/[^a-zA-Z0-9]/g, '_')}`
		let key = base
		let n = 2
		while (usedKeys.has(key)) {
			key = `${base}__${n}`
			n++
		}
		usedKeys.add(key)
		dynamicKeys.push(key)

		presets[key] = {
			type: 'simple',
			name,
			style: { text: escapeVariableSyntax(name), size: '14', color: white, bgcolor: blue },
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

	const structure: CompanionPresetSection<ModuleSchema>[] = [
		{
			id: 'controls',
			name: 'Controls',
			definitions: ['start_stop', 'resync', 'lock', 'div2', 'mul2', 'tap'],
		},
		{
			id: 'display',
			name: 'Display',
			definitions: ['bpm_display', 'confidence', 'preset_display', 'bar_beat'],
		},
		{
			id: 'presets',
			name: 'Presets',
			definitions: dynamicKeys,
		},
	]

	self.setPresetDefinitions(structure, presets)
}
