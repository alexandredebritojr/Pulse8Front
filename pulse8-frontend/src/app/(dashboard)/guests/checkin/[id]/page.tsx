'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle,
  Award,
  Ticket,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  QrCode,
  LogIn,
  LogOut,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatPhone } from '@/lib/utils'
import { CheckinDto, CheckinService } from '@/lib/api/checkin'
import ConfirmationModal from '@/components/ui/confirmation-modal'

export default function CheckinDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [checkin, setCheckin] = useState<CheckinDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Carregar dados reais da API
  useEffect(() => {
    const loadCheckin = async () => {
      try {
        console.log('🔍 CheckinDetailsPage: Carregando checkin com ID:', params.id)
        const checkinData = await CheckinService.getCheckinById(params.id as string)
        console.log('✅ CheckinDetailsPage: Checkin carregado:', checkinData)
        setCheckin(checkinData)
        setError(null)
      } catch (err: any) {
        console.error('❌ CheckinDetailsPage: Erro ao carregar checkin:', err)
        setError(err.message || 'Erro ao carregar checkin')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadCheckin()
    }
  }, [params.id])

  const handleDelete = async () => {
    try {
      console.log('🗑️ Excluindo checkin:', params.id)
      await CheckinService.deleteCheckin(params.id as string)
      console.log('✅ Checkin excluído com sucesso')
      router.push('/guests/checkin')
    } catch (err: any) {
      console.error('❌ Erro ao excluir checkin:', err)
      setError(err.message || 'Erro ao excluir checkin')
    } finally {
      setShowDeleteModal(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'checked-in':
        return 'bg-green-100 text-green-800'
      case 'checked-out':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'checked-in':
        return 'Check-in Realizado'
      case 'checked-out':
        return 'Check-out Realizado'
      case 'pending':
        return 'Pendente'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'checked-in':
        return <CheckCircle className="h-4 w-4" />
      case 'checked-out':
        return <LogOut className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando detalhes do check-in...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar check-in</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/guests/checkin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Check-ins
          </Button>
        </div>
      </div>
    )
  }

  if (!checkin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Check-in não encontrado</h3>
          <p className="text-gray-600 mb-4">O check-in solicitado não foi encontrado.</p>
          <Button onClick={() => router.push('/guests/checkin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Check-ins
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/guests/checkin')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalhes do Check-in</h1>
            <p className="text-gray-600">Informações completas do check-in</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/guests/checkin/${checkin.id}/edit`)}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Editar</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            <span>Excluir</span>
          </Button>
        </div>
      </div>

      {/* Informações do Convidado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Informações do Convidado</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome Completo</label>
              <p className="text-lg font-semibold text-gray-900">{checkin.guestName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900 flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{checkin.guestEmail}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Evento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Informações do Evento</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome do Evento</label>
              <p className="text-lg font-semibold text-gray-900">{checkin.eventName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Data do Evento</label>
              <p className="text-gray-900 flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(checkin.eventStartDate)}</span>
              </p>
            </div>
            {checkin.location && (
              <div>
                <label className="text-sm font-medium text-gray-500">Local</label>
                <p className="text-gray-900 flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{checkin.location}</span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status do Check-in */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LogIn className="h-5 w-5" />
            <span>Status do Check-in</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(checkin.status)}`}>
                  {getStatusIcon(checkin.status)}
                  <span className="ml-1">{getStatusText(checkin.status)}</span>
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Check-in</label>
              <p className="text-gray-900 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{formatDate(checkin.checkinTime)}</span>
              </p>
            </div>
            {checkin.checkoutTime && (
              <div>
                <label className="text-sm font-medium text-gray-500">Check-out</label>
                <p className="text-gray-900 flex items-center space-x-2">
                  <LogOut className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(checkin.checkoutTime)}</span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      {checkin.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Observações</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900 whitespace-pre-wrap">{checkin.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Excluir Check-in"
        message="Tem certeza que deseja excluir este check-in? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}



