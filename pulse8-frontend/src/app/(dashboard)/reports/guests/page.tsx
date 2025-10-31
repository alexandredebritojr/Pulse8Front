'use client'

import { useState, useEffect } from 'react'
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

export default function GuestsReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedEvent, setSelectedEvent] = useState('all')

  // Dados para os gráficos
  const checkInTimelineData = [
    { hour: '08:00', checkIns: 15 },
    { hour: '09:00', checkIns: 45 },
    { hour: '10:00', checkIns: 120 },
    { hour: '11:00', checkIns: 180 },
    { hour: '12:00', checkIns: 220 },
    { hour: '13:00', checkIns: 150 },
    { hour: '14:00', checkIns: 200 },
    { hour: '15:00', checkIns: 180 },
    { hour: '16:00', checkIns: 120 },
    { hour: '17:00', checkIns: 80 },
    { hour: '18:00', checkIns: 40 },
    { hour: '19:00', checkIns: 20 }
  ]

  const guestTypesData = [
    { type: 'Standard', count: 1100, percentage: 88.0, color: '#3b82f6' },
    { type: 'VIP', count: 85, percentage: 6.8, color: '#8b5cf6' },
    { type: 'Staff', count: 45, percentage: 3.6, color: '#10b981' },
    { type: 'Press', count: 20, percentage: 1.6, color: '#f59e0b' }
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

  // Função para renderizar gráfico de pizza dos tipos de convidados
  const renderGuestTypesPieChart = () => {
    if (!guestTypesData.length) return null

    const chartSize = 200
    const centerX = chartSize / 2
    const centerY = chartSize / 2
    const radius = 80

    let currentAngle = 0

    const total = guestTypesData.reduce((sum, item) => sum + item.count, 0)

    return (
      <div className="w-full">
        <div className="flex items-center justify-center">
          <svg width={chartSize} height={chartSize} className="overflow-visible">
            {guestTypesData.map((item, index) => {
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
          {guestTypesData.map((item, index) => (
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
            <h1 className="text-3xl font-bold text-gray-900">Relatório de Convidados</h1>
            <p className="text-gray-600">Análise detalhada dos convidados e check-in</p>
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

      {/* Guests Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Convidados</CardTitle>
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
            <CardTitle className="text-sm font-medium">Check-in Realizado</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1.180</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Check-in</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.4%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convidados VIP</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">85</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> vs período anterior
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
                  <span className="font-semibold">1.180</span>
                  <span className="text-green-600 text-sm">94.4%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Aguardando Check-in</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">70</span>
                  <span className="text-orange-600 text-sm">5.6%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Check-in Antecipado</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">320</span>
                  <span className="text-blue-600 text-sm">27.1%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Check-in no Dia</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">860</span>
                  <span className="text-green-600 text-sm">72.9%</span>
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
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">VIP</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">85</span>
                  <span className="text-purple-600 text-sm">6.8%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Standard</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">1.100</span>
                  <span className="text-blue-600 text-sm">88.0%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Staff</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">45</span>
                  <span className="text-green-600 text-sm">3.6%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Press</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">20</span>
                  <span className="text-orange-600 text-sm">1.6%</span>
                </div>
              </div>
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
          <div className="space-y-4">
            {[
              { 
                name: 'Festa de Aniversário - Janeiro 2024', 
                totalGuests: 85, 
                checkedIn: 82, 
                checkInRate: 96.5,
                vipGuests: 12,
                date: '15/01/2024'
              },
              { 
                name: 'Evento Corporativo - Q1 2024', 
                totalGuests: 120, 
                checkedIn: 115, 
                checkInRate: 95.8,
                vipGuests: 25,
                date: '22/01/2024'
              },
              { 
                name: 'Festival de Verão 2024', 
                totalGuests: 250, 
                checkedIn: 240, 
                checkInRate: 96.0,
                vipGuests: 30,
                date: '05/02/2024'
              },
              { 
                name: 'Evento de Luxo - Março', 
                totalGuests: 45, 
                checkedIn: 42, 
                checkInRate: 93.3,
                vipGuests: 18,
                date: '15/03/2024'
              }
            ].map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
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
                      {event.checkInRate}% taxa
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {event.vipGuests} VIPs
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {event.date}
                    </span>
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
              <div className="text-3xl font-bold text-green-600 mb-2">94.4%</div>
              <div className="text-sm text-gray-500">Taxa de Check-in</div>
              <div className="text-xs text-green-600 mt-1">Excelente</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">27.1%</div>
              <div className="text-sm text-gray-500">Check-in Antecipado</div>
              <div className="text-xs text-blue-600 mt-1">Bom</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">6.8%</div>
              <div className="text-sm text-gray-500">Convidados VIP</div>
              <div className="text-xs text-purple-600 mt-1">Alto Valor</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">4.2</div>
              <div className="text-sm text-gray-500">Avaliação Média</div>
              <div className="text-xs text-orange-600 mt-1">Muito Bom</div>
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
          <div className="space-y-4">
            {[
              { name: 'Festa de Aniversário - Janeiro 2024', checkInRate: 96.5, guests: 85, position: 1 },
              { name: 'Festival de Verão 2024', checkInRate: 96.0, guests: 250, position: 2 },
              { name: 'Evento Corporativo - Q1 2024', checkInRate: 95.8, guests: 120, position: 3 },
              { name: 'Evento de Luxo - Março', checkInRate: 93.3, guests: 45, position: 4 }
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
                      <span>{event.guests} convidados</span>
                      <span>{event.checkInRate}% check-in</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">{event.checkInRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

