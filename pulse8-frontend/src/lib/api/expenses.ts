import apiClient from './client'

if (!apiClient) {
  console.error('❌ apiClient não foi inicializado!')
}

export enum ExpenseType {
  Venue = 0,
  Catering = 1,
  Equipment = 2,
  Marketing = 3,
  Staff = 4,
  Transportation = 5,
  Other = 6
}

export enum ExpenseStatus {
  Pending = 0,
  Paid = 1,
  Overdue = 2,
  Cancelled = 3
}

export interface ExpenseDto {
  id: string
  title: string
  description: string
  amount: number
  dueDate: string
  status: number // ExpenseStatus enum
  invoiceNumber?: string
  notes?: string
  eventId: string
  eventName: string
  supplierId?: string
  supplierName?: string
  type: number // ExpenseType enum
  categoryName?: string
  organizationId: string
  organizationName: string
  createdAt: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateExpenseRequest {
  eventId: string
  title: string
  description: string
  amount: number
  dueDate: string
  invoiceNumber?: string
  notes?: string
  supplierId?: string
  type: number // ExpenseType enum
  status: number // ExpenseStatus enum
}

export interface UpdateExpenseRequest {
  id: string
  eventId: string
  title: string
  description: string
  amount: number
  dueDate: string
  invoiceNumber?: string
  notes?: string
  supplierId?: string
  type: number // ExpenseType enum
  status: number // ExpenseStatus enum
}

export interface GetExpensesQuery {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  status?: string
  category?: string
  type?: string
  eventId?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortDescending?: boolean
  organizationId?: string
}

export interface GetExpensesResponse {
  expenses: ExpenseDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
}

export class ExpensesService {
  static async getExpenses(query: GetExpensesQuery = {}): Promise<GetExpensesResponse> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    const params = new URLSearchParams()
    
    if (query.pageNumber) params.append('pageNumber', query.pageNumber.toString())
    if (query.pageSize) params.append('pageSize', query.pageSize.toString())
    if (query.searchTerm) params.append('searchTerm', query.searchTerm)
    if (query.status) params.append('status', query.status)
    if (query.category) params.append('category', query.category)
    if (query.type) params.append('type', query.type)
    if (query.eventId) params.append('eventId', query.eventId)
    if (query.dateFrom) params.append('dateFrom', query.dateFrom)
    if (query.dateTo) params.append('dateTo', query.dateTo)
    if (query.sortBy) params.append('sortBy', query.sortBy)
    if (query.sortDescending !== undefined) params.append('sortDescending', query.sortDescending.toString())
    if (query.organizationId) params.append('organizationId', query.organizationId)

    const queryString = params.toString()
    const url = queryString ? `/finance/expenses?${queryString}` : '/finance/expenses'
    
    console.log('🔍 ExpensesService.getExpenses: Iniciando...')
    console.log('🔍 ExpensesService.getExpenses: query =', query)
    console.log('🔍 ExpensesService.getExpenses: apiClient =', apiClient)
    console.log('🔍 ExpensesService.getExpenses: url =', url)
    
    return apiClient.get<GetExpensesResponse>(url)
  }

  static async getExpenseById(id: string): Promise<ExpenseDto> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    return apiClient.get<ExpenseDto>(`/finance/expenses/${id}`)
  }

  static async createExpense(expenseData: CreateExpenseRequest): Promise<string> {
    console.log('🔍 ExpensesService.createExpense: Iniciando...')
    console.log('🔍 ExpensesService.createExpense: expenseData =', expenseData)
    console.log('🔍 ExpensesService.createExpense: apiClient =', apiClient)
    
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 ExpensesService.createExpense: Fazendo POST para /finance/expenses')
    const response = await apiClient.post<{ id: string }>('/finance/expenses', expenseData)
    console.log('✅ ExpensesService.createExpense: Resposta =', response)
    return response.id
  }

  static async updateExpense(id: string, expenseData: UpdateExpenseRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 ExpensesService.updateExpense: Fazendo PUT para /finance/expenses/' + id)
    console.log('🔍 ExpensesService.updateExpense: Dados =', expenseData)
    const response = await apiClient.put<{ id: string }>(`/finance/expenses/${id}`, expenseData)
    console.log('✅ ExpensesService.updateExpense: Resposta =', response)
    return response.id
  }

  static async deleteExpense(id: string): Promise<void> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    await apiClient.delete(`/finance/expenses/${id}`)
  }
}
