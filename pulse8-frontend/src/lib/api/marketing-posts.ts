import ApiClient from './client'

export interface MarketingPostDto {
  id: string
  content: string
  platform: string
  scheduledDate: string
  status: string
  marketingCampaignId: string
  marketingCampaignName?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateMarketingPostRequest {
  content: string
  platform: string
  scheduledDate: string
  status: string
  marketingCampaignId: string
}

export interface UpdateMarketingPostRequest {
  content: string
  platform: string
  scheduledDate: string
  status: string
  marketingCampaignId: string
}

export interface GetMarketingPostsResponse {
  posts: MarketingPostDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export class MarketingPostsService {
  private static baseUrl = '/marketing/posts'

  static async getMarketingPosts(pageNumber: number = 1, pageSize: number = 10, search?: string): Promise<GetMarketingPostsResponse> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    })

    if (search) {
      params.append('search', search)
    }

    return ApiClient.get<GetMarketingPostsResponse>(`${this.baseUrl}?${params.toString()}`)
  }

  static async getMarketingPostById(id: string): Promise<MarketingPostDto> {
    return ApiClient.get<MarketingPostDto>(`${this.baseUrl}/${id}`)
  }

  static async createMarketingPost(data: CreateMarketingPostRequest): Promise<string> {
    return ApiClient.post<string>(this.baseUrl, data)
  }

  static async updateMarketingPost(id: string, data: UpdateMarketingPostRequest): Promise<string> {
    return ApiClient.put<string>(`${this.baseUrl}/${id}`, data)
  }

  static async deleteMarketingPost(id: string): Promise<void> {
    await ApiClient.delete(`${this.baseUrl}/${id}`)
  }
}
