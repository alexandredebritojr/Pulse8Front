import apiClient from './client'

if (!apiClient) {
  console.error('❌ apiClient não foi inicializado!')
}

export interface AssetDto {
  id: string
  name: string
  description: string
  filePath: string
  fileSize: number
  type: string
  mimeType: string
  organizationId: string
  organizationName: string
  eventId: string
  eventName: string
}

export interface CreateAssetRequest {
  name: string
  description: string
  filePath: string
  fileSize: number
  type: string
  mimeType: string
  organizationId: string
  eventId: string
}

export interface GetAssetsQuery {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  status?: string
  type?: string
  category?: string
  condition?: string
  sortBy?: string
  sortDescending?: boolean
  organizationId?: string
}

export interface GetAssetsResponse {
  assets: AssetDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export class AssetsService {
  static async getAssets(query: GetAssetsQuery = {}): Promise<GetAssetsResponse> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    const params = new URLSearchParams()
    
    if (query.pageNumber) params.append('pageNumber', query.pageNumber.toString())
    if (query.pageSize) params.append('pageSize', query.pageSize.toString())
    if (query.searchTerm) params.append('searchTerm', query.searchTerm)
    if (query.status) params.append('status', query.status)
    if (query.type) params.append('type', query.type)
    if (query.category) params.append('category', query.category)
    if (query.condition) params.append('condition', query.condition)
    if (query.sortBy) params.append('sortBy', query.sortBy)
    if (query.sortDescending !== undefined) params.append('sortDescending', query.sortDescending.toString())
    if (query.organizationId) params.append('organizationId', query.organizationId)

    const queryString = params.toString()
    const url = queryString ? `/marketing/assets?${queryString}` : '/marketing/assets'
    
    console.log('🔍 AssetsService.getAssets: Iniciando...')
    console.log('🔍 AssetsService.getAssets: query =', query)
    console.log('🔍 AssetsService.getAssets: apiClient =', apiClient)
    console.log('🔍 AssetsService.getAssets: url =', url)
    
    return apiClient.get<GetAssetsResponse>(url)
  }

  static async getAssetById(id: string): Promise<AssetDto> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    return apiClient.get<AssetDto>(`/marketing/assets/${id}`)
  }

  static async createAsset(assetData: CreateAssetRequest): Promise<string> {
    console.log('🔍 AssetsService.createAsset: Iniciando...')
    console.log('🔍 AssetsService.createAsset: assetData =', assetData)
    console.log('🔍 AssetsService.createAsset: apiClient =', apiClient)
    
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    
    console.log('🔍 AssetsService.createAsset: Fazendo POST para /marketing/assets')
    const response = await apiClient.post<{ id: string }>('/marketing/assets', assetData)
    console.log('✅ AssetsService.createAsset: Resposta =', response)
    return response.id
  }

  static async updateAsset(id: string, assetData: CreateAssetRequest): Promise<string> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    const response = await apiClient.put<{ id: string }>(`/marketing/assets/${id}`, assetData)
    return response.id
  }

  static async deleteAsset(id: string): Promise<void> {
    if (!apiClient) {
      throw new Error('ApiClient não foi inicializado corretamente')
    }
    await apiClient.delete(`/marketing/assets/${id}`)
  }
}
