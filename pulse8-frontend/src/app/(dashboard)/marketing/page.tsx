'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Megaphone, 
  Image, 
  Video, 
  FileText, 
  Calendar,
  TrendingUp,
  Eye,
  Download,
  Share,
  Filter,
  Search,
  Grid,
  List,
  BarChart3,
  Users,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import { formatDate } from '@/lib/utils'
import { MarketingService, MarketingDto, GetMarketingResponse } from '@/lib/api/marketing'

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<MarketingDto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'completed'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'Campaign' | 'Event' | 'Social Media'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState<MarketingDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Carregar campanhas de marketing da API
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        console.log('🔍 Carregando campanhas de marketing da API...')
        const queryParams = {
          pageNumber: 1,
          pageSize: 50,
          searchTerm: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined
        }
        
        const response = await MarketingService.getMarketingCampaigns(queryParams)
        console.log('✅ Campanhas carregadas:', response)
        setCampaigns(response.campaigns)
        setError('')
      } catch (err: any) {
        console.error('❌ Erro ao carregar campanhas:', err)
        setError(err.message || 'Erro ao carregar campanhas')
      } finally {
        setIsLoading(false)
      }
    }

    loadCampaigns()
  }, [searchTerm, statusFilter, typeFilter])

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Campaign':
        return <Megaphone className="h-5 w-5" />
      case 'Event':
        return <Calendar className="h-5 w-5" />
      case 'Social Media':
        return <Share className="h-5 w-5" />
      default:
        return <Target className="h-5 w-5" />
    }
  }

  const handleDeleteClick = (campaign: MarketingDto) => {
    setCampaignToDelete(campaign)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!campaignToDelete) return
    
    setIsDeleting(true)
    try {
      console.log('🗑️ Excluindo campanha:', campaignToDelete.id)
      await MarketingService.deleteMarketing(campaignToDelete.id)
      console.log('✅ Campanha excluída com sucesso')
      
      const updatedCampaigns = campaigns.filter(c => c.id !== campaignToDelete.id)
      setCampaigns(updatedCampaigns)
      
      setShowDeleteModal(false)
      setCampaignToDelete(null)
    } catch (err: any) {
      console.error('❌ Erro ao excluir campanha:', err)
      alert('Erro ao excluir campanha: ' + (err.message || 'Erro desconhecido'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setCampaignToDelete(null)
  }

  const activeCampaigns = campaigns?.filter(c => c.status === 'Active').length || 0
  const completedCampaigns = campaigns?.filter(c => c.status === 'Completed').length || 0
  const totalCampaigns = campaigns?.length || 0
  const totalBudget = campaigns?.reduce((sum, c) => sum + (c.budget || 0), 0) || 0

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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Marketing</h1>
          <p className="text-sm sm:text-base text-gray-600">Gerencie suas campanhas de marketing e acompanhe resultados</p>
        </div>
        <Link href="/marketing/create" className="flex-shrink-0">
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Campanha</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Megaphone className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{totalCampaigns}</p>
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
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Ativas</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{activeCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Concluídas</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{completedCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Orçamento</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  {totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
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
              placeholder="Buscar campanhas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'completed')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm flex-shrink-0 min-w-[120px]"
          >
            <option value="all">Todos</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
            <option value="completed">Concluídas</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'Campaign' | 'Event' | 'Social Media')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm flex-shrink-0 min-w-[140px]"
          >
            <option value="all">Todos os Tipos</option>
            <option value="Campaign">Campanha</option>
            <option value="Event">Evento</option>
            <option value="Social Media">Redes Sociais</option>
          </select>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              size="sm"
            >
              <Grid className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              size="sm"
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns?.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      {getTypeIcon(campaign.type)}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-500">{campaign.type}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {getStatusIcon(campaign.status)}
                    <span className="ml-1">{getStatusText(campaign.status)}</span>
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{campaign.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(campaign.startDate)} - {campaign.endDate ? formatDate(campaign.endDate) : 'Sem data fim'}
                  </div>
                  {campaign.budget && (
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Orçamento: {campaign.budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  )}
                  {campaign.targetAudience && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {campaign.targetAudience}
                    </div>
                  )}
                </div>

                {campaign.channels && campaign.channels.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Canais:</p>
                    <div className="flex flex-wrap gap-1">
                      {campaign.channels.map((channel, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href={`/marketing/${campaign.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                  <Link href={`/marketing/${campaign.id}/edit`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDeleteClick(campaign)}
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
          {campaigns?.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {getTypeIcon(campaign.type)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{campaign.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 break-words">
                        {campaign.type}
                        {campaign.description && ` • ${campaign.description}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-4 lg:gap-6">
                    {/* Values Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-500">Início</p>
                        <p className="font-semibold text-sm sm:text-base truncate">{formatDate(campaign.startDate)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-500">Fim</p>
                        <p className="font-semibold text-sm sm:text-base truncate">{campaign.endDate ? formatDate(campaign.endDate) : 'Sem data fim'}</p>
                      </div>
                      {campaign.budget && (
                        <div className="text-center">
                          <p className="text-xs sm:text-sm text-gray-500">Orçamento</p>
                          <p className="font-semibold text-sm sm:text-base truncate">{campaign.budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                      )}
                    </div>
                    {/* Status and Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        <span className="ml-1 hidden sm:inline">{getStatusText(campaign.status)}</span>
                      </span>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/marketing/${campaign.id}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/marketing/${campaign.id}/edit`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                          onClick={() => handleDeleteClick(campaign)}
                          title="Excluir campanha"
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

      {(!campaigns || campaigns.length === 0) && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma campanha encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece criando uma nova campanha.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
              <div className="mt-6">
                <Link href="/marketing/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Campanha
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
        title="Excluir Campanha"
        message={`Tem certeza que deseja excluir a campanha "${campaignToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}
