import type { SomeCompanionConfigField } from '@companion-module/base'

export type ModuleConfig = {
	host: string
	port: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'BPM2OSC Host / IP',
			width: 8,
			default: '127.0.0.1',
			tooltip: 'IP address of the machine running BPM2OSC',
		},
		{
			type: 'number',
			id: 'port',
			label: 'Port',
			width: 4,
			default: 5000,
			min: 1,
			max: 65535,
			tooltip: 'Web server port configured in BPM2OSC Settings → Web Server',
		},
	]
}
