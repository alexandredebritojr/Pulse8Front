import apiClient from './client'

if (!apiClient) {
  console.error('❌ apiClient não foi inicializado!')
}

export interface RevenueDto {
  id: string
  source: string
  amount: number
  date: string
  reference?: string
  notes?: string
  eventId: string
  eventName: string
  organizationId: string
  organizationName: string
}

export interface CreateRevenueRequest {
  source: string
  amount: number
  date: string
  reference?: string
  notes?: string
  eventId: string
}

export interface UpdateRevenueRequest {
  id: string
  source: string
  amount: number
  date: string
  reference?: string
  notes?: string
  eventId: string
}

export interface GetRevenueQuery {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  status?: string
  category?: string
  type?: string
  eventId?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortDescending?: boolean
  organizationId?: string
}

export interface GetRevenueResponse {
  revenues: RevenueDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  totalAmount?: number
}

export class RevenueService {
  static async getRevenue(query: GetRevenueQuery = {}): Promise<GetRevenueResponse> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    const params = new URLSearchParams()
    
    if (query.pageNumber) params.append('pageNumber', query.pageNumber.toString())
    if (query.pageSize) params.append('pageSize', query.pageSize.toString())
    if (query.searchTerm) params.append('searchTerm', query.searchTerm)
    if (query.status) params.append('status', query.status)
    if (query.category) params.append('category', query.category)
    if (query.type) params.append('type', query.type)
    if (query.eventId) params.append('eventId', query.eventId)
    if (query.dateFrom) params.append('dateFrom', query.dateFrom)
    if (query.dateTo) params.append('dateTo', query.dateTo)
    if (query.sortBy) params.append('sortBy', query.sortBy)
    if (query.sortDescending !== undefined) params.append('sortDescending', query.sortDescending.toString())
    if (query.organizationId) params.append('organizationId', query.organizationId)

    const queryString = params.toString()
    const url = queryString ? `/finance/revenue?${queryString}` : '/finance/revenue'
    
    console.log('🔍 RevenueService.getRevenue: Iniciando...')
    console.log('🔍 RevenueService.getRevenue: query =', query)
    console.log('🔍 RevenueService.getRevenue: apiClient =', apiClient)
    console.log('🔍 RevenueService.getRevenue: url =', url)
    
    return apiClient.get<GetRevenueResponse>(url)
  }

  static async getRevenueById(id: string): Promise<RevenueDto> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    return apiClient.get<RevenueDto>(`/finance/revenue/${id}`)
  }

  static async createRevenue(revenueData: CreateRevenueRequest): Promise<string> {
    console.log('🔍 RevenueService.createRevenue: Iniciando...')
    console.log('🔍 RevenueService.createRevenue: revenueData =', revenueData)
    console.log('🔍 RevenueService.createRevenue: apiClient =', apiClient)
    
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 RevenueService.createRevenue: Fazendo POST para /finance/revenue')
    const response = await apiClient.post<{ id: string }>('/finance/revenue', revenueData)
    console.log('✅ RevenueService.createRevenue: Resposta =', response)
    return response.id
  }

  static async updateRevenue(id: string, revenueData: UpdateRevenueRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    // Garantir que o ID está incluído no payload
    const updateData = {
      ...revenueData,
      id: id
    }
    
    console.log('🔍 RevenueService.updateRevenue: Fazendo PUT para /finance/revenue/' + id)
    console.log('🔍 RevenueService.updateRevenue: Dados =', updateData)
    const response = await apiClient.put<{ id: string }>(`/finance/revenue/${id}`, updateData)
    console.log('✅ RevenueService.updateRevenue: Resposta =', response)
    return response.id
  }

  static async deleteRevenue(id: string): Promise<void> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    await apiClient.delete(`/finance/revenue/${id}`)
  }
}
