import apiClient from './client'
import { User } from '@/types/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  // Dados do Usuário (Etapa 1)
  firstName: string
  lastName: string
  userEmail: string
  password: string
  userPhone: string
  document: string
  profilePicture?: string
  
  // Dados da Organização (Etapa 2) - opcionais se for promoter
  organizationName: string
  organizationCnpj: string
  organizationAddress: string
  organizationCity: string
  organizationState: string
  organizationZipCode: string
  organizationPhone: string
  organizationEmail: string
  
  // Dados específicos para promoter (cadastro via invite)
  organizationId?: string
  userType?: 'promoter' | 'admin' | 'organizer'
}

export interface AuthResponse {
  token: string
  expiresAt: string
  user: User
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  message: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export class AuthService {
  /**
   * Realiza login do usuário
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 AuthService: Tentando fazer login...')
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
      
      // Validação adicional: garantir que temos um token válido
      if (!response || !response.token) {
        console.error('❌ AuthService: Resposta inválida - token não recebido')
        throw new Error('Credenciais inválidas. Verifique seu email e senha.')
      }

      // Validar formato do token (deve ser JWT válido ou mock token)
      if (!response.token || (typeof response.token === 'string' && response.token.length < 10)) {
        console.error('❌ AuthService: Token inválido recebido')
        throw new Error('Credenciais inválidas. Verifique seu email e senha.')
      }
      
      console.log('✅ AuthService: Login bem-sucedido!')
      return response
    } catch (error: any) {
      console.error('❌ AuthService: Erro no login:', error)
      const errorMessage = this.getErrorMessage(error)
      
      // Garantir mensagem de erro apropriada para credenciais inválidas
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('inválid')) {
        throw new Error('Credenciais inválidas. Verifique seu email e senha e tente novamente.')
      }
      
      console.log('📝 AuthService: Mensagem de erro:', errorMessage)
      throw new Error(errorMessage)
    }
  }

  /**
   * Registra um novo usuário
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 AuthService: Tentando registrar usuário...')
      console.log('📝 Dados do registro:', userData)
      const response = await apiClient.post<AuthResponse>('/auth/register', userData)
      console.log('✅ AuthService: Registro bem-sucedido!')
      return response
    } catch (error: any) {
      console.error('❌ AuthService: Erro no registro:', error)
      const errorMessage = this.getErrorMessage(error)
      console.log('📝 AuthService: Mensagem de erro:', errorMessage)
      throw new Error(errorMessage)
    }
  }

  /**
   * Obtém dados do usuário autenticado
   */
  static async getMe(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me')
      return response
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error))
    }
  }

  /**
   * Renova o token JWT
   */
  static async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/refresh')
      return response
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error))
    }
  }

  /**
   * Altera a senha do usuário autenticado
   */
  static async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      console.log('🔐 AuthService: Tentando alterar senha...')
      const response = await apiClient.post<ChangePasswordResponse>('/auth/change-password', data)
      console.log('✅ AuthService: Senha alterada com sucesso!')
      return response
    } catch (error: any) {
      console.error('❌ AuthService: Erro ao alterar senha:', error)
      const errorMessage = this.getErrorMessage(error)
      throw new Error(errorMessage)
    }
  }

  /**
   * Verifica se o token está válido
   */
  static isTokenValid(token: string): boolean {
    if (!token) return false
    
    try {
      // Para tokens mock, verificar se tem o formato correto
      if (token.startsWith('mock-token-')) {
        return true
      }
      
      // Decodificar o JWT para verificar expiração
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      
      return payload.exp > currentTime
    } catch {
      return false
    }
  }

  /**
   * Extrai mensagem de erro da resposta da API
   */
  private static getErrorMessage(error: any): string {
    // Para fetch API, o erro já vem com a mensagem correta do handleResponse
    if (error.message) {
      return error.message
    }
    
    return 'Erro interno do servidor'
  }
}
