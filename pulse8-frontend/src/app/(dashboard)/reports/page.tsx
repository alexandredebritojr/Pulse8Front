'use client'

import { useState, useEffect } from 'react'
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
  Activity,
  Download,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Plus,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true) // Inicializar como true para simular carregamento
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedEvent, setSelectedEvent] = useState('all')

  // Dados para os gráficos
  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Fev', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Abr', revenue: 61000 },
    { month: 'Mai', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
    { month: 'Jul', revenue: 72000 },
    { month: 'Ago', revenue: 68000 },
    { month: 'Set', revenue: 75000 },
    { month: 'Out', revenue: 82000 },
    { month: 'Nov', revenue: 78000 },
    { month: 'Dez', revenue: 89000 }
  ]

  const eventDistributionData = [
    { type: 'Corporativo', count: 8, percentage: 33.3, color: '#3b82f6' },
    { type: 'Social', count: 6, percentage: 25.0, color: '#10b981' },
    { type: 'Cultural', count: 5, percentage: 20.8, color: '#f59e0b' },
    { type: 'Esportivo', count: 3, percentage: 12.5, color: '#ef4444' },
    { type: 'Religioso', count: 2, percentage: 8.4, color: '#8b5cf6' }
  ]

  // Mock data - em produção viria da API
  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500) // Reduzir tempo de loading para melhor UX
    
    return () => clearTimeout(timer)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios & Dashboards</h1>
          <p className="text-gray-600">Análises e métricas dos seus eventos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 450.000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convidados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.250</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2%</span> vs período anterior
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
                <span className="font-semibold">R$ 450.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Custos</span>
                <span className="font-semibold">R$ 280.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Lucro</span>
                <span className="font-semibold text-green-600">R$ 170.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Margem</span>
                <span className="font-semibold text-green-600">37.8%</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Ver Relatório Completo
            </Button>
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
                <span className="font-semibold">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Eventos Concluídos</span>
                <span className="font-semibold">22</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Em Andamento</span>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Taxa de Sucesso</span>
                <span className="font-semibold text-green-600">94%</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Ver Relatório Completo
            </Button>
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
                <span className="font-semibold">1.250</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Check-in Realizado</span>
                <span className="font-semibold">1.180</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Taxa de Check-in</span>
                <span className="font-semibold text-green-600">94.4%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">VIPs</span>
                <span className="font-semibold">85</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Ver Relatório Completo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Acesse relatórios e análises específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/reports/financial">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <DollarSign className="h-6 w-6 mb-2" />
                <span className="text-sm">Financeiro</span>
              </Button>
            </Link>
            <Link href="/reports/events">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Calendar className="h-6 w-6 mb-2" />
                <span className="text-sm">Eventos</span>
              </Button>
            </Link>
            <Link href="/reports/guests">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Convidados</span>
              </Button>
            </Link>
            <Link href="/reports/team">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Award className="h-6 w-6 mb-2" />
                <span className="text-sm">Equipe</span>
              </Button>
            </Link>
            <Link href="/reports/marketing">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Target className="h-6 w-6 mb-2" />
                <span className="text-sm">Marketing</span>
              </Button>
            </Link>
            <Link href="/reports/suppliers">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Star className="h-6 w-6 mb-2" />
                <span className="text-sm">Fornecedores</span>
              </Button>
            </Link>
            <Link href="/reports/performance">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <BarChart3 className="h-6 w-6 mb-2" />
                <span className="text-sm">Performance</span>
              </Button>
            </Link>
            <Link href="/reports/custom">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Plus className="h-6 w-6 mb-2" />
                <span className="text-sm">Personalizado</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

