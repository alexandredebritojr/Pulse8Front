'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Search,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { SchedulesService, ScheduleDto } from '@/lib/api/schedules'
import { EventsService, EventDto } from '@/lib/api/events'
import { formatDate, formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { CalendarEvent } from '@/lib/mock-calendar-events'
import BigCalendarView from '@/components/calendar/BigCalendarView'
import { View as BigCalendarViewType } from 'react-big-calendar'

type ViewType = 'day' | 'week' | 'month' | 'year'

// Gerar cor aleatória baseada no ID do evento para garantir cores únicas
const getScheduleColorValue = (eventId: string, type?: string) => {
  // Paleta de cores vibrantes e variadas (40 cores únicas)
  const colorPalette = [
    '#4285f4', // Azul Google
    '#34a853', // Verde Google
    '#ea4335', // Vermelho Google
    '#fbbc04', // Amarelo Google
    '#9c27b0', // Roxo
    '#ff9800', // Laranja
    '#00bcd4', // Ciano
    '#e91e63', // Rosa
    '#4caf50', // Verde claro
    '#ff5722', // Vermelho escuro
    '#2196f3', // Azul claro
    '#9e9e9e', // Cinza
    '#795548', // Marrom
    '#607d8b', // Azul acinzentado
    '#3f51b5', // Índigo
    '#009688', // Teal
    '#cddc39', // Lima
    '#ffc107', // Âmbar
    '#f44336', // Vermelho claro
    '#673ab7', // Roxo escuro
    '#03a9f4', // Azul claro
    '#8bc34a', // Verde claro
    '#ffeb3b', // Amarelo
    '#424242', // Cinza escuro
    '#ff6f00', // Laranja escuro
    '#c2185b', // Rosa escuro
    '#7b1fa2', // Roxo escuro
    '#1976d2', // Azul escuro
    '#388e3c', // Verde escuro
    '#d32f2f', // Vermelho escuro
    '#f57c00', // Laranja escuro
    '#512da8', // Roxo muito escuro
    '#303f9f', // Índigo escuro
    '#0288d1', // Azul claro
    '#00796b', // Teal escuro
    '#689f38', // Verde claro
    '#fbc02d', // Amarelo escuro
    '#e64a19', // Laranja vermelho
    '#5d4037', // Marrom escuro
    '#455a64', // Azul acinzentado escuro
    '#616161'  // Cinza médio
  ]
  
  // Gerar um hash simples do ID do evento para selecionar uma cor da paleta
  // Isso garante que o mesmo evento sempre terá a mesma cor (determinístico)
  let hash = 0
  for (let i = 0; i < eventId.length; i++) {
    hash = eventId.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Usar o hash para selecionar uma cor da paleta
  const index = Math.abs(hash) % colorPalette.length
  return colorPalette[index]
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>('week')
  const [schedules, setSchedules] = useState<ScheduleDto[]>([])
  const [events, setEvents] = useState<EventDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const dayViewRef = useRef<HTMLDivElement>(null)
  const weekViewRef = useRef<HTMLDivElement>(null)

  // Carregar schedules e events da API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        // Calcular range de datas baseado na view atual
        const { startDate, endDate } = getDateRange(currentDate, viewType)
        
        // Para garantir que eventos multi-dia sejam incluídos, buscar eventos desde alguns dias antes
        // Isso é especialmente importante para visualização diária
        const searchStartDate = new Date(startDate || currentDate)
        searchStartDate.setDate(searchStartDate.getDate() - 7) // Buscar 7 dias antes para capturar eventos multi-dia
        
        // Garantir que a data está em UTC para evitar problemas com PostgreSQL
        // Criar data em UTC meia-noite
        const searchStartDateUTC = new Date(Date.UTC(
          searchStartDate.getUTCFullYear(),
          searchStartDate.getUTCMonth(),
          searchStartDate.getUTCDate(),
          0, 0, 0, 0
        ))
        // Formatar como string YYYY-MM-DD em UTC
        const startDateString = searchStartDateUTC.toISOString().split('T')[0]
        
        // Carregar schedules e events em paralelo
        // Para events, vamos tentar sem startDate primeiro se causar problemas no backend
        const [schedulesResponse, eventsResponse] = await Promise.all([
          SchedulesService.getSchedules({
            pageNumber: 1,
            pageSize: 1000,
            organizationId: organizationId,
            startDate: startDateString
          }).catch(err => {
            console.error('Erro ao carregar schedules:', err)
            return { schedules: [], totalCount: 0, pageNumber: 1, pageSize: 1000, totalPages: 0 }
          }),
          EventsService.getEvents({
            pageNumber: 1,
            pageSize: 1000,
            organizationId: organizationId
            // Remover startDate temporariamente para evitar erro de timezone no backend
            // O filtro será feito no frontend após carregar
          }).catch(err => {
            console.error('Erro ao carregar events:', err)
            return { events: [], totalCount: 0, pageNumber: 1, pageSize: 1000, totalPages: 0 }
          })
        ])
        
        // Filtrar schedules que se sobrepõem ao período visualizado
        // Um evento deve ser incluído se ele começa antes do fim do período E termina depois do início
        let filteredSchedules = schedulesResponse.schedules || []
        if (startDate && endDate) {
          filteredSchedules = filteredSchedules.filter(schedule => {
            const scheduleStart = new Date(schedule.startTime)
            const scheduleEnd = new Date(schedule.endTime)
            // Verificar sobreposição: evento começa antes ou no fim do período E termina depois ou no início
            // Isso garante que eventos multi-dia sejam incluídos em todos os dias que cobrem
            return scheduleStart <= endDate && scheduleEnd >= startDate
          })
        }
        
        // Filtrar events que se sobrepõem ao período visualizado
        let filteredEvents = eventsResponse.events || []
        if (startDate && endDate) {
          filteredEvents = filteredEvents.filter(event => {
            const eventStart = new Date(event.startDate)
            const eventEnd = new Date(event.endDate)
            // Verificar sobreposição: evento começa antes ou no fim do período E termina depois ou no início
            return eventStart <= endDate && eventEnd >= startDate
          })
        }
        
        setSchedules(filteredSchedules)
        setEvents(filteredEvents)
        
        // Disponibilizar dados para o chat (se existir)
        // Armazenar no window para acesso global do chat
        if (typeof window !== 'undefined') {
          (window as any).calendarData = {
            schedules: filteredSchedules,
            events: filteredEvents,
            lastUpdated: new Date().toISOString()
          }
        }
      } catch (err: any) {
        console.error('❌ Erro ao carregar dados:', err)
        setError(err.message || 'Erro ao carregar dados do calendário')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [currentDate, viewType])

  // Scroll automático para a hora atual quando visualizar o dia/semana atual
  useEffect(() => {
    if (isLoading) return
    
    const now = new Date()
    const hourHeight = 64
    
    // Scroll para view diária
    if (viewType === 'day' && dayViewRef.current) {
      const isToday = currentDate.getFullYear() === now.getFullYear() &&
                     currentDate.getMonth() === now.getMonth() &&
                     currentDate.getDate() === now.getDate()
      
      if (isToday) {
        const currentHour = now.getHours()
        const currentMinutes = now.getMinutes()
        const currentTimeMinutes = currentHour * 60 + currentMinutes
        const scrollPosition = (currentTimeMinutes / 60) * hourHeight - 200 // Offset de 200px para mostrar um pouco antes
        
        setTimeout(() => {
          if (dayViewRef.current) {
            dayViewRef.current.scrollTop = Math.max(0, scrollPosition)
          }
        }, 200)
      }
    }
    
    // Scroll para view semanal
    if (viewType === 'week' && weekViewRef.current) {
      const { startDate, endDate } = getDateRange(currentDate, 'week')
      
      if (startDate && endDate) {
        const isCurrentWeek = now >= startDate && now <= endDate
        
        if (isCurrentWeek) {
          const currentHour = now.getHours()
          const currentMinutes = now.getMinutes()
          const currentTimeMinutes = currentHour * 60 + currentMinutes
          const scrollPosition = (currentTimeMinutes / 60) * hourHeight - 200 // Offset de 200px para mostrar um pouco antes
          
          setTimeout(() => {
            if (weekViewRef.current) {
              weekViewRef.current.scrollTop = Math.max(0, scrollPosition)
            }
          }, 200)
        }
      }
    }
  }, [viewType, currentDate, isLoading])

  // Filtrar schedules por busca
  const filteredSchedules = useMemo(() => {
    if (!searchTerm) return schedules
    const term = searchTerm.toLowerCase()
    return schedules.filter(schedule => 
      schedule.title.toLowerCase().includes(term) ||
      schedule.description?.toLowerCase().includes(term) ||
      schedule.eventName?.toLowerCase().includes(term)
    )
  }, [schedules, searchTerm])

  // Filtrar events por busca
  const filteredEventsFromApi = useMemo(() => {
    if (!searchTerm) return events
    const term = searchTerm.toLowerCase()
    return events.filter(event => 
      event.name.toLowerCase().includes(term) ||
      event.description?.toLowerCase().includes(term) ||
      event.location?.toLowerCase().includes(term)
    )
  }, [events, searchTerm])

  // Função para calcular range de datas baseado na view
  const getDateRange = (date: Date, view: ViewType) => {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    switch (view) {
      case 'day':
        return { startDate: start, endDate: end }
      case 'week':
        const weekStart = new Date(start)
        weekStart.setDate(start.getDate() - start.getDay()) // Domingo
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)
        return { startDate: weekStart, endDate: weekEnd }
      case 'month':
        const monthStart = new Date(start.getFullYear(), start.getMonth(), 1)
        const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0)
        monthEnd.setHours(23, 59, 59, 999)
        return { startDate: monthStart, endDate: monthEnd }
      case 'year':
        const yearStart = new Date(start.getFullYear(), 0, 1)
        const yearEnd = new Date(start.getFullYear(), 11, 31)
        yearEnd.setHours(23, 59, 59, 999)
        return { startDate: yearStart, endDate: yearEnd }
      default:
        return { startDate: start, endDate: end }
    }
  }

  // Navegar para hoje
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Navegar para período anterior/próximo
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    
    switch (viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1))
        break
    }
    
    setCurrentDate(newDate)
  }

  // Obter título do período atual
  const getPeriodTitle = () => {
    switch (viewType) {
      case 'day':
        return currentDate.toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })
      case 'week':
        const { startDate, endDate } = getDateRange(currentDate, 'week')
        if (startDate && endDate) {
          if (startDate.getMonth() === endDate.getMonth()) {
            return `${startDate.getDate()}-${endDate.getDate()} de ${startDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
          }
          return `${startDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`
        }
        return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      case 'month':
        return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      case 'year':
        return currentDate.getFullYear().toString()
      default:
        return ''
    }
  }

  // Obter cor do tipo de schedule
  const getScheduleColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Setup': 'bg-blue-100 text-blue-800 border-blue-200',
      'Soundcheck': 'bg-purple-100 text-purple-800 border-purple-200',
      'Event': 'bg-green-100 text-green-800 border-green-200',
      'Teardown': 'bg-orange-100 text-orange-800 border-orange-200',
      'Meeting': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Task': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Renderizar view diária
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const currentDayStart = new Date(currentDate)
    currentDayStart.setHours(0, 0, 0, 0)
    const currentDayEnd = new Date(currentDate)
    currentDayEnd.setHours(23, 59, 59, 999)
    
    // Normalizar currentDate para comparar apenas a data (sem hora)
    const currentDateNormalized = new Date(currentDate)
    currentDateNormalized.setHours(0, 0, 0, 0)
    
    const daySchedules = filteredSchedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startTime)
      scheduleDate.setHours(0, 0, 0, 0)
      
      // Comparar timestamps normalizados (só data, sem hora)
      return scheduleDate.getTime() === currentDateNormalized.getTime()
    })
    const headerHeight = 64 // altura do header
    const hourHeight = 64 // altura por hora
    const totalHoursHeight = 24 * hourHeight // altura total das horas

    return (
      <div ref={dayViewRef} className="h-full overflow-y-auto overflow-x-hidden bg-white">
        <div className="flex" style={{ height: `${headerHeight + totalHoursHeight}px` }}>
          {/* Time column */}
          <div className="sticky left-0 z-10 bg-white border-r border-gray-200" style={{ width: '80px', minWidth: '80px' }}>
            <div className="h-16 border-b border-gray-300 sticky top-0 bg-white z-10"></div>
            <div style={{ height: `${totalHoursHeight}px` }}>
              {hours.map(hour => (
                <div 
                  key={hour} 
                  className="border-t border-gray-200 flex items-start justify-end pr-2 pt-1" 
                  style={{ height: `${hourHeight}px`, minHeight: `${hourHeight}px` }}
                >
                  <span className="text-xs text-gray-500">{hour.toString().padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>
          </div>

          {/* Events column */}
          <div className="flex-1 relative min-w-0">
            <div className="h-16 border-b border-gray-300 sticky top-0 bg-white z-10"></div>
            <div className="relative" style={{ height: `${totalHoursHeight}px` }}>
              {/* Hour grid lines */}
              {hours.map(hour => (
                <div 
                  key={hour} 
                  className="absolute border-t border-gray-200 pointer-events-none" 
                  style={{ 
                    top: `${hour * hourHeight}px`,
                    left: 0,
                    right: 0,
                    height: `${hourHeight}px`
                  }}
                ></div>
              ))}
              
              {/* Render all schedules that appear in this day */}
              {daySchedules.map((schedule) => {
                const start = new Date(schedule.startTime)
                const end = new Date(schedule.endTime)
                
                // Calcular minutos do dia (0-1439, onde 0 = 00:00 e 1439 = 23:59)
                const startMinutes = start.getHours() * 60 + start.getMinutes()
                const endMinutes = end.getHours() * 60 + end.getMinutes()
                
                // Calcular posição e altura
                // O top é relativo ao container que já está posicionado após o header
                const duration = endMinutes - startMinutes
                const top = (startMinutes / 60) * hourHeight
                const height = Math.max((duration / 60) * hourHeight, 24)

                return (
                  <div
                    key={schedule.id}
                    className={`absolute left-1 right-1 rounded px-2 py-1 text-xs border ${getScheduleColor(schedule.type)}`}
                    style={{ top: `${top}px`, height: `${height}px`, zIndex: 10 }}
                    title={`${schedule.title} - ${formatDateTime(schedule.startTime)} - ${formatDateTime(schedule.endTime)}`}
                  >
                    <div className="font-medium truncate">{schedule.title}</div>
                    <div className="text-xs opacity-75 truncate">
                      {start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar view semanal
  const renderWeekView = () => {
    const { startDate, endDate } = getDateRange(currentDate, 'week')
    if (!startDate || !endDate) return null

    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }

    const hours = Array.from({ length: 24 }, (_, i) => i)
    const isToday = (date: Date) => date.toDateString() === new Date().toDateString()
    const headerHeight = 64 // altura do header
    const hourHeight = 64 // altura por hora
    const totalHoursHeight = 24 * hourHeight // altura total das horas

    return (
      <div ref={weekViewRef} className="h-full overflow-y-auto overflow-x-hidden bg-white">
        <div className="flex min-w-full" style={{ height: `${headerHeight + totalHoursHeight}px` }}>
          {/* Time column */}
          <div className="sticky left-0 z-20 bg-white border-r border-gray-200" style={{ width: '80px', minWidth: '80px' }}>
            <div className="h-16 border-b border-gray-300 sticky top-0 bg-white z-20"></div>
            <div style={{ height: `${totalHoursHeight}px` }}>
              {hours.map(hour => (
                <div 
                  key={hour} 
                  className="border-t border-gray-200 flex items-start justify-end pr-2 pt-1" 
                  style={{ height: `${hourHeight}px`, minHeight: `${hourHeight}px` }}
                >
                  <span className="text-xs text-gray-500">{hour.toString().padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>
          </div>

          {/* Day columns */}
          {days.map((day, dayIdx) => {
            const daySchedules = filteredSchedules.filter(schedule => {
              const scheduleDate = new Date(schedule.startTime)
              // Comparar ano, mês e dia
              return scheduleDate.getFullYear() === day.getFullYear() &&
                     scheduleDate.getMonth() === day.getMonth() &&
                     scheduleDate.getDate() === day.getDate()
            })

            return (
              <div key={dayIdx} className="flex-1 border-r border-gray-200 relative min-w-0" style={{ minWidth: 'calc((100% - 80px) / 7)' }}>
                {/* Day header */}
                <div className={`sticky top-0 z-10 h-16 border-b border-gray-300 flex flex-col items-center justify-center p-2 bg-white ${isToday(day) ? 'bg-blue-50' : 'bg-white'}`}>
                  <div className={`text-xs font-medium ${isToday(day) ? 'text-blue-600' : 'text-gray-600'}`}>
                    {day.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase()}
                  </div>
                  <div className={`text-lg font-semibold ${isToday(day) ? 'text-blue-600' : 'text-gray-900'}`}>
                    {day.getDate()}
                  </div>
                </div>

                {/* Hour slots */}
                <div className="relative" style={{ height: `${totalHoursHeight}px` }}>
                  {/* Hour grid lines */}
                  {hours.map(hour => (
                    <div 
                      key={hour} 
                      className="absolute border-t border-gray-200 pointer-events-none" 
                      style={{ 
                        top: `${hour * hourHeight}px`,
                        left: 0,
                        right: 0,
                        height: `${hourHeight}px`
                      }}
                    ></div>
                  ))}
                  
                  {/* Render all schedules that appear in this day */}
                  {daySchedules.map((schedule) => {
                    const start = new Date(schedule.startTime)
                    const end = new Date(schedule.endTime)
                    
                    // Calcular minutos do dia (0-1439, onde 0 = 00:00 e 1439 = 23:59)
                    const startMinutes = start.getHours() * 60 + start.getMinutes()
                    const endMinutes = end.getHours() * 60 + end.getMinutes()
                    
                    // Calcular posição e altura
                    const duration = endMinutes - startMinutes
                    const top = (startMinutes / 60) * hourHeight
                    const height = Math.max((duration / 60) * hourHeight, 24)

                    return (
                      <div
                        key={schedule.id}
                        className={`absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 text-xs border ${getScheduleColor(schedule.type)}`}
                        style={{ top: `${top}px`, height: `${height}px`, zIndex: 10 }}
                        title={`${schedule.title} - ${formatDateTime(schedule.startTime)} - ${formatDateTime(schedule.endTime)}`}
                      >
                        <div className="font-medium truncate">{schedule.title}</div>
                        <div className="text-xs opacity-75 truncate">
                          {start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Renderizar view mensal
  const renderMonthView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay()) // Domingo

    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    return (
      <div className="h-full overflow-auto bg-white">
        <div className="grid grid-cols-7 h-full" style={{ minHeight: 'calc(100vh - 200px)' }}>
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="bg-white p-3 text-center text-sm font-semibold text-gray-700 sticky top-0 z-10 border-b border-gray-300">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((date, idx) => {
            const isCurrentMonth = date.getMonth() === month
            const isToday = date.toDateString() === today.toDateString()
            const daySchedules = filteredSchedules.filter(schedule => {
              const scheduleDate = new Date(schedule.startTime)
              scheduleDate.setHours(0, 0, 0, 0)
              const dateNormalized = new Date(date)
              dateNormalized.setHours(0, 0, 0, 0)
              return scheduleDate.getTime() === dateNormalized.getTime()
            })

            return (
              <div
                key={idx}
                className={`flex flex-col bg-white border-r border-b border-gray-200 ${!isCurrentMonth ? 'bg-gray-50' : ''}`}
                style={{ minHeight: 'calc((100vh - 200px) / 6)' }}
              >
                <div className="p-2 flex-shrink-0">
                  <div className={`text-sm font-medium ${isToday ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                    {date.getDate()}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
                  {daySchedules.slice(0, 5).map(schedule => (
                    <div
                      key={schedule.id}
                      className={`text-xs px-2 py-1 rounded cursor-pointer hover:opacity-90 border ${getScheduleColor(schedule.type)}`}
                      title={`${schedule.title} - ${formatDateTime(schedule.startTime)}`}
                    >
                      <div className="font-medium truncate">{schedule.title}</div>
                      <div className="text-xs opacity-75 truncate">
                        {new Date(schedule.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  {daySchedules.length > 5 && (
                    <div className="text-xs text-gray-500 px-2 font-medium">
                      +{daySchedules.length - 5} mais
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Renderizar view anual
  const renderYearView = () => {
    const year = currentDate.getFullYear()
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(year, i, 1)
      const lastDay = new Date(year, i + 1, 0)
      return { monthDate, lastDay, monthIndex: i }
    })

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return (
      <div className="h-full overflow-auto bg-white p-2">
        <div className="grid grid-cols-4 gap-2 h-full" style={{ minHeight: 'calc(100vh - 200px)' }}>
          {months.map(({ monthDate, lastDay, monthIndex }) => {
            const monthEvents = filteredEvents.filter(event => {
              const eventDate = new Date(event.start)
              return eventDate.getFullYear() === year && eventDate.getMonth() === monthIndex
            })

            const firstDay = new Date(year, monthIndex, 1)
            const startDate = new Date(firstDay)
            startDate.setDate(startDate.getDate() - startDate.getDay())

            const days = []
            for (let i = 0; i < 42; i++) {
              const date = new Date(startDate)
              date.setDate(startDate.getDate() + i)
              days.push(date)
            }

            return (
              <div key={monthIndex} className="bg-white border border-gray-200 rounded p-2 flex flex-col" style={{ minHeight: 'calc((100vh - 220px) / 3)' }}>
                <div className="font-semibold text-xs mb-1.5 text-gray-900 text-center">
                  {monthNames[monthIndex]}
                </div>
                <div className="grid grid-cols-7 gap-0 text-xs flex-1">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
                    <div key={day} className="text-center text-gray-500 font-medium py-0.5 text-[10px]">
                      {day}
                    </div>
                  ))}
                  {days.map((date, idx) => {
                    const isCurrentMonth = date.getMonth() === monthIndex
                    const isToday = date.toDateString() === today.toDateString() && isCurrentMonth
                    const dayEvents = monthEvents.filter(event => {
                      const eventDate = new Date(event.start)
                      eventDate.setHours(0, 0, 0, 0)
                      const dateNormalized = new Date(date)
                      dateNormalized.setHours(0, 0, 0, 0)
                      return eventDate.getTime() === dateNormalized.getTime()
                    })

                    return (
                      <div
                        key={idx}
                        className={`text-center py-0.5 text-[10px] ${isCurrentMonth ? 'text-gray-900' : 'text-gray-300'} ${isToday ? 'bg-blue-600 text-white rounded' : ''}`}
                      >
                        <div className="relative inline-block">
                          <span className={dayEvents.length > 0 && !isToday ? 'font-semibold' : ''}>
                            {date.getDate()}
                          </span>
                          {dayEvents.length > 0 && !isToday && (
                            <span className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {monthEvents.length > 0 && (
                  <div className="mt-1 text-[10px] text-gray-500 text-center">
                    {monthEvents.length} evento{monthEvents.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Converter schedules e events da API para formato de eventos
  const eventsToUse = useMemo(() => {
    // Converter schedules
    const scheduleEvents = filteredSchedules.map(schedule => ({
      id: schedule.id,
      title: schedule.title,
      start: new Date(schedule.startTime),
      end: new Date(schedule.endTime),
      allDay: false,
      color: getScheduleColorValue(schedule.id, schedule.type),
      description: schedule.description,
      type: 'schedule' as const,
      source: 'schedules' as const
    })) as CalendarEvent[]
    
    // Converter events
    const eventEvents = filteredEventsFromApi.map(event => ({
      id: event.id,
      title: event.name,
      start: new Date(event.startDate),
      end: new Date(event.endDate),
      allDay: true, // Events geralmente são eventos de dia inteiro
      color: getScheduleColorValue(event.id, 'Event'),
      description: event.description,
      type: 'event' as const,
      source: 'events' as const,
      location: event.location
    })) as CalendarEvent[]
    
    // Combinar ambos os tipos de eventos
    return [...scheduleEvents, ...eventEvents]
  }, [filteredSchedules, filteredEventsFromApi])

  // Filtrar eventos por busca
  const filteredEvents = useMemo(() => {
    if (!searchTerm) return eventsToUse
    const term = searchTerm.toLowerCase()
    return eventsToUse.filter(event => 
      event.title.toLowerCase().includes(term) ||
      event.description?.toLowerCase().includes(term)
    )
  }, [eventsToUse, searchTerm])

  // Converter viewType para formato das bibliotecas
  const getBigCalendarView = (): BigCalendarViewType => {
    switch (viewType) {
      case 'day': return 'day'
      case 'week': return 'week'
      case 'month': return 'month'
      default: return 'week'
    }
  }

  // Renderizar view atual usando React Big Calendar
  const renderCurrentView = () => {
    // Se for visualização de ano, usar a view customizada
    if (viewType === 'year') {
      return renderYearView()
    }
    
    return (
      <BigCalendarView
        events={filteredEvents}
        currentDate={currentDate}
        view={getBigCalendarView()}
        onNavigate={setCurrentDate}
        onView={(view) => {
          if (view === 'day') setViewType('day')
          else if (view === 'week') setViewType('week')
          else if (view === 'month') setViewType('month')
        }}
      />
    )
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
        <div className="text-red-600 mb-4">❌ {error}</div>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header - estilo Gmail */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-300 bg-white gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Left side */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="font-medium"
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigatePeriod('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigatePeriod('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="text-base sm:text-lg font-normal text-gray-900 min-w-[150px] sm:min-w-[200px] truncate">
              {getPeriodTitle()}
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48 sm:w-64"
            />
          </div>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            <Input
              type="date"
              value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`}
              onChange={(e) => {
                // Criar data no timezone local para evitar problemas de fuso horário
                const dateString = e.target.value
                if (dateString) {
                  const [year, month, day] = dateString.split('-').map(Number)
                  const selectedDate = new Date(year, month - 1, day)
                  if (!isNaN(selectedDate.getTime())) {
                    setCurrentDate(selectedDate)
                  }
                }
              }}
              className="pl-10 w-40 sm:w-44"
            />
          </div>
          <div className="relative">
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value as ViewType)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            >
              <option value="day">Dia</option>
              <option value="week">Semana</option>
              <option value="month">Mês</option>
              <option value="year">Ano</option>
            </select>
          </div>
          <Link href="/calendar/schedules/create">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Criar</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendar view */}
      <div className="flex-1 min-h-0">
        {renderCurrentView()}
      </div>
    </div>
  )
}
