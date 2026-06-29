import {
  InstanceBase,
  InstanceStatus,
  runEntrypoint,
  type SomeCompanionConfigField,
} from '@companion-module/base'
import { request as httpRequest } from 'http'
import { EventSource } from 'eventsource'
import { getActionDefinitions }           from './actions.js'
import { getFeedbackDefinitions }         from './feedbacks.js'
import { VARIABLE_DEFS, updateVariables } from './variables.js'
import { generatePresets }                from './presets.js'
import { type Config, type BPM2OSCState, DEFAULT_STATE } from './types.js'

export class BPM2OSCInstance extends InstanceBase<Config> {
  config: Config = { host: '127.0.0.1', port: 5000 }
  state: BPM2OSCState = { ...DEFAULT_STATE }

  private _es: EventSource | null = null
  private _reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private _lastPresets: string[] = []

  async init(config: Config, _isFirstInit: boolean): Promise<void> {
    this.config = config
    this.setActionDefinitions(getActionDefinitions(this))
    this.setFeedbackDefinitions(getFeedbackDefinitions(this))
    this.setVariableDefinitions(VARIABLE_DEFS)
    this.setPresetDefinitions(generatePresets([]))
    updateVariables(this)
    this._connectSSE()
  }

  async destroy(): Promise<void> {
    this._disconnect()
  }

  async configUpdated(config: Config): Promise<void> {
    this.config = config
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
    return new Promise((resolve) => {
      const req = httpRequest(
        {
          hostname: this.config.host,
          port:     this.config.port,
          path:     `/api/${path}`,
          method:   'POST',
          headers:  { 'Content-Length': '0' },
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
        updateVariables(this)

        const newPresets = this.state.presets ?? []
        if (JSON.stringify(newPresets) !== JSON.stringify(this._lastPresets)) {
          this._lastPresets = [...newPresets]
          this.setPresetDefinitions(generatePresets(this._lastPresets))
        }

        this.checkFeedbacks('running', 'stopped', 'locked', 'auto_locked', 'factor_active', 'preset_active', 'confidence_above', 'beat_one')
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

runEntrypoint(BPM2OSCInstance, [])
