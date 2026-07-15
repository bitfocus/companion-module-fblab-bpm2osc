import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { request as httpRequest } from 'http'
import { EventSource } from 'eventsource'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdateVariableDefinitions, updateVariableValues, type VariablesSchema } from './variables.js'
import { UpdatePresets } from './presets.js'
import { UpgradeScripts } from './upgrades.js'
import { type BPM2OSCState, DEFAULT_STATE } from './types.js'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export { UpgradeScripts }

export default class ModuleInstance extends InstanceBase<ModuleSchema> {
	config!: ModuleConfig // Setup in init()
	state: BPM2OSCState = { ...DEFAULT_STATE }

	private _es: EventSource | null = null
	private _reconnectTimer: ReturnType<typeof setTimeout> | null = null
	private _lastPresets: string[] = []

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
		this.updateVariableDefinitions()
		updateVariableValues(this)

		this._connectSSE()
	}

	async destroy(): Promise<void> {
		this._disconnect()
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this._disconnect()
		this._connectSSE()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	baseUrl(): string {
		return `http://${this.config.host}:${this.config.port}`
	}

	async postCmd(path: string): Promise<void> {
		return new Promise((resolve) => {
			const req = httpRequest(
				{
					hostname: this.config.host,
					port: this.config.port,
					path: `/api/${path}`,
					method: 'POST',
					headers: { 'Content-Length': '0' },
				},
				(res) => {
					if (res.statusCode !== undefined && res.statusCode >= 400) {
						this.log('warn', `POST /api/${path} → ${res.statusCode}`)
					}
					res.resume()
					resolve()
				}
			)
			req.on('error', (e) => {
				this.log('error', `POST /api/${path} failed: ${e.message}`)
				resolve()
			})
			req.setTimeout(5000, () => {
				req.destroy(new Error('timeout'))
			})
			req.end()
		})
	}

	private _connectSSE(): void {
		this.updateStatus(InstanceStatus.Connecting)
		const url = `${this.baseUrl()}/api/stream`
		this.log('debug', `Connecting SSE: ${url}`)

		this._es = new EventSource(url)

		this._es.onopen = () => {
			this.log('debug', 'SSE connected')
			this.updateStatus(InstanceStatus.Ok)
			if (this._reconnectTimer) {
				clearTimeout(this._reconnectTimer)
				this._reconnectTimer = null
			}
		}

		this._es.onmessage = (e: MessageEvent) => {
			try {
				this.state = JSON.parse(e.data as string) as BPM2OSCState
				updateVariableValues(this)

				const newPresets = this.state.presets ?? []
				if (JSON.stringify(newPresets) !== JSON.stringify(this._lastPresets)) {
					this._lastPresets = [...newPresets]
					this.updatePresets()
				}

				this.checkFeedbacks(
					'running',
					'stopped',
					'locked',
					'auto_locked',
					'factor_active',
					'preset_active',
					'confidence_above',
					'beat_one'
				)
			} catch (err) {
				this.log('warn', `SSE parse error: ${err}`)
			}
		}

		this._es.onerror = () => {
			this.updateStatus(InstanceStatus.ConnectionFailure, 'Disconnected — retrying in 3 s')
			this._es?.close()
			this._es = null
			if (!this._reconnectTimer) {
				this._reconnectTimer = setTimeout(() => {
					this._reconnectTimer = null
					this._connectSSE()
				}, 3000)
			}
		}
	}

	private _disconnect(): void {
		if (this._reconnectTimer) {
			clearTimeout(this._reconnectTimer)
			this._reconnectTimer = null
		}
		if (this._es) {
			this._es.close()
			this._es = null
		}
	}
}
