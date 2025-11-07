import apiClient from './client'

export enum InviteStatus {
  Pending = 0,
  Accepted = 1,
  Expired = 2,
  Cancelled = 3
}

export interface EventInviteDto {
  id: string
  token: string
  email: string
  inviteMessage?: string
  status: InviteStatus
  expiresAt: string
  acceptedAt?: string
  createdAt: string
  createdByUserName: string
  acceptedByUserName?: string
  inviteUrl: string
}

export interface CreateEventInviteRequest {
  email?: string
  inviteMessage?: string
  expiresInDays?: number
}

export interface CreateEventInviteResponse {
  inviteId: string
  token: string
  inviteUrl: string
  expiresAt: string
}

export interface GetEventInvitesResponse {
  invites: EventInviteDto[]
}

export interface ValidateInviteTokenResponse {
  inviteId: string
  eventId: string
  eventName: string
  eventDescription?: string
  organizationId: string
  organizationName: string
  inviteMessage?: string
  invitedEmail?: string
  expiresAt: string
  isExpired: boolean
  isAccepted: boolean
}

export class EventInvitesService {
  static async getEventInvites(eventId: string): Promise<GetEventInvitesResponse> {
    return apiClient.get<GetEventInvitesResponse>(`/events/${eventId}/invites`)
  }

  static async createEventInvite(
    eventId: string,
    data: CreateEventInviteRequest
  ): Promise<CreateEventInviteResponse> {
    console.log('🔍 EventInvitesService.createEventInvite:', {
      eventId,
      data,
      url: `/events/${eventId}/invites`
    })
    try {
      const response = await apiClient.post<CreateEventInviteResponse>(`/events/${eventId}/invites`, data)
      console.log('✅ EventInvitesService.createEventInvite: Sucesso', response)
      return response
    } catch (error: any) {
      console.error('❌ EventInvitesService.createEventInvite: Erro', {
        message: error?.message,
        response: error?.response,
        status: error?.status,
        data: error?.data
      })
      throw error
    }
  }

  static async cancelEventInvite(eventId: string, inviteId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/events/${eventId}/invites/${inviteId}`)
  }

  static async validateInviteToken(token: string): Promise<ValidateInviteTokenResponse> {
    return apiClient.get<ValidateInviteTokenResponse>(`/invites/validate/${token}`)
  }

  static async acceptInvite(token: string): Promise<{ message: string; eventId: string; eventName: string }> {
    console.log('📤 EventInvitesService.acceptInvite:', { token, url: '/invites/accept' })
    try {
      const response = await apiClient.post<{ message: string; eventId: string; eventName: string }>('/invites/accept', { token })
      console.log('✅ EventInvitesService.acceptInvite: Sucesso', response)
      return response
    } catch (error: any) {
      console.error('❌ EventInvitesService.acceptInvite: Erro', {
        message: error?.message,
        response: error?.response,
        status: error?.status,
        data: error?.data
      })
      throw error
    }
  }
}


