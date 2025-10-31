'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Users, DollarSign, Target, Calendar, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PromotersService, PromoterDto } from '@/lib/api/promoters'
import ConfirmationModal from '@/components/ui/confirmation-modal'

export default function PromoterDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const promoterId = params.id as string

  const [promoter, setPromoter] = useState<PromoterDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    const loadPromoter = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const promoterData = await PromotersService.getPromoterById(promoterId)
        setPromoter(promoterData)
      } catch (err: any) {
        console.error('❌ Erro ao carregar promoter:', err)
        setError(err.message || 'Erro ao carregar promoter')
      } finally {
        setIsLoading(false)
      }
    }

    if (promoterId) {
      loadPromoter()
    }
  }, [promoterId])

  const handleDelete = async () => {
    try {
      await PromotersService.deletePromoter(promoterId)
      setShowDeleteModal(false)
      router.push('/promoters')
    } catch (err: any) {
      console.error('❌ Erro ao excluir promoter:', err)
      setError(err.message || 'Erro ao excluir promoter')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Inactive': return 'bg-gray-100 text-gray-800'
      case 'Suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active': return 'Ativo'
      case 'Inactive': return 'Inativo'
      case 'Suspended': return 'Suspenso'
      default: return status
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/promoters')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Erro</h1>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      </div>
    )
  }

  if (!promoter) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/promoters')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Promoter não encontrado</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/promoters')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{promoter.userName}</h1>
            <p className="text-gray-600">Detalhes do promoter</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/promoters/${promoter.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Promoter */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <p className="text-gray-900">{promoter.userName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Badge className={getStatusColor(promoter.status)}>
                    {getStatusText(promoter.status)}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{promoter.userEmail}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{promoter.userPhone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Comissão */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Configurações de Comissão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taxa de Comissão
                  </label>
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatPercentage(promoter.commissionRate)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total de Vendas
                  </label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(promoter.totalSales)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total de Comissões
                  </label>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(promoter.totalCommission)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Evento
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{promoter.eventName}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Códigos e Campanha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Códigos e Campanha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código do Promoter
                  </label>
                  <p className="text-gray-900">
                    {promoter.promoterCode || 'Não definido'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código UTM
                  </label>
                  <p className="text-gray-900">
                    {promoter.utmCode || 'Não definido'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campanha
                  </label>
                  <p className="text-gray-900">
                    {promoter.campaignName || 'Nenhuma campanha associada'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Sistema */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Criado em
                </label>
                <p className="text-gray-900">{formatDate(promoter.createdAt)}</p>
              </div>
              {promoter.updatedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Atualizado em
                  </label>
                  <p className="text-gray-900">{formatDate(promoter.updatedAt)}</p>
                </div>
              )}
              {promoter.createdBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Criado por
                  </label>
                  <p className="text-gray-900">{promoter.createdBy}</p>
                </div>
              )}
              {promoter.updatedBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Atualizado por
                  </label>
                  <p className="text-gray-900">{promoter.updatedBy}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Excluir Promoter"
        message="Tem certeza que deseja excluir este promoter? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}