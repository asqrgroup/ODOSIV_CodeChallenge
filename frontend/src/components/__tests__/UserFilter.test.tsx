import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserFilter } from '@components'

describe('UserFilter', () => {
  it('renders the search form with input and button', () => {
    const mockOnQueryChange = vi.fn()
    const mockOnSubmit = vi.fn()

    render(
      <UserFilter
        query=""
        onQueryChange={mockOnQueryChange}
        onSubmit={mockOnSubmit}
      />
    )

    expect(screen.getByRole('searchbox', { name: /search users by name/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search for users/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/search users by name/i)).toBeInTheDocument()
  })

  it('displays the current query value in the input', () => {
    const mockOnQueryChange = vi.fn()
    const mockOnSubmit = vi.fn()
    const query = 'John Doe'

    render(
      <UserFilter
        query={query}
        onQueryChange={mockOnQueryChange}
        onSubmit={mockOnSubmit}
      />
    )

    const input = screen.getByRole('searchbox')
    expect(input).toHaveValue(query)
  })

  it('calls onQueryChange when input value changes', () => {
    const mockOnQueryChange = vi.fn()
    const mockOnSubmit = vi.fn()
    const newQuery = 'Jane'

    render(
      <UserFilter
        query=""
        onQueryChange={mockOnQueryChange}
        onSubmit={mockOnSubmit}
      />
    )

    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: newQuery } })

    expect(mockOnQueryChange).toHaveBeenCalledWith(newQuery)
    expect(mockOnQueryChange).toHaveBeenCalledTimes(1)
  })

  it('calls onSubmit with the query when form is submitted', async () => {
    const user = userEvent.setup()
    const mockOnQueryChange = vi.fn()
    const mockOnSubmit = vi.fn()
    const query = 'John'

    render(
      <UserFilter
        query={query}
        onQueryChange={mockOnQueryChange}
        onSubmit={mockOnSubmit}
      />
    )

    const button = screen.getByRole('button', { name: /search for users/i })
    await user.click(button)

    expect(mockOnSubmit).toHaveBeenCalledWith(query)
    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })
})
