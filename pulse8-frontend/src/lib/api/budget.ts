import apiClient from './client'

export interface BudgetDto {
  id: string
  name: string
  description: string
  amount: number
  spent: number
  startDate: string
  endDate: string
  status: string
  createdAt: string
  updatedAt: string | null
}

export interface CreateBudgetRequest {
  name: string
  description?: string
  amount: number
  startDate: string
  endDate: string
  organizationId: string
}

export interface GetBudgetsResponse {
  budgets: BudgetDto[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export const BudgetService = {
  async getBudgets(organizationId: string, searchTerm?: string, statusFilter?: string, page: number = 1, pageSize: number = 10): Promise<GetBudgetsResponse> {
    const params = new URLSearchParams({
      organizationId,
      page: page.toString(),
      pageSize: pageSize.toString()
    })
    
    if (searchTerm) params.append('searchTerm', searchTerm)
    if (statusFilter) params.append('statusFilter', statusFilter)

    const response = await apiClient.get<GetBudgetsResponse>(`/budget?${params.toString()}`)
    return response
  },

  async createBudget(data: CreateBudgetRequest): Promise<{ id: string; message: string }> {
    const response = await apiClient.post<{ id: string; message: string }>('/budget', data)
    return response
  },

  async updateBudget(id: string, data: CreateBudgetRequest): Promise<{ id: string; message: string }> {
    const response = await apiClient.put<{ id: string; message: string }>(`/budget/${id}`, data)
    return response
  },

  async deleteBudget(id: string): Promise<{ id: string; message: string }> {
    const response = await apiClient.delete<{ id: string; message: string }>(`/budget/${id}`)
    return response
  },

  async getBudgetById(id: string): Promise<BudgetDto> {
    const response = await apiClient.get<BudgetDto>(`/budget/${id}`)
    return response
  }
}
