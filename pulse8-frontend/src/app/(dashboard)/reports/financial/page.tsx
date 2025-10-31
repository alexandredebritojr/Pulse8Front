'use client'

import { useState, useEffect } from 'react'
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

export default function FinancialReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedEvent, setSelectedEvent] = useState('all')

  // Dados para os gráficos
  const revenueExpensesData = [
    { month: 'Jan', revenue: 45000, expenses: 28000 },
    { month: 'Fev', revenue: 52000, expenses: 32000 },
    { month: 'Mar', revenue: 48000, expenses: 30000 },
    { month: 'Abr', revenue: 61000, expenses: 38000 },
    { month: 'Mai', revenue: 55000, expenses: 35000 },
    { month: 'Jun', revenue: 67000, expenses: 42000 },
    { month: 'Jul', revenue: 72000, expenses: 45000 },
    { month: 'Ago', revenue: 68000, expenses: 40000 },
    { month: 'Set', revenue: 75000, expenses: 47000 },
    { month: 'Out', revenue: 82000, expenses: 50000 },
    { month: 'Nov', revenue: 78000, expenses: 48000 },
    { month: 'Dez', revenue: 89000, expenses: 55000 }
  ]

  const expenseCategoriesData = [
    { category: 'Fornecedores', amount: 120000, percentage: 42.9, color: '#3b82f6' },
    { category: 'Equipe', amount: 80000, percentage: 28.6, color: '#10b981' },
    { category: 'Marketing', amount: 45000, percentage: 16.1, color: '#f59e0b' },
    { category: 'Operacional', amount: 35000, percentage: 12.5, color: '#ef4444' }
  ]

  // Mock data - em produção viria da API
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  const periods = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' },
    { value: '1y', label: 'Último ano' },
    { value: 'all', label: 'Todos os períodos' }
  ]

  const events = [
    { value: 'all', label: 'Todos os eventos' },
    { value: 'event-1', label: 'Festa de Aniversário - Janeiro 2024' },
    { value: 'event-2', label: 'Evento Corporativo - Q1 2024' },
    { value: 'event-3', label: 'Festival de Verão 2024' }
  ]

  // Função para formatar moeda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

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
                {/* Revenue label */}
                <text
                  x={x + barWidth / 2}
                  y={revenueY - 5}
                  fontSize="9"
                  fill="#374151"
                  textAnchor="middle"
                >
                  {formatCurrency(d.revenue)}
                </text>
                {/* Expense label */}
                <text
                  x={x + barWidth + 2 + barWidth / 2}
                  y={expenseY - 5}
                  fontSize="9"
                  fill="#374151"
                  textAnchor="middle"
                >
                  {formatCurrency(d.expenses)}
                </text>
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
            <h1 className="text-3xl font-bold text-gray-900">Relatório Financeiro</h1>
            <p className="text-gray-600">Análise financeira detalhada dos eventos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline">
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
            {events.map(event => (
              <option key={event.value} value={event.value}>{event.label}</option>
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
            <div className="text-2xl font-bold">R$ 450.000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos Totais</CardTitle>
            <Minus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 280.000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+8%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 170.000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+18%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">37.8%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3.2%</span> vs período anterior
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
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vendas de Ingressos</span>
                <span className="font-semibold">R$ 320.000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Patrocínios</span>
                <span className="font-semibold">R$ 80.000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vendas de Produtos</span>
                <span className="font-semibold">R$ 35.000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Outros</span>
                <span className="font-semibold">R$ 15.000</span>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="font-bold text-lg">R$ 450.000</span>
              </div>
            </div>
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
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fornecedores</span>
                <span className="font-semibold">R$ 120.000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Equipe</span>
                <span className="font-semibold">R$ 80.000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Marketing</span>
                <span className="font-semibold">R$ 45.000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Operacional</span>
                <span className="font-semibold">R$ 35.000</span>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="font-bold text-lg">R$ 280.000</span>
              </div>
            </div>
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
          <div className="space-y-4">
            {[
              { name: 'Festa de Aniversário - Janeiro 2024', revenue: 85000, expenses: 52000, profit: 33000, margin: 38.8 },
              { name: 'Evento Corporativo - Q1 2024', revenue: 120000, expenses: 75000, profit: 45000, margin: 37.5 },
              { name: 'Festival de Verão 2024', revenue: 180000, expenses: 110000, profit: 70000, margin: 38.9 },
              { name: 'Evento de Luxo - Março', revenue: 65000, expenses: 43000, profit: 22000, margin: 33.8 }
            ].map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{event.name}</h4>
                  <div className="flex gap-4 text-sm text-gray-500 mt-1">
                    <span>Receita: R$ {event.revenue.toLocaleString()}</span>
                    <span>Despesas: R$ {event.expenses.toLocaleString()}</span>
                    <span>Lucro: R$ {event.profit.toLocaleString()}</span>
                    <span>Margem: {event.margin}%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Relatório
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
              <div className="text-3xl font-bold text-green-600 mb-2">37.8%</div>
              <div className="text-sm text-gray-500">Margem de Lucro</div>
              <div className="text-xs text-green-600 mt-1">Excelente</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1.6</div>
              <div className="text-sm text-gray-500">ROI (Return on Investment)</div>
              <div className="text-xs text-blue-600 mt-1">Bom</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">2.1</div>
              <div className="text-sm text-gray-500">Receita por Convidado</div>
              <div className="text-xs text-purple-600 mt-1">R$ 360</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

