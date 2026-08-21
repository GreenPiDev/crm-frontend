const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export interface ApiErrorDetail {
  path: string
  message: string
}

export class ApiError extends Error {
  statusCode: number
  details?: ApiErrorDetail[]

  constructor(statusCode: number, message: string, details?: ApiErrorDetail[]) {
    super(message)
    this.statusCode = statusCode
    this.details = details
  }
}

type TokenGetter = () => string | null
type TokenRefresher = () => Promise<string | null>

let getAccessToken: TokenGetter = () => null
let refreshAccessToken: TokenRefresher = async () => null

export function setAccessTokenGetter(getter: TokenGetter) {
  getAccessToken = getter
}

export function setTokenRefresher(refresher: TokenRefresher) {
  refreshAccessToken = refresher
}

// Eşzamanlı 401'lerin ayrı ayrı refresh çağrısı tetiklemesini önler; tek
// istek paylaşılır, sonucu bekleyen herkese aynı token (veya null) döner.
let refreshInFlight: Promise<string | null> | null = null

function refreshOnce(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean
  /**
   * Bilinen taze bir access token'ı doğrudan kullanır ve otomatik 401-refresh
   * denemesini atlar. Token refresh akışının kendi içinde tekrar refresh
   * tetiklemesini (deadlock riski) önlemek için kullanılır.
   */
  overrideToken?: string
}

function doFetch(path: string, options: ApiFetchOptions, token: string | null) {
  const { headers, ...rest } = options
  return fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { skipAuth, overrideToken } = options
  const token = skipAuth ? null : (overrideToken ?? getAccessToken())

  let response = await doFetch(path, options, token)

  if (!skipAuth && !overrideToken && response.status === 401 && path !== '/auth/refresh') {
    const newToken = await refreshOnce()
    if (newToken) {
      response = await doFetch(path, options, newToken)
    }
  }

  if (response.status === 204) {
    return undefined as T
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.message ?? 'Beklenmeyen bir hata oluştu',
      body?.details
    )
  }

  return body as T
}
