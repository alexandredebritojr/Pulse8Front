import apiClient from './client'

export interface OrganizationDto {
  id: string
  name: string
  document?: string
  email?: string
  phone?: string
  address?: string
  status: string
  createdAt: string
  updatedAt?: string
}

export interface GetOrganizationsResponse {
  organizations: OrganizationDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface CreateOrganizationRequest {
  name: string
  document?: string
  email?: string
  phone?: string
  address?: string
}

export interface UpdateOrganizationRequest extends CreateOrganizationRequest {
  id: string
}

export const OrganizationsService = {
  async getOrganizations(
    pageNumber: number = 1,
    pageSize: number = 1000,
    searchTerm?: string,
    status?: string,
    sortBy?: string,
    sortDescending?: boolean
  ): Promise<GetOrganizationsResponse> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    })
    
    if (searchTerm) params.append('searchTerm', searchTerm)
    if (status) params.append('status', status)
    if (sortBy) params.append('sortBy', sortBy)
    if (sortDescending !== undefined) params.append('sortDescending', sortDescending.toString())

    const response = await apiClient.get<GetOrganizationsResponse>(`/organizations?${params.toString()}`)
    return response
  },

  async getOrganizationById(id: string): Promise<OrganizationDto> {
    const response = await apiClient.get<OrganizationDto>(`/organizations/${id}`)
    return response
  },

  async createOrganization(data: CreateOrganizationRequest): Promise<{ id: string }> {
    const response = await apiClient.post<{ id: string }>('/organizations', data)
    return response
  },

  async updateOrganization(id: string, data: UpdateOrganizationRequest): Promise<{ id: string }> {
    const response = await apiClient.put<{ id: string }>(`/organizations/${id}`, data)
    return response
  },

  async deleteOrganization(id: string): Promise<{ id: string }> {
    const response = await apiClient.delete<{ id: string }>(`/organizations/${id}`)
    return response
  }
}






