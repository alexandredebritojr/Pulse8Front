'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  Clock,
  BarChart3,
  UserPlus,
  Copy,
  X,
  CheckCircle2,
  XCircle,
  Clock3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EventsService, EventDto } from '@/lib/api/events'
import { GuestsService, GetGuestsResponse } from '@/lib/api/guests'
import { RevenueService, GetRevenueResponse } from '@/lib/api/revenue'
import { ExpensesService, GetExpensesResponse } from '@/lib/api/expenses'
import { EventInvitesService, EventInviteDto, InviteStatus, CreateEventInviteRequest } from '@/lib/api/invites'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [event, setEvent] = useState<EventDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [totalGuests, setTotalGuests] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [invites, setInvites] = useState<EventInviteDto[]>([])
  const [isLoadingInvites, setIsLoadingInvites] = useState(false)
  const [showCreateInviteModal, setShowCreateInviteModal] = useState(false)
  const [isCreatingInvite, setIsCreatingInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteExpiresInDays, setInviteExpiresInDays] = useState(30)
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null)

  // Verificar se o usuário é Promoter (UserOrganizationType = 3)
  const isPromoter = user?.userOrganizationType === 3

  // Carregar dados reais da API
  useEffect(() => {
    const loadEventData = async () => {
      if (!params.id) return
      
      try {
        setIsLoading(true)
        setError('')
        
        const eventId = params.id as string
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        console.log('🔍 Carregando dados do evento:', eventId)
        
        // Carregar evento
        const eventData = await EventsService.getEventById(eventId)
        console.log('✅ Evento carregado:', eventData)
        setEvent(eventData)
        
        // Carregar dados relacionados em paralelo (apenas se não for Promoter)
        if (!isPromoter) {
          // Usar getGuestsByEvent para garantir que apenas convidados deste evento sejam retornados
          const [guestsResponse, revenueResponse, expensesResponse] = await Promise.all([
            GuestsService.getGuestsByEvent(eventId, { pageSize: 1, organizationId }).catch(() => ({ guests: [], totalCount: 0, pageNumber: 1, pageSize: 1, totalPages: 0 } as GetGuestsResponse)),
            RevenueService.getRevenue({ eventId, pageSize: 1, organizationId }).catch(() => ({ revenues: [], totalCount: 0, totalAmount: 0 } as GetRevenueResponse)),
            ExpensesService.getExpenses({ eventId, pageSize: 1, organizationId }).catch(() => ({ expenses: [], totalCount: 0, totalAmount: 0 } as GetExpensesResponse))
          ])
          
          // Calcular totais
          const guestsCount = guestsResponse.totalCount || guestsResponse.guests?.length || 0
          const revenueTotal = revenueResponse.totalAmount || revenueResponse.revenues?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0
          const expensesTotal = expensesResponse.totalAmount || expensesResponse.expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0
          
          setTotalGuests(guestsCount)
          setTotalRevenue(revenueTotal)
          setTotalExpenses(expensesTotal)
          
          console.log('✅ Dados carregados:', {
            guests: guestsCount,
            revenue: revenueTotal,
            expenses: expensesTotal
          })
        } else {
          console.log('✅ Dados carregados (Promoter - sem estatísticas financeiras)')
        }
      } catch (err: any) {
        console.error('❌ Erro ao carregar dados do evento:', err)
        setError(err.message || 'Erro ao carregar dados do evento')
      } finally {
        setIsLoading(false)
      }
    }

    loadEventData()
  }, [params.id, isPromoter])

  // Carregar convites
  useEffect(() => {
    const loadInvites = async () => {
      if (!params.id || isPromoter) return
      
      try {
        setIsLoadingInvites(true)
        const response = await EventInvitesService.getEventInvites(params.id as string)
        setInvites(response.invites || [])
      } catch (err: any) {
        console.error('❌ Erro ao carregar convites:', err)
      } finally {
        setIsLoadingInvites(false)
      }
    }

    loadInvites()
  }, [params.id, isPromoter])

  const getStatusColor = (status: string | number | null | undefined) => {
    if (status === null || status === undefined) return 'bg-gray-100 text-gray-800'
    
    const statusStr = String(status).toLowerCase()
    
    switch (statusStr) {
      case 'active':
      case '1':
        return 'bg-green-100 text-green-800'
      case 'planning':
      case '0':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
      case '2':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
      case '3':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string | number | null | undefined) => {
    if (status === null || status === undefined) return 'Indefinido'
    
    const statusStr = String(status).toLowerCase()
    
    switch (statusStr) {
      case 'active':
      case '1':
        return 'Ativo'
      case 'planning':
      case '0':
        return 'Planejamento'
      case 'completed':
      case '2':
        return 'Finalizado'
      case 'cancelled':
      case '3':
        return 'Cancelado'
      default:
        return String(status)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!event) return
    
    setIsDeleting(true)
    setDeleteError('')
    
    try {
      console.log('🗑️ Excluindo evento:', event.id)
      console.log('🗑️ Tipo do ID:', typeof event.id)
      console.log('🗑️ Valor do ID:', event.id)
      
      const result = await EventsService.deleteEvent(event.id)
      console.log('✅ Evento excluído com sucesso:', result)
      
      // Fechar o modal imediatamente
      setShowDeleteModal(false)
      setDeleteError('')
      
      // Aguardar um pouco para garantir que a exclusão foi processada
      setTimeout(() => {
        router.push('/events')
      }, 1000)
    } catch (err: any) {
      console.error('❌ Erro ao excluir evento:', err)
      console.error('❌ Stack trace:', err.stack)
      
      // Capturar a mensagem de erro da API
      let errorMessage = 'Erro desconhecido'
      
      console.log('🔍 Erro completo:', err)
      console.log('🔍 err.message:', err.message)
      console.log('🔍 err.toString():', err.toString())
      console.log('🔍 err.stack:', err.stack)
      
      // O ApiClient já capturou a mensagem correta da API e colocou em err.message
      if (err.message && err.message !== 'Erro na requisição') {
        errorMessage = err.message
      } else if (err.message) {
        // Se a mensagem é genérica, tentar extrair do stack trace ou usar a mensagem original
        errorMessage = err.message
      }
      
      console.log('🔍 errorMessage final:', errorMessage)
      setDeleteError(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setDeleteError('')
  }

  const handleDeleteClose = () => {
    setShowDeleteModal(false)
    setDeleteError('')
  }

  const handleCreateInvite = async () => {
    if (!event) return

    setIsCreatingInvite(true)
    try {
      const data: CreateEventInviteRequest = {
        email: inviteEmail.trim() || undefined,
        inviteMessage: inviteMessage.trim() || undefined,
        expiresInDays: inviteExpiresInDays
      }

      console.log('🔍 Criando convite:', {
        eventId: event.id,
        data
      })

      const response = await EventInvitesService.createEventInvite(event.id, data)
      console.log('✅ Convite criado com sucesso:', response)
      
      // Recarregar lista de convites
      const invitesResponse = await EventInvitesService.getEventInvites(event.id)
      setInvites(invitesResponse.invites || [])

      // Fechar modal e limpar campos
      setShowCreateInviteModal(false)
      setInviteEmail('')
      setInviteMessage('')
      setInviteExpiresInDays(30)
    } catch (err: any) {
      console.error('❌ Erro ao criar convite:', err)
      console.error('❌ Erro completo:', {
        message: err?.message,
        response: err?.response,
        status: err?.status,
        data: err?.data,
        stack: err?.stack
      })
      const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao criar convite'
      alert(errorMessage)
    } finally {
      setIsCreatingInvite(false)
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    if (!event) return

    if (!confirm('Tem certeza que deseja cancelar este convite?')) return

    try {
      await EventInvitesService.cancelEventInvite(event.id, inviteId)
      
      // Recarregar lista de convites
      const invitesResponse = await EventInvitesService.getEventInvites(event.id)
      setInvites(invitesResponse.invites || [])
    } catch (err: any) {
      console.error('❌ Erro ao cancelar convite:', err)
      alert(err.message || 'Erro ao cancelar convite')
    }
  }

  const handleCopyInviteLink = async (inviteUrl: string, inviteId: string) => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopiedInviteId(inviteId)
      setTimeout(() => setCopiedInviteId(null), 2000)
    } catch (err) {
      console.error('❌ Erro ao copiar link:', err)
      alert('Erro ao copiar link')
    }
  }

  const getInviteStatusColor = (status: InviteStatus) => {
    switch (status) {
      case InviteStatus.Pending:
        return 'bg-yellow-100 text-yellow-800'
      case InviteStatus.Accepted:
        return 'bg-green-100 text-green-800'
      case InviteStatus.Expired:
        return 'bg-gray-100 text-gray-800'
      case InviteStatus.Cancelled:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getInviteStatusText = (status: InviteStatus) => {
    switch (status) {
      case InviteStatus.Pending:
        return 'Pendente'
      case InviteStatus.Accepted:
        return 'Aceito'
      case InviteStatus.Expired:
        return 'Expirado'
      case InviteStatus.Cancelled:
        return 'Cancelado'
      default:
        return 'Desconhecido'
    }
  }

  const getInviteStatusIcon = (status: InviteStatus) => {
    switch (status) {
      case InviteStatus.Pending:
        return <Clock3 className="h-4 w-4" />
      case InviteStatus.Accepted:
        return <CheckCircle2 className="h-4 w-4" />
      case InviteStatus.Expired:
      case InviteStatus.Cancelled:
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Erro ao carregar evento</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/events" className="mt-4 inline-block">
          <Button>Voltar para Eventos</Button>
        </Link>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Evento não encontrado</h3>
        <p className="text-gray-500">O evento que você está procurando não existe.</p>
        <Link href="/events" className="mt-4 inline-block">
          <Button>Voltar para Eventos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link href="/events">
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{event.name}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(event.status)}`}>
                {getStatusText(event.status)}
              </span>
            </div>
          </div>
        </div>
        {!isPromoter && (
          <div className="flex gap-2 flex-shrink-0">
            <Link href={`/events/${event.id}/edit`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleDeleteClick} className="text-red-600 hover:text-red-700 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Excluir</span>
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{event.description}</p>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Data de Início</p>
                    <p className="text-sm text-gray-600">{formatDateTime(event.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Data de Fim</p>
                    <p className="text-sm text-gray-600">{formatDateTime(event.endDate)}</p>
                  </div>
                </div>
                {!isPromoter && (
                  <>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Orçamento Total</p>
                        <p className="text-sm text-gray-600">{event.totalBudget ? formatCurrency(event.totalBudget) : 'Não definido'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Capacidade</p>
                        <p className="text-sm text-gray-600">{event.capacity ? `${event.capacity} pessoas` : 'Não definida'}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats - Ocultar para Promoters */}
          {!isPromoter && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Convidados</p>
                      <p className="text-2xl font-semibold text-gray-900">{totalGuests}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Receita</p>
                      <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Despesas</p>
                      <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalExpenses)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Convites para Promoters */}
          {!isPromoter && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Convites para Promoters</CardTitle>
                    <CardDescription>
                      Gerencie os convites para promoters deste evento
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateInviteModal(true)} className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Gerar Convite
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingInvites ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  </div>
                ) : invites.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhum convite criado ainda.</p>
                    <p className="text-sm mt-2">Clique em &quot;Gerar Convite&quot; para criar um novo convite.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invites.map((invite) => (
                      <div
                        key={invite.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getInviteStatusColor(invite.status)}`}>
                                {getInviteStatusIcon(invite.status)}
                                {getInviteStatusText(invite.status)}
                              </span>
                              {invite.email && (
                                <span className="text-sm text-gray-600">{invite.email}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <span>Criado em: {formatDateTime(invite.createdAt)}</span>
                              <span>Expira em: {formatDateTime(invite.expiresAt)}</span>
                              {invite.acceptedAt && (
                                <span>Aceito em: {formatDateTime(invite.acceptedAt)}</span>
                              )}
                            </div>
                            {invite.inviteMessage && (
                              <p className="text-sm text-gray-700 mb-2">{invite.inviteMessage}</p>
                            )}
                            <div className="flex items-center gap-2 mt-3">
                              <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded px-3 py-2">
                                <input
                                  type="text"
                                  value={invite.inviteUrl}
                                  readOnly
                                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyInviteLink(invite.inviteUrl, invite.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  {copiedInviteId === invite.id ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              {invite.status === InviteStatus.Pending && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelInvite(invite.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancelar
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
      </div>

      {/* Modal de Criar Convite */}
      <Dialog open={showCreateInviteModal} onOpenChange={setShowCreateInviteModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gerar Novo Convite</DialogTitle>
            <DialogDescription>
              Crie um link de convite para promoters se cadastrarem neste evento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email (Opcional)</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="email@exemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Se especificado, apenas este email poderá usar o convite
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-message">Mensagem (Opcional)</Label>
              <Textarea
                id="invite-message"
                placeholder="Mensagem personalizada para o convite..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-expires">Expira em (dias)</Label>
              <Input
                id="invite-expires"
                type="number"
                min="1"
                max="365"
                value={inviteExpiresInDays}
                onChange={(e) => setInviteExpiresInDays(parseInt(e.target.value) || 30)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateInviteModal(false)
                setInviteEmail('')
                setInviteMessage('')
                setInviteExpiresInDays(30)
              }}
              disabled={isCreatingInvite}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateInvite} disabled={isCreatingInvite}>
              {isCreatingInvite ? 'Gerando...' : 'Gerar Convite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={deleteError ? handleDeleteClose : handleDeleteCancel}
        onConfirm={deleteError ? handleDeleteClose : handleDeleteConfirm}
        title={deleteError ? "Erro ao Excluir Evento" : "Excluir Evento"}
        message={
          deleteError 
            ? deleteError
            : `Tem certeza que deseja excluir o evento "${event?.name}"? Esta ação não pode ser desfeita.`
        }
        confirmText={deleteError ? "OK" : "Excluir"}
        cancelText={deleteError ? "" : "Cancelar"}
        isLoading={isDeleting}
        variant={deleteError ? "warning" : "danger"}
      />
    </div>
  )
}


