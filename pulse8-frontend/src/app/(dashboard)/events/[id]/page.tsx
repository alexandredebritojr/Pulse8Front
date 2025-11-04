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
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import { EventsService, EventDto } from '@/lib/api/events'
import { GuestsService, GetGuestsResponse } from '@/lib/api/guests'
import { RevenueService, GetRevenueResponse } from '@/lib/api/revenue'
import { ExpensesService, GetExpensesResponse } from '@/lib/api/expenses'
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
        
        // Carregar dados relacionados em paralelo
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
      } catch (err: any) {
        console.error('❌ Erro ao carregar dados do evento:', err)
        setError(err.message || 'Erro ao carregar dados do evento')
      } finally {
        setIsLoading(false)
      }
    }

    loadEventData()
  }, [params.id])

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
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
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
      </div>

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


