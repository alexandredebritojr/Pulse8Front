'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download,
  Filter,
  RefreshCw,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  Eye,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RevenueService, RevenueDto } from '@/lib/api/revenue'
import { ExpensesService, ExpenseDto, ExpenseType } from '@/lib/api/expenses'
import { EventsService, EventDto } from '@/lib/api/events'
import { formatCurrency } from '@/lib/utils'

export default function FinancialReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedEvent, setSelectedEvent] = useState('all')
  const [revenues, setRevenues] = useState<RevenueDto[]>([])
  const [expenses, setExpenses] = useState<ExpenseDto[]>([])
  const [events, setEvents] = useState<EventDto[]>([])

  // Carregar dados da API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        // Buscar receitas, despesas e eventos
        const [revenueResponse, expensesResponse, eventsResponse] = await Promise.all([
          RevenueService.getRevenue({
            pageNumber: 1,
            pageSize: 1000,
            organizationId: organizationId
          }),
          ExpensesService.getExpenses({
            pageNumber: 1,
            pageSize: 1000,
            organizationId: organizationId
          }),
          EventsService.getEvents({
            pageNumber: 1,
            pageSize: 1000,
            organizationId: organizationId
          })
        ])
        
        setRevenues(revenueResponse.revenues || [])
        setExpenses(expensesResponse.expenses || [])
        setEvents(eventsResponse.events || [])
      } catch (err: any) {
        console.error('❌ Erro ao carregar dados financeiros:', err)
        setError(err.message || 'Erro ao carregar dados financeiros')
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
    let filteredRevenues = [...revenues]
    let filteredExpenses = [...expenses]
    
    // Filtrar por período
    if (selectedPeriod !== 'all') {
      const periodStart = getPeriodStartDate(selectedPeriod)
      if (periodStart) {
        filteredRevenues = filteredRevenues.filter(r => {
          const revenueDate = new Date(r.date)
          return revenueDate >= periodStart
        })
        filteredExpenses = filteredExpenses.filter(e => {
          const expenseDate = new Date(e.dueDate)
          return expenseDate >= periodStart
        })
      }
    }
    
    // Filtrar por evento
    if (selectedEvent !== 'all') {
      filteredRevenues = filteredRevenues.filter(r => r.eventId === selectedEvent)
      filteredExpenses = filteredExpenses.filter(e => e.eventId === selectedEvent)
    }
    
    return { revenues: filteredRevenues, expenses: filteredExpenses }
  }, [revenues, expenses, selectedPeriod, selectedEvent])

  // Calcular estatísticas financeiras
  const financialStats = useMemo(() => {
    const totalRevenue = filteredData.revenues.reduce((sum, r) => sum + r.amount, 0)
    const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + e.amount, 0)
    const profit = totalRevenue - totalExpenses
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0
    
    // Calcular período anterior para comparação
    const periodStart = getPeriodStartDate(selectedPeriod)
    let previousRevenue = 0
    let previousExpenses = 0
    
    if (periodStart && selectedPeriod !== 'all') {
      const periodLength = new Date().getTime() - periodStart.getTime()
      const previousPeriodStart = new Date(periodStart.getTime() - periodLength)
      
      const prevRevenues = revenues.filter(r => {
        const revenueDate = new Date(r.date)
        return revenueDate >= previousPeriodStart && revenueDate < periodStart
      })
      
      const prevExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.dueDate)
        return expenseDate >= previousPeriodStart && expenseDate < periodStart
      })
      
      previousRevenue = prevRevenues.reduce((sum, r) => sum + r.amount, 0)
      previousExpenses = prevExpenses.reduce((sum, e) => sum + e.amount, 0)
    }
    
    const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
    const expensesChange = previousExpenses > 0 ? ((totalExpenses - previousExpenses) / previousExpenses) * 100 : 0
    const previousProfit = previousRevenue - previousExpenses
    const profitChange = previousProfit !== 0 ? ((profit - previousProfit) / Math.abs(previousProfit)) * 100 : 0
    const previousMargin = previousRevenue > 0 ? (previousProfit / previousRevenue) * 100 : 0
    const marginChange = margin - previousMargin

    return {
      totalRevenue,
      totalExpenses,
      profit,
      margin,
      revenueChange,
      expensesChange,
      profitChange,
      marginChange
    }
  }, [filteredData, revenues, expenses, selectedPeriod])

  // Gerar dados de receita vs despesas por mês
  const revenueExpensesData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const monthlyData: { [key: string]: { revenue: number; expenses: number } } = {}
    
    // Agrupar receitas por mês
    filteredData.revenues.forEach(revenue => {
      const date = new Date(revenue.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, expenses: 0 }
      }
      monthlyData[monthKey].revenue += revenue.amount
    })
    
    // Agrupar despesas por mês
    filteredData.expenses.forEach(expense => {
      const date = new Date(expense.dueDate)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, expenses: 0 }
      }
      monthlyData[monthKey].expenses += expense.amount
    })
    
    // Converter para array ordenado pelos últimos 12 meses
    const now = new Date()
    const result = []
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      const data = monthlyData[monthKey] || { revenue: 0, expenses: 0 }
      result.push({
        month: months[date.getMonth()],
        revenue: data.revenue,
        expenses: data.expenses
      })
    }
    
    return result
  }, [filteredData])

  // Gerar dados de categorias de despesas
  const expenseCategoriesData = useMemo(() => {
    const categoryNames: { [key: number]: string } = {
      [ExpenseType.Venue]: 'Local',
      [ExpenseType.Catering]: 'Alimentação',
      [ExpenseType.Equipment]: 'Equipamentos',
      [ExpenseType.Marketing]: 'Marketing',
      [ExpenseType.Staff]: 'Equipe',
      [ExpenseType.Transportation]: 'Transporte',
      [ExpenseType.Other]: 'Outros'
    }
    
    const categoryColors: { [key: number]: string } = {
      [ExpenseType.Venue]: '#3b82f6',
      [ExpenseType.Catering]: '#10b981',
      [ExpenseType.Equipment]: '#f59e0b',
      [ExpenseType.Marketing]: '#ef4444',
      [ExpenseType.Staff]: '#8b5cf6',
      [ExpenseType.Transportation]: '#06b6d4',
      [ExpenseType.Other]: '#6b7280'
    }
    
    const categoryTotals: { [key: number]: number } = {}
    
    filteredData.expenses.forEach(expense => {
      const type = expense.type
      categoryTotals[type] = (categoryTotals[type] || 0) + expense.amount
    })
    
    const total = filteredData.expenses.reduce((sum, e) => sum + e.amount, 0)
    
    return Object.entries(categoryTotals)
      .map(([typeStr, amount]) => {
        const type = parseInt(typeStr)
        return {
          category: categoryNames[type] || 'Outros',
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
          color: categoryColors[type] || '#6b7280'
        }
      })
      .sort((a, b) => b.amount - a.amount)
  }, [filteredData.expenses])

  // Detalhamento de receitas por fonte
  const revenueBreakdown = useMemo(() => {
    const sources: { [key: string]: number } = {}
    
    filteredData.revenues.forEach(revenue => {
      const source = revenue.source || 'Outros'
      sources[source] = (sources[source] || 0) + revenue.amount
    })
    
    return Object.entries(sources)
      .map(([source, amount]) => ({ source, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [filteredData.revenues])

  // Performance por evento
  const eventPerformanceData = useMemo(() => {
    return events.map(event => {
      const eventRevenues = filteredData.revenues.filter(r => r.eventId === event.id)
      const eventExpenses = filteredData.expenses.filter(e => e.eventId === event.id)
      
      const revenue = eventRevenues.reduce((sum, r) => sum + r.amount, 0)
      const expense = eventExpenses.reduce((sum, e) => sum + e.amount, 0)
      const profit = revenue - expense
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0
      
      return {
        id: event.id,
        name: event.name,
        revenue,
        expenses: expense,
        profit,
        margin
      }
    })
    .filter(e => e.revenue > 0 || e.expenses > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
  }, [events, filteredData])

  // Calcular ROI médio
  const avgROI = useMemo(() => {
    const eventsWithROI = events.filter(e => e.roi !== null && e.roi !== undefined)
    if (eventsWithROI.length === 0) return 0
    const totalROI = eventsWithROI.reduce((sum, e) => sum + (e.roi || 0), 0)
    return totalROI / eventsWithROI.length
  }, [events])

  // Função para atualizar dados
  const handleRefresh = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
      
      const [revenueResponse, expensesResponse, eventsResponse] = await Promise.all([
        RevenueService.getRevenue({
          pageNumber: 1,
          pageSize: 1000,
          organizationId: organizationId
        }),
        ExpensesService.getExpenses({
          pageNumber: 1,
          pageSize: 1000,
          organizationId: organizationId
        }),
        EventsService.getEvents({
          pageNumber: 1,
          pageSize: 1000,
          organizationId: organizationId
        })
      ])
      
      setRevenues(revenueResponse.revenues || [])
      setExpenses(expensesResponse.expenses || [])
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

  // Função para renderizar gráfico de barras Receita vs Despesas
  const renderRevenueExpensesBarChart = () => {
    if (!revenueExpensesData.length) return null

    const maxValue = Math.max(...revenueExpensesData.map(d => Math.max(d.revenue, d.expenses)))
    const chartWidth = 600
    const chartHeight = 300
    const padding = 60
    const innerWidth = chartWidth - (padding * 2)
    const innerHeight = chartHeight - (padding * 2)
    const barWidth = innerWidth / revenueExpensesData.length * 0.3
    const barSpacing = innerWidth / revenueExpensesData.length

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
                {formatCurrency(maxValue * (1 - ratio))}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {revenueExpensesData.map((d, i) => (
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
          {revenueExpensesData.map((d, i) => {
            const revenueBarHeight = (d.revenue / maxValue) * innerHeight
            const expenseBarHeight = (d.expenses / maxValue) * innerHeight
            const x = padding + (i * barSpacing) + (barSpacing - barWidth * 2) / 2
            const revenueY = padding + innerHeight - revenueBarHeight
            const expenseY = padding + innerHeight - expenseBarHeight
            
            return (
              <g key={i}>
                {/* Revenue bar */}
                <rect
                  x={x}
                  y={revenueY}
                  width={barWidth}
                  height={revenueBarHeight}
                  fill="#10b981"
                  rx="2"
                />
                {/* Expense bar */}
                <rect
                  x={x + barWidth + 2}
                  y={expenseY}
                  width={barWidth}
                  height={expenseBarHeight}
                  fill="#ef4444"
                  rx="2"
                />
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Receita</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Despesas</span>
          </div>
        </div>
      </div>
    )
  }

  // Função para renderizar gráfico de pizza das categorias de despesas
  const renderExpenseCategoriesPieChart = () => {
    if (!expenseCategoriesData.length) return null

    const chartSize = 200
    const centerX = chartSize / 2
    const centerY = chartSize / 2
    const radius = 80

    let currentAngle = 0

    const total = expenseCategoriesData.reduce((sum, item) => sum + item.amount, 0)

    return (
      <div className="w-full">
        <div className="flex items-center justify-center">
          <svg width={chartSize} height={chartSize} className="overflow-visible">
            {expenseCategoriesData.map((item, index) => {
              const percentage = item.amount / total
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
          {expenseCategoriesData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700">{item.category}</span>
              </div>
              <div className="text-gray-500">
                {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Relatório Financeiro</h1>
            <p className="text-sm sm:text-base text-gray-600">Análise financeira detalhada dos eventos</p>
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

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {financialStats.revenueChange > 0 ? (
                <span className="text-green-600">+{financialStats.revenueChange.toFixed(1)}%</span>
              ) : financialStats.revenueChange < 0 ? (
                <span className="text-red-600">{financialStats.revenueChange.toFixed(1)}%</span>
              ) : (
                <span>Sem alteração</span>
              )} vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos Totais</CardTitle>
            <Minus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialStats.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {financialStats.expensesChange > 0 ? (
                <span className="text-red-600">+{financialStats.expensesChange.toFixed(1)}%</span>
              ) : financialStats.expensesChange < 0 ? (
                <span className="text-green-600">{financialStats.expensesChange.toFixed(1)}%</span>
              ) : (
                <span>Sem alteração</span>
              )} vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(financialStats.profit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialStats.profitChange > 0 ? (
                <span className="text-green-600">+{financialStats.profitChange.toFixed(1)}%</span>
              ) : financialStats.profitChange < 0 ? (
                <span className="text-red-600">{financialStats.profitChange.toFixed(1)}%</span>
              ) : (
                <span>Sem alteração</span>
              )} vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialStats.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {financialStats.margin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {financialStats.marginChange > 0 ? (
                <span className="text-green-600">+{financialStats.marginChange.toFixed(1)}%</span>
              ) : financialStats.marginChange < 0 ? (
                <span className="text-red-600">{financialStats.marginChange.toFixed(1)}%</span>
              ) : (
                <span>Sem alteração</span>
              )} vs período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Receita vs Despesas
            </CardTitle>
            <CardDescription>
              Comparação mensal de receita e despesas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderRevenueExpensesBarChart()}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Categorias de Despesas
            </CardTitle>
            <CardDescription>
              Distribuição dos custos por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderExpenseCategoriesPieChart()}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Detalhamento da Receita
            </CardTitle>
            <CardDescription>
              Fontes de receita por categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {revenueBreakdown.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma receita encontrada
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {revenueBreakdown.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{item.source}</span>
                      <span className="font-semibold">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg">{formatCurrency(financialStats.totalRevenue)}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Detalhamento das Despesas
            </CardTitle>
            <CardDescription>
              Custos por categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenseCategoriesData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma despesa encontrada
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {expenseCategoriesData.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{item.category}</span>
                      <span className="font-semibold">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg">{formatCurrency(financialStats.totalExpenses)}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Performance por Evento
          </CardTitle>
          <CardDescription>
            Análise financeira individual de cada evento
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
                      <span>Receita: {formatCurrency(event.revenue)}</span>
                      <span>Despesas: {formatCurrency(event.expenses)}</span>
                      <span className={event.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        Lucro: {formatCurrency(event.profit)}
                      </span>
                      <span>Margem: {event.margin.toFixed(1)}%</span>
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

      {/* Financial Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Indicadores de Saúde Financeira
          </CardTitle>
          <CardDescription>
            Métricas importantes para análise financeira
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                financialStats.margin >= 30 ? 'text-green-600' :
                financialStats.margin >= 20 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {financialStats.margin.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Margem de Lucro</div>
              <div className={`text-xs mt-1 ${
                financialStats.margin >= 30 ? 'text-green-600' :
                financialStats.margin >= 20 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {financialStats.margin >= 30 ? 'Excelente' :
                 financialStats.margin >= 20 ? 'Bom' :
                 'A melhorar'}
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${avgROI > 0 ? (avgROI > 2 ? 'text-green-600' : avgROI > 1 ? 'text-blue-600' : 'text-yellow-600') : 'text-gray-600'}`}>
                {avgROI > 0 ? avgROI.toFixed(1) : '-'}
              </div>
              <div className="text-sm text-gray-500">ROI Médio</div>
              <div className={`text-xs mt-1 ${avgROI > 0 ? (avgROI > 2 ? 'text-green-600' : avgROI > 1 ? 'text-blue-600' : 'text-yellow-600') : 'text-gray-500'}`}>
                {avgROI > 0 ? (avgROI > 2 ? 'Excelente' : avgROI > 1 ? 'Bom' : 'Regular') : 'Sem dados'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {financialStats.totalRevenue > 0 && events.length > 0 
                  ? formatCurrency(financialStats.totalRevenue / events.length)
                  : '-'
                }
              </div>
              <div className="text-sm text-gray-500">Receita Média por Evento</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
