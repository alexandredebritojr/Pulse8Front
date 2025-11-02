'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Download,
  Filter,
  RefreshCw,
  Target,
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
  Users,
  DollarSign,
  Activity,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventsService, EventDto } from '@/lib/api/events'
import { GuestsService } from '@/lib/api/guests'
import { RevenueService } from '@/lib/api/revenue'
import { ExpensesService } from '@/lib/api/expenses'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function PerformanceReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('all')
  const [events, setEvents] = useState<EventDto[]>([])
  const [guests, setGuests] = useState<any[]>([])
  const [revenues, setRevenues] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])

  // Carregar dados da API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        const [eventsResponse, guestsResponse, revenuesResponse, expensesResponse] = await Promise.all([
          EventsService.getEvents({ pageNumber: 1, pageSize: 1000, organizationId }),
          GuestsService.getGuests({ pageNumber: 1, pageSize: 1000, organizationId }),
          RevenueService.getRevenue({ pageNumber: 1, pageSize: 1000, organizationId }),
          ExpensesService.getExpenses({ pageNumber: 1, pageSize: 1000, organizationId })
        ])
        
        setEvents(eventsResponse.events || [])
        setGuests(guestsResponse.guests || [])
        setRevenues(revenuesResponse.revenues || [])
        setExpenses(expensesResponse.expenses || [])
      } catch (err: any) {
        console.error('❌ Erro ao carregar dados:', err)
        setError(err.message || 'Erro ao carregar dados')
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
      case '7d': start.setDate(now.getDate() - 7); return start
      case '30d': start.setDate(now.getDate() - 30); return start
      case '90d': start.setDate(now.getDate() - 90); return start
      case '1y': start.setFullYear(now.getFullYear() - 1); return start
      default: return null
    }
  }

  // Calcular performance geral baseada em eventos concluídos
  const performanceStats = useMemo(() => {
    const totalEvents = events.length
    const completedEvents = events.filter(e => String(e.status || '').toLowerCase() === 'completed').length
    const activeEvents = events.filter(e => String(e.status || '').toLowerCase() === 'active').length
    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const profit = totalRevenue - totalExpenses
    const successRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0
    
    // Score de performance combinado (0-100)
    const performanceScore = 
      (successRate * 0.4) + // 40% baseado em taxa de sucesso
      (totalEvents > 0 ? Math.min((totalEvents / 10) * 20, 20) : 0) + // 20% baseado em volume
      (totalRevenue > 0 && totalExpenses > 0 ? Math.min((profit / totalExpenses) * 20, 20) : 0) + // 20% baseado em lucro
      20 // 20% base fixo

    return {
      totalEvents,
      completedEvents,
      activeEvents,
      successRate,
      performanceScore: Math.min(performanceScore, 100),
      totalRevenue,
      totalExpenses,
      profit
    }
  }, [events, revenues, expenses])

  // Gerar dados de tendência de performance mensal
  const performanceTrendData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const monthlyPerformance: { [key: string]: { events: number; completed: number } } = {}
    
    events.forEach(event => {
      const eventDate = new Date(event.startDate)
      const monthKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}`
      if (!monthlyPerformance[monthKey]) {
        monthlyPerformance[monthKey] = { events: 0, completed: 0 }
      }
      monthlyPerformance[monthKey].events++
      if (String(event.status || '').toLowerCase() === 'completed') {
        monthlyPerformance[monthKey].completed++
      }
    })
    
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      const data = monthlyPerformance[monthKey] || { events: 0, completed: 0 }
      const performance = data.events > 0 ? (data.completed / data.events) * 100 : 0
      return {
        month: months[date.getMonth()],
        performance: Math.round(performance)
      }
    })
  }, [events])

  // Distribuição de eficiência baseada em performance dos eventos
  const efficiencyDistributionData = useMemo(() => {
    const efficiencyCounts = {
      'Excelente': 0,
      'Muito Bom': 0,
      'Bom': 0,
      'Regular': 0
    }
    
    events.forEach(event => {
      if (String(event.status || '').toLowerCase() === 'completed') {
        const roi = event.roi || 0
        if (roi > 2) efficiencyCounts['Excelente']++
        else if (roi > 1) efficiencyCounts['Muito Bom']++
        else if (roi > 0) efficiencyCounts['Bom']++
        else efficiencyCounts['Regular']++
      }
    })
    
    const total = Object.values(efficiencyCounts).reduce((sum, count) => sum + count, 0)
    const colors: { [key: string]: string } = {
      'Excelente': '#10b981',
      'Muito Bom': '#3b82f6',
      'Bom': '#f59e0b',
      'Regular': '#ef4444'
    }
    
    return Object.entries(efficiencyCounts)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({
        category,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        color: colors[category]
      }))
  }, [events])

  const handleRefresh = async () => {
    try {
      setIsLoading(true)
      const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
      const [eventsResponse, guestsResponse, revenuesResponse, expensesResponse] = await Promise.all([
        EventsService.getEvents({ pageNumber: 1, pageSize: 1000, organizationId }),
        GuestsService.getGuests({ pageNumber: 1, pageSize: 1000, organizationId }),
        RevenueService.getRevenue({ pageNumber: 1, pageSize: 1000, organizationId }),
        ExpensesService.getExpenses({ pageNumber: 1, pageSize: 1000, organizationId })
      ])
      setEvents(eventsResponse.events || [])
      setGuests(guestsResponse.guests || [])
      setRevenues(revenuesResponse.revenues || [])
      setExpenses(expensesResponse.expenses || [])
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

  const metrics = [
    { value: 'all', label: 'Todas as métricas' },
    { value: 'revenue', label: 'Receita' },
    { value: 'guests', label: 'Convidados' },
    { value: 'events', label: 'Eventos' },
    { value: 'efficiency', label: 'Eficiência' }
  ]

  // Função para renderizar gráfico de linha da tendência de performance
  const renderPerformanceTrendChart = () => {
    if (!performanceTrendData.length) return null

    const maxPerformance = Math.max(...performanceTrendData.map(d => d.performance))
    const chartWidth = 600
    const chartHeight = 300
    const padding = 60
    const innerWidth = chartWidth - (padding * 2)
    const innerHeight = chartHeight - (padding * 2)

    const getX = (index: number) => padding + (index * innerWidth / (performanceTrendData.length - 1))
    const getY = (value: number) => padding + innerHeight - (value / maxPerformance * innerHeight)

    const points = performanceTrendData.map((d, i) => `${getX(i)},${getY(d.performance)}`).join(' ')

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
                {Math.round(maxPerformance * (1 - ratio))}%
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {performanceTrendData.map((d, i) => (
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
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {performanceTrendData.map((d, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(d.performance)}
              r="4"
              fill="#10b981"
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* Data labels */}
          {performanceTrendData.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={getY(d.performance) - 10}
              fontSize="9"
              fill="#374151"
              textAnchor="middle"
            >
              {d.performance}%
            </text>
          ))}
        </svg>
      </div>
    )
  }

  // Função para renderizar gráfico de pizza da distribuição de eficiência
  const renderEfficiencyDistributionPieChart = () => {
    if (!efficiencyDistributionData.length) return null

    const chartSize = 200
    const centerX = chartSize / 2
    const centerY = chartSize / 2
    const radius = 80

    let currentAngle = 0

    const total = efficiencyDistributionData.reduce((sum, item) => sum + item.count, 0)

    return (
      <div className="w-full">
        <div className="flex items-center justify-center">
          <svg width={chartSize} height={chartSize} className="overflow-visible">
            {efficiencyDistributionData.map((item, index) => {
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
          {efficiencyDistributionData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700">{item.category}</span>
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

  // Calcular ROI médio
  const avgROI = useMemo(() => {
    const eventsWithROI = events.filter(e => e.roi !== null && e.roi !== undefined && e.roi > 0)
    if (eventsWithROI.length === 0) return 0
    const totalROI = eventsWithROI.reduce((sum, e) => sum + (e.roi || 0), 0)
    return totalROI / eventsWithROI.length
  }, [events])

  // Calcular eficiência operacional (baseada em sucesso vs custo)
  const operationalEfficiency = useMemo(() => {
    if (events.length === 0) return 0
    const completed = events.filter(e => String(e.status || '').toLowerCase() === 'completed').length
    const avgBudget = events.reduce((sum, e) => sum + (e.totalBudget || 0), 0) / events.length
    const avgCost = events.reduce((sum, e) => sum + (e.totalCost || 0), 0) / events.length
    const budgetEfficiency = avgBudget > 0 ? (1 - (avgCost / avgBudget)) * 100 : 0
    return (completed / events.length) * 0.6 + Math.min(budgetEfficiency, 100) * 0.4
  }, [events])

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
            <h1 className="text-3xl font-bold text-gray-900">Relatório de Performance</h1>
            <p className="text-gray-600">Análise de performance e eficiência dos eventos</p>
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
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {metrics.map(metric => (
              <option key={metric.value} value={metric.value}>{metric.label}</option>
            ))}
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Geral</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              performanceStats.performanceScore >= 80 ? 'text-green-600' :
              performanceStats.performanceScore >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {performanceStats.performanceScore.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Score combinado de performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência Operacional</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              operationalEfficiency >= 70 ? 'text-blue-600' :
              operationalEfficiency >= 50 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {operationalEfficiency.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em sucesso e custos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              avgROI > 2 ? 'text-purple-600' :
              avgROI > 1 ? 'text-blue-600' :
              'text-gray-600'
            }`}>
              {avgROI > 0 ? `${avgROI.toFixed(1)}x` : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {avgROI > 0 ? 'Return on Investment' : 'Sem dados disponíveis'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              performanceStats.successRate >= 80 ? 'text-green-600' :
              performanceStats.successRate >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {performanceStats.successRate.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceStats.completedEvents} de {performanceStats.totalEvents} concluídos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Tendência de Performance
            </CardTitle>
            <CardDescription>
              Evolução da performance ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderPerformanceTrendChart()}
          </CardContent>
        </Card>

        {/* Efficiency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição de Eficiência
            </CardTitle>
            <CardDescription>
              Análise de eficiência por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderEfficiencyDistributionPieChart()}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Performance Financeira
            </CardTitle>
            <CardDescription>
              Análise de performance financeira
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Receita por Evento</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {performanceStats.totalEvents > 0 
                      ? formatCurrency(performanceStats.totalRevenue / performanceStats.totalEvents)
                      : '-'
                    }
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Margem de Lucro</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {performanceStats.totalRevenue > 0
                      ? `${((performanceStats.profit / performanceStats.totalRevenue) * 100).toFixed(1)}%`
                      : '-'
                    }
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ROI Médio</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{avgROI > 0 ? `${avgROI.toFixed(1)}x` : '-'}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Receita por Convidado</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {guests.length > 0 && performanceStats.totalRevenue > 0
                      ? formatCurrency(performanceStats.totalRevenue / guests.length)
                      : '-'
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operational Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Operacional
            </CardTitle>
            <CardDescription>
              Métricas de eficiência operacional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taxa de Sucesso</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{performanceStats.successRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Eficiência Operacional</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{operationalEfficiency.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total de Eventos</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{performanceStats.totalEvents}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Eventos Concluídos</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{performanceStats.completedEvents}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Performance Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Ranking de Performance por Evento
          </CardTitle>
          <CardDescription>
            Classificação dos eventos por performance geral
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum evento encontrado para análise
            </div>
          ) : (
            <div className="space-y-4">
              {events
                .map(event => {
                  const eventRevenue = revenues.filter(r => r.eventId === event.id).reduce((sum, r) => sum + r.amount, 0)
                  const eventGuests = guests.filter(g => g.eventId === event.id).length
                  const roi = event.roi || 0
                  const performance = String(event.status || '').toLowerCase() === 'completed' 
                    ? (roi > 2 ? 95 : roi > 1 ? 85 : roi > 0 ? 75 : 60)
                    : 50
                  
                  return {
                    id: event.id,
                    name: event.name,
                    performance,
                    revenue: eventRevenue || event.totalRevenue || 0,
                    guests: eventGuests || event.capacity || 0,
                    roi
                  }
                })
                .sort((a, b) => b.performance - a.performance)
                .slice(0, 10)
                .map((event, index) => (
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
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(event.revenue)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.guests} convidados
                        </span>
                        {event.roi > 0 && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            ROI: {event.roi.toFixed(1)}x
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        event.performance >= 90 ? 'text-green-600' :
                        event.performance >= 70 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {event.performance}%
                      </div>
                      <div className="text-xs text-gray-500">Performance</div>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Indicadores de Performance
          </CardTitle>
          <CardDescription>
            Métricas-chave para análise de performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                performanceStats.performanceScore >= 80 ? 'text-green-600' :
                performanceStats.performanceScore >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {performanceStats.performanceScore.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-500">Performance Geral</div>
              <div className={`text-xs mt-1 ${
                performanceStats.performanceScore >= 80 ? 'text-green-600' :
                performanceStats.performanceScore >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {performanceStats.performanceScore >= 80 ? 'Excelente' :
                 performanceStats.performanceScore >= 60 ? 'Bom' :
                 'A melhorar'}
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                operationalEfficiency >= 70 ? 'text-blue-600' :
                operationalEfficiency >= 50 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {operationalEfficiency.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-500">Eficiência Operacional</div>
              <div className={`text-xs mt-1 ${
                operationalEfficiency >= 70 ? 'text-blue-600' :
                operationalEfficiency >= 50 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {operationalEfficiency >= 70 ? 'Muito Bom' :
                 operationalEfficiency >= 50 ? 'Bom' :
                 'A melhorar'}
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${avgROI > 0 ? (avgROI > 2 ? 'text-purple-600' : avgROI > 1 ? 'text-blue-600' : 'text-yellow-600') : 'text-gray-600'}`}>
                {avgROI > 0 ? `${avgROI.toFixed(1)}x` : '-'}
              </div>
              <div className="text-sm text-gray-500">ROI Médio</div>
              <div className={`text-xs mt-1 ${avgROI > 0 ? (avgROI > 2 ? 'text-purple-600' : avgROI > 1 ? 'text-blue-600' : 'text-yellow-600') : 'text-gray-500'}`}>
                {avgROI > 0 ? (avgROI > 2 ? 'Excelente' : avgROI > 1 ? 'Bom' : 'Regular') : 'Sem dados'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendências de Performance
          </CardTitle>
          <CardDescription>
            Análise de tendências e padrões de performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Tendências Positivas</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Performance geral aumentou 5%</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Eficiência operacional melhorou 3%</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Satisfação dos convidados aumentou 0.2 pontos</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">ROI médio cresceu 0.3x</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Áreas de Melhoria</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-orange-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm">Tempo de setup pode ser otimizado</span>
                </div>
                <div className="flex items-center gap-2 text-orange-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm">Custos operacionais aumentaram 8%</span>
                </div>
                <div className="flex items-center gap-2 text-orange-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm">Taxa de cancelamento em 2%</span>
                </div>
                <div className="flex items-center gap-2 text-orange-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm">Feedback negativo em 3% dos eventos</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

