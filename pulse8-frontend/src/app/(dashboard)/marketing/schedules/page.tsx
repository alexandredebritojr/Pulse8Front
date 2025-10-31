'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Megaphone, 
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Edit,
  Trash2,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime, formatDate } from '@/lib/utils'
import { PostingSchedule, PostingStatus } from '@/types/api'

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<PostingSchedule[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<PostingStatus | 'all'>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - em produção viria da API
  useEffect(() => {
    const mockSchedules: PostingSchedule[] = [
      {
        id: '1',
        eventId: 'event-1',
        title: 'Post Instagram - Lineup',
        content: 'Confira a lineup completa do Festival de Verão 2024! 🎵 #FestivalVerão #Música #Lineup',
        scheduledTime: '2024-02-10T18:00:00Z',
        platform: 'Instagram',
        status: PostingStatus.Scheduled,
        assetId: '1',
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z',
      },
      {
        id: '2',
        eventId: 'event-1',
        title: 'Post Facebook - Contagem Regressiva',
        content: 'Faltam apenas 5 dias para o Festival de Verão! ⏰ Não perca essa experiência única!',
        scheduledTime: '2024-02-12T12:00:00Z',
        platform: 'Facebook',
        status: PostingStatus.Published,
        assetId: '2',
        createdAt: '2024-01-08T00:00:00Z',
        updatedAt: '2024-01-08T00:00:00Z',
      },
      {
        id: '3',
        eventId: 'event-2',
        title: 'Tweet - Workshop Marketing',
        content: 'Workshop de Marketing Digital com especialistas da área! 📈 Inscrições abertas!',
        scheduledTime: '2024-02-15T14:00:00Z',
        platform: 'Twitter',
        status: PostingStatus.Scheduled,
        assetId: '3',
        createdAt: '2024-01-12T00:00:00Z',
        updatedAt: '2024-01-12T00:00:00Z',
      },
      {
        id: '4',
        eventId: 'event-1',
        title: 'Story Instagram - Behind the Scenes',
        content: 'Por trás das câmeras do Festival de Verão! 🎬',
        scheduledTime: '2024-02-14T20:00:00Z',
        platform: 'Instagram',
        status: PostingStatus.Draft,
        assetId: '4',
        createdAt: '2024-01-13T00:00:00Z',
        updatedAt: '2024-01-13T00:00:00Z',
      },
      {
        id: '5',
        eventId: 'event-3',
        title: 'Post LinkedIn - Conferência Tech',
        content: 'Conferência Tech 2024: As últimas tendências em tecnologia! 💻',
        scheduledTime: '2024-02-18T09:00:00Z',
        platform: 'LinkedIn',
        status: PostingStatus.Failed,
        assetId: '5',
        createdAt: '2024-01-14T00:00:00Z',
        updatedAt: '2024-01-14T00:00:00Z',
      },
    ]
    
    setTimeout(() => {
      setSchedules(mockSchedules)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter
    const matchesPlatform = platformFilter === 'all' || schedule.platform === platformFilter
    return matchesSearch && matchesStatus && matchesPlatform
  })

  const getStatusColor = (status: PostingStatus) => {
    switch (status) {
      case PostingStatus.Draft:
        return 'bg-gray-100 text-gray-800'
      case PostingStatus.Scheduled:
        return 'bg-blue-100 text-blue-800'
      case PostingStatus.Published:
        return 'bg-green-100 text-green-800'
      case PostingStatus.Failed:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: PostingStatus) => {
    switch (status) {
      case PostingStatus.Draft:
        return 'Rascunho'
      case PostingStatus.Scheduled:
        return 'Agendado'
      case PostingStatus.Published:
        return 'Publicado'
      case PostingStatus.Failed:
        return 'Falhou'
      default:
        return status
    }
  }

  const getStatusIcon = (status: PostingStatus) => {
    switch (status) {
      case PostingStatus.Draft:
        return <PauseCircle className="h-4 w-4" />
      case PostingStatus.Scheduled:
        return <Clock className="h-4 w-4" />
      case PostingStatus.Published:
        return <CheckCircle className="h-4 w-4" />
      case PostingStatus.Failed:
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Facebook':
        return <Facebook className="h-5 w-5 text-blue-600" />
      case 'Instagram':
        return <Instagram className="h-5 w-5 text-pink-600" />
      case 'Twitter':
        return <Twitter className="h-5 w-5 text-blue-400" />
      case 'LinkedIn':
        return <Linkedin className="h-5 w-5 text-blue-700" />
      case 'YouTube':
        return <Youtube className="h-5 w-5 text-red-600" />
      default:
        return <Megaphone className="h-5 w-5 text-gray-600" />
    }
  }

  const getEventName = (eventId: string) => {
    const eventNames: { [key: string]: string } = {
      'event-1': 'Festival de Verão 2024',
      'event-2': 'Workshop Marketing Digital',
      'event-3': 'Conferência Tech 2024',
    }
    return eventNames[eventId] || 'Evento'
  }

  const platforms = Array.from(new Set(schedules.map(schedule => schedule.platform)))

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
          <h1 className="text-3xl font-bold text-gray-900">Agendamento de Posts</h1>
          <p className="text-gray-600">Gerencie posts agendados para redes sociais</p>
        </div>
        <Link href="/marketing/schedules/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PostingStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos os status</option>
            <option value={PostingStatus.Draft}>Rascunho</option>
            <option value={PostingStatus.Scheduled}>Agendado</option>
            <option value={PostingStatus.Published}>Publicado</option>
            <option value={PostingStatus.Failed}>Falhou</option>
          </select>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todas as plataformas</option>
            {platforms.map(platform => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Schedules List */}
      <div className="space-y-4">
        {filteredSchedules.map((schedule) => (
          <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getPlatformIcon(schedule.platform)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{schedule.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{schedule.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDateTime(schedule.scheduledTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Megaphone className="h-4 w-4" />
                        {getEventName(schedule.eventId)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(schedule.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                        {getStatusText(schedule.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{schedule.platform}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredSchedules.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum post encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || platformFilter !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece criando seu primeiro post agendado.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && platformFilter === 'all' && (
            <div className="mt-6">
              <Link href="/marketing/schedules/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Post
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

