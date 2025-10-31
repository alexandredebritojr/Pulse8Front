'use client'

import { useState, useEffect } from 'react'
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

export default function EventsReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Dados para os gráficos
  const timelineData = [
    { month: 'Jan', events: 6 },
    { month: 'Fev', events: 8 },
    { month: 'Mar', events: 5 },
    { month: 'Abr', events: 3 },
    { month: 'Mai', events: 2 },
    { month: 'Jun', events: 4 },
    { month: 'Jul', events: 7 },
    { month: 'Ago', events: 9 },
    { month: 'Set', events: 6 },
    { month: 'Out', events: 8 },
    { month: 'Nov', events: 5 },
    { month: 'Dez', events: 3 }
  ]

  const eventTypesData = [
    { type: 'Corporativo', count: 8, percentage: 33.3, color: '#3b82f6' },
    { type: 'Social', count: 6, percentage: 25.0, color: '#10b981' },
    { type: 'Cultural', count: 5, percentage: 20.8, color: '#f59e0b' },
    { type: 'Esportivo', count: 3, percentage: 12.5, color: '#ef4444' },
    { type: 'Religioso', count: 2, percentage: 8.4, color: '#8b5cf6' }
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

  const statuses = [
    { value: 'all', label: 'Todos os status' },
    { value: 'planning', label: 'Planejamento' },
    { value: 'active', label: 'Ativo' },
    { value: 'completed', label: 'Concluído' },
    { value: 'cancelled', label: 'Cancelado' }
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
    if (!eventTypesData.length) return null

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
            <h1 className="text-3xl font-bold text-gray-900">Relatório de Eventos</h1>
            <p className="text-gray-600">Análise detalhada dos eventos realizados</p>
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
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">22</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Convidados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> vs período anterior
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
            {[
              { 
                name: 'Festa de Aniversário - Janeiro 2024', 
                status: 'Concluído', 
                guests: 85, 
                revenue: 85000, 
                rating: 4.8,
                date: '15/01/2024'
              },
              { 
                name: 'Evento Corporativo - Q1 2024', 
                status: 'Concluído', 
                guests: 120, 
                revenue: 120000, 
                rating: 4.9,
                date: '22/01/2024'
              },
              { 
                name: 'Festival de Verão 2024', 
                status: 'Concluído', 
                guests: 250, 
                revenue: 180000, 
                rating: 4.7,
                date: '05/02/2024'
              },
              { 
                name: 'Evento de Luxo - Março', 
                status: 'Ativo', 
                guests: 45, 
                revenue: 65000, 
                rating: 4.6,
                date: '15/03/2024'
              },
              { 
                name: 'Workshop de Marketing', 
                status: 'Planejamento', 
                guests: 30, 
                revenue: 0, 
                rating: 0,
                date: '25/03/2024'
              }
            ].map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{event.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                      event.status === 'Ativo' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'Planejamento' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event.guests} convidados
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {event.date}
                    </span>
                    {event.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {event.rating}/5
                      </span>
                    )}
                    {event.revenue > 0 && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        R$ {event.revenue.toLocaleString()}
                      </span>
                    )}
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
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Eventos Corporativos</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">8 eventos</span>
                  <span className="text-green-600 text-sm">+25%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Festas Privadas</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">6 eventos</span>
                  <span className="text-green-600 text-sm">+15%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Festivais</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">4 eventos</span>
                  <span className="text-green-600 text-sm">+10%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Workshops</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">3 eventos</span>
                  <span className="text-green-600 text-sm">+5%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Outros</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">3 eventos</span>
                  <span className="text-green-600 text-sm">+8%</span>
                </div>
              </div>
            </div>
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
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Janeiro 2024</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">6 eventos</span>
                  <span className="text-green-600 text-sm">+20%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fevereiro 2024</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">8 eventos</span>
                  <span className="text-green-600 text-sm">+33%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Março 2024</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">5 eventos</span>
                  <span className="text-green-600 text-sm">+25%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Abril 2024</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">3 eventos</span>
                  <span className="text-green-600 text-sm">+15%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Maio 2024</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">2 eventos</span>
                  <span className="text-green-600 text-sm">+10%</span>
                </div>
              </div>
            </div>
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
              <div className="text-3xl font-bold text-green-600 mb-2">94%</div>
              <div className="text-sm text-gray-500">Taxa de Sucesso</div>
              <div className="text-xs text-green-600 mt-1">Excelente</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">4.7</div>
              <div className="text-sm text-gray-500">Avaliação Média</div>
              <div className="text-xs text-blue-600 mt-1">Muito Bom</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">52</div>
              <div className="text-sm text-gray-500">Média de Convidados</div>
              <div className="text-xs text-purple-600 mt-1">Por Evento</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">2.1</div>
              <div className="text-sm text-gray-500">ROI Médio</div>
              <div className="text-xs text-orange-600 mt-1">Bom</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

