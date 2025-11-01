'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime, formatDate } from '@/lib/utils'
import { Schedule, ScheduleType, ScheduleStatus } from '@/types/api'

export default function TimelinePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - em produção viria da API
  useEffect(() => {
    const mockSchedules: Schedule[] = [
      {
        id: '1',
        eventId: 'event-1',
        title: 'Setup do Palco Principal',
        description: 'Montagem do palco e equipamentos de som e iluminação',
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
        description: 'Teste de som com a banda principal e ajustes finais',
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
        description: 'Evento principal - Festival de música eletrônica',
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
        description: 'Desmontagem de equipamentos e limpeza do local',
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
        description: 'Reunião com a equipe para alinhamento final',
        startTime: '2024-02-20T09:00:00Z',
        endTime: '2024-02-20T11:00:00Z',
        type: ScheduleType.Meeting,
        status: ScheduleStatus.InProgress,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '6',
        eventId: 'event-3',
        title: 'Workshop Marketing Digital',
        description: 'Workshop prático sobre estratégias de marketing digital',
        startTime: '2024-02-20T14:00:00Z',
        endTime: '2024-02-20T18:00:00Z',
        type: ScheduleType.Event,
        status: ScheduleStatus.Completed,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]
    
    setTimeout(() => {
      setSchedules(mockSchedules)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.Pending:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case ScheduleStatus.InProgress:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case ScheduleStatus.Completed:
        return 'bg-green-100 text-green-800 border-green-200'
      case ScheduleStatus.Cancelled:
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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

  // Agrupar cronogramas por data
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const date = new Date(schedule.startTime).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(schedule)
    return acc
  }, {} as { [key: string]: Schedule[] })

  // Ordenar cronogramas por horário
  Object.keys(groupedSchedules).forEach(date => {
    groupedSchedules[date].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
  })

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Timeline</h1>
          <p className="text-sm sm:text-base text-gray-600">Visualização cronológica dos cronogramas</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="icon" className="flex-shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="flex-shrink-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Link href="/calendar/schedules/create" className="flex-shrink-0">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Cronograma</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.keys(groupedSchedules).length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cronograma encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando seu primeiro cronograma.
            </p>
            <div className="mt-6">
              <Link href="/calendar/schedules/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Cronograma
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          Object.entries(groupedSchedules).map(([date, daySchedules]) => (
            <div key={date} className="space-y-4">
              {/* Date Header */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <CalendarIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {formatDate(date)}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {daySchedules.length} cronograma{daySchedules.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Timeline Items */}
              <div className="ml-6 space-y-4">
                {daySchedules.map((schedule, index) => (
                  <div key={schedule.id} className="relative">
                    {/* Timeline Line */}
                    {index < daySchedules.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                    )}
                    
                    {/* Timeline Item */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${getStatusColor(schedule.status)}`}>
                          {getTypeIcon(schedule.type)}
                        </div>
                      </div>
                      
                      <Card className="flex-1 hover:shadow-lg transition-shadow min-w-0">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base sm:text-lg truncate">{schedule.title}</h3>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{schedule.description}</p>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 mt-2">
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                  <Clock className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{formatDateTime(schedule.startTime)} - {formatDateTime(schedule.endTime)}</span>
                                </span>
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                  <Users className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{getEventName(schedule.eventId)}</span>
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-2 flex-shrink-0">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap">
                                {getTypeText(schedule.type)}
                              </span>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(schedule.status)}
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(schedule.status)}`}>
                                  {getStatusText(schedule.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

