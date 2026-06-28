import {
  InstanceBase,
  InstanceStatus,
  type SomeCompanionConfigField,
} from '@companion-module/base'
import { EventSource } from 'eventsource'
import { getActionDefinitions }         from './actions.js'
import { getFeedbackDefinitions }       from './feedbacks.js'
import { VARIABLE_DEFS, updateVariables } from './variables.js'
import { PRESET_DEFS, PRESET_STRUCTURE } from './presets.js'
import { type Config, type BPM2OSCState, DEFAULT_STATE } from './types.js'

export default class BPM2OSCInstance extends InstanceBase {
  config: Config = { host: '127.0.0.1', port: 5000 }
  state: BPM2OSCState = { ...DEFAULT_STATE }

  private _es: EventSource | null = null
  private _reconnectTimer: ReturnType<typeof setTimeout> | null = null

  async init(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = rawConfig as unknown as Config
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.setActionDefinitions(getActionDefinitions(this) as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.setFeedbackDefinitions(getFeedbackDefinitions(this) as any)
    this.setVariableDefinitions(VARIABLE_DEFS)
    this.setPresetDefinitions(PRESET_STRUCTURE, PRESET_DEFS)
    updateVariables(this)
    this._connectSSE()
  }

  async destroy(): Promise<void> {
    this._disconnect()
  }

  async configUpdated(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = rawConfig as unknown as Config
    this._disconnect()
    this._connectSSE()
  }

  getConfigFields(): SomeCompanionConfigField[] {
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

  baseUrl(): string {
    return `http://${this.config.host}:${this.config.port}`
  }

  async postCmd(path: string): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl()}/api/${path}`, { method: 'POST' })
      if (!res.ok) this.log('warn', `POST /api/${path} → ${res.status}`)
    } catch (e) {
      this.log('error', `POST /api/${path} failed: ${e}`)
    }
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
        updateVariables(this)
        this.checkAllFeedbacks()
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
