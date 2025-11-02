import apiClient from './client'

if (!apiClient) {
  console.error('❌ apiClient não foi inicializado!')
}

export interface CheckinDto {
  id: string
  guestId: string
  guestName: string
  guestEmail: string
  eventId: string
  eventName: string
  eventStartDate: string
  checkinTime: string
  checkoutTime?: string
  status: string
  notes?: string
  location?: string
  staffMember?: string
  createdAt: string
  updatedAt?: string
}

export interface GetCheckinsQuery {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  status?: string
  sortBy?: string
  sortDescending?: boolean
  organizationId?: string
}

export interface GetCheckinResponse {
  checkIns: CheckinDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  checkedInCount: number
  checkedOutCount: number
}

export interface CreateCheckinRequest {
  guestId: string
  eventId: string
  checkinTime: string
  checkoutTime?: string
  status: string
  notes?: string
  location?: string
  staffMember?: string
}

export interface UpdateCheckinRequest extends CreateCheckinRequest {
  id: string
}

export class CheckinService {
  static async getCheckins(query: GetCheckinsQuery = {}): Promise<GetCheckinResponse> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    const params = new URLSearchParams()
    
    if (query.pageNumber) params.append('pageNumber', query.pageNumber.toString())
    if (query.pageSize) params.append('pageSize', query.pageSize.toString())
    if (query.searchTerm) params.append('searchTerm', query.searchTerm)
    if (query.status) params.append('status', query.status)
    if (query.sortBy) params.append('sortBy', query.sortBy)
    if (query.sortDescending !== undefined) params.append('sortDescending', query.sortDescending.toString())
    if (query.organizationId) params.append('organizationId', query.organizationId)

    const queryString = params.toString()
    const url = queryString ? `/guests/checkins?${queryString}` : '/guests/checkins'
    
    console.log('🔍 CheckinService.getCheckins: Iniciando...')
    console.log('🔍 CheckinService.getCheckins: query =', query)
    console.log('🔍 CheckinService.getCheckins: url =', url)
    
    return apiClient.get<GetCheckinResponse>(url)
  }

  static async getCheckinById(id: string): Promise<CheckinDto> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    return apiClient.get<CheckinDto>(`/guests/checkins/${id}`)
  }

  static async createCheckin(checkinData: CreateCheckinRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 CheckinService.createCheckin: Iniciando...')
    console.log('🔍 CheckinService.createCheckin: checkinData =', checkinData)
    
    try {
      const response = await apiClient.post<{ id: string } | string>('/guests/checkin', checkinData)
      console.log('✅ CheckinService.createCheckin: Resposta =', response)
      
      // A resposta pode ser um objeto { id: string } ou diretamente uma string
      if (typeof response === 'string') {
        return response
      } else if (response && typeof response === 'object' && 'id' in response) {
        return response.id
      } else {
        throw new Error('Formato de resposta inválido do servidor')
      }
    } catch (error: any) {
      console.error('❌ CheckinService.createCheckin: Erro:', error)
      throw error
    }
  }

  static async updateCheckin(id: string, checkinData: UpdateCheckinRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 CheckinService.updateCheckin: Iniciando...')
    console.log('🔍 CheckinService.updateCheckin: id =', id)
    console.log('🔍 CheckinService.updateCheckin: checkinData =', checkinData)
    
    return apiClient.put<string>(`/guests/checkins/${id}`, checkinData)
  }

  static async deleteCheckin(id: string): Promise<void> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 CheckinService.deleteCheckin: Iniciando...')
    console.log('🔍 CheckinService.deleteCheckin: id =', id)
    
    return apiClient.delete<void>(`/guests/checkins/${id}`)
  }
}