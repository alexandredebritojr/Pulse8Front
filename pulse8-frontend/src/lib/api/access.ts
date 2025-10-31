import apiClient from './client'

export interface AccessLogDto {
  id: string
  userId: string
  userName: string
  userEmail: string
  action: string
  resource: string
  ipAddress: string
  userAgent: string
  location?: string
  device: string
  browser: string
  os: string
  status: 'Success' | 'Failed' | 'Blocked'
  timestamp: string
  duration?: number
  details?: string
}

export interface GetAccessLogsResponse {
  accessLogs: AccessLogDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface AccessStats {
  totalLogins: number
  successfulLogins: number
  failedLogins: number
  blockedLogins: number
  uniqueUsers: number
  averageSessionDuration: number
  topActions: Array<{ action: string; count: number }>
  topResources: Array<{ resource: string; count: number }>
  topDevices: Array<{ device: string; count: number }>
  topBrowsers: Array<{ browser: string; count: number }>
  topLocations: Array<{ location: string; count: number }>
}

export const AccessService = {
  async getAccessLogs(
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm?: string,
    type?: string,
    status?: string,
    userId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<GetAccessLogsResponse> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    })
    
    if (searchTerm) params.append('searchTerm', searchTerm)
    if (type) params.append('type', type)
    if (status) params.append('status', status)
    if (userId) params.append('userId', userId)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await apiClient.get<GetAccessLogsResponse>(`/access/logs?${params.toString()}`)
    return response
  },

  async getAccessStats(
    startDate?: string,
    endDate?: string,
    organizationId?: string
  ): Promise<AccessStats> {
    const params = new URLSearchParams()
    
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (organizationId) params.append('organizationId', organizationId)

    const response = await apiClient.get<AccessStats>(`/access/stats?${params.toString()}`)
    return response
  },

  async blockUser(userId: string, reason: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>(`/access/block`, { userId, reason })
    return response
  },

  async unblockUser(userId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>(`/access/unblock`, { userId })
    return response
  }
}
