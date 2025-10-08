import './App.css'
import { useEffect, useMemo, useState } from 'react'
import { UserList, PipelineHealth, UserFilter } from '@components'
import type { User as UserType } from '@types'

type FetchData = {
  data_all?: {
    high_bpm: number
    low_bpm?: number
    avg_bpm?: number
    avg_confidence?: number
    bpm_stddev?: number
  }
  data_by_user?: UserType[]
}

function App() {
  const [rawData, setRawData] = useState<FetchData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [health, setHealth] = useState<'passing' | 'failing' | 'unknown'>('unknown')

  const handleSearch = async (nameQuery: string) => {
    setLoading(true)
    setError(null)

    try {
      const url = new URL('http://localhost:4000/search-users')
      if (nameQuery.trim()) {
        url.searchParams.set('name', nameQuery.trim())
      }

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new Error(`Expected application/json but got ${contentType}`)
      }

      const users = (await res.json()) as unknown
      setRawData({ data_by_user: users as unknown as UserType[] })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setRawData(null)
    } finally {
      setLoading(false)
    }
  }

  // Fetch pipeline health (mock) - best effort, do not block data fetch
  const fetchHealth = async () => {
    try {
      const res = await fetch('http://localhost:4000/pipeline-health')
      const status = res.ok ? 'passing' : 'failing'
      // Try to read body to surface more info if needed
      setHealth(status as 'passing' | 'failing')
    } catch {
      setHealth('unknown')
    }
  }

  // Load all users on mount
  useEffect(() => {
    handleSearch('')
    fetchHealth()

    const id = setInterval(() => {
      fetchHealth()
    }, 15000)

    return () => clearInterval(id)
  }, [])

  const users: UserType[] = useMemo(() => {
    if (!rawData) return []
    // prefer data_by_user, fall back to single data_all if present
    if (Array.isArray(rawData.data_by_user)) return rawData.data_by_user
    if (rawData.data_all && rawData.data_all.high_bpm !== undefined) {
      return [
        {
          id: 0,
          name: 'All Users',
          high_bpm: rawData.data_all.high_bpm,
          low_bpm: rawData.data_all.low_bpm ?? 50,
          avg_bpm: rawData.data_all.avg_bpm ?? (rawData.data_all.high_bpm + (rawData.data_all.low_bpm ?? 50)) / 2,
          avg_confidence: rawData.data_all.avg_confidence ?? 0,
          bpm_stddev: rawData.data_all.bpm_stddev ?? 0,
        },
      ]
    }
    return []
  }, [rawData])

  return (
    <>
      <div className='app-header'>
      <h1>ODOS IV</h1>
      <PipelineHealth status={health} />
      </div>
        <div className="app-container">
        <div className="dashboard-container">
          {error && <div className="error-message">Error: {error}</div>}
          <UserList users={users} FilterComponent={UserFilter} onSearch={handleSearch} loading={loading} />
        </div>
      </div>
    </>
  )
}

export default App
