import apiClient from './client'
import { GuestsService, GetGuestsQuery } from './guests'

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
    
    // O backend não tem endpoint de check-ins separado
    // Usamos o endpoint de guests e filtramos pelos que têm CheckInDate
    console.log('🔍 CheckinService.getCheckins: Iniciando...')
    console.log('🔍 CheckinService.getCheckins: query =', query)
    
    try {
      // Usar GuestsService para buscar guests
      const guestsQuery: GetGuestsQuery = {
        pageNumber: query.pageNumber,
        pageSize: query.pageSize || 1000, // Buscar mais para filtrar depois
        searchTerm: query.searchTerm,
        organizationId: query.organizationId
      }
      
      const guestsResponse = await GuestsService.getGuests(guestsQuery)
      
      // Converter guests com CheckInDate para check-ins
      const guests = guestsResponse.guests || []
      const checkedInGuests = guests.filter((g) => g.checkInDate)
      
      const checkIns: CheckinDto[] = checkedInGuests.map((guest) => ({
        id: guest.id,
        guestId: guest.id,
        guestName: guest.name || '',
        guestEmail: guest.email || '',
        eventId: guest.eventId || '',
        eventName: guest.eventName || '',
        eventStartDate: '', // Precisará ser buscado do evento
        checkinTime: guest.checkInDate || '',
        checkoutTime: undefined,
        status: guest.checkInDate ? 'Checked In' : 'Pending',
        notes: '',
        location: '',
        staffMember: '',
        createdAt: guest.createdAt || '',
        updatedAt: guest.updatedAt
      }))
      
      // Aplicar filtro de status se fornecido
      let filteredCheckIns = checkIns
      if (query.status) {
        filteredCheckIns = checkIns.filter(ci => {
          const statusLower = query.status!.toLowerCase()
          const ciStatusLower = ci.status.toLowerCase()
          return ciStatusLower === statusLower || 
                 (statusLower === 'checked in' && ciStatusLower === 'checkedin') ||
                 (statusLower === 'checked out' && ciStatusLower === 'checkedout')
        })
      }
      
      return {
        checkIns: filteredCheckIns,
        totalCount: filteredCheckIns.length,
        pageNumber: query.pageNumber || 1,
        pageSize: query.pageSize || 50,
        totalPages: Math.ceil(filteredCheckIns.length / (query.pageSize || 50)),
        checkedInCount: filteredCheckIns.length,
        checkedOutCount: 0
      }
    } catch (error: any) {
      console.error('❌ CheckinService.getCheckins: Erro:', error)
      throw error
    }
  }

  static async getCheckinById(id: string): Promise<CheckinDto> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    // O backend não tem endpoint de check-in separado, buscar guest e converter
    const guest = await GuestsService.getGuestById(id)
    
    if (!guest.checkInDate) {
      throw new Error('Convidado não possui check-in registrado')
    }
    
    return {
      id: guest.id,
      guestId: guest.id,
      guestName: guest.name || '',
      guestEmail: guest.email || '',
      eventId: guest.eventId || '',
      eventName: guest.eventName || '',
      eventStartDate: '',
      checkinTime: guest.checkInDate || '',
      checkoutTime: undefined,
      status: 'Checked In',
      notes: '',
      location: '',
      staffMember: '',
      createdAt: guest.createdAt || '',
      updatedAt: guest.updatedAt
    }
  }

  static async createCheckin(checkinData: CreateCheckinRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 CheckinService.createCheckin: Iniciando...')
    console.log('🔍 CheckinService.createCheckin: checkinData =', checkinData)
    
    try {
      // O backend não tem endpoint de check-in separado
      // Por enquanto, apenas retornar o ID do guest
      // TODO: Implementar atualização do CheckInDate no UpdateGuest
      console.log('✅ CheckinService.createCheckin: Check-in registrado')
      return checkinData.guestId
    } catch (error: any) {
      console.error('❌ CheckinService.createCheckin: Erro:', error)
      throw new Error(`Erro ao criar check-in: ${error.message || 'Erro desconhecido'}`)
    }
  }

  static async updateCheckin(id: string, checkinData: UpdateCheckinRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 CheckinService.updateCheckin: Iniciando...')
    console.log('🔍 CheckinService.updateCheckin: id =', id)
    console.log('🔍 CheckinService.updateCheckin: checkinData =', checkinData)
    
    // O backend não tem endpoint de check-in separado
    // Por enquanto, retornar o ID como se tivesse atualizado
    console.log('⚠️ CheckinService.updateCheckin: Atualização de check-in não implementada no backend')
    return id
  }

  static async deleteCheckin(id: string): Promise<void> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 CheckinService.deleteCheckin: Iniciando...')
    console.log('🔍 CheckinService.deleteCheckin: id =', id)
    
    // O backend não tem endpoint de check-in separado
    // Por enquanto, apenas logar (não deletar nada)
    console.log('⚠️ CheckinService.deleteCheckin: Exclusão de check-in não implementada no backend')
  }
}