import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { apiFetch, setAccessTokenGetter } from './api-client'

// Not: Backend'de henüz bir GET /users/me ucu yok, bu yüzden yenilenmiş bir
// refresh token'dan tam kullanıcı (rol + enabledModules) bilgisi sessizce geri
// yüklenemiyor. Bu ilk sürümde oturum sekme belleğinde tutulur; sayfa
// yenilendiğinde kullanıcı yeniden giriş yapar. Kalıcı oturum, /users/me
// eklendiğinde tamamlanabilir (bkz. NOTLAR.md).

export interface AuthUser {
  id: string
  tenantId: string
  email: string
  fullName: string
  role: 'OWNER' | 'ADMIN' | 'SALES' | 'VIEWER'
  enabledModules: string[]
}

interface TokenPair {
  accessToken: string
  refreshToken: string
}

interface AuthResponse {
  user: AuthUser
  tokens: TokenPair
}

interface AuthContextValue {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  register: (input: {
    tenantName: string
    fullName: string
    email: string
    password: string
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const accessTokenRef = useRef<string | null>(null)
  const refreshTokenRef = useRef<string | null>(null)

  useEffect(() => {
    setAccessTokenGetter(() => accessTokenRef.current)
  }, [])

  function applyTokens(tokens: TokenPair) {
    accessTokenRef.current = tokens.accessToken
    refreshTokenRef.current = tokens.refreshToken
  }

  async function login(email: string, password: string) {
    const response = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    })
    applyTokens(response.tokens)
    setUser(response.user)
  }

  async function register(input: {
    tenantName: string
    fullName: string
    email: string
    password: string
  }) {
    const response = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
      skipAuth: true,
    })
    applyTokens(response.tokens)
    setUser(response.user)
  }

  function logout() {
    accessTokenRef.current = null
    refreshTokenRef.current = null
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth, AuthProvider içinde kullanılmalıdır')
  }
  return ctx
}
