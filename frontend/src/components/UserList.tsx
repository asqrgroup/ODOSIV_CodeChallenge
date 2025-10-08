import { type FC, useState, type ComponentType, useRef, useEffect, useCallback } from 'react'
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
  const [focusedCell, setFocusedCell] = useState<{row: number, col: number} | null>(null)

  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)

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

  // Keyboard navigation for table cells
  const handleTableKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!tableRef.current || !focusedCell) return

    const rows = Array.from(tableRef.current.querySelectorAll('tbody tr'))
    const cols = 9 // Number of columns

    const { row, col } = focusedCell
    let newRow = row
    let newCol = col

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        newRow = Math.min(row + 1, rows.length - 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        newRow = Math.max(row - 1, 0)
        break
      case 'ArrowRight':
        e.preventDefault()
        newCol = Math.min(col + 1, cols - 1)
        break
      case 'ArrowLeft':
        e.preventDefault()
        newCol = Math.max(col - 1, 0)
        break
      case 'Home':
        e.preventDefault()
        if (e.ctrlKey) {
          newRow = 0
          newCol = 0
        } else {
          newCol = 0
        }
        break
      case 'End':
        e.preventDefault()
        if (e.ctrlKey) {
          newRow = rows.length - 1
          newCol = cols - 1
        } else {
          newCol = cols - 1
        }
        break
      default:
        return
    }

    if (newRow !== row || newCol !== col) {
      setFocusedCell({ row: newRow, col: newCol })
      const targetCell = rows[newRow]?.children[newCol] as HTMLElement
      targetCell?.focus()
    }
  }, [focusedCell])

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

  const rows = (users ?? []).map((u, rowIndex) => (
    <tr key={u.id} aria-label={`User data for ${u.name}`}>
      <th
        scope="row"
        tabIndex={0}
        onFocus={() => setFocusedCell({ row: rowIndex, col: 0 })}
        aria-describedby="name-column-description"
      >
        {u.name}
      </th>
      <td
        tabIndex={0}
        onFocus={() => setFocusedCell({ row: rowIndex, col: 1 })}
        aria-describedby="high-bpm-column-description"
      >
        {u.high_bpm}
      </td>
      <td
        tabIndex={0}
        onFocus={() => setFocusedCell({ row: rowIndex, col: 2 })}
        aria-describedby="low-bpm-column-description"
      >
        {u.low_bpm}
      </td>
      <td
        tabIndex={0}
        onFocus={() => setFocusedCell({ row: rowIndex, col: 3 })}
        aria-describedby="avg-bpm-column-description"
      >
        {typeof u.avg_bpm === 'number' ? u.avg_bpm.toFixed(1) : '\u2014'}
      </td>
      <td
        tabIndex={0}
        onFocus={() => setFocusedCell({ row: rowIndex, col: 4 })}
        aria-describedby="avg-confidence-column-description"
      >
        {typeof u.avg_confidence === 'number' ? u.avg_confidence.toFixed(2) : '\u2014'}
      </td>
      <td
        tabIndex={0}
        onFocus={() => setFocusedCell({ row: rowIndex, col: 5 })}
        aria-describedby="bpm-stddev-column-description"
      >
        {typeof u.bpm_stddev === 'number' ? u.bpm_stddev : '\u2014'}
      </td>
      <td
        tabIndex={0}
        onFocus={() => setFocusedCell({ row: rowIndex, col: 6 })}
        aria-describedby="sample-count-column-description"
      >
        {typeof u.sample_count === 'number' ? u.sample_count.toLocaleString() : '\u2014'}
      </td>
      <td
        tabIndex={0}
        onFocus={() => setFocusedCell({ row: rowIndex, col: 7 })}
        aria-describedby="window-start-column-description"
      >
        {u.window?.start ? new Date(u.window.start).toLocaleString() : '\u2014'}
      </td>
      <td
        tabIndex={0}
        onFocus={() => setFocusedCell({ row: rowIndex, col: 8 })}
        aria-describedby="last-updated-column-description"
      >
        {u.last_updated ? new Date(u.last_updated).toLocaleString() : '\u2014'}
      </td>
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
        <div
          className="table-container"
          ref={tableContainerRef}
          tabIndex={0}
          aria-label="Scrollable table of user data. Use arrow keys to navigate between cells."
          onKeyDown={handleTableKeyDown}
          role="application"
          aria-describedby="table-instructions"
        >
          <div id="table-instructions" className="sr-only">
            Navigate the table using arrow keys. Press Home to go to the first column, End to go to the last column.
            Use Ctrl+Home to go to the first cell, Ctrl+End to go to the last cell.
          </div>
          <table
            className="user-table"
            role="table"
            aria-describedby="user-list-heading table-instructions"
            ref={tableRef}
          >
            <caption className="sr-only">
              Per-user BPM and confidence metrics. {users.length} users displayed.
            </caption>
            <thead className={isSticky ? 'sticky' : ''}>
              <tr role="row">
                <th scope="col">
                  Name
                  <span id="name-column-description" className="sr-only">User name</span>
                </th>
                <th scope="col">
                  High BPM
                  <span id="high-bpm-column-description" className="sr-only">Highest BPM recorded</span>
                </th>
                <th scope="col">
                  Low BPM
                  <span id="low-bpm-column-description" className="sr-only">Lowest BPM recorded</span>
                </th>
                <th scope="col">
                  Avg BPM
                  <span id="avg-bpm-column-description" className="sr-only">Average BPM</span>
                </th>
                <th scope="col">
                  Avg Confidence
                  <span id="avg-confidence-column-description" className="sr-only">Average confidence score</span>
                </th>
                <th scope="col">
                  BPM Std Dev
                  <span id="bpm-stddev-column-description" className="sr-only">BPM standard deviation</span>
                </th>
                <th scope="col">
                  Samples
                  <span id="sample-count-column-description" className="sr-only">Number of samples</span>
                </th>
                <th scope="col">
                  Window Start
                  <span id="window-start-column-description" className="sr-only">Data window start time</span>
                </th>
                <th scope="col">
                  Last Updated
                  <span id="last-updated-column-description" className="sr-only">Last update timestamp</span>
                </th>
              </tr>
            </thead>
            <tbody role="rowgroup">{rows}</tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default UserList
