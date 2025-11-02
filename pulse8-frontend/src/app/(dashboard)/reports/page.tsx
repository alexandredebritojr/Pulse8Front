'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Calendar,
  DollarSign,
  Target,
  Award,
  PieChart,
  LineChart,
  Download,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventsService, EventDto } from '@/lib/api/events'
import { GuestsService } from '@/lib/api/guests'
import { RevenueService } from '@/lib/api/revenue'
import { formatCurrency } from '@/lib/utils'

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedEvent, setSelectedEvent] = useState('all')
  const [events, setEvents] = useState<EventDto[]>([])
  const [guests, setGuests] = useState<any[]>([])
  const [revenues, setRevenues] = useState<any[]>([])

  // Carregar dados da API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        const [eventsResponse, guestsResponse, revenuesResponse] = await Promise.all([
          EventsService.getEvents({ pageNumber: 1, pageSize: 1000, organizationId }),
          GuestsService.getGuests({ pageNumber: 1, pageSize: 1000, organizationId }),
          RevenueService.getRevenue({ pageNumber: 1, pageSize: 1000, organizationId })
        ])
        
        setEvents(eventsResponse.events || [])
        setGuests(guestsResponse.guests || [])
        setRevenues(revenuesResponse.revenues || [])
      } catch (err: any) {
        console.error('❌ Erro ao carregar dados:', err)
        setError(err.message || 'Erro ao carregar dados')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalEvents = events.length
    const completedEvents = events.filter(e => String(e.status || '').toLowerCase() === 'completed').length
    const successRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0
    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0)
    const totalGuests = guests.length

    return {
      totalEvents,
      completedEvents,
      successRate,
      totalRevenue,
      totalGuests
    }
  }, [events, revenues, guests])

  // Gerar dados de receita mensal
  const revenueData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const monthlyRevenue: { [key: string]: number } = {}
    
    revenues.forEach(revenue => {
      const date = new Date(revenue.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + revenue.amount
    })
    
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      return {
        month: months[date.getMonth()],
        revenue: monthlyRevenue[monthKey] || 0
      }
    })
  }, [revenues])

  // Gerar dados de distribuição de eventos
  const eventDistributionData = useMemo(() => {
    const typeColors: { [key: string]: string } = {
      'Corporativo': '#3b82f6',
      'Social': '#10b981',
      'Cultural': '#f59e0b',
      'Esportivo': '#ef4444',
      'Religioso': '#8b5cf6',
      'Outros': '#6b7280'
    }
    
    const typeCounts: { [key: string]: number } = {}
    
    events.forEach(event => {
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
    
    const total = events.length
    return Object.entries(typeCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        color: typeColors[type] || '#6b7280'
      }))
      .sort((a, b) => b.count - a.count)
  }, [events])

  const handleRefresh = async () => {
    try {
      setIsLoading(true)
      const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
      const [eventsResponse, guestsResponse, revenuesResponse] = await Promise.all([
        EventsService.getEvents({ pageNumber: 1, pageSize: 1000, organizationId }),
        GuestsService.getGuests({ pageNumber: 1, pageSize: 1000, organizationId }),
        RevenueService.getRevenue({ pageNumber: 1, pageSize: 1000, organizationId })
      ])
      setEvents(eventsResponse.events || [])
      setGuests(guestsResponse.guests || [])
      setRevenues(revenuesResponse.revenues || [])
    } catch (err: any) {
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


  // Função para renderizar gráfico de barras da receita
  const renderRevenueBarChart = () => {
    if (!revenueData.length) return null

    const maxRevenue = Math.max(...revenueData.map(d => d.revenue))
    const chartWidth = 600
    const chartHeight = 300
    const padding = 60
    const innerWidth = chartWidth - (padding * 2)
    const innerHeight = chartHeight - (padding * 2)
    const barWidth = innerWidth / revenueData.length * 0.8
    const barSpacing = innerWidth / revenueData.length

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
                {formatCurrency(maxRevenue * (1 - ratio))}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {revenueData.map((d, i) => (
            <text
              key={i}
              x={padding + (i * barSpacing) + (barSpacing / 2)}
              y={chartHeight - 20}
              fontSize="12"
              fill="#6b7280"
              textAnchor="middle"
            >
              {d.month}
            </text>
          ))}

          {/* Bars */}
          {revenueData.map((d, i) => {
            const barHeight = (d.revenue / maxRevenue) * innerHeight
            const x = padding + (i * barSpacing) + (barSpacing - barWidth) / 2
            const y = padding + innerHeight - barHeight
            
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="#3b82f6"
                  rx="2"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  fontSize="10"
                  fill="#374151"
                  textAnchor="middle"
                >
                  {formatCurrency(d.revenue)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  // Função para renderizar gráfico de pizza da distribuição de eventos
  const renderEventDistributionPieChart = () => {
    if (!eventDistributionData.length) return null

    const chartSize = 200
    const centerX = chartSize / 2
    const centerY = chartSize / 2
    const radius = 80

    let currentAngle = 0

    const total = eventDistributionData.reduce((sum, item) => sum + item.count, 0)

    return (
      <div className="w-full">
        <div className="flex items-center justify-center">
          <svg width={chartSize} height={chartSize} className="overflow-visible">
            {eventDistributionData.map((item, index) => {
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
          {eventDistributionData.map((item, index) => (
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Relatórios & Dashboards</h1>
          <p className="text-sm sm:text-base text-gray-600">Análises e métricas dos seus eventos</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" className="text-xs sm:text-sm">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button variant="outline" onClick={handleRefresh} className="text-xs sm:text-sm">
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar relatórios..."
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>{period.label}</option>
            ))}
          </select>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-w-0"
          >
            <option value="all">Todos os eventos</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
          <Button variant="outline" className="text-xs sm:text-sm">
            <Filter className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Total de eventos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Receita acumulada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convidados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuests}</div>
            <p className="text-xs text-muted-foreground">
              Total de convidados cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              stats.successRate >= 80 ? 'text-green-600' :
              stats.successRate >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {stats.successRate.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completedEvents} de {stats.totalEvents} eventos concluídos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Receita ao Longo do Tempo
            </CardTitle>
            <CardDescription>
              Evolução da receita nos últimos 12 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderRevenueBarChart()}
          </CardContent>
        </Card>

        {/* Events Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição de Eventos
            </CardTitle>
            <CardDescription>
              Tipos de eventos realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderEventDistributionPieChart()}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Relatório Financeiro
            </CardTitle>
            <CardDescription>
              Análise financeira detalhada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Receita Total</span>
                <span className="font-semibold">{formatCurrency(stats.totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Eventos</span>
                <span className="font-semibold">{stats.totalEvents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Convidados</span>
                <span className="font-semibold text-green-600">{stats.totalGuests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Taxa de Sucesso</span>
                <span className="font-semibold text-green-600">{stats.successRate.toFixed(1)}%</span>
              </div>
            </div>
            <Link href="/reports/financial" className="w-full">
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Ver Relatório Completo
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Events Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Relatório de Eventos
            </CardTitle>
            <CardDescription>
              Estatísticas dos eventos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total de Eventos</span>
                <span className="font-semibold">{stats.totalEvents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Eventos Concluídos</span>
                <span className="font-semibold">{stats.completedEvents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Em Andamento</span>
                <span className="font-semibold">
                  {events.filter(e => String(e.status || '').toLowerCase() === 'active').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Taxa de Sucesso</span>
                <span className="font-semibold text-green-600">{stats.successRate.toFixed(1)}%</span>
              </div>
            </div>
            <Link href="/reports/events" className="w-full">
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Ver Relatório Completo
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Guests Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Relatório de Convidados
            </CardTitle>
            <CardDescription>
              Análise de convidados e check-in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total de Convidados</span>
                <span className="font-semibold">{stats.totalGuests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Receita Total</span>
                <span className="font-semibold">{formatCurrency(stats.totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Eventos</span>
                <span className="font-semibold text-green-600">{stats.totalEvents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Taxa de Sucesso</span>
                <span className="font-semibold">{stats.successRate.toFixed(1)}%</span>
              </div>
            </div>
            <Link href="/reports/guests" className="w-full">
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Ver Relatório Completo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

