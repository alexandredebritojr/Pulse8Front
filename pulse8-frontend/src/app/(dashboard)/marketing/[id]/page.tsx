'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Megaphone, 
  Calendar, 
  DollarSign, 
  Users, 
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { MarketingService, MarketingDto } from '@/lib/api/marketing'
import ConfirmationModal from '@/components/ui/confirmation-modal'

export default function MarketingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<MarketingDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const campaignData = await MarketingService.getMarketingById(campaignId)
        setCampaign(campaignData)
      } catch (err: any) {
        console.error('❌ Erro ao carregar campanha:', err)
        setError(err.message || 'Erro ao carregar campanha')
      } finally {
        setIsLoading(false)
      }
    }

    if (campaignId) {
      loadCampaign()
    }
  }, [campaignId])

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!campaign) return
    
    setIsDeleting(true)
    try {
      await MarketingService.deleteMarketing(campaign.id)
      router.push('/marketing')
    } catch (err: any) {
      console.error('❌ Erro ao excluir campanha:', err)
      setError('Erro ao excluir campanha: ' + (err.message || 'Erro desconhecido'))
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Inactive':
        return 'bg-red-100 text-red-800'
      case 'Completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active':
        return 'Ativo'
      case 'Inactive':
        return 'Inativo'
      case 'Completed':
        return 'Concluído'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-4 w-4" />
      case 'Inactive':
        return <AlertCircle className="h-4 w-4" />
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
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
        <Button onClick={() => router.push('/marketing')}>Voltar</Button>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">Campanha não encontrada</div>
        <Button onClick={() => router.push('/marketing')}>Voltar</Button>
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
            onClick={() => router.push('/marketing')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{campaign.name}</h1>
            <p className="text-sm sm:text-base text-gray-600">{campaign.type}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/marketing/${campaign.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </Link>
          <Button 
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Excluir</span>
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Campanha
                </label>
                <p className="text-gray-900">{campaign.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <p className="text-gray-900">{campaign.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <p className="text-gray-900">{campaign.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {getStatusIcon(campaign.status)}
                    <span className="ml-1">{getStatusText(campaign.status)}</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates and Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Datas e Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Início
                  </label>
                  <p className="text-gray-900">{formatDate(campaign.startDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Fim
                  </label>
                  <p className="text-gray-900">{campaign.endDate ? formatDate(campaign.endDate) : 'Não definida'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orçamento Planejado
                  </label>
                  <p className="text-gray-900">
                    {campaign.budget ? campaign.budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não definido'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custo Real
                  </label>
                  <p className="text-gray-900">
                    {campaign.actualCost ? campaign.actualCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não definido'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Audience and Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Público e Canais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Público-Alvo
                </label>
                <p className="text-gray-900">{campaign.targetAudience || 'Não definido'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canais de Comunicação
                </label>
                {campaign.channels && campaign.channels.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {campaign.channels.map((channel, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {channel}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum canal definido</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                  {getStatusIcon(campaign.status)}
                  <span className="ml-2">{getStatusText(campaign.status)}</span>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Organização</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{campaign.organizationName}</p>
            </CardContent>
          </Card>

          {/* Created Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Criado em</p>
                <p className="text-sm text-gray-900">{formatDate(campaign.createdAt)}</p>
              </div>
              {campaign.updatedAt && (
                <div>
                  <p className="text-xs text-gray-500">Atualizado em</p>
                  <p className="text-sm text-gray-900">{formatDate(campaign.updatedAt)}</p>
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
        title="Excluir Campanha"
        message={`Tem certeza que deseja excluir a campanha "${campaign.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}



