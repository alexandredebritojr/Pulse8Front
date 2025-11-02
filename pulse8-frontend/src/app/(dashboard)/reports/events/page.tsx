'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Calendar, 
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
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventsService, EventDto } from '@/lib/api/events'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function EventsReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [events, setEvents] = useState<EventDto[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Carregar eventos da API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        // Buscar todos os eventos para o relatório
        const response = await EventsService.getEvents({
          pageNumber: 1,
          pageSize: 1000, // Buscar muitos eventos para o relatório
          organizationId: organizationId
        })
        
        setEvents(response.events || [])
      } catch (err: any) {
        console.error('❌ Erro ao carregar eventos:', err)
        setError(err.message || 'Erro ao carregar eventos')
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [])

  // Função para calcular a data de início baseada no período selecionado
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

  // Filtrar eventos baseado no período e status selecionados
  const filteredEvents = useMemo(() => {
    let filtered = [...events]
    
    // Filtrar por período
    if (selectedPeriod !== 'all') {
      const periodStart = getPeriodStartDate(selectedPeriod)
      if (periodStart) {
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.startDate)
          return eventDate >= periodStart
        })
      }
    }
    
    // Filtrar por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(event => {
        const eventStatus = String(event.status || '').toLowerCase()
        return eventStatus === selectedStatus.toLowerCase()
      })
    }
    
    return filtered
  }, [events, selectedPeriod, selectedStatus])

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalEvents = filteredEvents.length
    const completedEvents = filteredEvents.filter(e => String(e.status || '').toLowerCase() === 'completed').length
    const activeEvents = filteredEvents.filter(e => String(e.status || '').toLowerCase() === 'active').length
    const cancelledEvents = filteredEvents.filter(e => String(e.status || '').toLowerCase() === 'cancelled').length
    const successRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0
    
    // Calcular média de capacidade (convidados)
    const eventsWithCapacity = filteredEvents.filter(e => e.capacity && e.capacity > 0)
    const avgGuests = eventsWithCapacity.length > 0
      ? Math.round(eventsWithCapacity.reduce((sum, e) => sum + (e.capacity || 0), 0) / eventsWithCapacity.length)
      : 0

    // Calcular comparação com período anterior (simplificado - compara com todos os eventos fora do período)
    const periodStart = getPeriodStartDate(selectedPeriod)
    let previousPeriodEvents: EventDto[] = []
    
    if (periodStart && selectedPeriod !== 'all') {
      previousPeriodEvents = events.filter(event => {
        const eventDate = new Date(event.startDate)
        // Eventos no mesmo intervalo antes do período atual
        const periodEnd = new Date(periodStart)
        const periodLength = new Date().getTime() - periodStart.getTime()
        const previousPeriodStart = new Date(periodStart.getTime() - periodLength)
        
        return eventDate >= previousPeriodStart && eventDate < periodStart
      })
    }
    
    const previousCompleted = previousPeriodEvents.filter(e => String(e.status || '').toLowerCase() === 'completed').length
    const previousTotal = previousPeriodEvents.length
    const previousSuccessRate = previousTotal > 0 ? (previousCompleted / previousTotal) * 100 : 0
    
    const successRateChange = successRate - previousSuccessRate
    const eventsChange = previousTotal > 0 ? ((totalEvents - previousTotal) / previousTotal) * 100 : 0

    return {
      totalEvents,
      completedEvents,
      activeEvents,
      cancelledEvents,
      successRate,
      avgGuests,
      successRateChange,
      eventsChange
    }
  }, [filteredEvents, events, selectedPeriod])

  // Gerar dados de timeline baseado nos eventos reais
  const timelineData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const timeline: { [key: string]: number } = {}
    
    // Inicializar todos os meses com 0
    months.forEach(month => {
      timeline[month] = 0
    })
    
    // Contar eventos por mês
    filteredEvents.forEach(event => {
      const eventDate = new Date(event.startDate)
      const monthIndex = eventDate.getMonth()
      const monthName = months[monthIndex]
      if (monthName) {
        timeline[monthName] = (timeline[monthName] || 0) + 1
      }
    })
    
    return months.map(month => ({
      month,
      events: timeline[month] || 0
    }))
  }, [filteredEvents])

  // Gerar dados de tipos de eventos (baseado na descrição/nome - simplificado)
  // Como não temos campo de "tipo" no EventDto, vamos usar categorias baseadas no nome
  const eventTypesData = useMemo(() => {
    const typeColors: { [key: string]: string } = {
      'Corporativo': '#3b82f6',
      'Social': '#10b981',
      'Cultural': '#f59e0b',
      'Esportivo': '#ef4444',
      'Religioso': '#8b5cf6',
      'Outros': '#6b7280'
    }
    
    const typeCounts: { [key: string]: number } = {}
    
    filteredEvents.forEach(event => {
      const nameLower = (event.name || '').toLowerCase()
      let type = 'Outros'
      
      if (nameLower.includes('corporativo') || nameLower.includes('empresa') || nameLower.includes('business')) {
        type = 'Corporativo'
      } else if (nameLower.includes('festa') || nameLower.includes('aniversário') || nameLower.includes('social')) {
        type = 'Social'
      } else if (nameLower.includes('cultural') || nameLower.includes('arte') || nameLower.includes('música')) {
        type = 'Cultural'
      } else if (nameLower.includes('esport') || nameLower.includes('jogo') || nameLower.includes('competição')) {
        type = 'Esportivo'
      } else if (nameLower.includes('religios') || nameLower.includes('igreja') || nameLower.includes('missa')) {
        type = 'Religioso'
      }
      
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })
    
    const total = filteredEvents.length
    const types = Object.entries(typeCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        color: typeColors[type] || '#6b7280'
      }))
      .sort((a, b) => b.count - a.count)
    
    return types
  }, [filteredEvents])

  // Dados de performance dos eventos
  const eventPerformanceData = useMemo(() => {
    return filteredEvents
      .map(event => {
        const status = String(event.status || '').toLowerCase()
        const statusText = 
          status === 'completed' ? 'Concluído' :
          status === 'active' ? 'Ativo' :
          status === 'planning' ? 'Planejamento' :
          status === 'cancelled' ? 'Cancelado' :
          'Indefinido'
        
        return {
          id: event.id,
          name: event.name,
          status: statusText,
          guests: event.capacity || 0,
          revenue: event.totalRevenue || 0,
          rating: 0, // Não temos rating no EventDto
          date: formatDate(event.startDate)
        }
      })
      .sort((a, b) => new Date(b.date.split('/').reverse().join('-')).getTime() - new Date(a.date.split('/').reverse().join('-')).getTime())
      .slice(0, 10) // Limitar a 10 eventos mais recentes
  }, [filteredEvents])

  // Dados de performance por categoria
  const categoryPerformanceData = useMemo(() => {
    const categories: { [key: string]: { count: number; previousCount: number } } = {}
    
    filteredEvents.forEach(event => {
      const nameLower = (event.name || '').toLowerCase()
      let type = 'Outros'
      
      if (nameLower.includes('corporativo') || nameLower.includes('empresa') || nameLower.includes('business')) {
        type = 'Corporativo'
      } else if (nameLower.includes('festa') || nameLower.includes('aniversário') || nameLower.includes('social')) {
        type = 'Social'
      } else if (nameLower.includes('cultural') || nameLower.includes('arte') || nameLower.includes('música')) {
        type = 'Cultural'
      } else if (nameLower.includes('esport') || nameLower.includes('jogo') || nameLower.includes('competição')) {
        type = 'Esportivo'
      } else if (nameLower.includes('religios') || nameLower.includes('igreja') || nameLower.includes('missa')) {
        type = 'Religioso'
      }
      
      if (!categories[type]) {
        categories[type] = { count: 0, previousCount: 0 }
      }
      categories[type].count++
    })
    
    return Object.entries(categories)
      .map(([type, data]) => {
        const change = data.previousCount > 0 
          ? ((data.count - data.previousCount) / data.previousCount) * 100 
          : 0
        return {
          type,
          count: data.count,
          change
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [filteredEvents])

  // Dados de tendências mensais
  const monthlyTrendsData = useMemo(() => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    const monthlyData: { [key: string]: number } = {}
    
    // Contar eventos por mês
    filteredEvents.forEach(event => {
      const eventDate = new Date(event.startDate)
      const monthYear = `${months[eventDate.getMonth()]} ${eventDate.getFullYear()}`
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1
    })
    
    // Pegar os últimos 5 meses com eventos
    const sortedMonths = Object.entries(monthlyData)
      .sort((a, b) => {
        const dateA = new Date(a[0].split(' ').reverse().join('-'))
        const dateB = new Date(b[0].split(' ').reverse().join('-'))
        return dateB.getTime() - dateA.getTime()
      })
      .slice(0, 5)
      .map(([monthYear, count]) => ({
        month: monthYear,
        count,
        change: 0 // Simplificado - poderia calcular comparando com mês anterior
      }))
    
    return sortedMonths
  }, [filteredEvents])

  // Calcular ROI médio
  const avgROI = useMemo(() => {
    const eventsWithROI = filteredEvents.filter(e => e.roi !== null && e.roi !== undefined)
    if (eventsWithROI.length === 0) return 0
    const totalROI = eventsWithROI.reduce((sum, e) => sum + (e.roi || 0), 0)
    return totalROI / eventsWithROI.length
  }, [filteredEvents])

  // Função para atualizar dados
  const handleRefresh = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
      
      const response = await EventsService.getEvents({
        pageNumber: 1,
        pageSize: 1000,
        organizationId: organizationId
      })
      
      setEvents(response.events || [])
    } catch (err: any) {
      console.error('❌ Erro ao atualizar eventos:', err)
      setError(err.message || 'Erro ao atualizar eventos')
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

  const statuses = [
    { value: 'all', label: 'Todos os status' },
    { value: 'planning', label: 'Planejamento' },
    { value: 'active', label: 'Ativo' },
    { value: 'completed', label: 'Concluído' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'draft', label: 'Rascunho' }
  ]

  // Função para renderizar gráfico de linha da timeline de eventos
  const renderTimelineLineChart = () => {
    if (!timelineData.length) return null

    const maxEvents = Math.max(...timelineData.map(d => d.events))
    const chartWidth = 600
    const chartHeight = 300
    const padding = 60
    const innerWidth = chartWidth - (padding * 2)
    const innerHeight = chartHeight - (padding * 2)

    const getX = (index: number) => padding + (index * innerWidth / (timelineData.length - 1))
    const getY = (value: number) => padding + innerHeight - (value / maxEvents * innerHeight)

    const points = timelineData.map((d, i) => `${getX(i)},${getY(d.events)}`).join(' ')

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
                {Math.round(maxEvents * (1 - ratio))}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {timelineData.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={chartHeight - 20}
              fontSize="12"
              fill="#6b7280"
              textAnchor="middle"
            >
              {d.month}
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
          {timelineData.map((d, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(d.events)}
              r="4"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* Data labels */}
          {timelineData.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={getY(d.events) - 10}
              fontSize="10"
              fill="#374151"
              textAnchor="middle"
            >
              {d.events}
            </text>
          ))}
        </svg>
      </div>
    )
  }

  // Função para renderizar gráfico de pizza dos tipos de eventos
  const renderEventTypesPieChart = () => {
    if (!eventTypesData.length) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-gray-500">
            <PieChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhum evento encontrado para categorizar</p>
          </div>
        </div>
      )
    }

    const chartSize = 200
    const centerX = chartSize / 2
    const centerY = chartSize / 2
    const radius = 80

    let currentAngle = 0

    const total = eventTypesData.reduce((sum, item) => sum + item.count, 0)

    return (
      <div className="w-full">
        <div className="flex items-center justify-center">
          <svg width={chartSize} height={chartSize} className="overflow-visible">
            {eventTypesData.map((item, index) => {
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
          {eventTypesData.map((item, index) => (
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
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Link href="/reports" className="flex-shrink-0">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Relatório de Eventos</h1>
            <p className="text-sm sm:text-base text-gray-600">Análise detalhada dos eventos realizados</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" className="text-xs sm:text-sm">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </Button>
          <Button variant="outline" onClick={handleRefresh} className="text-xs sm:text-sm">
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-wrap gap-2">
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Events Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.eventsChange > 0 ? (
                <span className="text-green-600">+{stats.eventsChange.toFixed(1)}%</span>
              ) : stats.eventsChange < 0 ? (
                <span className="text-red-600">{stats.eventsChange.toFixed(1)}%</span>
              ) : (
                <span>Sem alteração</span>
              )} vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalEvents > 0 ? `${((stats.completedEvents / stats.totalEvents) * 100).toFixed(1)}% do total` : 'Nenhum evento'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.successRateChange > 0 ? (
                <span className="text-green-600">+{stats.successRateChange.toFixed(1)}%</span>
              ) : stats.successRateChange < 0 ? (
                <span className="text-red-600">{stats.successRateChange.toFixed(1)}%</span>
              ) : (
                <span>Sem alteração</span>
              )} vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Convidados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgGuests}</div>
            <p className="text-xs text-muted-foreground">
              Por evento {stats.avgGuests > 0 ? 'com capacidade definida' : 'sem dados'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Timeline de Eventos
            </CardTitle>
            <CardDescription>
              Distribuição dos eventos ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderTimelineLineChart()}
          </CardContent>
        </Card>

        {/* Event Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Tipos de Eventos
            </CardTitle>
            <CardDescription>
              Distribuição por categoria de evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderEventTypesPieChart()}
          </CardContent>
        </Card>
      </div>

      {/* Event Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance dos Eventos
          </CardTitle>
          <CardDescription>
            Análise detalhada de cada evento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eventPerformanceData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum evento encontrado para o período selecionado
              </div>
            ) : (
              eventPerformanceData.map((event) => (
                <div key={event.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h4 className="font-medium truncate">{event.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        event.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                        event.status === 'Ativo' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'Planejamento' ? 'bg-yellow-100 text-yellow-800' :
                        event.status === 'Cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      {event.guests > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          {event.guests} convidados
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        {event.date}
                      </span>
                      {event.revenue > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 flex-shrink-0" />
                          {formatCurrency(event.revenue)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Eye className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Ver Detalhes</span>
                        <span className="sm:hidden">Ver</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Categories Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Performance por Categoria
            </CardTitle>
            <CardDescription>
              Análise de performance por tipo de evento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryPerformanceData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum evento encontrado para análise
              </div>
            ) : (
              <div className="space-y-3">
                {categoryPerformanceData.map((category) => (
                  <div key={category.type} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{category.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{category.count} {category.count === 1 ? 'evento' : 'eventos'}</span>
                      {category.change !== 0 && (
                        <span className={`text-sm ${category.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {category.change > 0 ? '+' : ''}{category.change.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendências Mensais
            </CardTitle>
            <CardDescription>
              Evolução do número de eventos por mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyTrendsData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum evento encontrado para análise
              </div>
            ) : (
              <div className="space-y-3">
                {monthlyTrendsData.map((trend) => (
                  <div key={trend.month} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{trend.month}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{trend.count} {trend.count === 1 ? 'evento' : 'eventos'}</span>
                      {trend.change !== 0 && (
                        <span className={`text-sm ${trend.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Métricas de Sucesso
          </CardTitle>
          <CardDescription>
            Indicadores de performance dos eventos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.successRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-500">Taxa de Sucesso</div>
              <div className={`text-xs mt-1 ${
                stats.successRate >= 80 ? 'text-green-600' :
                stats.successRate >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {stats.successRate >= 80 ? 'Excelente' :
                 stats.successRate >= 60 ? 'Bom' :
                 'A melhorar'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">-</div>
              <div className="text-sm text-gray-500">Avaliação Média</div>
              <div className="text-xs text-blue-600 mt-1">Não disponível</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.avgGuests}</div>
              <div className="text-sm text-gray-500">Média de Convidados</div>
              <div className="text-xs text-purple-600 mt-1">Por Evento</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{avgROI > 0 ? avgROI.toFixed(1) : '-'}</div>
              <div className="text-sm text-gray-500">ROI Médio</div>
              <div className={`text-xs mt-1 ${avgROI > 0 ? (avgROI > 2 ? 'text-green-600' : avgROI > 1 ? 'text-orange-600' : 'text-red-600') : 'text-gray-500'}`}>
                {avgROI > 0 ? (avgROI > 2 ? 'Excelente' : avgROI > 1 ? 'Bom' : 'A melhorar') : 'Sem dados'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

