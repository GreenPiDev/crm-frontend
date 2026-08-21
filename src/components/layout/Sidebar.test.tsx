import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import * as authContext from '@/lib/auth-context'
import { Sidebar } from './Sidebar'

function mockUser(enabledModules: string[]) {
  vi.spyOn(authContext, 'useAuth').mockReturnValue({
    user: {
      id: '1',
      tenantId: 't1',
      email: 'sahip@acme.test',
      fullName: 'Test Sahibi',
      role: 'OWNER',
      enabledModules,
    },
    isInitializing: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  })
}

describe('Sidebar', () => {
  it('etkin olmayan modülün nav öğesini göstermez', () => {
    mockUser(['accounts'])

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    expect(screen.getByText('Firmalar')).toBeInTheDocument()
    expect(screen.queryByText('Kişiler')).not.toBeInTheDocument()
    expect(screen.getByText('Panel')).toBeInTheDocument()
    expect(screen.getByText('Ayarlar')).toBeInTheDocument()
  })

  it('tüm modüller etkinken hepsini gösterir', () => {
    mockUser(['accounts', 'contacts'])

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    expect(screen.getByText('Firmalar')).toBeInTheDocument()
    expect(screen.getByText('Kişiler')).toBeInTheDocument()
  })
})
