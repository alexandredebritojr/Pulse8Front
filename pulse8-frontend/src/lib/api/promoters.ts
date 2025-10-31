import apiClient from './client'

if (!apiClient) {
  console.error('❌ apiClient não foi inicializado!')
}

export interface PromoterDto {
  id: string
  promoterCode?: string
  utmCode?: string
  commissionRate: number
  totalSales: number
  totalCommission: number
  status: string
  eventId: string
  eventName: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  campaignId?: string
  campaignName?: string
  createdAt: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export interface CreatePromoterRequest {
  eventId: string
  userId: string
  promoterCode?: string
  utmCode?: string
  commissionRate: number
  campaignId?: string
}

export interface UpdatePromoterRequest extends CreatePromoterRequest {
  id: string
}

export interface GetPromotersQuery {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  status?: string
  campaignId?: string
  sortBy?: string
  sortDescending?: boolean
}

export interface GetPromotersResponse {
  promoters: PromoterDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  totalSales: number
  totalCommissions: number
}

export class PromotersService {
  static async getPromoters(query: GetPromotersQuery): Promise<GetPromotersResponse> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    const params = new URLSearchParams()
    
    if (query.pageNumber) params.append('pageNumber', query.pageNumber.toString())
    if (query.pageSize) params.append('pageSize', query.pageSize.toString())
    if (query.searchTerm) params.append('searchTerm', query.searchTerm)
    if (query.status) params.append('status', query.status)
    if (query.campaignId) params.append('campaignId', query.campaignId)
    if (query.sortBy) params.append('sortBy', query.sortBy)
    if (query.sortDescending !== undefined) params.append('sortDescending', query.sortDescending.toString())

    const queryString = params.toString()
    const url = queryString ? `/Promoters/all?${queryString}` : '/Promoters/all'
    
    console.log('🔍 PromotersService.getPromoters: Iniciando...')
    console.log('🔍 PromotersService.getPromoters: query =', query)
    console.log('🔍 PromotersService.getPromoters: apiClient =', apiClient)
    console.log('🔍 PromotersService.getPromoters: url =', url)
    
    return apiClient.get<GetPromotersResponse>(url)
  }

  static async getPromoterById(id: string): Promise<PromoterDto> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    return apiClient.get<PromoterDto>(`/Promoters/${id}`)
  }

  static async createPromoter(promoterData: CreatePromoterRequest): Promise<string> {
    console.log('🔍 PromotersService.createPromoter: Iniciando...')
    console.log('🔍 PromotersService.createPromoter: promoterData =', promoterData)
    console.log('🔍 PromotersService.createPromoter: apiClient =', apiClient)
    
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 PromotersService.createPromoter: Fazendo POST para /Promoters')
    const response = await apiClient.post<{ id: string }>('/Promoters', promoterData)
    console.log('✅ PromotersService.createPromoter: Resposta =', response)
    return response.id
  }

  static async updatePromoter(id: string, promoterData: CreatePromoterRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    const updateData = {
      id: id,
      ...promoterData
    }
    const response = await apiClient.put<{ id: string }>(`/Promoters/${id}`, updateData)
    return response.id
  }

  static async deletePromoter(id: string): Promise<void> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    await apiClient.delete(`/Promoters/${id}`)
  }
}