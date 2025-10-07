import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PipelineHealth } from '@components'

describe('PipelineHealth', () => {
  it('renders with passing status', () => {
    render(<PipelineHealth status="passing" />)

    const statusElement = screen.getByRole('status')
    expect(statusElement).toBeInTheDocument()
    expect(statusElement).toHaveAttribute('aria-live', 'polite')
    expect(statusElement).toHaveClass('pipeline-health')

    expect(screen.getByText('Data Pipeline Health: passing')).toBeInTheDocument()

    const indicator = statusElement.querySelector('.status-indicator')
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass('passing')
    expect(indicator).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders with failing status', () => {
    render(<PipelineHealth status="failing" />)

    const statusElement = screen.getByRole('status')
    expect(statusElement).toBeInTheDocument()
    expect(statusElement).toHaveAttribute('aria-live', 'polite')
    expect(statusElement).toHaveClass('pipeline-health')

    expect(screen.getByText('Data Pipeline Health: failing')).toBeInTheDocument()

    const indicator = statusElement.querySelector('.status-indicator')
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass('failing')
    expect(indicator).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders with unknown status', () => {
    render(<PipelineHealth status="unknown" />)

    const statusElement = screen.getByRole('status')
    expect(statusElement).toBeInTheDocument()
    expect(statusElement).toHaveAttribute('aria-live', 'polite')
    expect(statusElement).toHaveClass('pipeline-health')

    expect(screen.getByText('Data Pipeline Health: unknown')).toBeInTheDocument()

    const indicator = statusElement.querySelector('.status-indicator')
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass('unknown')
    expect(indicator).toHaveAttribute('aria-hidden', 'true')
  })
})
