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
import { GuestDto, GuestsService } from '@/lib/api/guests'
import ConfirmationModal from '@/components/ui/confirmation-modal'

export default function GuestDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [guest, setGuest] = useState<GuestDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Carregar dados reais da API
  useEffect(() => {
    const loadGuest = async () => {
      try {
        console.log('🔍 GuestDetailsPage: Carregando guest com ID:', params.id)
        const guestData = await GuestsService.getGuestById(params.id as string)
        console.log('✅ GuestDetailsPage: Guest carregado:', guestData)
        setGuest(guestData)
      } catch (err: any) {
        console.error('❌ GuestDetailsPage: Erro ao carregar guest:', err)
        setError(err.message || 'Erro ao carregar dados do convidado')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadGuest()
    }
  }, [params.id])

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'bg-green-100 text-green-800' // Confirmed
      case 2: return 'bg-blue-100 text-blue-800' // CheckedIn
      case 3: return 'bg-purple-100 text-purple-800' // CheckedOut
      case 0: return 'bg-yellow-100 text-yellow-800' // Pending
      case 4: return 'bg-red-100 text-red-800' // NoShow
      case 5: return 'bg-gray-100 text-gray-800' // Cancelled
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Confirmado' // Confirmed
      case 2: return 'Check-in Realizado' // CheckedIn
      case 3: return 'Check-out Realizado' // CheckedOut
      case 0: return 'Pendente' // Pending
      case 4: return 'Não Compareceu' // NoShow
      case 5: return 'Cancelado' // Cancelled
      default: return 'Pendente'
    }
  }

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1: return <CheckCircle className="h-4 w-4" /> // Confirmed
      case 2: return <LogIn className="h-4 w-4" /> // CheckedIn
      case 3: return <LogOut className="h-4 w-4" /> // CheckedOut
      case 0: return <AlertCircle className="h-4 w-4" /> // Pending
      case 4: return <AlertCircle className="h-4 w-4" /> // NoShow
      case 5: return <AlertCircle className="h-4 w-4" /> // Cancelled
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleDelete = async () => {
    if (!guest) return
    
    try {
      console.log('🗑️ GuestDetailsPage: Excluindo guest:', guest.id)
      await GuestsService.deleteGuest(guest.id)
      console.log('✅ GuestDetailsPage: Guest excluído com sucesso')
      router.push('/guests')
    } catch (err: any) {
      console.error('❌ GuestDetailsPage: Erro ao excluir guest:', err)
      setError(err.message || 'Erro ao excluir convidado')
    } finally {
      setShowDeleteModal(false)
    }
  }

  const getGuestType = (guest: GuestDto) => {
    return { type: 'Convidado', color: 'text-blue-600', icon: '🎫' }
  }

  const getCheckInStatus = (guest: GuestDto) => {
    if (guest.checkInDate) {
      return { status: 'Check-in Realizado', color: 'text-green-600', icon: '✅' }
    }
    return { status: 'Pendente', color: 'text-gray-600', icon: '⏳' }
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
        <Button onClick={() => router.push('/guests')}>Voltar</Button>
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">Convidado não encontrado</div>
        <Button onClick={() => router.push('/guests')}>Voltar</Button>
      </div>
    )
  }

  const guestType = getGuestType(guest)
  const checkInStatus = getCheckInStatus(guest)

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.push('/guests')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{guest.name || 'Nome não informado'}</h1>
            <p className="text-sm sm:text-base text-gray-600">{getStatusText(guest.status)}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/guests/${guest.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </Link>
          <Button 
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Excluir</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600 break-words">{guest.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Telefone</p>
                    <p className="text-sm text-gray-600 break-words">{formatPhone(guest.phone)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:col-span-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Documento</p>
                    <p className="text-sm text-gray-600">{guest.document}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informações do Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Evento</p>
                  <p className="text-lg font-semibold">{guest.eventName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Check-in</p>
                  <p className="text-lg font-semibold">{guest.checkInDate ? formatDate(guest.checkInDate) : 'Não realizado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest Type and Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Tipo e Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo de Convidado</p>
                  <p className={`text-lg font-semibold ${guestType.color}`}>
                    {guestType.icon} {guestType.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status de Check-in</p>
                  <p className={`text-lg font-semibold ${checkInStatus.color}`}>
                    {checkInStatus.icon} {checkInStatus.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Acompanhante</p>
                  <p className="text-lg font-semibold">Sim - João Silva</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Restrições Alimentares</p>
                  <p className="text-lg font-semibold">Vegetariano</p>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Convidado cadastrado</p>
                    <p className="text-sm text-gray-500">{formatDate(guest.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Edit className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Informações atualizadas</p>
                    <p className="text-sm text-gray-500">{formatDate(guest.updatedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <LogIn className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Check-in realizado</p>
                    <p className="text-sm text-gray-500">15 de Janeiro, 2024 - 19:30</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Evento</span>
                <span className="font-semibold">Festa Aniversário</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Data</span>
                <span className="font-semibold">15/01/2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Horário</span>
                <span className="font-semibold">19:00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Local</span>
                <span className="font-semibold">Centro Convenções</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start">
                <QrCode className="h-4 w-4 mr-2" />
                Gerar QR Code
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <LogIn className="h-4 w-4 mr-2" />
                Fazer Check-in
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Send className="h-4 w-4 mr-2" />
                Enviar Convite
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Relatórios
              </Button>
            </CardContent>
          </Card>

          {/* Contact Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Ligar
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                Ver no Mapa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Excluir Convidado"
        message="Tem certeza que deseja excluir este convidado? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}

