class ApiClient {
  private baseURL: string

  constructor() {
    console.log('🔧 ApiClient: Inicializando...')
    // Usar variável de ambiente ou fallback para localhost
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:5001'
    this.baseURL = `${backendBase.replace(/\/$/, '')}/api`
    console.log('🔧 ApiClient: baseURL =', this.baseURL)
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token')
      console.log('🔍 ApiClient: Token encontrado:', token ? 'SIM' : 'NÃO')
      if (token) {
        headers.Authorization = `Bearer ${token}`
        console.log('🔍 ApiClient: Authorization header adicionado:', `Bearer ${token.substring(0, 20)}...`)
      } else {
        console.log('⚠️ ApiClient: Nenhum token encontrado no localStorage')
      }
    }

    console.log('🔍 ApiClient: Headers finais:', headers)
    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'Erro na requisição'
      
      // Verificar o Content-Type da resposta
      const contentType = response.headers.get('content-type')
      console.log('🔍 ApiClient: Content-Type:', contentType)
      
      try {
        if (contentType && contentType.includes('application/json')) {
          // Se for JSON, tentar fazer parse
          const errorData = await response.json()
          console.log('🔍 ApiClient: errorData JSON:', errorData)
          errorMessage = errorData.message || errorData.error || errorData.title || `Erro ${response.status}: ${response.statusText}`
        } else {
          // Se for texto simples, ler como texto
          const errorText = await response.text()
          console.log('🔍 ApiClient: errorText:', errorText)
          errorMessage = errorText || `Erro ${response.status}: ${response.statusText}`
        }
      } catch (parseError) {
        console.log('🔍 ApiClient: Erro ao fazer parse da resposta:', parseError)
        // Se falhar o parse, usar a mensagem padrão
        errorMessage = `Erro ${response.status}: ${response.statusText}`
      }
      
      console.log('❌ ApiClient: Erro da API:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        contentType,
        errorMessage
      })
      
      // Só redireciona para login se for erro de token expirado (401) e não for endpoint de login
      if (response.status === 401 && !response.url.includes('/auth/login')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token')
          window.location.href = '/login'
        }
        throw new Error('Token expirado')
      }
      
      console.log('🔍 ApiClient: errorMessage final:', errorMessage)
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async get<T>(url: string): Promise<T> {
    const headers = this.getHeaders()
    const fullUrl = `${this.baseURL}${url}`
    console.log('🔍 ApiClient: Fazendo GET para:', fullUrl)
    console.log('🔍 ApiClient: Com headers:', headers)
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    })
    
    console.log('🔍 ApiClient: Status da resposta:', response.status)
    console.log('🔍 ApiClient: Headers da resposta:', Object.fromEntries(response.headers.entries()))
    
    return this.handleResponse<T>(response)
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const fullUrl = `${this.baseURL}${url}`
    const headers = this.getHeaders()
    
    console.log('🔍 ApiClient: Fazendo POST para:', fullUrl)
    console.log('🔍 ApiClient: Com headers:', headers)
    console.log('🔍 ApiClient: Com dados:', data)
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })
    
    console.log('🔍 ApiClient: Status da resposta:', response.status)
    console.log('🔍 ApiClient: Headers da resposta:', Object.fromEntries(response.headers.entries()))
    
    return this.handleResponse<T>(response)
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })
    return this.handleResponse<T>(response)
  }

  async delete<T>(url: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    return this.handleResponse<T>(response)
  }
}

// Garantir que sempre temos uma instância válida
let apiClientInstance: ApiClient

try {
  apiClientInstance = new ApiClient()
  console.log('✅ ApiClient inicializado com sucesso')
} catch (error) {
  console.error('❌ Erro ao inicializar ApiClient:', error)
  // Criar uma instância de fallback
  apiClientInstance = new ApiClient()
}

export default apiClientInstance

