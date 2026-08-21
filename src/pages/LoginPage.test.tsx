import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '@/lib/auth-context'
import LoginPage from './LoginPage'

function renderLoginPage() {
  render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  it('boş form gönderildiğinde doğrulama hatalarını gösterir', async () => {
    renderLoginPage()

    fireEvent.click(screen.getByRole('button', { name: 'Giriş Yap' }))

    await waitFor(() => {
      expect(screen.getByText('Geçersiz e-posta adresi')).toBeInTheDocument()
      expect(screen.getByText('Şifre zorunludur')).toBeInTheDocument()
    })
  })
})
