import apiClient from './client'

if (!apiClient) {
  console.error('❌ apiClient não foi inicializado!')
}

export interface GuestDto {
  id: string
  name: string
  email: string
  phone: string
  document: string
  checkInDate?: string | null
  eventId: string
  eventName: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateGuestRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  document: string
  eventId: string
}

export interface UpdateGuestRequest {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  phone: string
  document: string
  eventId: string
}

export interface GetGuestsQuery {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  status?: string
  eventId?: string
  city?: string
  state?: string
  sortBy?: string
  sortDescending?: boolean
  organizationId?: string
}

export interface GetGuestsResponse {
  guests: GuestDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export class GuestsService {
  static async getGuests(query: GetGuestsQuery = {}): Promise<GetGuestsResponse> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    const params = new URLSearchParams()
    
    if (query.pageNumber) params.append('pageNumber', query.pageNumber.toString())
    if (query.pageSize) params.append('pageSize', query.pageSize.toString())
    if (query.searchTerm) params.append('searchTerm', query.searchTerm)
    if (query.status) params.append('status', query.status)
    if (query.eventId) params.append('eventId', query.eventId)
    if (query.city) params.append('city', query.city)
    if (query.state) params.append('state', query.state)
    if (query.sortBy) params.append('sortBy', query.sortBy)
    if (query.sortDescending !== undefined) params.append('sortDescending', query.sortDescending.toString())
    if (query.organizationId) params.append('organizationId', query.organizationId)

    const queryString = params.toString()
    const url = queryString ? `/guests?${queryString}` : '/guests'
    
    console.log('🔍 GuestsService.getGuests: Iniciando...')
    console.log('🔍 GuestsService.getGuests: query =', query)
    console.log('🔍 GuestsService.getGuests: apiClient =', apiClient)
    console.log('🔍 GuestsService.getGuests: url =', url)
    
    return apiClient.get<GetGuestsResponse>(url)
  }

  static async getGuestById(id: string): Promise<GuestDto> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    return apiClient.get<GuestDto>(`/guests/${id}`)
  }

  static async createGuest(guestData: CreateGuestRequest): Promise<string> {
    console.log('🔍 GuestsService.createGuest: Iniciando...')
    console.log('🔍 GuestsService.createGuest: guestData =', guestData)
    console.log('🔍 GuestsService.createGuest: apiClient =', apiClient)
    
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 GuestsService.createGuest: Fazendo POST para /guests')
    const response = await apiClient.post<{ id: string }>('/guests', guestData)
    console.log('✅ GuestsService.createGuest: Resposta =', response)
    return response.id
  }

  static async updateGuest(id: string, guestData: CreateGuestRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    // Criar UpdateGuestRequest com o id incluído
    const fullName = `${guestData.firstName} ${guestData.lastName}`.trim()
    const updateData: UpdateGuestRequest = {
      id: id,
      firstName: guestData.firstName,
      lastName: guestData.lastName,
      name: fullName,
      email: guestData.email,
      phone: guestData.phone,
      document: guestData.document,
      eventId: guestData.eventId
    }
    
    const response = await apiClient.put<{ id: string }>(`/guests/${id}`, updateData)
    return response.id
  }

  static async deleteGuest(id: string): Promise<void> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    await apiClient.delete(`/guests/${id}`)
  }

  /**
   * Gera um QR Code para o convidado
   */
  static async generateQRCode(guestId: string): Promise<{ qrCode: string; qrCodeUrl?: string }> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    try {
      // Tentar chamar o endpoint do backend se existir
      const response = await apiClient.post<{ qrCode: string; qrCodeUrl?: string }>(`/guests/${guestId}/qr-code`, {})
      return response
    } catch (error: any) {
      // Se o endpoint não existir, gerar um código único baseado no ID do guest
      // Este código pode ser usado pelo backend para gerar o QR Code real
      console.warn('Endpoint de QR Code não encontrado, gerando código único:', error)
      const qrCode = `GUEST-${guestId}-${Date.now()}`
      return { qrCode }
    }
  }
}


export interface CheckInRequest {
  guestId: string
  eventId: string
  checkInTime?: string
  notes?: string
}

export interface CheckInResponse {
  guestId: string
  eventId: string
  checkInTime: string
  guestName: string
  eventName: string
}

export class CheckInService {
  static async checkInGuest(checkInData: CheckInRequest): Promise<CheckInResponse> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 CheckInService.checkInGuest: Iniciando...')
    console.log('🔍 CheckInService.checkInGuest: checkInData =', checkInData)
    
    return apiClient.post<CheckInResponse>('/guests/checkin', {
      guestId: checkInData.guestId,
      eventId: checkInData.eventId,
      checkInTime: checkInData.checkInTime || new Date().toISOString(),
      notes: checkInData.notes
    })
  }
}

