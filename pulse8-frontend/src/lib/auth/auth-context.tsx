'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@/types/api'
import { AuthService, RegisterRequest } from '@/lib/api/auth'
import { normalizeUser } from '@/lib/utils/user'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: RegisterRequest) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se há token salvo no localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token')
      if (token) {
        // Validar token e buscar dados do usuário
        validateToken(token)
      } else {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const validateToken = async (token: string) => {
    try {
      if (!AuthService.isTokenValid(token)) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token')
        }
        setIsLoading(false)
        return
      }

      const userData = await AuthService.getMe()
      const normalizedUser = normalizeUser(userData)
      
      // Salvar organizationId no localStorage se disponível
      if (normalizedUser.organizationId && typeof window !== 'undefined') {
        localStorage.setItem('organizationId', normalizedUser.organizationId)
        console.log('🏢 OrganizationId salvo no localStorage:', normalizedUser.organizationId)
      }
      
      setUser(normalizedUser)
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Iniciando login...')
      console.log('📧 Email:', email)
      
      // Validação básica antes de chamar a API
      const trimmedEmail = email.trim()
      const trimmedPassword = password.trim()
      
      if (!trimmedEmail || !trimmedPassword) {
        throw new Error('Email e senha são obrigatórios')
      }

      // Validação de email mais robusta
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedEmail)) {
        throw new Error('Por favor, insira um email válido')
      }

      if (trimmedPassword.length < 3) {
        throw new Error('Senha inválida')
      }
      
      // Usar os valores trimados
      email = trimmedEmail
      password = trimmedPassword
      
      const data = await AuthService.login({ email, password })
      
      // Verificar se recebemos uma resposta válida
      if (!data || !data.token) {
        throw new Error('Resposta inválida do servidor. Credenciais podem estar incorretas.')
      }

      if (!data.user) {
        throw new Error('Dados do usuário não recebidos. Credenciais podem estar incorretas.')
      }
      
      console.log('✅ AuthContext: Login bem-sucedido!', data)
      console.log('👤 Estrutura do usuário:', JSON.stringify(data.user, null, 2))
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', data.token)
        console.log('💾 Token salvo no localStorage')
      }
      
      const normalizedUser = normalizeUser(data.user)
      console.log('👤 Usuário normalizado:', normalizedUser)
      
      // Salvar organizationId no localStorage se disponível
      if (normalizedUser.organizationId && typeof window !== 'undefined') {
        localStorage.setItem('organizationId', normalizedUser.organizationId)
        console.log('🏢 OrganizationId salvo no localStorage:', normalizedUser.organizationId)
      }
      
      setUser(normalizedUser)
    } catch (error: any) {
      console.error('❌ AuthContext: Erro no login:', error)
      // Preservar mensagem de erro original ou fornecer uma genérica mas útil
      const errorMessage = error.message || 'Credenciais inválidas. Verifique seu email e senha e tente novamente.'
      throw new Error(errorMessage)
    }
  }

  const logout = () => {
    console.log('🚪 AuthContext: Fazendo logout...')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('organizationId')
      console.log('🗑️ Token e organizationId removidos do localStorage')
    }
    setUser(null)
    console.log('👤 Usuário removido do estado')
  }

  const register = async (userData: RegisterRequest) => {
    try {
      console.log('🔐 AuthContext: Iniciando registro...')
      console.log('📝 Dados do registro:', userData)
      
      const data = await AuthService.register(userData)
      console.log('✅ AuthContext: Registro bem-sucedido!', data)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', data.token)
        console.log('💾 Token salvo no localStorage')
      }
      
      const normalizedUser = normalizeUser(data.user)
      console.log('👤 Usuário normalizado:', normalizedUser)
      
      // Salvar organizationId no localStorage se disponível
      if (normalizedUser.organizationId && typeof window !== 'undefined') {
        localStorage.setItem('organizationId', normalizedUser.organizationId)
        console.log('🏢 OrganizationId salvo no localStorage:', normalizedUser.organizationId)
      }
      
      setUser(normalizedUser)
    } catch (error: any) {
      console.error('❌ AuthContext: Erro no registro:', error)
      throw new Error(error.message || 'Erro ao criar conta')
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

