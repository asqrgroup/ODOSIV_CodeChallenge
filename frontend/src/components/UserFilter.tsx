import { type FC, type FormEvent } from 'react'

type Props = {
  query: string
  onQueryChange: (q: string) => void
  onSubmit: (q: string) => void
}

const UserFilter: FC<Props> = ({ query, onQueryChange, onSubmit }) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(query)
  }

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQueryChange(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit} className="search-form">
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
    </form>
  )
}

export default UserFilter
