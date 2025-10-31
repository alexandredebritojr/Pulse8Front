import apiClient from './client'

export interface PersonDto {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  document: string
  pixKey?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  birthDate?: string
  profilePicture?: string
  role?: string
  status: string
  organizationId: string
  organizationName: string
  eventId: string
  eventName?: string
  createdAt: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  promoterCount: number
  guestCount: number
}

export interface GetPeopleQuery {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  status?: string
  sortBy?: string
  sortDescending?: boolean
  organizationId?: string
}

export interface GetPeopleResponse {
  people: PersonDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

// Alias para compatibilidade com código existente
export type TeamMemberDto = PersonDto
export type GetTeamMembersResponse = GetPeopleResponse

// Interface para criar membro da equipe
export interface CreateTeamMemberRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  document: string
  pixKey?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  birthDate?: string
  profilePicture?: string
  role?: string
  status: string
  eventId: string
}

export class TeamService {
  static async getPeople(query: GetPeopleQuery = {}): Promise<GetPeopleResponse> {
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
    const url = queryString ? `/people?${queryString}` : '/people'
    
    return apiClient.get<GetPeopleResponse>(url)
  }

  // Alias para compatibilidade com código existente
  static async getTeamMembers(query: GetPeopleQuery = {}): Promise<GetTeamMembersResponse> {
    return this.getPeople(query)
  }

  // Obter membro da equipe por ID
  static async getTeamMemberById(id: string): Promise<PersonDto> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    return apiClient.get<PersonDto>(`/people/${id}`)
  }

  // Criar novo membro da equipe
  static async createTeamMember(memberData: CreateTeamMemberRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    const response = await apiClient.post<{ id: string }>('/people', memberData)
    return response.id
  }

  // Atualizar membro da equipe
  static async updateTeamMember(id: string, memberData: CreateTeamMemberRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    const response = await apiClient.put<{ id: string }>(`/people/${id}`, memberData)
    return response.id
  }

  // Deletar membro da equipe
  static async deleteTeamMember(id: string): Promise<void> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    await apiClient.delete(`/people/${id}`)
  }
}



