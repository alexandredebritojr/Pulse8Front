'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Calendar, MapPin, Users, DollarSign, Grid, List, CheckCircle, AlertCircle, TrendingUp, BarChart3, Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import { EventsService, EventDto, GetEventsResponse } from '@/lib/api/events'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventDto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<EventDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Verificar se o usuário é Promoter (UserOrganizationType = 3)
  const isPromoter = user?.userOrganizationType === 3

  // Carregar eventos da API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        console.log('🔍 Carregando eventos da API...')
        console.log('🔍 EventsService =', EventsService)
        console.log('🔍 EventsService.getEvents =', EventsService.getEvents)
        console.log('🔍 statusFilter =', statusFilter)
        console.log('🔍 searchTerm =', searchTerm)
        
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        const queryParams = {
          pageNumber: 1,
          pageSize: 50,
          searchTerm: searchTerm || undefined,
          // Para Promoters, sempre exibir todos os status (não aplicar filtro de status)
          status: (!isPromoter && statusFilter !== 'all') ? statusFilter : undefined,
          organizationId: organizationId
        }
        console.log('🔍 Query params =', queryParams)
        
        const response = await EventsService.getEvents(queryParams)
        console.log('✅ Eventos carregados:', response)
        console.log('✅ Total de eventos:', response.events.length)
        console.log('✅ Eventos:', response.events.map(e => ({ id: e.id, name: e.name, status: e.status })))
        setEvents(response.events)
        setError('')
      } catch (err: any) {
        console.error('❌ Erro ao carregar eventos:', err)
        console.error('❌ Stack trace:', err.stack)
        setError(err.message || 'Erro ao carregar eventos')
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [searchTerm, statusFilter])

  const getStatusColor = (status: string | number | null | undefined) => {
    if (status === null || status === undefined) return 'bg-gray-100 text-gray-800'
    
    const statusStr = String(status).toLowerCase()
    
    switch (statusStr) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string | number | null | undefined) => {
    if (status === null || status === undefined) return 'Indefinido'
    
    const statusStr = String(status).toLowerCase()
    
    switch (statusStr) {
      case 'draft':
        return 'Rascunho'
      case 'planning':
        return 'Planejamento'
      case 'active':
        return 'Ativo'
      case 'completed':
        return 'Finalizado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return String(status)
    }
  }

  const handleDeleteClick = (event: EventDto) => {
    setEventToDelete(event)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return
    
    setIsDeleting(true)
    try {
      console.log('🗑️ Excluindo evento:', eventToDelete.id)
      await EventsService.deleteEvent(eventToDelete.id)
      console.log('✅ Evento excluído com sucesso')
      
      // Recarregar a lista de eventos
      const updatedEvents = events.filter(e => e.id !== eventToDelete.id)
      setEvents(updatedEvents)
      
      setShowDeleteModal(false)
      setEventToDelete(null)
    } catch (err: any) {
      console.error('❌ Erro ao excluir evento:', err)
      alert('Erro ao excluir evento: ' + (err.message || 'Erro desconhecido'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setEventToDelete(null)
  }

  // Calcular estatísticas dos eventos
  const totalEvents = events.length
  const activeEvents = events.filter(e => String(e.status).toLowerCase() === 'active').length
  const completedEvents = events.filter(e => String(e.status).toLowerCase() === 'completed').length
  const draftEvents = events.filter(e => String(e.status).toLowerCase() === 'draft').length

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
        <div className="text-red-600 mb-4">❌ {error}</div>
        <Button onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>
          <p className="text-gray-600">
            {isPromoter ? 'Visualize os eventos associados a você' : 'Gerencie todos os seus eventos e produções'}
          </p>
        </div>
        {!isPromoter && (
          <Link href="/events/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Total</CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{totalEvents}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
              Cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Ativos</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">{activeEvents}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
              Andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Finalizados</CardTitle>
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{completedEvents}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
              Concluídos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Rascunhos</CardTitle>
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-yellow-600">{draftEvents}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
              Planejamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {!isPromoter && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as string | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos os status</option>
              <option value="draft">Rascunho</option>
              <option value="planning">Planejamento</option>
              <option value="active">Ativo</option>
              <option value="completed">Finalizado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          )}
          
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
          </div>
        </div>
      </div>

      {/* Events Display */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-4"
      }>
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            {viewMode === 'grid' ? (
              // Grid Layout
              <>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {getStatusText(event.status)}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(event.startDate)} - {formatDate(event.endDate)}
                    </div>
                    {!isPromoter && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        {event.totalBudget ? formatCurrency(event.totalBudget) : 'Orçamento não definido'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Link href={`/events/${event.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </Link>
                    {!isPromoter && (
                      <>
                        <Link href={`/events/${event.id}/edit`}>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDeleteClick(event)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </>
            ) : (
              // List Layout
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{event.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 break-words">
                        {event.description || 'Sem descrição'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-4 lg:gap-6">
                    {/* Values Grid */}
                    <div className={`grid grid-cols-1 ${isPromoter ? 'sm:grid-cols-1' : 'sm:grid-cols-3'} gap-2 sm:gap-4 lg:gap-6`}>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                      </div>
                      {!isPromoter && (
                        <>
                          <div className="flex items-center text-sm text-gray-500">
                            <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{event.totalBudget ? formatCurrency(event.totalBudget) : 'Orçamento não definido'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{event.capacity ? `${event.capacity} pessoas` : 'Capacidade não definida'}</span>
                          </div>
                        </>
                      )}
                    </div>
                    {/* Status and Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(event.status)}`}>
                        {getStatusText(event.status)}
                      </span>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/events/${event.id}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {!isPromoter && (
                          <>
                            <Link href={`/events/${event.id}/edit`}>
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                              onClick={() => handleDeleteClick(event)}
                              title="Excluir evento"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum evento encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece criando seu primeiro evento.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && !isPromoter && (
            <div className="mt-6">
              <Link href="/events/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Evento
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Evento"
        message={`Tem certeza que deseja excluir o evento "${eventToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}

