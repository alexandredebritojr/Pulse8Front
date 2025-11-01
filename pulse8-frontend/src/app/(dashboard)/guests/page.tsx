'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  Star,
  DollarSign,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Grid,
  List,
  Award,
  BarChart3,
  Clock,
  UserCheck,
  UserX,
  QrCode,
  Ticket,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import { formatDate, formatPhone } from '@/lib/utils'
import { GuestsService, GuestDto, GetGuestsResponse } from '@/lib/api/guests'

export default function GuestsPage() {
  const [guests, setGuests] = useState<GuestDto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [guestToDelete, setGuestToDelete] = useState<GuestDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Carregar guests da API
  useEffect(() => {
    const loadGuests = async () => {
      try {
        console.log('🔍 Carregando guests da API...')
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        const queryParams = {
          pageNumber: 1,
          pageSize: 50,
          searchTerm: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          organizationId: organizationId
        }
        
        const response = await GuestsService.getGuests(queryParams)
        console.log('✅ Guests carregados:', response)
        setGuests(response.guests)
        setError('')
      } catch (err: any) {
        console.error('❌ Erro ao carregar guests:', err)
        setError(err.message || 'Erro ao carregar guests')
      } finally {
        setIsLoading(false)
      }
    }

    loadGuests()
  }, [searchTerm, statusFilter])

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: // Confirmed
      case 2: // CheckedIn
        return 'bg-green-100 text-green-800'
      case 0: // Pending
        return 'bg-yellow-100 text-yellow-800'
      case 5: // Cancelled
      case 4: // NoShow
        return 'bg-red-100 text-red-800'
      case 3: // CheckedOut
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: // Confirmed
        return 'Confirmado'
      case 2: // CheckedIn
        return 'Check-in'
      case 3: // CheckedOut
        return 'Check-out'
      case 0: // Pending
        return 'Pendente'
      case 5: // Cancelled
        return 'Cancelado'
      case 4: // NoShow
        return 'Não compareceu'
      default:
        return 'Desconhecido'
    }
  }

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1: // Confirmed
      case 2: // CheckedIn
        return <CheckCircle className="h-4 w-4" />
      case 3: // CheckedOut
        return <Check className="h-4 w-4" />
      case 0: // Pending
        return <Clock className="h-4 w-4" />
      case 5: // Cancelled
      case 4: // NoShow
        return <UserX className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }


  const handleDeleteClick = (guest: GuestDto) => {
    setGuestToDelete(guest)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!guestToDelete) return
    
    setIsDeleting(true)
    try {
      console.log('🗑️ Excluindo convidado:', guestToDelete.id)
      await GuestsService.deleteGuest(guestToDelete.id)
      console.log('✅ Convidado excluído com sucesso')
      
      const updatedGuests = guests.filter(g => g.id !== guestToDelete.id)
      setGuests(updatedGuests)
      
      setShowDeleteModal(false)
      setGuestToDelete(null)
    } catch (err: any) {
      console.error('❌ Erro ao excluir convidado:', err)
      alert('Erro ao excluir convidado: ' + (err.message || 'Erro desconhecido'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setGuestToDelete(null)
  }

  const totalGuests = guests?.length || 0
  const confirmedGuests = totalGuests // Simplificado - todos os convidados são considerados confirmados
  const pendingGuests = 0 // Simplificado - não há status no payload
  const vipGuests = 0 // Simplificado - não há tipo no payload

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

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Convidados</h1>
          <p className="text-sm sm:text-base text-gray-600">Gerencie seus convidados e acompanhe confirmações</p>
        </div>
        <Link href="/guests/create" className="flex-shrink-0">
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Convidado</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{totalGuests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Confirmados</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{confirmedGuests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pendentes</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{pendingGuests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <Star className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">VIP</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{vipGuests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar convidados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'confirmed' | 'pending' | 'cancelled')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm flex-shrink-0 min-w-[120px]"
          >
            <option value="all">Todos</option>
            <option value="confirmed">Confirmados</option>
            <option value="pending">Pendentes</option>
            <option value="cancelled">Cancelados</option>
          </select>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
          </div>
        </div>
      </div>

      {/* Guests List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guests?.map((guest) => (
            <Card key={guest.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{guest.name}</h3>
                      <p className="text-sm text-gray-500">{guest.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <span className="ml-1">Confirmado</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {formatPhone(guest.phone)}
                  </div>
                  {guest.eventName && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {guest.eventName}
                    </div>
                  )}
                </div>


                <div className="flex gap-2">
                  <Link href={`/guests/${guest.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                  <Link href={`/guests/${guest.id}/edit`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDeleteClick(guest)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {guests?.map((guest) => (
            <Card key={guest.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{guest.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 break-words">
                        {guest.email}
                        {guest.phone && ` • ${formatPhone(guest.phone)}`}
                        {guest.eventName && ` • ${guest.eventName}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-4 lg:gap-6">
                    {/* Status and Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                        <CheckCircle className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Confirmado</span>
                      </span>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/guests/${guest.id}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/guests/${guest.id}/edit`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                          onClick={() => handleDeleteClick(guest)}
                          title="Excluir convidado"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(guests?.length || 0) === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum convidado encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece criando um novo convidado.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <div className="mt-6">
                <Link href="/guests/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Convidado
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Convidado"
        message={`Tem certeza que deseja excluir o convidado "${guestToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}
