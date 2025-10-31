import apiClient from './client'

export interface RoleDto {
  id: string
  name: string
  description: string
  color: string
  accessLevel: number
  isSystemRole: boolean
  organizationId: string
  organizationName: string
  userCount: number
  createdAt: string
  updatedAt: string
}

export interface GetRolesResponse {
  roles: RoleDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface CreateRoleRequest {
  name: string
  description: string
  color: string
  accessLevel: number
  isSystemRole: boolean
}

export interface UpdateRoleRequest {
  id: string
  name: string
  description: string
  color: string
  accessLevel: number
  isSystemRole: boolean
}

export class RolesService {
  static async getRoles(params: {
    pageNumber?: number
    pageSize?: number
    searchTerm?: string
    sortBy?: string
    sortDescending?: boolean
  } = {}): Promise<GetRolesResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString())
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm)
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortDescending !== undefined) queryParams.append('sortDescending', params.sortDescending.toString())

    const url = `/roles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await apiClient.get<GetRolesResponse>(url)
    return response
  }

  static async getRoleById(id: string): Promise<RoleDto> {
    const response = await apiClient.get<RoleDto>(`/roles/${id}`)
    return response
  }

  static async createRole(data: CreateRoleRequest): Promise<RoleDto> {
    const response = await apiClient.post<RoleDto>('/roles', data)
    return response
  }

  static async updateRole(data: UpdateRoleRequest): Promise<RoleDto> {
    const response = await apiClient.put<RoleDto>(`/roles/${data.id}`, data)
    return response
  }

  static async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/roles/${id}`)
  }
}
