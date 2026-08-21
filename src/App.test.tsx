import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('oturum açılmamışken giriş sayfasına yönlendirir', () => {
    render(
      <MemoryRouter initialEntries={['/panel']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Nova CRM')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Giriş Yap' })).toBeInTheDocument()
  })
})
