'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Users, DollarSign, TrendingUp, Loader2 } from 'lucide-react'
import { EventsService, EventDto } from '@/lib/api/events'
import { RevenueService } from '@/lib/api/revenue'
import { GuestsService } from '@/lib/api/guests'
import { formatDate, formatCurrency } from '@/lib/utils'

interface DashboardStats {
  totalEvents: number
  totalGuests: number
  totalRevenue: number
  growthRate: number
  eventsThisMonth: number
  guestsThisMonth: number
  revenueThisMonth: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalGuests: 0,
    totalRevenue: 0,
    growthRate: 0,
    eventsThisMonth: 0,
    guestsThisMonth: 0,
    revenueThisMonth: 0,
  })
  const [recentEvents, setRecentEvents] = useState<EventDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Redirecionar Promoters para a página de eventos imediatamente
  useEffect(() => {
    // Promoter: userOrganizationType === 3 OU não tem organização nem userOrganizationType
    const isPromoter = user?.userOrganizationType === 3 || (!user?.organizationId && !user?.userOrganizationType)
    if (isPromoter) {
      console.log('🔀 Dashboard: Redirecionando Promoter para /events')
      router.replace('/events')
      return
    }
  }, [user, router])

  useEffect(() => {
    // Não carregar dados se for promoter (será redirecionado)
    const isPromoter = user?.userOrganizationType === 3 || (!user?.organizationId && !user?.userOrganizationType)
    if (isPromoter) {
      return
    }

    // Não carregar dados se não houver organização
    if (!user?.organizationId) {
      setIsLoading(false)
      setError('Organização não encontrada')
      return
    }

    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        setError('')

        const organizationId = user.organizationId || localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'

        // Buscar dados em paralelo
        const [eventsResponse, revenueResponse, guestsResponse] = await Promise.all([
          EventsService.getEvents({
            pageNumber: 1,
            pageSize: 100,
            organizationId,
            sortBy: 'startDate',
            sortDescending: false,
          }),
          RevenueService.getRevenue({
            pageNumber: 1,
            pageSize: 100,
            organizationId,
          }),
          GuestsService.getGuests({
            pageNumber: 1,
            pageSize: 100,
            organizationId,
          }),
        ])

        // Calcular estatísticas
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

        // Eventos
        const totalEvents = eventsResponse.totalCount
        const eventsThisMonth = eventsResponse.events.filter(event => {
          const eventDate = new Date(event.startDate)
          return eventDate >= firstDayOfMonth
        }).length

        // Receitas
        const totalRevenue = revenueResponse.totalAmount || revenueResponse.revenues.reduce((sum, rev) => sum + rev.amount, 0)
        const revenueThisMonth = revenueResponse.revenues.filter(rev => {
          const revDate = new Date(rev.date)
          return revDate >= firstDayOfMonth
        }).reduce((sum, rev) => sum + rev.amount, 0)
        
        const revenueLastMonth = revenueResponse.revenues.filter(rev => {
          const revDate = new Date(rev.date)
          return revDate >= lastMonth && revDate <= lastMonthEnd
        }).reduce((sum, rev) => sum + rev.amount, 0)

        // Convidados
        const totalGuests = guestsResponse.totalCount
        const guestsThisMonth = guestsResponse.guests.filter(guest => {
          const guestDate = guest.createdAt ? new Date(guest.createdAt) : new Date()
          return guestDate >= firstDayOfMonth
        }).length

        // Calcular taxa de crescimento (baseada na receita)
        const growthRate = revenueLastMonth > 0
          ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
          : 0

        // Eventos recentes (últimos 5, ordenados por data)
        const sortedEvents = [...eventsResponse.events]
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .slice(0, 5)

        setStats({
          totalEvents,
          totalGuests,
          totalRevenue,
          growthRate: Math.round(growthRate * 100) / 100,
          eventsThisMonth,
          guestsThisMonth,
          revenueThisMonth,
        })
        setRecentEvents(sortedEvents)
      } catch (err: any) {
        console.error('Erro ao carregar dados do dashboard:', err)
        setError(err.message || 'Erro ao carregar dados do dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    // Não carregar dados do dashboard se o usuário for Promoter (será redirecionado)
    if (user && user.userOrganizationType !== 3) {
      loadDashboardData()
    }
  }, [user])

  const getStatusText = (status: string | number | null | undefined): string => {
    if (status === null || status === undefined) return 'Indefinido'
    
    const statusStr = String(status).toLowerCase()
    
    switch (statusStr) {
      case 'draft':
        return 'Rascunho'
      case 'planning':
      case '0':
        return 'Planejamento'
      case 'active':
      case '1':
        return 'Ativo'
      case 'completed':
      case '2':
        return 'Finalizado'
      case 'cancelled':
      case '3':
        return 'Cancelado'
      default:
        return String(status)
    }
  }

  const getStatusColor = (status: string | number | null | undefined): string => {
    if (status === null || status === undefined) return 'bg-gray-100 text-gray-800'
    
    const statusStr = String(status).toLowerCase()
    
    switch (statusStr) {
      case 'draft':
      case '0':
        return 'bg-gray-100 text-gray-800'
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'active':
      case '1':
        return 'bg-green-100 text-green-800'
      case 'completed':
      case '2':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
      case '3':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const statsCards = [
    {
      title: 'Total de Eventos',
      value: stats.totalEvents.toString(),
      change: stats.eventsThisMonth > 0 ? `+${stats.eventsThisMonth} este mês` : 'Nenhum este mês',
      icon: Calendar,
    },
    {
      title: 'Total de Convidados',
      value: stats.totalGuests.toString(),
      change: stats.guestsThisMonth > 0 ? `+${stats.guestsThisMonth} este mês` : 'Nenhum este mês',
      icon: Users,
    },
    {
      title: 'Receita Total',
      value: formatCurrency(stats.totalRevenue),
      change: stats.revenueThisMonth > 0 
        ? `${formatCurrency(stats.revenueThisMonth)} este mês`
        : 'Nenhuma receita este mês',
      icon: DollarSign,
    },
    {
      title: 'Taxa de Crescimento',
      value: `${stats.growthRate >= 0 ? '+' : ''}${stats.growthRate.toFixed(1)}%`,
      change: stats.growthRate >= 0 ? 'Crescimento positivo' : 'Crescimento negativo',
      icon: TrendingUp,
    },
  ]

  // Se for Promoter, não renderizar nada (será redirecionado)
  if (user?.userOrganizationType === 3) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Aqui está um resumo do que está acontecendo em sua organização.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-medium">Erro ao carregar dados</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
            <CardDescription>
              Últimos eventos criados em sua organização
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhum evento encontrado</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{event.name}</p>
                        <p className="text-sm text-gray-500">{formatDate(event.startDate)}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {getStatusText(event.status)}
                      </span>
                    </div>
                  ))}
                </div>
                <Link href="/events">
                  <Button className="w-full mt-4" variant="outline">
                    Ver todos os eventos
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {user?.userOrganizationType !== 3 && (
                <Link href="/events/create">
                  <Button className="h-20 w-full flex flex-col items-center justify-center">
                    <Calendar className="h-6 w-6 mb-2" />
                    <span className="text-sm">Novo Evento</span>
                  </Button>
                </Link>
              )}
              {user?.userOrganizationType !== 3 && (
                <Link href="/guests">
                  <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center">
                    <Users className="h-6 w-6 mb-2" />
                    <span className="text-sm">Convidados</span>
                  </Button>
                </Link>
              )}
              {user?.userOrganizationType !== 3 && (
                <Link href="/finance/budget">
                  <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center">
                    <DollarSign className="h-6 w-6 mb-2" />
                    <span className="text-sm">Orçamento</span>
                  </Button>
                </Link>
              )}
              {user?.userOrganizationType !== 3 && (
                <Link href="/reports">
                  <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    <span className="text-sm">Relatórios</span>
                  </Button>
                </Link>
              )}
              {user?.userOrganizationType === 3 && (
                <Link href="/events" className="col-span-2">
                  <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center">
                    <Calendar className="h-6 w-6 mb-2" />
                    <span className="text-sm">Ver Eventos</span>
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

