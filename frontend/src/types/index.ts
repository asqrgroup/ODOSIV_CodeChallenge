export type User = {
  id: number
  name: string
  high_bpm: number
  low_bpm: number
  avg_bpm?: number
  avg_confidence?: number
  bpm_stddev?: number
  sample_count?: number
  window?: { start: string; end: string }
  last_updated?: string
}

export type ChartUser = Pick<User, 'name' | 'high_bpm'>
