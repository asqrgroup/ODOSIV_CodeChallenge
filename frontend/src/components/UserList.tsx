import { type FC, useState, type ComponentType, useRef, useEffect } from 'react'
import type { User } from '@types'

type FilterProps = {
  query: string
  onQueryChange: (q: string) => void
  onSubmit: (q: string) => void
}

const UserList: FC<{
  users: User[];
  FilterComponent?: ComponentType<FilterProps>;
  onSearch: (query: string) => void;
  loading: boolean;
}> = ({ users, FilterComponent, onSearch, loading }) => {
  const [query, setQuery] = useState('')
  const [lastSearched, setLastSearched] = useState('')
  const [isSticky, setIsSticky] = useState(false)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (tableContainerRef.current) {
        setIsSticky(tableContainerRef.current.scrollTop > 0)
      }
    }
    const container = tableContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleSubmit = (q: string) => {
    setLastSearched(q.trim())
    onSearch(q)
  }

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(query)
  }

  const rows = (users ?? []).map((u) => (
    <tr key={u.id} aria-label={`user-row-${u.id}`}>
      <th scope="row">{u.name}</th>
      <td>{u.high_bpm}</td>
      <td>{u.low_bpm}</td>
      <td>{typeof u.avg_bpm === 'number' ? u.avg_bpm.toFixed(1) : '\u2014'}</td>
      <td>{typeof u.avg_confidence === 'number' ? u.avg_confidence.toFixed(2) : '\u2014'}</td>
      <td>{typeof u.bpm_stddev === 'number' ? u.bpm_stddev : '\u2014'}</td>
      <td>{typeof u.sample_count === 'number' ? u.sample_count.toLocaleString() : '\u2014'}</td>
      <td>{u.window?.start ? new Date(u.window.start).toLocaleString() : '\u2014'}</td>
      <td>{u.last_updated ? new Date(u.last_updated).toLocaleString() : '\u2014'}</td>
    </tr>
  ))

  return (
    <section>
      {FilterComponent ? (
          <div className='dashboard-header'>
            <h2>Dashboard</h2>
            <FilterComponent query={query} onQueryChange={setQuery} onSubmit={handleSubmit} />
          </div>
      ) : (
        <>
          <h2 id="user-list-heading">Users</h2>
          <form onSubmit={handleFormSubmit} className="search-form">
            <div>
              <label htmlFor="user-search" className="sr-only">
                Search users by name
              </label>
              <input
                id="user-search"
                type="search"
                placeholder="Search by name"
                value={query}
                onChange={handleQueryChange}
                aria-label="Search users by name"
                className="search-input"
              />
              <button
                type="submit"
                aria-label="Search for users"
                className="search-button"
              >
                Search
              </button>
            </div>
          </form>
        </>
      )}

      {loading && <p>Loading data...</p>}

      {!loading && rows.length === 0 ? (
        <p>{lastSearched ? `No ${lastSearched} user available.` : 'No users available.'}</p>
      ) : (
        <div className="table-container" ref={tableContainerRef} tabIndex={0} aria-label="Scrollable table of user data">
          <table className="user-table" role="table" aria-describedby="user-list-heading">
            <caption className="sr-only">Per-user BPM and confidence metrics</caption>
            <thead className={isSticky ? 'sticky' : ''}>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">High BPM</th>
                <th scope="col">Low BPM</th>
                <th scope="col">Avg BPM</th>
                <th scope="col">Avg Confidence</th>
                <th scope="col">BPM Std Dev</th>
                <th scope="col">Samples</th>
                <th scope="col">Window Start</th>
                <th scope="col">Last Updated</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default UserList
