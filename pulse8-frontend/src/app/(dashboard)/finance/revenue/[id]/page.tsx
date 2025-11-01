'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  User, 
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import { RevenueService, RevenueDto } from '@/lib/api/revenue'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function RevenueDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [revenue, setRevenue] = useState<RevenueDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Carregar dados reais da API
  useEffect(() => {
    const loadRevenue = async () => {
      try {
        console.log('🔍 Carregando receita:', params.id)
        const revenueData = await RevenueService.getRevenueById(params.id as string)
        console.log('✅ Receita carregada:', revenueData)
        setRevenue(revenueData)
        setError('')
      } catch (err: any) {
        console.error('❌ Erro ao carregar receita:', err)
        setError(err.message || 'Erro ao carregar receita')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadRevenue()
    }
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado'
      case 'pending':
        return 'Pendente'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'One-time':
        return 'Única'
      case 'Recurring':
        return 'Recorrente'
      case 'Fixed':
        return 'Fixa'
      case 'Variable':
        return 'Variável'
      default:
        return type
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!revenue) return

    try {
      setIsDeleting(true)
      console.log('🗑️ Excluindo receita:', revenue.id)
      
      await RevenueService.deleteRevenue(revenue.id)
      console.log('✅ Receita excluída com sucesso')
      
      router.push('/finance/revenue')
    } catch (err: any) {
      console.error('❌ Erro ao excluir receita:', err)
      setError(err.message || 'Erro ao excluir receita')
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

  if (!revenue) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">Receita não encontrada</div>
        <Link href="/finance/revenue">
          <Button>Voltar para Receitas</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/finance/revenue')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{revenue.source}</h1>
            <p className="text-sm sm:text-base text-gray-600">Detalhes da receita</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/finance/revenue/${revenue.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDeleteClick} 
            className="text-red-600 hover:text-red-700 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Excluir</span>
          </Button>
        </div>
      </div>

      {/* Reference */}
      {revenue.reference && (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Referência: {revenue.reference}
          </span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Informações da Receita
              </CardTitle>
              <CardDescription>
                Dados principais da receita
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fonte
                  </label>
                  <p className="text-gray-900">{revenue.source}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referência
                  </label>
                  <p className="text-gray-900">{revenue.reference || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Evento
                  </label>
                  <p className="text-gray-900">{revenue.eventName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organização
                  </label>
                  <p className="text-gray-900">{revenue.organizationName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor
                  </label>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue.amount || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Informações de Pagamento
              </CardTitle>
              <CardDescription>
                Detalhes sobre o pagamento recebido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data da Receita
                  </label>
                  <p className="text-gray-900">{revenue.date ? formatDate(revenue.date) : '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referência
                  </label>
                  <p className="text-gray-900">{revenue.reference || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {revenue.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 whitespace-pre-wrap">{revenue.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Event Information */}
          {revenue.eventId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Evento Relacionado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Evento:</p>
                  <p className="font-medium">{revenue.eventName || 'Evento não encontrado'}</p>
                  <Link href={`/events/${revenue.eventId}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Evento
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Data da receita:</p>
                <p className="text-sm">{revenue.date ? formatDate(revenue.date) : '-'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Receita"
        message={`Tem certeza que deseja excluir a receita "${revenue.source}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  )
}
