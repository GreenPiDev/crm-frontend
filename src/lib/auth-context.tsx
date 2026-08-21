import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { apiFetch, setAccessTokenGetter, setTokenRefresher } from './api-client'

// Sayfa yenilendiğinde refresh token ile oturum doğrulanır, ardından GET
// /users/me ile güncel kullanıcı bilgisi (rol + enabledModules dahil)
// sunucudan çekilir. Böylece bir kullanıcının rolü/modül erişimi değiştiğinde
// bunu bir sonraki sessiz refresh'te (en geç 15 dakikada bir, ya da sayfa
// yenilemesinde) görür; tekrar login olması gerekmez.

const REFRESH_TOKEN_KEY = 'nova_crm_refresh_token'
const USER_KEY = 'nova_crm_user'

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
  isInitializing: boolean
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
  const [isInitializing, setIsInitializing] = useState(true)
  const accessTokenRef = useRef<string | null>(null)
  const refreshTokenRef = useRef<string | null>(null)

  function applyTokens(tokens: TokenPair) {
    accessTokenRef.current = tokens.accessToken
    refreshTokenRef.current = tokens.refreshToken
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  }

  function clearSession() {
    accessTokenRef.current = null
    refreshTokenRef.current = null
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  async function refreshAccessToken(): Promise<string | null> {
    const storedRefreshToken = refreshTokenRef.current
    if (!storedRefreshToken) {
      return null
    }
    try {
      const tokens = await apiFetch<TokenPair>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
        skipAuth: true,
      })
      applyTokens(tokens)

      const me = await apiFetch<AuthUser>('/users/me', {
        overrideToken: tokens.accessToken,
      })
      localStorage.setItem(USER_KEY, JSON.stringify(me))
      setUser(me)

      return tokens.accessToken
    } catch {
      clearSession()
      return null
    }
  }

  useEffect(() => {
    setAccessTokenGetter(() => accessTokenRef.current)
    setTokenRefresher(refreshAccessToken)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    async function restoreSession() {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!storedRefreshToken) {
        clearSession()
        setIsInitializing(false)
        return
      }

      refreshTokenRef.current = storedRefreshToken
      await refreshAccessToken()
      setIsInitializing(false)
    }

    restoreSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(email: string, password: string) {
    const response = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    })
    applyTokens(response.tokens)
    localStorage.setItem(USER_KEY, JSON.stringify(response.user))
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
    localStorage.setItem(USER_KEY, JSON.stringify(response.user))
    setUser(response.user)
  }

  function logout() {
    const storedRefreshToken = refreshTokenRef.current
    if (storedRefreshToken) {
      apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      }).catch(() => {
        // Sunucu tarafı iptali başarısız olsa bile yerel oturumu temizlemeye devam et.
      })
    }
    clearSession()
  }

  return (
    <AuthContext.Provider
      value={{ user, isInitializing, login, register, logout }}
    >
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
