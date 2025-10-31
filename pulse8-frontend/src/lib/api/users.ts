import apiClient from './client'

export interface UserDto {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  document: string
  status: 'Active' | 'Inactive' | 'Pending' | 'Suspended'
  lastLoginAt?: string
  profilePicture?: string
  organizationId: string
  organizationName: string
  roleId: string
  roleName: string
  createdAt: string
  updatedAt?: string
}

export interface GetUsersResponse {
  users: UserDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface CreateUserRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  document?: string
  password: string
  organizationId: string
  roleId: string
}

export interface UpdateUserRequest {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  document?: string
  status: 'Active' | 'Inactive' | 'Pending' | 'Suspended'
  organizationId: string
  roleId: string
}

export const UsersService = {
  async getUsers(
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm?: string,
    status?: string,
    organizationId?: string,
    roleId?: string,
    sortBy?: string,
    sortDescending?: boolean
  ): Promise<GetUsersResponse> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    })
    
    if (searchTerm) params.append('searchTerm', searchTerm)
    if (status) params.append('status', status)
    if (organizationId) params.append('organizationId', organizationId)
    if (roleId) params.append('roleId', roleId)
    if (sortBy) params.append('sortBy', sortBy)
    if (sortDescending !== undefined) params.append('sortDescending', sortDescending.toString())

    const response = await apiClient.get<GetUsersResponse>(`/users?${params.toString()}`)
    return response
  },

  async createUser(data: CreateUserRequest): Promise<{ id: string }> {
    const response = await apiClient.post<{ id: string }>('/users', data)
    return response
  },

  async updateUser(id: string, data: UpdateUserRequest): Promise<{ id: string }> {
    const response = await apiClient.put<{ id: string }>(`/users/${id}`, data)
    return response
  },

  async deleteUser(id: string): Promise<{ id: string }> {
    const response = await apiClient.delete<{ id: string }>(`/users/${id}`)
    return response
  }
}
