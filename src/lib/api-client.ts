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

let getAccessToken: TokenGetter = () => null

export function setAccessTokenGetter(getter: TokenGetter) {
  getAccessToken = getter
}

interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { skipAuth, headers, ...rest } = options
  const token = skipAuth ? null : getAccessToken()

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

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
