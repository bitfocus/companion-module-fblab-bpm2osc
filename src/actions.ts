import type ModuleInstance from './main.js'

export type ActionsSchema = {
	start: { options: Record<string, never> }
	stop: { options: Record<string, never> }
	toggle: { options: Record<string, never> }
	resync: { options: Record<string, never> }
	lock: { options: Record<string, never> }
	div2: { options: Record<string, never> }
	mul2: { options: Record<string, never> }
	tap: { options: Record<string, never> }
	preset: { options: { name: string } }
}

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		start: {
			name: 'Start Engine',
			options: [],
			callback: async () => self.postCmd('start'),
		},
		stop: {
			name: 'Stop Engine',
			options: [],
			callback: async () => self.postCmd('stop'),
		},
		toggle: {
			name: 'Toggle Start / Stop',
			options: [],
			callback: async () => self.postCmd(self.state.running ? 'stop' : 'start'),
		},
		resync: {
			name: 'Resync Beat',
			options: [],
			callback: async () => self.postCmd('resync'),
		},
		lock: {
			name: 'Toggle Lock BPM',
			options: [],
			callback: async () => self.postCmd('lock'),
		},
		div2: {
			name: 'BPM ÷2 (half tempo)',
			options: [],
			callback: async () => self.postCmd('div2'),
		},
		mul2: {
			name: 'BPM ×2 (double tempo)',
			options: [],
			callback: async () => self.postCmd('mul2'),
		},
		tap: {
			name: 'Tap Tempo',
			options: [],
			callback: async () => self.postCmd('tap'),
		},
		preset: {
			name: 'Apply Preset',
			options: [
				{
					type: 'textinput',
					id: 'name',
					label: 'Preset name (exact, case-sensitive)',
					default: '',
				},
			],
			callback: async (event) => {
				const name = String(event.options.name ?? '').trim()
				if (name) await self.postCmd(`preset/${encodeURIComponent(name)}`)
			},
		},
	})
}
