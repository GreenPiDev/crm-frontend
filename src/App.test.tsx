import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('Nova CRM başlığını gösterir', () => {
    render(<App />)
    expect(screen.getByText('Nova CRM')).toBeInTheDocument()
  })
})
