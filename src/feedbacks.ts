import { combineRgb } from '@companion-module/base'
import type ModuleInstance from './main.js'

export type FeedbacksSchema = {
	running: { type: 'boolean'; options: Record<string, never> }
	stopped: { type: 'boolean'; options: Record<string, never> }
	locked: { type: 'boolean'; options: Record<string, never> }
	auto_locked: { type: 'boolean'; options: Record<string, never> }
	factor_active: { type: 'boolean'; options: Record<string, never> }
	preset_active: { type: 'boolean'; options: { preset: string } }
	beat_one: { type: 'boolean'; options: Record<string, never> }
	confidence_above: { type: 'boolean'; options: { threshold: number } }
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		running: {
			name: 'Engine Running',
			description: 'Highlights when the BPM detection engine is active',
			type: 'boolean',
			defaultStyle: { bgcolor: combineRgb(0, 180, 0), color: combineRgb(255, 255, 255) },
			options: [],
			callback: () => self.state.running,
		},
		stopped: {
			name: 'Engine Stopped',
			description: 'Highlights when the engine is NOT running',
			type: 'boolean',
			defaultStyle: { bgcolor: combineRgb(80, 0, 0), color: combineRgb(255, 255, 255) },
			options: [],
			callback: () => !self.state.running,
		},
		locked: {
			name: 'BPM Locked (manual)',
			description: 'Highlights when BPM is manually locked',
			type: 'boolean',
			defaultStyle: { bgcolor: combineRgb(200, 40, 40), color: combineRgb(255, 255, 255) },
			options: [],
			callback: () => self.state.locked,
		},
		auto_locked: {
			name: 'BPM Auto-Locked',
			description: 'Highlights when BPM is auto-locked by confidence (not manually locked)',
			type: 'boolean',
			defaultStyle: { bgcolor: combineRgb(15, 52, 96), color: combineRgb(233, 69, 96) },
			options: [],
			callback: () => self.state.auto_locked && !self.state.locked,
		},
		factor_active: {
			name: 'BPM Factor Active (÷2 or ×2)',
			description: 'Highlights when a tempo factor is applied',
			type: 'boolean',
			defaultStyle: { bgcolor: combineRgb(200, 100, 0), color: combineRgb(255, 255, 255) },
			options: [],
			callback: () => self.state.factor !== 1,
		},
		preset_active: {
			name: 'Specific Preset Active',
			description: 'Highlights when a particular preset is selected',
			type: 'boolean',
			defaultStyle: { bgcolor: combineRgb(15, 52, 96), color: combineRgb(0, 212, 170) },
			options: [
				{
					type: 'textinput',
					id: 'preset',
					label: 'Preset name (exact, case-sensitive)',
					default: '',
				},
			],
			callback: (feedback) => self.state.preset === String(feedback.options.preset ?? ''),
		},
		beat_one: {
			name: 'Beat 1 (downbeat)',
			description: 'True on beat 1 of the bar',
			type: 'boolean',
			defaultStyle: { bgcolor: combineRgb(200, 40, 40), color: combineRgb(255, 255, 255) },
			options: [],
			callback: () => self.state.bar_beat === 0,
		},
		confidence_above: {
			name: 'Confidence Above Threshold',
			description: 'Highlights when detection confidence exceeds a given percentage',
			type: 'boolean',
			defaultStyle: { bgcolor: combineRgb(0, 140, 80), color: combineRgb(255, 255, 255) },
			options: [
				{
					type: 'number',
					id: 'threshold',
					label: 'Threshold (%)',
					default: 70,
					min: 0,
					max: 100,
				},
			],
			callback: (feedback) => Math.round(self.state.conf * 100) >= Number(feedback.options.threshold ?? 70),
		},
	})
}
