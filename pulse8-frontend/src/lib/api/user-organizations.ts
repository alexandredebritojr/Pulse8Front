import apiClient from './client'

if (!apiClient) {
  console.error('❌ apiClient não foi inicializado!')
}

export interface UserOrganizationDto {
  id: string
  userId: string
  userName: string
  userEmail: string
  organizationId: string
  organizationName: string
  roleId: string
  roleName: string
  status: string
  joinedAt: string
  leftAt?: string
  createdAt: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateUserOrganizationRequest {
  userId: string
  organizationId: string
  roleId: string
}

export interface UpdateUserOrganizationRequest extends CreateUserOrganizationRequest {
  id: string
}

export interface GetUserOrganizationsQuery {
  userId?: string
  organizationId?: string
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  status?: string
  sortBy?: string
  sortDescending?: boolean
}

export interface GetUserOrganizationsResponse {
  userOrganizations: UserOrganizationDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export class UserOrganizationsService {
  static async getUserOrganizations(query: GetUserOrganizationsQuery): Promise<GetUserOrganizationsResponse> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    const params = new URLSearchParams()
    
    if (query.userId) params.append('userId', query.userId)
    if (query.organizationId) params.append('organizationId', query.organizationId)
    if (query.pageNumber) params.append('pageNumber', query.pageNumber.toString())
    if (query.pageSize) params.append('pageSize', query.pageSize.toString())
    if (query.searchTerm) params.append('searchTerm', query.searchTerm)
    if (query.status) params.append('status', query.status)
    if (query.sortBy) params.append('sortBy', query.sortBy)
    if (query.sortDescending !== undefined) params.append('sortDescending', query.sortDescending.toString())

    const queryString = params.toString()
    const url = queryString ? `/user-organizations?${queryString}` : '/user-organizations'
    
    return apiClient.get<GetUserOrganizationsResponse>(url)
  }

  static async getUserOrganizationById(id: string): Promise<UserOrganizationDto> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    return apiClient.get<UserOrganizationDto>(`/user-organizations/${id}`)
  }

  static async createUserOrganization(data: CreateUserOrganizationRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    const response = await apiClient.post<{ id: string }>('/user-organizations', data)
    return response.id
  }

  static async updateUserOrganization(id: string, data: CreateUserOrganizationRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    const response = await apiClient.put<{ id: string }>(`/user-organizations/${id}`, data)
    return response.id
  }

  static async deleteUserOrganization(id: string): Promise<void> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    await apiClient.delete(`/user-organizations/${id}`)
  }
}

