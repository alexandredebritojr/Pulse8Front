'use client'

import { useState, useEffect } from 'react'
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

export default function PerformanceReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('all')

  // Dados para os gráficos
  const performanceTrendData = [
    { month: 'Jan', performance: 88 },
    { month: 'Fev', performance: 91 },
    { month: 'Mar', performance: 89 },
    { month: 'Abr', performance: 93 },
    { month: 'Mai', performance: 90 },
    { month: 'Jun', performance: 94 },
    { month: 'Jul', performance: 92 },
    { month: 'Ago', performance: 96 },
    { month: 'Set', performance: 94 },
    { month: 'Out', performance: 97 },
    { month: 'Nov', performance: 95 },
    { month: 'Dez', performance: 98 }
  ]

  const efficiencyDistributionData = [
    { category: 'Excelente', count: 8, percentage: 33.3, color: '#10b981' },
    { category: 'Muito Bom', count: 10, percentage: 41.7, color: '#3b82f6' },
    { category: 'Bom', count: 4, percentage: 16.7, color: '#f59e0b' },
    { category: 'Regular', count: 2, percentage: 8.3, color: '#ef4444' }
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
            <h1 className="text-3xl font-bold text-gray-900">Relatório de Performance</h1>
            <p className="text-gray-600">Análise de performance e eficiência dos eventos</p>
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
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência Operacional</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">87%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">2.1x</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.3x</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">4.7/5</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.2</span> vs período anterior
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
                  <span className="font-semibold">R$ 18.750</span>
                  <span className="text-green-600 text-sm">+12%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Margem de Lucro</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">37.8%</span>
                  <span className="text-green-600 text-sm">+3.2%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ROI Médio</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">2.1x</span>
                  <span className="text-green-600 text-sm">+0.3x</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Receita por Convidado</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">R$ 360</span>
                  <span className="text-green-600 text-sm">+8%</span>
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
                  <span className="font-semibold">94%</span>
                  <span className="text-green-600 text-sm">+2%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Eficiência de Check-in</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">94.4%</span>
                  <span className="text-green-600 text-sm">+2.1%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tempo Médio de Setup</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">2.5h</span>
                  <span className="text-green-600 text-sm">-0.3h</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Satisfação da Equipe</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">4.6/5</span>
                  <span className="text-green-600 text-sm">+0.1</span>
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
          <div className="space-y-4">
            {[
              { 
                name: 'Festa de Aniversário - Janeiro 2024', 
                performance: 98.5, 
                revenue: 85000, 
                guests: 85, 
                satisfaction: 4.9,
                position: 1
              },
              { 
                name: 'Evento Corporativo - Q1 2024', 
                performance: 96.2, 
                revenue: 120000, 
                guests: 120, 
                satisfaction: 4.8,
                position: 2
              },
              { 
                name: 'Festival de Verão 2024', 
                performance: 94.8, 
                revenue: 180000, 
                guests: 250, 
                satisfaction: 4.7,
                position: 3
              },
              { 
                name: 'Evento de Luxo - Março', 
                performance: 92.1, 
                revenue: 65000, 
                guests: 45, 
                satisfaction: 4.6,
                position: 4
              }
            ].map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    event.position === 1 ? 'bg-yellow-500' :
                    event.position === 2 ? 'bg-gray-400' :
                    event.position === 3 ? 'bg-orange-500' :
                    'bg-gray-300'
                  }`}>
                    {event.position}
                  </div>
                  <div>
                    <h4 className="font-medium">{event.name}</h4>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        R$ {event.revenue.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.guests} convidados
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {event.satisfaction}/5
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{event.performance}%</div>
                    <div className="text-xs text-gray-500">Performance</div>
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
              </div>
            ))}
          </div>
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
              <div className="text-3xl font-bold text-green-600 mb-2">94%</div>
              <div className="text-sm text-gray-500">Performance Geral</div>
              <div className="text-xs text-green-600 mt-1">Excelente</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">87%</div>
              <div className="text-sm text-gray-500">Eficiência Operacional</div>
              <div className="text-xs text-blue-600 mt-1">Muito Bom</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">2.1x</div>
              <div className="text-sm text-gray-500">ROI Médio</div>
              <div className="text-xs text-purple-600 mt-1">Bom</div>
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

