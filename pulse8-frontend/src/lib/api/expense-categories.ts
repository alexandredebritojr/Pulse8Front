import apiClient from './client'

// Verificar se apiClient foi inicializado corretamente
if (!apiClient) {
  console.error('❌ apiClient não foi inicializado!')
}

export interface ExpenseCategoryDto {
  id: string
  name: string
  description: string
  color: string
  isActive: boolean
  organizationId: string
  organizationName: string
  createdAt: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateExpenseCategoryRequest {
  name: string
  description: string
  color?: string
  isActive?: boolean
}

export interface UpdateExpenseCategoryRequest extends CreateExpenseCategoryRequest {
  id: string
}

export interface GetExpenseCategoriesQuery {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  isActive?: boolean
  sortBy?: string
  sortDescending?: boolean
}

export interface GetExpenseCategoriesResponse {
  categories: ExpenseCategoryDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export class ExpenseCategoriesService {
  static async getExpenseCategories(query: GetExpenseCategoriesQuery = {}): Promise<GetExpenseCategoriesResponse> {
    console.log('🔍 ExpenseCategoriesService.getExpenseCategories: Iniciando...')
    console.log('🔍 ExpenseCategoriesService.getExpenseCategories: query =', query)
    console.log('🔍 ExpenseCategoriesService.getExpenseCategories: apiClient =', apiClient)
    
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
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString())
    if (query.sortBy) params.append('sortBy', query.sortBy)
    if (query.sortDescending !== undefined) params.append('sortDescending', query.sortDescending.toString())

    const queryString = params.toString()
    const url = queryString ? `/finance/expense-categories?${queryString}` : '/finance/expense-categories'
    
    console.log('🔍 ExpenseCategoriesService.getExpenseCategories: url =', url)
    
    return apiClient.get<GetExpenseCategoriesResponse>(url)
  }

  static async getExpenseCategoryById(id: string): Promise<ExpenseCategoryDto> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    return apiClient.get<ExpenseCategoryDto>(`/finance/expense-categories/${id}`)
  }

  static async createExpenseCategory(categoryData: CreateExpenseCategoryRequest): Promise<string> {
    console.log('🔍 ExpenseCategoriesService.createExpenseCategory: Iniciando...')
    console.log('🔍 ExpenseCategoriesService.createExpenseCategory: categoryData =', categoryData)
    console.log('🔍 ExpenseCategoriesService.createExpenseCategory: apiClient =', apiClient)
    
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 ExpenseCategoriesService.createExpenseCategory: Fazendo POST para /finance/expense-categories')
    const response = await apiClient.post<{ id: string }>('/finance/expense-categories', categoryData)
    console.log('✅ ExpenseCategoriesService.createExpenseCategory: Resposta =', response)
    return response.id
  }

  static async updateExpenseCategory(id: string, categoryData: CreateExpenseCategoryRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    const response = await apiClient.put<{ id: string }>(`/finance/expense-categories/${id}`, categoryData)
    return response.id
  }

  static async deleteExpenseCategory(id: string): Promise<void> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    await apiClient.delete(`/finance/expense-categories/${id}`)
  }
}
