'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Users,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatDateTime, formatDate } from '@/lib/utils'
import { SchedulesService, ScheduleDto } from '@/lib/api/schedules'
import { EventsService, EventDto } from '@/lib/api/events'

type TimelineItem = {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  type: string
  status: string
  source: 'schedule' | 'event'
  eventName?: string
  location?: string
}

export default function TimelinePage() {
  const [schedules, setSchedules] = useState<ScheduleDto[]>([])
  const [filteredSchedules, setFilteredSchedules] = useState<ScheduleDto[]>([])
  const [allEvents, setAllEvents] = useState<EventDto[]>([])
  const [filteredEvents, setFilteredEvents] = useState<EventDto[]>([])
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [error, setError] = useState('')
  const [filterDate, setFilterDate] = useState<string>('')
  const [filterEventId, setFilterEventId] = useState<string>('')

  // Carregar eventos para a combobox e timeline
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoadingEvents(true)
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        const response = await EventsService.getEvents({
          pageNumber: 1,
          pageSize: 100,
          organizationId: organizationId
        }).catch(err => {
          console.error('Erro ao carregar events:', err)
          return { events: [], totalCount: 0, pageNumber: 1, pageSize: 100, totalPages: 0 }
        })
        
        const loadedEvents = response.events || []
        setAllEvents(loadedEvents)
        
        // Filtrar events por data e eventId
        let filtered = loadedEvents
        if (filterDate) {
          const filterDateObj = new Date(filterDate)
          filterDateObj.setHours(0, 0, 0, 0)
          filtered = filtered.filter(event => {
            const eventStartDate = new Date(event.startDate)
            eventStartDate.setHours(0, 0, 0, 0)
            return eventStartDate >= filterDateObj
          })
        }
        if (filterEventId) {
          filtered = filtered.filter(event => event.id === filterEventId)
        }
        setFilteredEvents(filtered)
      } catch (err: any) {
        console.error('❌ Erro ao carregar eventos:', err)
      } finally {
        setIsLoadingEvents(false)
      }
    }

    loadEvents()
  }, [filterDate, filterEventId])

  // Carregar schedules da API
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        const queryParams = {
          pageNumber: 1,
          pageSize: 100, // Buscar mais registros para a timeline
          organizationId: organizationId,
          sortBy: 'startTime',
          sortDescending: false,
          eventId: filterEventId || undefined,
          startDate: filterDate || undefined
        }
        
        const response = await SchedulesService.getSchedules(queryParams)
        const allSchedules = response.schedules || []
        setSchedules(allSchedules)
        
        // Filtrar por data no frontend também (caso o backend não suporte)
        let filtered = allSchedules
        if (filterDate) {
          const filterDateObj = new Date(filterDate)
          filterDateObj.setHours(0, 0, 0, 0)
          filtered = filtered.filter(schedule => {
            const scheduleDate = new Date(schedule.startTime)
            scheduleDate.setHours(0, 0, 0, 0)
            return scheduleDate >= filterDateObj
          })
        }
        if (filterEventId) {
          filtered = filtered.filter(schedule => schedule.eventId === filterEventId)
        }
        setFilteredSchedules(filtered)
      } catch (err: any) {
        console.error('❌ Erro ao carregar schedules:', err)
        setError(err.message || 'Erro ao carregar cronogramas')
      } finally {
        setIsLoading(false)
      }
    }

    loadSchedules()
  }, [filterDate, filterEventId])

  // Combinar schedules e events em timeline items
  useEffect(() => {
    const items: TimelineItem[] = []
    
    // Adicionar schedules
    filteredSchedules.forEach(schedule => {
      items.push({
        id: schedule.id,
        title: schedule.title,
        description: schedule.description,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        type: schedule.type,
        status: schedule.status || 'Pending',
        source: 'schedule',
        eventName: schedule.eventName
      })
    })
    
    // Adicionar events
    filteredEvents.forEach(event => {
      items.push({
        id: event.id,
        title: event.name,
        description: event.description,
        startTime: event.startDate,
        endTime: event.endDate,
        type: 'Event',
        status: event.status ? String(event.status) : 'active',
        source: 'event',
        location: event.location
      })
    })
    
    // Ordenar por data/hora
    items.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    
    setTimelineItems(items)
    
    // Disponibilizar dados para o chat
    if (typeof window !== 'undefined') {
      (window as any).timelineData = {
        schedules: filteredSchedules,
        events: filteredEvents,
        timelineItems: items,
        lastUpdated: new Date().toISOString()
      }
    }
  }, [filteredSchedules, filteredEvents])

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200'
    const statusLower = String(status).toLowerCase()
    switch (statusLower) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'inprogress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string | undefined | null) => {
    if (!status) return 'Indefinido'
    const statusLower = String(status).toLowerCase()
    switch (statusLower) {
      case 'pending':
        return 'Pendente'
      case 'inprogress':
        return 'Em Andamento'
      case 'completed':
        return 'Concluído'
      case 'cancelled':
      case 'canceled':
        return 'Cancelado'
      case 'draft':
        return 'Rascunho'
      case 'planning':
        return 'Planejamento'
      case 'active':
        return 'Ativo'
      default:
        return String(status)
    }
  }

  const getStatusIcon = (status: string | undefined | null) => {
    if (!status) return <Clock className="h-4 w-4" />
    const statusLower = String(status).toLowerCase()
    switch (statusLower) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'inprogress':
        return <PlayCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
      case 'canceled':
        return <AlertCircle className="h-4 w-4" />
      case 'draft':
        return <Clock className="h-4 w-4" />
      case 'planning':
        return <Clock className="h-4 w-4" />
      case 'active':
        return <PlayCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Setup':
        return '🔧'
      case 'Soundcheck':
        return '🎵'
      case 'Event':
        return '🎪'
      case 'Teardown':
        return '🧹'
      case 'Meeting':
        return '👥'
      case 'Task':
        return '✓'
      default:
        return '📅'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'Setup':
        return 'Setup'
      case 'Soundcheck':
        return 'Soundcheck'
      case 'Event':
        return 'Evento'
      case 'Teardown':
        return 'Desmontagem'
      case 'Meeting':
        return 'Reunião'
      case 'Task':
        return 'Tarefa'
      default:
        return type
    }
  }

  // Limpar filtros
  const clearFilters = () => {
    setFilterDate('')
    setFilterEventId('')
  }

  // Agrupar items da timeline por data (usar timelineItems)
  const groupedItems = timelineItems.reduce((acc, item) => {
    const date = new Date(item.startTime).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {} as { [key: string]: TimelineItem[] })

  // Ordenar items por horário (já está ordenado no useEffect, mas garantir)
  Object.keys(groupedItems).forEach(date => {
    groupedItems[date].sort((a, b) => 
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

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
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

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Filtro de Data */}
              <div className="flex-1 sm:max-w-xs">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Data Inicial
                </label>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full"
                  placeholder="Filtrar a partir da data"
                />
              </div>

              {/* Filtro de Evento */}
              <div className="flex-1 sm:max-w-xs">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Evento
                </label>
                <select
                  value={filterEventId}
                  onChange={(e) => setFilterEventId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  disabled={isLoadingEvents}
                >
                  <option value="">Todos os Eventos</option>
                  {allEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botão Limpar Filtros */}
              {(filterDate || filterEventId) && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Limpar</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum item encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterDate || filterEventId
                ? 'Nenhum cronograma ou evento corresponde aos filtros aplicados. Tente ajustar os filtros.'
                : 'Comece criando seu primeiro cronograma ou evento.'}
            </p>
            {(filterDate || filterEventId) ? (
              <div className="mt-6">
                <Button onClick={clearFilters} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            ) : (
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
        ) : (
          Object.entries(groupedItems).map(([date, dayItems]) => (
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
                    {dayItems.length} item{dayItems.length !== 1 ? 's' : ''} ({dayItems.filter(i => i.source === 'schedule').length} cronograma{dayItems.filter(i => i.source === 'schedule').length !== 1 ? 's' : ''}, {dayItems.filter(i => i.source === 'event').length} evento{dayItems.filter(i => i.source === 'event').length !== 1 ? 's' : ''})
                  </p>
                </div>
              </div>

              {/* Timeline Items */}
              <div className="ml-6 space-y-4">
                {dayItems.map((item, index) => (
                  <div key={item.id} className="relative">
                    {/* Timeline Line */}
                    {index < dayItems.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                    )}
                    
                    {/* Timeline Item */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${getStatusColor(item.status)} ${item.source === 'event' ? 'border-2 border-blue-500' : ''}`}>
                          {getTypeIcon(item.type)}
                        </div>
                      </div>
                      
                      <Card className="flex-1 hover:shadow-lg transition-shadow min-w-0">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-base sm:text-lg truncate">{item.title}</h3>
                                {item.source === 'event' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                                    Evento
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 mt-2">
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                  <Clock className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {item.source === 'event' 
                                      ? `${formatDate(item.startTime)} - ${formatDate(item.endTime)}`
                                      : `${formatDateTime(item.startTime)} - ${formatDateTime(item.endTime)}`
                                    }
                                  </span>
                                </span>
                                {item.eventName && (
                                  <span className="flex items-center gap-1 whitespace-nowrap">
                                    <Users className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{item.eventName}</span>
                                  </span>
                                )}
                                {item.location && (
                                  <span className="flex items-center gap-1 whitespace-nowrap">
                                    <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{item.location}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-2 flex-shrink-0">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap">
                                {getTypeText(item.type)}
                              </span>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(item.status)}
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(item.status)}`}>
                                  {getStatusText(item.status)}
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

