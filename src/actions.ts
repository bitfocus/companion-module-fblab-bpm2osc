import type BPM2OSCInstance from './main.js'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getActionDefinitions(instance: BPM2OSCInstance) {
  return {
    start: {
      name: 'Start Engine',
      options: [],
      callback: async () => instance.postCmd('start'),
    },
    stop: {
      name: 'Stop Engine',
      options: [],
      callback: async () => instance.postCmd('stop'),
    },
    toggle: {
      name: 'Toggle Start / Stop',
      options: [],
      callback: async () => instance.postCmd(instance.state.running ? 'stop' : 'start'),
    },
    resync: {
      name: 'Resync Beat',
      options: [],
      callback: async () => instance.postCmd('resync'),
    },
    lock: {
      name: 'Toggle Lock BPM',
      options: [],
      callback: async () => instance.postCmd('lock'),
    },
    div2: {
      name: 'BPM ÷2 (half tempo)',
      options: [],
      callback: async () => instance.postCmd('div2'),
    },
    mul2: {
      name: 'BPM ×2 (double tempo)',
      options: [],
      callback: async () => instance.postCmd('mul2'),
    },
    tap: {
      name: 'Tap Tempo',
      options: [],
      callback: async () => instance.postCmd('tap'),
    },
    preset: {
      name: 'Apply Preset',
      options: [
        {
          type: 'textinput' as const,
          id: 'name',
          label: 'Preset name (exact, case-sensitive)',
          default: '',
        },
      ],
      callback: async (action: { options: Record<string, unknown> }) => {
        const name = String(action.options['name'] ?? '').trim()
        if (name) await instance.postCmd(`preset/${encodeURIComponent(name)}`)
      },
    },
  } as const
}
