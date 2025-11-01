'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  Clock, 
  Users,
  MapPin,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Grid,
  List,
  BarChart3,
  TrendingUp,
  Eye,
  Settings,
  Volume2,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import { formatDateTime } from '@/lib/utils'
import { SchedulesService, ScheduleDto, GetSchedulesResponse } from '@/lib/api/schedules'

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleDto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [scheduleToDelete, setScheduleToDelete] = useState<ScheduleDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Carregar schedules da API
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        console.log('🔍 Carregando schedules da API...')
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        const queryParams = {
          pageNumber: 1,
          pageSize: 50,
          searchTerm: searchTerm || undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          organizationId: organizationId
        }
        
        const response = await SchedulesService.getSchedules(queryParams)
        console.log('✅ Schedules carregados:', response)
        console.log('🔍 Total de schedules:', response.schedules?.length || 0)
        console.log('🔍 Schedules array:', response.schedules)
        setSchedules(response.schedules)
        setError('')
      } catch (err: any) {
        console.error('❌ Erro ao carregar schedules:', err)
        setError(err.message || 'Erro ao carregar schedules')
      } finally {
        setIsLoading(false)
      }
    }

    loadSchedules()
  }, [searchTerm, typeFilter, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'InProgress':
        return 'bg-blue-100 text-blue-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'Concluído'
      case 'InProgress':
        return 'Em Andamento'
      case 'Pending':
        return 'Pendente'
      case 'Cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />
      case 'InProgress':
        return <PlayCircle className="h-4 w-4" />
      case 'Pending':
        return <Clock className="h-4 w-4" />
      case 'Cancelled':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800'
      case 'task':
        return 'bg-green-100 text-green-800'
      case 'event':
        return 'bg-purple-100 text-purple-800'
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'Meeting':
        return 'Reunião'
      case 'Task':
        return 'Tarefa'
      case 'Event':
        return 'Evento'
      case 'Setup':
        return 'Setup'
      case 'Soundcheck':
        return 'Soundcheck'
      case 'Teardown':
        return 'Desmontagem'
      case 'Other':
        return 'Outros'
      default:
        return type
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Meeting':
        return <Users className="h-4 w-4" />
      case 'Task':
        return <CheckCircle className="h-4 w-4" />
      case 'Event':
        return <CalendarIcon className="h-4 w-4" />
      case 'Setup':
        return <Settings className="h-4 w-4" />
      case 'Soundcheck':
        return <Volume2 className="h-4 w-4" />
      case 'Teardown':
        return <Trash2 className="h-4 w-4" />
      case 'Other':
        return <MoreHorizontal className="h-4 w-4" />
      default:
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  const handleDeleteClick = (schedule: ScheduleDto) => {
    setScheduleToDelete(schedule)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!scheduleToDelete) return
    
    setIsDeleting(true)
    try {
      console.log('🗑️ Excluindo agendamento:', scheduleToDelete.id)
      await SchedulesService.deleteSchedule(scheduleToDelete.id)
      console.log('✅ Agendamento excluído com sucesso')
      
      // Recarregar a lista de agendamentos
      const updatedSchedules = schedules.filter(s => s.id !== scheduleToDelete.id)
      setSchedules(updatedSchedules)
      
      setShowDeleteModal(false)
      setScheduleToDelete(null)
    } catch (err: any) {
      console.error('❌ Erro ao excluir agendamento:', err)
      alert('Erro ao excluir agendamento: ' + (err.message || 'Erro desconhecido'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setScheduleToDelete(null)
  }

  const completedSchedules = schedules?.filter(s => s.status === 'Completed').length || 0
  const pendingSchedules = schedules?.filter(s => s.status === 'Pending').length || 0
  const inProgressSchedules = schedules?.filter(s => s.status === 'InProgress').length || 0
  const totalSchedules = schedules?.length || 0

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
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-sm sm:text-base text-gray-600">Gerencie sua agenda e cronograma</p>
        </div>
        <Link href="/calendar/schedules/create" className="flex-shrink-0">
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Agendamento</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <CalendarIcon className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{totalSchedules}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Concluídos</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{completedSchedules}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pendentes</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{pendingSchedules}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <PlayCircle className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Em Andamento</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{inProgressSchedules}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar agendamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm flex-shrink-0 min-w-[140px]"
          >
            <option value="all">Todos os Tipos</option>
            <option value="Setup">Setup</option>
            <option value="Soundcheck">Soundcheck</option>
            <option value="Event">Evento</option>
            <option value="Teardown">Desmontagem</option>
            <option value="Meeting">Reunião</option>
            <option value="Task">Tarefa</option>
            <option value="Other">Outros</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm flex-shrink-0 min-w-[120px]"
          >
            <option value="all">Todos</option>
            <option value="Pending">Pendentes</option>
            <option value="InProgress">Em Andamento</option>
            <option value="Completed">Concluídos</option>
            <option value="Cancelled">Cancelados</option>
          </select>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              size="sm"
            >
              <Grid className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              size="sm"
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules?.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      {getTypeIcon(schedule.type)}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{schedule.title}</h3>
                      <p className="text-sm text-gray-500">{getTypeText(schedule.type)}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                    {getStatusIcon(schedule.status)}
                    <span className="ml-1">{getStatusText(schedule.status)}</span>
                  </span>
                </div>

                {schedule.description && (
                  <p className="text-sm text-gray-600 mb-4">{schedule.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatDateTime(schedule.startTime)} - {formatDateTime(schedule.endTime)}
                  </div>
                  {schedule.eventName && (
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {schedule.eventName}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/calendar/schedules/${schedule.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                  <Link href={`/calendar/schedules/${schedule.id}/edit`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDeleteClick(schedule)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
                  {schedules?.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {getTypeIcon(schedule.type)}
                          </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{schedule.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 break-words">
                        {getTypeText(schedule.type)}
                        {schedule.description && ` • ${schedule.description}`}
                      </p>
                          </div>
                        </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-4 lg:gap-6">
                    {/* Values Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-500">Início</p>
                        <p className="font-semibold text-sm sm:text-base truncate">{formatDateTime(schedule.startTime)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-500">Término</p>
                        <p className="font-semibold text-sm sm:text-base truncate">{formatDateTime(schedule.endTime)}</p>
                      </div>
                      {schedule.eventName && (
                        <div className="text-center">
                          <p className="text-xs sm:text-sm text-gray-500">Evento</p>
                          <p className="font-semibold text-sm sm:text-base truncate">{schedule.eventName}</p>
                        </div>
                      )}
                    </div>
                    {/* Status and Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(schedule.status)}`}>
                        {getStatusIcon(schedule.status)}
                        <span className="ml-1 hidden sm:inline">{getStatusText(schedule.status)}</span>
                      </span>
                      <div className="flex gap-2 flex-shrink-0">
                          <Link href={`/calendar/schedules/${schedule.id}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/calendar/schedules/${schedule.id}/edit`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                          onClick={() => handleDeleteClick(schedule)}
                          title="Excluir agendamento"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                        </div>
            </div>
          </CardContent>
        </Card>
          ))}
        </div>
      )}

      {(schedules?.length || 0) === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum agendamento encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece criando um novo agendamento.'
              }
            </p>
            {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
              <div className="mt-6">
                <Link href="/calendar/schedules/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Agendamento
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Agendamento"
        message={`Tem certeza que deseja excluir o agendamento "${scheduleToDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}
