import apiClient from './client'

// Verificar se apiClient foi inicializado corretamente
if (!apiClient) {
  console.error('❌ apiClient não foi inicializado!')
}

export interface EventDto {
  id: string
  name: string
  description: string
  location: string
  address?: string
  city?: string
  state?: string
  capacity?: number
  startDate: string
  endDate: string
  setupDate?: string
  teardownDate?: string
  ticketPrice?: number
  imageUrl?: string
  bannerUrl?: string
  website?: string
  socialMedia?: string
  totalBudget?: number
  totalCost?: number
  totalRevenue?: number
  profit?: number
  roi?: number
  status: string | number | null
  createdAt: string
}

export interface CreateEventRequest {
  name: string
  description: string
  location: string
  address?: string
  city?: string
  state?: string
  capacity?: number
  startDate: string
  endDate: string
  setupDate?: string
  teardownDate?: string
  ticketPrice?: number
  imageUrl?: string
  bannerUrl?: string
  website?: string
  socialMedia?: string
  totalBudget?: number
  status?: string
}

export interface UpdateEventRequest extends CreateEventRequest {
  id: string
}

export interface GetEventsResponse {
  events: EventDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface GetEventsQuery {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  status?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortDescending?: boolean
  organizationId?: string
}

export class EventsService {
  static async getEvents(query: GetEventsQuery = {}): Promise<GetEventsResponse> {
    console.log('🔍 EventsService.getEvents: Iniciando...')
    console.log('🔍 EventsService.getEvents: query =', query)
    console.log('🔍 EventsService.getEvents: apiClient =', apiClient)
    
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    if (!apiClient.get) {
      throw new Error('Método get não encontrado no ApiClient')
    }
    
    const params = new URLSearchParams()
    
    if (query.pageNumber) params.append('pageNumber', query.pageNumber.toString())
    if (query.pageSize) params.append('pageSize', query.pageSize.toString())
    if (query.searchTerm) params.append('searchTerm', query.searchTerm)
    if (query.status) params.append('status', query.status)
    if (query.startDate) params.append('startDate', query.startDate)
    if (query.endDate) params.append('endDate', query.endDate)
    if (query.sortBy) params.append('sortBy', query.sortBy)
    if (query.sortDescending !== undefined) params.append('sortDescending', query.sortDescending.toString())
    if (query.organizationId) params.append('organizationId', query.organizationId)

    const queryString = params.toString()
    const url = queryString ? `/events?${queryString}` : '/events'
    
    console.log('🔍 EventsService.getEvents: url =', url)
    
    return apiClient.get<GetEventsResponse>(url)
  }

  static async getEventById(id: string): Promise<EventDto> {
    return apiClient.get<EventDto>(`/events/${id}`)
  }

  static async createEvent(eventData: CreateEventRequest): Promise<string> {
    return apiClient.post<string>('/events', eventData)
  }

  static async updateEvent(id: string, eventData: UpdateEventRequest): Promise<string> {
    return apiClient.put<string>(`/events/${id}`, eventData)
  }

  static async deleteEvent(id: string): Promise<string> {
    return apiClient.delete<string>(`/events/${id}`)
  }
}
