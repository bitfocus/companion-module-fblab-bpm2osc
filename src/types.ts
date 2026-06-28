export interface Config {
  host: string
  port: number
}

export interface BPM2OSCState {
  running: boolean
  bpm: number | null
  factor: number
  locked: boolean
  auto_locked: boolean
  conf: number
  fix: string
  vu: number[]
  bar_beat: number
  beat_flash: boolean
  preset: string
  presets: string[]
  metro_period: number
  next_tick_in: number
}

export const DEFAULT_STATE: BPM2OSCState = {
  running: false, bpm: null, factor: 1,
  locked: false, auto_locked: false,
  conf: 0, fix: '', vu: [],
  bar_beat: -1, beat_flash: false,
  preset: '', presets: [],
  metro_period: 0, next_tick_in: -1,
}
