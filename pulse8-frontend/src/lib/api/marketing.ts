import apiClient from './client'

if (!apiClient) {
  console.error('❌ apiClient não foi inicializado!')
}

export interface MarketingDto {
  id: string
  name: string
  description: string
  type: string // Campaign, Event, Social Media, etc.
  status: string // Active, Inactive, Completed
  startDate: string
  endDate?: string
  budget?: number
  actualCost?: number
  targetAudience?: string
  channels: string[] // Social Media, Email, Print, etc.
  metrics?: {
    reach?: number
    engagement?: number
    conversions?: number
  }
  organizationId: string
  organizationName: string
  createdAt: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateMarketingRequest {
  name: string
  description: string
  type: string
  status?: string
  startDate: string
  endDate?: string
  budget?: number
  targetAudience?: string
  channels: string[]
}

export interface GetMarketingQuery {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  status?: string
  type?: string
  eventId?: string
  sortBy?: string
  sortDescending?: boolean
}

export interface GetMarketingResponse {
  marketing: MarketingDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface GetMarketingCampaignsResponse {
  campaigns: MarketingDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export class MarketingService {
  static async getMarketing(query: GetMarketingQuery = {}): Promise<GetMarketingResponse> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    const params = new URLSearchParams()
    
    if (query.pageNumber) params.append('pageNumber', query.pageNumber.toString())
    if (query.pageSize) params.append('pageSize', query.pageSize.toString())
    if (query.searchTerm) params.append('searchTerm', query.searchTerm)
    if (query.status) params.append('status', query.status)
    if (query.type) params.append('type', query.type)
    if (query.sortBy) params.append('sortBy', query.sortBy)
    if (query.sortDescending !== undefined) params.append('sortDescending', query.sortDescending.toString())

    const queryString = params.toString()
    const url = queryString ? `/marketing/assets?${queryString}` : '/marketing/assets'
    
    console.log('🔍 MarketingService.getMarketing: Iniciando...')
    console.log('🔍 MarketingService.getMarketing: query =', query)
    console.log('🔍 MarketingService.getMarketing: apiClient =', apiClient)
    console.log('🔍 MarketingService.getMarketing: url =', url)
    
    return apiClient.get<GetMarketingResponse>(url)
  }

  static async getMarketingCampaigns(query: GetMarketingQuery = {}): Promise<GetMarketingCampaignsResponse> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    const params = new URLSearchParams()
    
    if (query.pageNumber) params.append('pageNumber', query.pageNumber.toString())
    if (query.pageSize) params.append('pageSize', query.pageSize.toString())
    if (query.searchTerm) params.append('searchTerm', query.searchTerm)
    if (query.status) params.append('status', query.status)
    if (query.type) params.append('type', query.type)
    if (query.eventId) params.append('eventId', query.eventId)
    if (query.sortBy) params.append('sortBy', query.sortBy)
    if (query.sortDescending !== undefined) params.append('sortDescending', query.sortDescending.toString())

    const queryString = params.toString()
    const url = queryString ? `/marketing?${queryString}` : '/marketing'
    
    console.log('🔍 MarketingService.getMarketingCampaigns: Iniciando...')
    console.log('🔍 MarketingService.getMarketingCampaigns: query =', query)
    console.log('🔍 MarketingService.getMarketingCampaigns: apiClient =', apiClient)
    console.log('🔍 MarketingService.getMarketingCampaigns: url =', url)
    
    return apiClient.get<GetMarketingCampaignsResponse>(url)
  }

  static async getMarketingById(id: string): Promise<MarketingDto> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    return apiClient.get<MarketingDto>(`/marketing/${id}`)
  }

  static async createMarketing(marketingData: CreateMarketingRequest): Promise<string> {
    console.log('🔍 MarketingService.createMarketing: Iniciando...')
    console.log('🔍 MarketingService.createMarketing: marketingData =', marketingData)
    console.log('🔍 MarketingService.createMarketing: apiClient =', apiClient)
    
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 MarketingService.createMarketing: Fazendo POST para /marketing')
    const response = await apiClient.post<{ id: string }>('/marketing', marketingData)
    console.log('✅ MarketingService.createMarketing: Resposta =', response)
    return response.id
  }

  static async updateMarketing(id: string, marketingData: CreateMarketingRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    const response = await apiClient.put<{ id: string }>(`/marketing/${id}`, marketingData)
    return response.id
  }

  static async deleteMarketing(id: string): Promise<void> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    await apiClient.delete(`/marketing/assets/${id}`)
  }
}
