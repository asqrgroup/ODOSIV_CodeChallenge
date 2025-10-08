import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { UserList } from '@components'
import type { User } from '@types'

const users: User[] = [
  { 
    id: 1, 
    name: 'Alice', 
    high_bpm: 120, 
    low_bpm: 60, 
    avg_bpm: 80, 
    avg_confidence: 0.95, 
    bpm_stddev: 5,
    sample_count: 100,
    last_updated: '2024-01-01T00:00:00Z',
    window: { start: '2024-01-01T00:00:00Z', end: '2024-01-01T01:00:00Z' }
  },
  { 
    id: 2, 
    name: 'Bob', 
    high_bpm: 110, 
    low_bpm: 55, 
    avg_bpm: 75, 
    avg_confidence: 0.9, 
    bpm_stddev: 4,
    sample_count: 80,
    last_updated: '2024-01-02T00:00:00Z',
    window: { start: '2024-01-02T00:00:00Z', end: '2024-01-02T01:00:00Z' }
  },
]

test('renders users with search functionality', async () => {
  const mockOnSearch = vi.fn()
  render(<UserList users={users} onSearch={mockOnSearch} loading={false} />)

  expect(screen.getByText('Alice')).toBeInTheDocument()
  expect(screen.getByText('Bob')).toBeInTheDocument()

  const input = screen.getByRole('searchbox', { name: /search users by name/i })
  const searchButton = screen.getByRole('button', { name: /search for users/i })

  await userEvent.type(input, 'Alice')
  await userEvent.click(searchButton)

  expect(mockOnSearch).toHaveBeenCalledWith('Alice')
})

test('shows loading indicator when loading', () => {
  const mockOnSearch = vi.fn()
  render(<UserList users={[]} onSearch={mockOnSearch} loading={true} />)

  expect(screen.getByText('Loading data...')).toBeInTheDocument()
})

test('shows no results message when users array is empty', () => {
  const mockOnSearch = vi.fn()
  render(<UserList users={[]} onSearch={mockOnSearch} loading={false} />)

  expect(screen.getByText('No users available.')).toBeInTheDocument()
})

test('shows search value in no results message after search', async () => {
  const mockOnSearch = vi.fn()
  const { rerender } = render(<UserList users={users} onSearch={mockOnSearch} loading={false} />)

  const input = screen.getByRole('searchbox', { name: /search users by name/i })
  const searchButton = screen.getByRole('button', { name: /search for users/i })

  await userEvent.type(input, 'TestUser')
  await userEvent.click(searchButton)

  // Simulate empty results after search
  rerender(<UserList users={[]} onSearch={mockOnSearch} loading={false} />)

  expect(screen.getByText('No TestUser user available.')).toBeInTheDocument()
})

// Accessibility tests
describe('Accessibility', () => {
  test('table has proper ARIA structure', () => {
    const mockOnSearch = vi.fn()
    render(<UserList users={users} onSearch={mockOnSearch} loading={false} />)

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    expect(table).toHaveAttribute('aria-describedby')
  })

  test('table cells are focusable', () => {
    const mockOnSearch = vi.fn()
    render(<UserList users={users} onSearch={mockOnSearch} loading={false} />)

    const aliceNameCell = screen.getByRole('rowheader', { name: 'Alice' })
    expect(aliceNameCell).toHaveAttribute('tabIndex', '0')
  })
})
