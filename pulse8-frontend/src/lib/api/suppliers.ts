import apiClient from './client'

// Verificar se apiClient foi inicializado corretamente
if (!apiClient) {
  console.error('❌ apiClient não foi inicializado!')
}

export interface SupplierDto {
  id: string
  name: string
  document: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  pixKey?: string
  bankAccount?: string
  notes?: string
  status: string // Active, Inactive, Suspended
  organizationId: string
  organizationName: string
  createdAt: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  expenseCount: number
  totalExpenseAmount: number
}

export interface CreateSupplierRequest {
  name: string
  document: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  pixKey?: string
  bankAccount?: string
  notes?: string
  status?: string
}

export interface UpdateSupplierRequest extends CreateSupplierRequest {
  id: string
  organizationId?: string
}

export interface GetSuppliersQuery {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  status?: string
  sortBy?: string
  sortDescending?: boolean
  organizationId?: string
}

export interface GetSuppliersResponse {
  suppliers: SupplierDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export class SuppliersService {
  static async getSuppliers(query: GetSuppliersQuery = {}): Promise<GetSuppliersResponse> {
    console.log('🔍 SuppliersService.getSuppliers: Iniciando...')
    console.log('🔍 SuppliersService.getSuppliers: query =', query)
    console.log('🔍 SuppliersService.getSuppliers: apiClient =', apiClient)
    
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
    if (query.status) params.append('status', query.status)
    if (query.sortBy) params.append('sortBy', query.sortBy)
    if (query.sortDescending !== undefined) params.append('sortDescending', query.sortDescending.toString())
    if (query.organizationId) params.append('organizationId', query.organizationId)

    const queryString = params.toString()
    const url = queryString ? `/suppliers?${queryString}` : '/suppliers'
    
    console.log('🔍 SuppliersService.getSuppliers: url =', url)
    
    const response = await apiClient.get<any>(url)
    
    // Mapear status numérico para string em cada fornecedor
    const mapStatusToString = (status: number): string => {
      switch (status) {
        case 0: return 'Active'
        case 1: return 'Inactive'
        case 2: return 'Suspended'
        default: return 'Active'
      }
    }
    
    return {
      ...response,
      suppliers: response.suppliers.map((supplier: any) => ({
        ...supplier,
        status: mapStatusToString(supplier.status)
      }))
    }
  }

  static async getSupplierById(id: string): Promise<SupplierDto> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    const supplier = await apiClient.get<any>(`/suppliers/${id}`)
    
    // Mapear status numérico para string
    const mapStatusToString = (status: number): string => {
      switch (status) {
        case 0: return 'Active'
        case 1: return 'Inactive'
        case 2: return 'Suspended'
        default: return 'Active'
      }
    }
    
    return {
      ...supplier,
      status: mapStatusToString(supplier.status)
    }
  }

  static async createSupplier(supplierData: CreateSupplierRequest): Promise<string> {
    console.log('🔍 SuppliersService.createSupplier: Iniciando...')
    console.log('🔍 SuppliersService.createSupplier: supplierData =', supplierData)
    console.log('🔍 SuppliersService.createSupplier: apiClient =', apiClient)
    
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 SuppliersService.createSupplier: Fazendo POST para /suppliers')
    const response = await apiClient.post<{ id: string }>('/suppliers', supplierData)
    console.log('✅ SuppliersService.createSupplier: Resposta =', response)
    return response.id
  }

  static async updateSupplier(id: string, supplierData: UpdateSupplierRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    // Mapear status string para enum
    const mapStatusToEnum = (status: string): number => {
      switch (status) {
        case 'Active': return 0
        case 'Inactive': return 1
        case 'Suspended': return 2
        default: return 0
      }
    }
    
    // Preparar payload no formato esperado pelo backend
    const updateData = {
      id: id,
      name: supplierData.name,
      document: supplierData.document,
      email: supplierData.email,
      phone: supplierData.phone,
      address: supplierData.address,
      city: supplierData.city,
      state: supplierData.state,
      zipCode: supplierData.zipCode,
      pixKey: supplierData.pixKey,
      bankAccount: supplierData.bankAccount,
      notes: supplierData.notes,
      status: mapStatusToEnum(supplierData.status || 'Active'),
      organizationId: supplierData.organizationId || ''
    }
    
    console.log('🔍 SuppliersService.updateSupplier: Fazendo PUT para /suppliers/' + id)
    console.log('🔍 SuppliersService.updateSupplier: Dados =', updateData)
    const response = await apiClient.put<{ id: string }>(`/suppliers/${id}`, updateData)
    console.log('✅ SuppliersService.updateSupplier: Resposta =', response)
    return response.id
  }

  static async deleteSupplier(id: string): Promise<void> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    await apiClient.delete(`/suppliers/${id}`)
  }
}
