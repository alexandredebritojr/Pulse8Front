'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import { SchedulesService, ScheduleDto } from '@/lib/api/schedules'
import { formatDate, formatDateTime } from '@/lib/utils'

export default function ScheduleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [schedule, setSchedule] = useState<ScheduleDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Carregar dados reais da API
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        console.log('🔍 Carregando agendamento:', params.id)
        const scheduleData = await SchedulesService.getScheduleById(params.id as string)
        console.log('✅ Agendamento carregado:', scheduleData)
        setSchedule(scheduleData)
        setError('')
      } catch (err: any) {
        console.error('❌ Erro ao carregar agendamento:', err)
        setError(err.message || 'Erro ao carregar agendamento')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadSchedule()
    }
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'InProgress':
        return 'bg-blue-100 text-blue-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'Concluído'
      case 'InProgress':
        return 'Em Andamento'
      case 'Pending':
        return 'Pendente'
      case 'Cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />
      case 'InProgress':
        return <PlayCircle className="h-4 w-4" />
      case 'Pending':
        return <Clock className="h-4 w-4" />
      case 'Cancelled':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Meeting':
        return 'bg-blue-100 text-blue-800'
      case 'Task':
        return 'bg-green-100 text-green-800'
      case 'Event':
        return 'bg-purple-100 text-purple-800'
      case 'Setup':
        return 'bg-orange-100 text-orange-800'
      case 'Soundcheck':
        return 'bg-cyan-100 text-cyan-800'
      case 'Teardown':
        return 'bg-red-100 text-red-800'
      case 'Other':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'Meeting':
        return 'Reunião'
      case 'Task':
        return 'Tarefa'
      case 'Event':
        return 'Evento'
      case 'Setup':
        return 'Setup'
      case 'Soundcheck':
        return 'Soundcheck'
      case 'Teardown':
        return 'Desmontagem'
      case 'Other':
        return 'Outros'
      default:
        return type
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Meeting':
        return <Users className="h-4 w-4" />
      case 'Task':
        return <CheckCircle className="h-4 w-4" />
      case 'Event':
        return <Calendar className="h-4 w-4" />
      case 'Setup':
        return <Settings className="h-4 w-4" />
      case 'Soundcheck':
        return <PlayCircle className="h-4 w-4" />
      case 'Teardown':
        return <Trash2 className="h-4 w-4" />
      case 'Other':
        return <Clock className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!schedule) return

    setIsDeleting(true)
    try {
      await SchedulesService.deleteSchedule(schedule.id)
      console.log('✅ Agendamento deletado com sucesso')
      router.push('/calendar/schedules')
    } catch (err: any) {
      console.error('❌ Erro ao deletar agendamento:', err)
      setError(err.message || 'Erro ao deletar agendamento')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
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
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">Agendamento não encontrado</div>
        <Link href="/calendar/schedules">
          <Button>Voltar para Agenda</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/calendar/schedules')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{schedule.title}</h1>
            <p className="text-gray-600">Detalhes do agendamento</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/calendar/schedules/${schedule.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button variant="outline" onClick={handleDeleteClick} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center space-x-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(schedule.status)}`}>
          {getStatusIcon(schedule.status)}
          <span className="ml-2">{getStatusText(schedule.status)}</span>
        </span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(schedule.type)}`}>
          {getTypeIcon(schedule.type)}
          <span className="ml-2">{getTypeText(schedule.type)}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do Agendamento */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Agendamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Título</label>
                <p className="text-gray-900">{schedule.title}</p>
              </div>
              {schedule.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Descrição</label>
                  <p className="text-gray-900">{schedule.description}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Data/Hora de Início</label>
                  <p className="text-gray-900">{formatDateTime(schedule.startTime)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data/Hora de Fim</label>
                  <p className="text-gray-900">{formatDateTime(schedule.endTime)}</p>
                </div>
              </div>
              {schedule.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Observações</label>
                  <p className="text-gray-900">{schedule.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações do Evento */}
          {schedule.eventName && (
            <Card>
              <CardHeader>
                <CardTitle>Informações do Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium text-gray-500">Evento</label>
                  <p className="text-gray-900">{schedule.eventName}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Criado em</label>
                <p className="text-gray-900">{formatDateTime(schedule.createdAt)}</p>
              </div>
              {schedule.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Atualizado em</label>
                  <p className="text-gray-900">{formatDateTime(schedule.updatedAt)}</p>
                </div>
              )}
              {schedule.createdBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Criado por</label>
                  <p className="text-gray-900">{schedule.createdBy}</p>
                </div>
              )}
              {schedule.updatedBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Atualizado por</label>
                  <p className="text-gray-900">{schedule.updatedBy}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Agendamento"
        message="Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  )
}
