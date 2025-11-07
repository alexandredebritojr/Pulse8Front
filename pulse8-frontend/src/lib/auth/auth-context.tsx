'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@/types/api'
import { AuthService, RegisterRequest, UserOrganizationInfo, GoogleOAuthRequest, InstagramOAuthRequest } from '@/lib/api/auth'
import { normalizeUser } from '@/lib/utils/user'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ userOrganizations?: UserOrganizationInfo[] }>
  loginWithGoogle: (oauthData: GoogleOAuthRequest) => Promise<{ userOrganizations?: UserOrganizationInfo[] }>
  loginWithInstagram: (oauthData: InstagramOAuthRequest) => Promise<{ userOrganizations?: UserOrganizationInfo[] }>
  logout: () => void
  register: (userData: RegisterRequest) => Promise<void>
  updateUserOrganization: (organizationId: string, userOrganizationType: number, userOrganizationTypeName: string) => void
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
      
      // Salvar ou remover organizationId no localStorage baseado nos dados do usuário
      if (typeof window !== 'undefined') {
        if (normalizedUser.organizationId) {
          localStorage.setItem('organizationId', normalizedUser.organizationId)
          console.log('🏢 OrganizationId salvo no localStorage:', normalizedUser.organizationId)
        } else {
          localStorage.removeItem('organizationId')
          console.log('🗑️ OrganizationId removido do localStorage (usuário sem organização)')
        }
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
      console.log('🏢 Organizações recebidas:', data.userOrganizations?.length || 0)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', data.token)
        console.log('💾 Token salvo no localStorage')
      }
      
      const normalizedUser = normalizeUser(data.user)
      console.log('👤 Usuário normalizado:', normalizedUser)
      
      // Não definir organização ainda se houver múltiplas - deixar o usuário escolher
      // Se houver apenas uma organização ou nenhuma, definir como antes
      if (typeof window !== 'undefined') {
        if (!data.userOrganizations || data.userOrganizations.length === 0) {
          // Usuário sem organizações
          localStorage.removeItem('organizationId')
          console.log('🗑️ OrganizationId removido do localStorage (usuário sem organização)')
        } else if (data.userOrganizations.length === 1) {
          // Usuário com apenas uma organização - definir automaticamente
          const orgId = data.userOrganizations[0].organizationId
          localStorage.setItem('organizationId', orgId)
          console.log('🏢 OrganizationId salvo no localStorage (única organização):', orgId)
          normalizedUser.organizationId = orgId
          normalizedUser.userOrganizationType = data.userOrganizations[0].userOrganizationType
          normalizedUser.userOrganizationTypeName = data.userOrganizations[0].userOrganizationTypeName
        }
        // Se houver múltiplas organizações, não definir ainda - o modal vai permitir escolher
      }
      
      setUser(normalizedUser)
      
      // Retornar as organizações para o componente de login decidir se mostra o modal
      return { userOrganizations: data.userOrganizations }
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
      
      // Salvar ou remover organizationId no localStorage baseado nos dados do usuário
      if (typeof window !== 'undefined') {
        if (normalizedUser.organizationId) {
          localStorage.setItem('organizationId', normalizedUser.organizationId)
          console.log('🏢 OrganizationId salvo no localStorage:', normalizedUser.organizationId)
        } else {
          localStorage.removeItem('organizationId')
          console.log('🗑️ OrganizationId removido do localStorage (usuário sem organização)')
        }
      }
      
      setUser(normalizedUser)
    } catch (error: any) {
      console.error('❌ AuthContext: Erro no registro:', error)
      throw new Error(error.message || 'Erro ao criar conta')
    }
  }

  const loginWithGoogle = async (oauthData: GoogleOAuthRequest) => {
    try {
      console.log('🔐 AuthContext: Iniciando login com Google OAuth...')
      
      const data = await AuthService.loginWithGoogle(oauthData)
      
      // Verificar se recebemos uma resposta válida
      if (!data || !data.token) {
        throw new Error('Resposta inválida do servidor.')
      }

      if (!data.user) {
        throw new Error('Dados do usuário não recebidos.')
      }
      
      console.log('✅ AuthContext: Login com Google bem-sucedido!', data)
      console.log('👤 Estrutura do usuário:', JSON.stringify(data.user, null, 2))
      console.log('🏢 Organizações recebidas:', data.userOrganizations?.length || 0)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', data.token)
        console.log('💾 Token salvo no localStorage')
      }
      
      const normalizedUser = normalizeUser(data.user)
      console.log('👤 Usuário normalizado:', normalizedUser)
      
      // Não definir organização ainda se houver múltiplas - deixar o usuário escolher
      // Se houver apenas uma organização ou nenhuma, definir como antes
      if (typeof window !== 'undefined') {
        if (!data.userOrganizations || data.userOrganizations.length === 0) {
          // Usuário sem organizações
          localStorage.removeItem('organizationId')
          console.log('🗑️ OrganizationId removido do localStorage (usuário sem organização)')
        } else if (data.userOrganizations.length === 1) {
          // Usuário com apenas uma organização - definir automaticamente
          const orgId = data.userOrganizations[0].organizationId
          localStorage.setItem('organizationId', orgId)
          console.log('🏢 OrganizationId salvo no localStorage (única organização):', orgId)
          normalizedUser.organizationId = orgId
          normalizedUser.userOrganizationType = data.userOrganizations[0].userOrganizationType
          normalizedUser.userOrganizationTypeName = data.userOrganizations[0].userOrganizationTypeName
        }
        // Se houver múltiplas organizações, não definir ainda - o modal vai permitir escolher
      }
      
      setUser(normalizedUser)
      
      // Retornar as organizações para o componente de login decidir se mostra o modal
      return { userOrganizations: data.userOrganizations }
    } catch (error: any) {
      console.error('❌ AuthContext: Erro no login com Google:', error)
      const errorMessage = error.message || 'Erro ao fazer login com Google'
      throw new Error(errorMessage)
    }
  }

  const loginWithInstagram = async (oauthData: InstagramOAuthRequest) => {
    try {
      console.log('🔐 AuthContext: Iniciando login com Instagram OAuth...')
      
      const data = await AuthService.loginWithInstagram(oauthData)
      
      // Verificar se recebemos uma resposta válida
      if (!data || !data.token) {
        throw new Error('Resposta inválida do servidor.')
      }

      if (!data.user) {
        throw new Error('Dados do usuário não recebidos.')
      }
      
      console.log('✅ AuthContext: Login com Instagram bem-sucedido!', data)
      console.log('👤 Estrutura do usuário:', JSON.stringify(data.user, null, 2))
      console.log('🏢 Organizações recebidas:', data.userOrganizations?.length || 0)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', data.token)
        console.log('💾 Token salvo no localStorage')
      }
      
      const normalizedUser = normalizeUser(data.user)
      console.log('👤 Usuário normalizado:', normalizedUser)
      
      // Não definir organização ainda se houver múltiplas - deixar o usuário escolher
      // Se houver apenas uma organização ou nenhuma, definir como antes
      if (typeof window !== 'undefined') {
        if (!data.userOrganizations || data.userOrganizations.length === 0) {
          // Usuário sem organizações
          localStorage.removeItem('organizationId')
          console.log('🗑️ OrganizationId removido do localStorage (usuário sem organização)')
        } else if (data.userOrganizations.length === 1) {
          // Usuário com apenas uma organização - definir automaticamente
          const orgId = data.userOrganizations[0].organizationId
          localStorage.setItem('organizationId', orgId)
          console.log('🏢 OrganizationId salvo no localStorage (única organização):', orgId)
          normalizedUser.organizationId = orgId
          normalizedUser.userOrganizationType = data.userOrganizations[0].userOrganizationType
          normalizedUser.userOrganizationTypeName = data.userOrganizations[0].userOrganizationTypeName
        }
        // Se houver múltiplas organizações, não definir ainda - o modal vai permitir escolher
      }
      
      setUser(normalizedUser)
      
      // Retornar as organizações para o componente de login decidir se mostra o modal
      return { userOrganizations: data.userOrganizations }
    } catch (error: any) {
      console.error('❌ AuthContext: Erro no login com Instagram:', error)
      const errorMessage = error.message || 'Erro ao fazer login com Instagram'
      throw new Error(errorMessage)
    }
  }

  const updateUserOrganization = (organizationId: string, userOrganizationType: number, userOrganizationTypeName: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        organizationId,
        userOrganizationType,
        userOrganizationTypeName
      }
      setUser(updatedUser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('organizationId', organizationId)
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, loginWithInstagram, logout, register, updateUserOrganization }}>
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

