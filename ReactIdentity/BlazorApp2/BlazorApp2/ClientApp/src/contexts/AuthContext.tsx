import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiGet, apiPost, clearAntiforgeryToken } from '@/api/apiClient'
import type { User, LoginRequest, RegisterRequest, LoginResponse, ApiResponse, Verify2faRequest } from '@/types/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<LoginResponse>
  register: (request: RegisterRequest) => Promise<ApiResponse>
  logout: () => Promise<void>
  verify2fa: (request: Verify2faRequest) => Promise<LoginResponse>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const userData = await apiGet<User>('/auth/user')
      setUser(userData)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [refreshUser])

  const login = async (request: LoginRequest): Promise<LoginResponse> => {
    const response = await apiPost<LoginResponse>('/auth/login', request)
    if (response.succeeded) {
      await refreshUser()
    }
    return response
  }

  const register = async (request: RegisterRequest): Promise<ApiResponse> => {
    const response = await apiPost<ApiResponse>('/auth/register', request)
    return response
  }

  const logout = async () => {
    await apiPost('/auth/logout')
    setUser(null)
    clearAntiforgeryToken()
  }

  const verify2fa = async (request: Verify2faRequest): Promise<LoginResponse> => {
    const response = await apiPost<LoginResponse>('/auth/2fa/verify', request)
    if (response.succeeded) {
      await refreshUser()
    }
    return response
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        verify2fa,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
