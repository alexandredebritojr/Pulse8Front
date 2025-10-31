'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Grid,
  List,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatDateTime } from '@/lib/utils'
import { Schedule, ScheduleType, ScheduleStatus } from '@/types/api'

export default function CalendarPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<ScheduleType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - em produção viria da API
  useEffect(() => {
    const mockSchedules: Schedule[] = [
      {
        id: '1',
        eventId: 'event-1',
        title: 'Setup do Palco Principal',
        description: 'Montagem do palco e equipamentos de som',
        startTime: '2024-02-14T08:00:00Z',
        endTime: '2024-02-14T12:00:00Z',
        type: ScheduleType.Setup,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        eventId: 'event-1',
        title: 'Soundcheck - Banda Principal',
        description: 'Teste de som com a banda principal',
        startTime: '2024-02-14T14:00:00Z',
        endTime: '2024-02-14T16:00:00Z',
        type: ScheduleType.Soundcheck,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '3',
        eventId: 'event-1',
        title: 'Festival de Verão 2024',
        description: 'Evento principal - Festival de música',
        startTime: '2024-02-15T18:00:00Z',
        endTime: '2024-02-16T06:00:00Z',
        type: ScheduleType.Event,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '4',
        eventId: 'event-1',
        title: 'Desmontagem',
        description: 'Desmontagem de equipamentos e limpeza',
        startTime: '2024-02-16T08:00:00Z',
        endTime: '2024-02-16T14:00:00Z',
        type: ScheduleType.Teardown,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '5',
        eventId: 'event-2',
        title: 'Reunião de Planejamento',
        description: 'Reunião com a equipe para alinhamento',
        startTime: '2024-02-20T09:00:00Z',
        endTime: '2024-02-20T11:00:00Z',
        type: ScheduleType.Meeting,
        status: ScheduleStatus.InProgress,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      // Novos eventos adicionados
      {
        id: '6',
        eventId: 'event-3',
        title: 'Workshop de Marketing Digital',
        description: 'Workshop sobre estratégias de marketing digital para eventos',
        startTime: '2024-02-22T09:00:00Z',
        endTime: '2024-02-22T17:00:00Z',
        type: ScheduleType.Event,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '7',
        eventId: 'event-4',
        title: 'Conferência de Tecnologia',
        description: 'Conferência sobre inovações tecnológicas no setor de eventos',
        startTime: '2024-02-25T08:00:00Z',
        endTime: '2024-02-25T18:00:00Z',
        type: ScheduleType.Event,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '8',
        eventId: 'event-5',
        title: 'Reunião com Fornecedores',
        description: 'Reunião para alinhamento com fornecedores de equipamentos',
        startTime: '2024-02-27T14:00:00Z',
        endTime: '2024-02-27T16:00:00Z',
        type: ScheduleType.Meeting,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '9',
        eventId: 'event-6',
        title: 'Festival de Inverno',
        description: 'Festival de música com artistas locais',
        startTime: '2024-03-01T19:00:00Z',
        endTime: '2024-03-02T02:00:00Z',
        type: ScheduleType.Event,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '10',
        eventId: 'event-7',
        title: 'Treinamento da Equipe',
        description: 'Treinamento sobre novos procedimentos e equipamentos',
        startTime: '2024-03-05T10:00:00Z',
        endTime: '2024-03-05T15:00:00Z',
        type: ScheduleType.Meeting,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '11',
        eventId: 'event-8',
        title: 'Exposição de Arte',
        description: 'Exposição de arte contemporânea com abertura ao público',
        startTime: '2024-03-08T18:00:00Z',
        endTime: '2024-03-08T22:00:00Z',
        type: ScheduleType.Event,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '12',
        eventId: 'event-9',
        title: 'Seminário de Sustentabilidade',
        description: 'Seminário sobre práticas sustentáveis em eventos',
        startTime: '2024-03-12T09:00:00Z',
        endTime: '2024-03-12T17:00:00Z',
        type: ScheduleType.Event,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '13',
        eventId: 'event-10',
        title: 'Reunião de Avaliação',
        description: 'Reunião para avaliação dos eventos do mês anterior',
        startTime: '2024-03-15T15:00:00Z',
        endTime: '2024-03-15T17:00:00Z',
        type: ScheduleType.Meeting,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '14',
        eventId: 'event-11',
        title: 'Festival de Comida',
        description: 'Festival gastronômico com chefs renomados',
        startTime: '2024-03-18T12:00:00Z',
        endTime: '2024-03-18T20:00:00Z',
        type: ScheduleType.Event,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '15',
        eventId: 'event-12',
        title: 'Workshop de Fotografia',
        description: 'Workshop de fotografia para eventos e cobertura',
        startTime: '2024-03-22T09:00:00Z',
        endTime: '2024-03-22T16:00:00Z',
        type: ScheduleType.Event,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      // Eventos para o mês atual (Janeiro 2024)
      {
        id: '16',
        eventId: 'event-13',
        title: 'Reunião de Planejamento Semanal',
        description: 'Reunião semanal para planejamento de eventos',
        startTime: '2024-01-15T09:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        type: ScheduleType.Meeting,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '17',
        eventId: 'event-14',
        title: 'Conferência de Inovação',
        description: 'Conferência sobre inovações no setor de eventos',
        startTime: '2024-01-18T08:00:00Z',
        endTime: '2024-01-18T18:00:00Z',
        type: ScheduleType.Event,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '18',
        eventId: 'event-15',
        title: 'Workshop de Design',
        description: 'Workshop de design gráfico para eventos',
        startTime: '2024-01-22T14:00:00Z',
        endTime: '2024-01-22T17:00:00Z',
        type: ScheduleType.Event,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '19',
        eventId: 'event-16',
        title: 'Festival de Música',
        description: 'Festival de música independente',
        startTime: '2024-01-25T19:00:00Z',
        endTime: '2024-01-26T02:00:00Z',
        type: ScheduleType.Event,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '20',
        eventId: 'event-17',
        title: 'Reunião com Clientes',
        description: 'Reunião para apresentação de propostas',
        startTime: '2024-01-29T15:00:00Z',
        endTime: '2024-01-29T17:00:00Z',
        type: ScheduleType.Meeting,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '21',
        eventId: 'event-18',
        title: 'Exposição de Arte Digital',
        description: 'Exposição de arte digital interativa',
        startTime: '2024-01-31T18:00:00Z',
        endTime: '2024-01-31T22:00:00Z',
        type: ScheduleType.Event,
        status: ScheduleStatus.Pending,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]
    
    setTimeout(() => {
      setSchedules(mockSchedules)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || schedule.type === typeFilter
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusColor = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.Pending:
        return 'bg-yellow-100 text-yellow-800'
      case ScheduleStatus.InProgress:
        return 'bg-blue-100 text-blue-800'
      case ScheduleStatus.Completed:
        return 'bg-green-100 text-green-800'
      case ScheduleStatus.Cancelled:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.Pending:
        return 'Pendente'
      case ScheduleStatus.InProgress:
        return 'Em Andamento'
      case ScheduleStatus.Completed:
        return 'Concluído'
      case ScheduleStatus.Cancelled:
        return 'Cancelado'
      default:
        return status
    }
  }

  const getStatusIcon = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.Pending:
        return <Clock className="h-4 w-4" />
      case ScheduleStatus.InProgress:
        return <PlayCircle className="h-4 w-4" />
      case ScheduleStatus.Completed:
        return <CheckCircle className="h-4 w-4" />
      case ScheduleStatus.Cancelled:
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: ScheduleType) => {
    switch (type) {
      case ScheduleType.Setup:
        return '🔧'
      case ScheduleType.Soundcheck:
        return '🎵'
      case ScheduleType.Event:
        return '🎪'
      case ScheduleType.Teardown:
        return '🧹'
      case ScheduleType.Meeting:
        return '👥'
      default:
        return '📅'
    }
  }

  const getTypeText = (type: ScheduleType) => {
    switch (type) {
      case ScheduleType.Setup:
        return 'Setup'
      case ScheduleType.Soundcheck:
        return 'Soundcheck'
      case ScheduleType.Event:
        return 'Evento'
      case ScheduleType.Teardown:
        return 'Desmontagem'
      case ScheduleType.Meeting:
        return 'Reunião'
      default:
        return type
    }
  }

  const getEventName = (eventId: string) => {
    const eventNames: { [key: string]: string } = {
      'event-1': 'Festival de Verão 2024',
      'event-2': 'Workshop Marketing Digital',
      'event-3': 'Conferência Tech 2024',
    }
    return eventNames[eventId] || 'Evento'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendário & Cronogramas</h1>
          <p className="text-gray-600">Gerencie todos os cronogramas e agendamentos</p>
        </div>
        <div className="flex gap-2">
          <Link href="/calendar/schedules/create">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cronograma
            </Button>
          </Link>
          <Link href="/events/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar cronogramas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ScheduleType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos os tipos</option>
            <option value={ScheduleType.Setup}>Setup</option>
            <option value={ScheduleType.Soundcheck}>Soundcheck</option>
            <option value={ScheduleType.Event}>Evento</option>
            <option value={ScheduleType.Teardown}>Desmontagem</option>
            <option value={ScheduleType.Meeting}>Reunião</option>
            <option value={ScheduleType.Other}>Outros</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ScheduleStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos os status</option>
            <option value={ScheduleStatus.Pending}>Pendente</option>
            <option value={ScheduleStatus.InProgress}>Em Andamento</option>
            <option value={ScheduleStatus.Completed}>Concluído</option>
            <option value={ScheduleStatus.Cancelled}>Cancelado</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            <Grid className="h-4 w-4 mr-2" />
            Calendário
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar/List View */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {/* Calendar Header */}
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {Array.from({ length: 35 }, (_, i) => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - 6)
            const daySchedules = filteredSchedules.filter(schedule => {
              const scheduleDate = new Date(schedule.startTime)
              return scheduleDate.toDateString() === date.toDateString()
            })
            
            return (
              <div
                key={i}
                className={`min-h-24 p-2 border border-gray-200 rounded-lg ${
                  date.getMonth() !== currentDate.getMonth() ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {daySchedules.slice(0, 2).map((schedule) => (
                    <div
                      key={schedule.id}
                      className="text-xs p-1 rounded bg-indigo-100 text-indigo-800 truncate"
                    >
                      {schedule.title}
                    </div>
                  ))}
                  {daySchedules.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{daySchedules.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredSchedules.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{getTypeIcon(schedule.type)}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{schedule.title}</h3>
                      <p className="text-sm text-gray-500">{schedule.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {formatDateTime(schedule.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDateTime(schedule.endTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {getEventName(schedule.eventId)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getTypeText(schedule.type)}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusIcon(schedule.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                          {getStatusText(schedule.status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredSchedules.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cronograma encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece criando seu primeiro cronograma.'
            }
          </p>
          {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
            <div className="mt-6">
              <Link href="/calendar/schedules/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Cronograma
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

