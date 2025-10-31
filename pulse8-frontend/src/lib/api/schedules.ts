import apiClient from './client'

export interface ScheduleDto {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  type: string
  status: string
  notes?: string
  eventId: string
  eventName?: string
  organizationId: string
  organizationName: string
  createdAt: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateScheduleRequest {
  title: string
  description: string
  startTime: string
  endTime: string
  eventId: string
}

export interface UpdateScheduleRequest extends CreateScheduleRequest {
  id: string
}

export interface GetSchedulesQuery {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  status?: string
  type?: string
  sortBy?: string
  sortDescending?: boolean
  organizationId?: string
}

export interface GetSchedulesResponse {
  schedules: ScheduleDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export class SchedulesService {
  static async getSchedules(query: GetSchedulesQuery = {}): Promise<GetSchedulesResponse> {
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
    if (query.organizationId) params.append('organizationId', query.organizationId)

    const queryString = params.toString()
    const url = queryString ? `/schedule?${queryString}` : '/schedule'
    
    console.log('🔍 SchedulesService.getSchedules: Fazendo GET para', url)
    const response = await apiClient.get<any>(url)
    console.log('✅ SchedulesService.getSchedules: Resposta bruta =', response)
    
    // Mapear a resposta do backend para o formato esperado pelo frontend
    const mappedResponse: GetSchedulesResponse = {
      schedules: response.schedules || response.Schedules || [],
      totalCount: response.totalCount || 0,
      pageNumber: response.pageNumber || 1,
      pageSize: response.pageSize || 10,
      totalPages: response.totalPages || 0
    }
    
    console.log('✅ SchedulesService.getSchedules: Resposta mapeada =', mappedResponse)
    return mappedResponse
  }

  static async getScheduleById(id: string): Promise<ScheduleDto> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    console.log('🔍 SchedulesService.getScheduleById: Fazendo GET para /schedule/' + id)
    const response = await apiClient.get<ScheduleDto>(`/schedule/${id}`)
    console.log('✅ SchedulesService.getScheduleById: Resposta =', response)
    return response
  }

  static async createSchedule(scheduleData: CreateScheduleRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 SchedulesService.createSchedule: Fazendo POST para /schedule')
    console.log('🔍 SchedulesService.createSchedule: Dados =', scheduleData)
    const response = await apiClient.post<{ id: string }>('/schedule', scheduleData)
    console.log('✅ SchedulesService.createSchedule: Resposta =', response)
    return response.id
  }

  static async updateSchedule(id: string, scheduleData: UpdateScheduleRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 SchedulesService.updateSchedule: Fazendo PUT para /schedule/' + id)
    console.log('🔍 SchedulesService.updateSchedule: Dados =', scheduleData)
    const response = await apiClient.put<{ id: string }>(`/schedule/${id}`, scheduleData)
    console.log('✅ SchedulesService.updateSchedule: Resposta =', response)
    return response.id
  }

  static async deleteSchedule(id: string): Promise<void> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 SchedulesService.deleteSchedule: Fazendo DELETE para /schedule/' + id)
    await apiClient.delete(`/schedule/${id}`)
    console.log('✅ SchedulesService.deleteSchedule: Agendamento deletado')
  }
}