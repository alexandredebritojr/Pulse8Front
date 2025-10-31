import ApiClient from './client'

export interface CampaignDto {
  id: string
  name: string
  description: string
  type: string
  startDate: string
  endDate: string
  budget: number
  actualCost?: number
  status: string
  organizationId: string
  organizationName: string
  targetAudience?: string
  channels?: string[]
  commissionValue?: number
  commissionRate?: number
  eventId?: string
  createdAt: string
  updatedAt?: string
}

export interface GetCampaignsResponse {
  campaigns: CampaignDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface CreateCampaignRequest {
  name: string
  description: string
  type: string
  status: string
  startDate: string
  endDate?: string
  budget?: number
  commissionValue?: number
  commissionRate?: number
  eventId?: string
  targetAudience?: string
  channels?: string[]
}

export interface UpdateCampaignRequest {
  name: string
  description: string
  type: string
  status: string
  startDate: string
  endDate?: string
  budget?: number
  commissionValue?: number
  commissionRate?: number
  eventId?: string
}

export class CampaignsService {
  private static baseUrl = '/marketing'

  static async getCampaigns(
    pageNumber: number = 1, 
    pageSize: number = 100, 
    searchTerm?: string, 
    status?: string, 
    type?: string, 
    organizationId?: string
  ): Promise<GetCampaignsResponse> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    })

    if (searchTerm) params.append('searchTerm', searchTerm)
    if (status) params.append('status', status)
    if (type) params.append('type', type)
    if (organizationId) params.append('organizationId', organizationId)

    return ApiClient.get<GetCampaignsResponse>(`${this.baseUrl}?${params.toString()}`)
  }

  static async getCampaignById(id: string): Promise<CampaignDto> {
    return ApiClient.get<CampaignDto>(`${this.baseUrl}/${id}`)
  }

  static async createCampaign(data: CreateCampaignRequest): Promise<string> {
    return ApiClient.post<string>(this.baseUrl, data)
  }

  static async updateCampaign(id: string, data: UpdateCampaignRequest): Promise<string> {
    return ApiClient.put<string>(`${this.baseUrl}/${id}`, data)
  }

  static async deleteCampaign(id: string): Promise<void> {
    await ApiClient.delete(`${this.baseUrl}/${id}`)
  }
}