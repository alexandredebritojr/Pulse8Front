'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Users, 
  TrendingUp, 
  TrendingDown,
  Download,
  Filter,
  RefreshCw,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Award,
  UserCheck,
  UserX,
  QrCode
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GuestsService, GuestDto } from '@/lib/api/guests'
import { CheckinService, CheckinDto } from '@/lib/api/checkin'
import { EventsService, EventDto } from '@/lib/api/events'
import { formatDate } from '@/lib/utils'

export default function GuestsReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedEvent, setSelectedEvent] = useState('all')
  const [guests, setGuests] = useState<GuestDto[]>([])
  const [checkins, setCheckins] = useState<CheckinDto[]>([])
  const [events, setEvents] = useState<EventDto[]>([])

  // Carregar dados da API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        // Buscar convidados, check-ins e eventos
        const guestsPromise = GuestsService.getGuests({
          pageNumber: 1,
          pageSize: 1000,
          organizationId: organizationId
        })
        
        const eventsPromise = EventsService.getEvents({
          pageNumber: 1,
          pageSize: 1000,
          organizationId: organizationId
        })
        
        // Tentar buscar check-ins, mas não falhar se der erro
        let checkinsData = { checkIns: [] as CheckinDto[], totalCount: 0, pageNumber: 1, pageSize: 1000, totalPages: 0, checkedInCount: 0, checkedOutCount: 0 }
        try {
          checkinsData = await CheckinService.getCheckins({
            pageNumber: 1,
            pageSize: 1000
          })
        } catch (checkinError: any) {
          console.warn('⚠️ Aviso: Não foi possível carregar check-ins:', checkinError.message)
          // Continuar sem check-ins - a página ainda funcionará
        }
        
        const [guestsResponse, eventsResponse] = await Promise.all([
          guestsPromise,
          eventsPromise
        ])
        
        setGuests(guestsResponse.guests || [])
        setCheckins(checkinsData.checkIns || [])
        setEvents(eventsResponse.events || [])
      } catch (err: any) {
        console.error('❌ Erro ao carregar dados de convidados:', err)
        setError(err.message || 'Erro ao carregar dados de convidados')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Função para calcular data de início do período
  const getPeriodStartDate = (period: string): Date | null => {
    const now = new Date()
    const start = new Date()
    
    switch (period) {
      case '7d':
        start.setDate(now.getDate() - 7)
        return start
      case '30d':
        start.setDate(now.getDate() - 30)
        return start
      case '90d':
        start.setDate(now.getDate() - 90)
        return start
      case '1y':
        start.setFullYear(now.getFullYear() - 1)
        return start
      case 'all':
      default:
        return null
    }
  }

  // Filtrar dados por período e evento
  const filteredData = useMemo(() => {
    let filteredGuests = [...guests]
    let filteredCheckins = [...checkins]
    
    // Filtrar por período
    if (selectedPeriod !== 'all') {
      const periodStart = getPeriodStartDate(selectedPeriod)
      if (periodStart) {
        filteredCheckins = filteredCheckins.filter(c => {
          const checkinDate = new Date(c.checkinTime)
          return checkinDate >= periodStart
        })
      }
    }
    
    // Filtrar por evento
    if (selectedEvent !== 'all') {
      filteredGuests = filteredGuests.filter(g => g.eventId === selectedEvent)
      filteredCheckins = filteredCheckins.filter(c => c.eventId === selectedEvent)
    }
    
    return { guests: filteredGuests, checkins: filteredCheckins }
  }, [guests, checkins, selectedPeriod, selectedEvent])

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalGuests = filteredData.guests.length
    const checkedIn = filteredData.checkins.length
    const checkInRate = totalGuests > 0 ? (checkedIn / totalGuests) * 100 : 0
    const waitingCheckIn = totalGuests - checkedIn

    // Calcular período anterior para comparação
    const periodStart = getPeriodStartDate(selectedPeriod)
    let previousGuests = 0
    let previousCheckins = 0
    
    if (periodStart && selectedPeriod !== 'all') {
      const periodLength = new Date().getTime() - periodStart.getTime()
      const previousPeriodStart = new Date(periodStart.getTime() - periodLength)
      
      const prevGuests = guests.filter(g => {
        if (!g.createdAt) return false
        const guestDate = new Date(g.createdAt)
        return guestDate >= previousPeriodStart && guestDate < periodStart
      })
      
      const prevCheckins = checkins.filter(c => {
        const checkinDate = new Date(c.checkinTime)
        return checkinDate >= previousPeriodStart && checkinDate < periodStart
      })
      
      previousGuests = prevGuests.length
      previousCheckins = prevCheckins.length
    }
    
    const guestsChange = previousGuests > 0 ? ((totalGuests - previousGuests) / previousGuests) * 100 : 0
    const checkinsChange = previousCheckins > 0 ? ((checkedIn - previousCheckins) / previousCheckins) * 100 : 0
    const previousCheckInRate = previousGuests > 0 ? (previousCheckins / previousGuests) * 100 : 0
    const checkInRateChange = checkInRate - previousCheckInRate

    return {
      totalGuests,
      checkedIn,
      waitingCheckIn,
      checkInRate,
      guestsChange,
      checkinsChange,
      checkInRateChange
    }
  }, [filteredData, guests, checkins, selectedPeriod])

  // Gerar dados de timeline de check-in por hora
  const checkInTimelineData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const hourlyData: { [key: number]: number } = {}
    
    filteredData.checkins.forEach(checkin => {
      const checkinTime = new Date(checkin.checkinTime)
      const hour = checkinTime.getHours()
      hourlyData[hour] = (hourlyData[hour] || 0) + 1
    })
    
    return hours
      .map(hour => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        checkIns: hourlyData[hour] || 0
      }))
      .filter(h => h.checkIns > 0 || hours.indexOf(parseInt(h.hour)) < 13) // Mostrar até 13h ou horas com check-ins
      .slice(0, 12)
  }, [filteredData.checkins])

  // Dados de performance por evento
  const eventPerformanceData = useMemo(() => {
    return events
      .map(event => {
        const eventGuests = filteredData.guests.filter(g => g.eventId === event.id)
        const eventCheckins = filteredData.checkins.filter(c => c.eventId === event.id)
        
        const totalGuests = eventGuests.length
        const checkedIn = eventCheckins.length
        const checkInRate = totalGuests > 0 ? (checkedIn / totalGuests) * 100 : 0
        
        return {
          id: event.id,
          name: event.name,
          totalGuests,
          checkedIn,
          checkInRate,
          date: formatDate(event.startDate)
        }
      })
      .filter(e => e.totalGuests > 0)
      .sort((a, b) => b.checkInRate - a.checkInRate)
      .slice(0, 10)
  }, [events, filteredData])

  // Função para atualizar dados
  const handleRefresh = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
      
      const guestsPromise = GuestsService.getGuests({
        pageNumber: 1,
        pageSize: 1000,
        organizationId: organizationId
      })
      
      const eventsPromise = EventsService.getEvents({
        pageNumber: 1,
        pageSize: 1000,
        organizationId: organizationId
      })
      
      // Tentar buscar check-ins, mas não falhar se der erro
      let checkinsData = { checkIns: [] as CheckinDto[], totalCount: 0, pageNumber: 1, pageSize: 1000, totalPages: 0, checkedInCount: 0, checkedOutCount: 0 }
      try {
        checkinsData = await CheckinService.getCheckins({
          pageNumber: 1,
          pageSize: 1000
        })
      } catch (checkinError: any) {
        console.warn('⚠️ Aviso: Não foi possível carregar check-ins:', checkinError.message)
        // Continuar sem check-ins - a página ainda funcionará
      }
      
      const [guestsResponse, eventsResponse] = await Promise.all([
        guestsPromise,
        eventsPromise
      ])
      
      setGuests(guestsResponse.guests || [])
      setCheckins(checkinsData.checkIns || [])
      setEvents(eventsResponse.events || [])
    } catch (err: any) {
      console.error('❌ Erro ao atualizar dados:', err)
      setError(err.message || 'Erro ao atualizar dados')
    } finally {
      setIsLoading(false)
    }
  }

  const periods = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' },
    { value: '1y', label: 'Último ano' },
    { value: 'all', label: 'Todos os períodos' }
  ]

  // Remover dados mockados - guestTypesData será simplificado já que não temos campo de tipo no GuestDto

  // Função para renderizar gráfico de linha da timeline de check-in
  const renderCheckInTimelineChart = () => {
    if (!checkInTimelineData.length) return null

    const maxCheckIns = Math.max(...checkInTimelineData.map(d => d.checkIns))
    const chartWidth = 600
    const chartHeight = 300
    const padding = 60
    const innerWidth = chartWidth - (padding * 2)
    const innerHeight = chartHeight - (padding * 2)

    const getX = (index: number) => padding + (index * innerWidth / (checkInTimelineData.length - 1))
    const getY = (value: number) => padding + innerHeight - (value / maxCheckIns * innerHeight)

    const points = checkInTimelineData.map((d, i) => `${getX(i)},${getY(d.checkIns)}`).join(' ')

    return (
      <div className="w-full">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <g key={i}>
              <line
                x1={padding}
                y1={padding + (ratio * innerHeight)}
                x2={chartWidth - padding}
                y2={padding + (ratio * innerHeight)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={padding + (ratio * innerHeight) + 4}
                fontSize="12"
                fill="#6b7280"
                textAnchor="end"
              >
                {Math.round(maxCheckIns * (1 - ratio))}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {checkInTimelineData.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={chartHeight - 20}
              fontSize="10"
              fill="#6b7280"
              textAnchor="middle"
            >
              {d.hour}
            </text>
          ))}

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {checkInTimelineData.map((d, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(d.checkIns)}
              r="4"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* Data labels */}
          {checkInTimelineData.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={getY(d.checkIns) - 10}
              fontSize="9"
              fill="#374151"
              textAnchor="middle"
            >
              {d.checkIns}
            </text>
          ))}
        </svg>
      </div>
    )
  }

  // Função para renderizar gráfico de pizza de status de check-in
  const renderGuestTypesPieChart = () => {
    const checkedInCount = stats.checkedIn
    const waitingCount = stats.waitingCheckIn
    const total = stats.totalGuests
    
    if (total === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Nenhum dado disponível
        </div>
      )
    }

    const data = [
      { type: 'Check-in Realizado', count: checkedInCount, percentage: stats.checkInRate, color: '#10b981' },
      { type: 'Aguardando Check-in', count: waitingCount, percentage: (waitingCount / total) * 100, color: '#f59e0b' }
    ]

    const chartSize = 200
    const centerX = chartSize / 2
    const centerY = chartSize / 2
    const radius = 80

    let currentAngle = 0

    return (
      <div className="w-full">
        <div className="flex items-center justify-center">
          <svg width={chartSize} height={chartSize} className="overflow-visible">
            {data.map((item, index) => {
              if (item.count === 0) return null
              const percentage = item.count / total
              const angle = percentage * 360
              const startAngle = currentAngle
              const endAngle = currentAngle + angle
              
              const startAngleRad = (startAngle * Math.PI) / 180
              const endAngleRad = (endAngle * Math.PI) / 180
              
              const x1 = centerX + radius * Math.cos(startAngleRad)
              const y1 = centerY + radius * Math.sin(startAngleRad)
              const x2 = centerX + radius * Math.cos(endAngleRad)
              const y2 = centerY + radius * Math.sin(endAngleRad)
              
              const largeArcFlag = angle > 180 ? 1 : 0
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ')

              currentAngle += angle

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="2"
                />
              )
            })}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700">{item.type}</span>
              </div>
              <div className="text-gray-500">
                {item.count} ({item.percentage.toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>
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
        <Button onClick={handleRefresh}>
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatório de Convidados</h1>
            <p className="text-gray-600">Análise detalhada dos convidados e check-in</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>{period.label}</option>
            ))}
          </select>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos os eventos</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Guests Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Convidados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.guestsChange > 0 ? (
                <span className="text-green-600">+{stats.guestsChange.toFixed(1)}%</span>
              ) : stats.guestsChange < 0 ? (
                <span className="text-red-600">{stats.guestsChange.toFixed(1)}%</span>
              ) : (
                <span>Sem alteração</span>
              )} vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in Realizado</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
            <p className="text-xs text-muted-foreground">
              {stats.checkinsChange > 0 ? (
                <span className="text-green-600">+{stats.checkinsChange.toFixed(1)}%</span>
              ) : stats.checkinsChange < 0 ? (
                <span className="text-red-600">{stats.checkinsChange.toFixed(1)}%</span>
              ) : (
                <span>Sem alteração</span>
              )} vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Check-in</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.checkInRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.checkInRateChange > 0 ? (
                <span className="text-green-600">+{stats.checkInRateChange.toFixed(1)}%</span>
              ) : stats.checkInRateChange < 0 ? (
                <span className="text-red-600">{stats.checkInRateChange.toFixed(1)}%</span>
              ) : (
                <span>Sem alteração</span>
              )} vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Check-in</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.waitingCheckIn}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalGuests > 0 
                ? `${((stats.waitingCheckIn / stats.totalGuests) * 100).toFixed(1)}% do total`
                : 'Nenhum convidado'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Timeline de Check-in
            </CardTitle>
            <CardDescription>
              Evolução do check-in ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderCheckInTimelineChart()}
          </CardContent>
        </Card>

        {/* Guest Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Tipos de Convidados
            </CardTitle>
            <CardDescription>
              Distribuição por tipo de convidado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderGuestTypesPieChart()}
          </CardContent>
        </Card>
      </div>

      {/* Guest Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Análise de Check-in
            </CardTitle>
            <CardDescription>
              Estatísticas detalhadas do check-in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Check-in Realizado</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stats.checkedIn}</span>
                  <span className="text-green-600 text-sm">{stats.checkInRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Aguardando Check-in</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stats.waitingCheckIn}</span>
                  <span className="text-orange-600 text-sm">
                    {stats.totalGuests > 0 ? ((stats.waitingCheckIn / stats.totalGuests) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Demografia dos Convidados
            </CardTitle>
            <CardDescription>
              Perfil dos convidados por categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              Informações demográficas não disponíveis nos dados atuais
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Performance by Guests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance por Evento
          </CardTitle>
          <CardDescription>
            Análise de convidados por evento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventPerformanceData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum evento encontrado para análise
            </div>
          ) : (
            <div className="space-y-4">
              {eventPerformanceData.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{event.name}</h4>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.totalGuests} convidados
                      </span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-4 w-4" />
                        {event.checkedIn} check-in
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {event.checkInRate.toFixed(1)}% taxa
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {event.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guest Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Métricas de Engajamento
          </CardTitle>
          <CardDescription>
            Indicadores de participação e engajamento dos convidados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                stats.checkInRate >= 90 ? 'text-green-600' :
                stats.checkInRate >= 70 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {stats.checkInRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Taxa de Check-in</div>
              <div className={`text-xs mt-1 ${
                stats.checkInRate >= 90 ? 'text-green-600' :
                stats.checkInRate >= 70 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {stats.checkInRate >= 90 ? 'Excelente' :
                 stats.checkInRate >= 70 ? 'Bom' :
                 'A melhorar'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.checkedIn}</div>
              <div className="text-sm text-gray-500">Total de Check-ins</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.waitingCheckIn}</div>
              <div className="text-sm text-gray-500">Aguardando Check-in</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalGuests}</div>
              <div className="text-sm text-gray-500">Total de Convidados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Eventos com Melhor Performance
          </CardTitle>
          <CardDescription>
            Ranking dos eventos com melhor taxa de check-in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventPerformanceData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum evento encontrado para análise
            </div>
          ) : (
            <div className="space-y-4">
              {eventPerformanceData.slice(0, 5).map((event, index) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' :
                      'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{event.name}</h4>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>{event.totalGuests} convidados</span>
                        <span>{event.checkInRate.toFixed(1)}% check-in</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${
                      event.checkInRate >= 90 ? 'text-green-600' :
                      event.checkInRate >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {event.checkInRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

