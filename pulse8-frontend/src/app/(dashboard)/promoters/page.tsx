'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Edit, Trash2, Eye, Users, DollarSign, Target, Grid, List, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PromotersService, PromoterDto } from '@/lib/api/promoters'
import ConfirmationModal from '@/components/ui/confirmation-modal'

export default function PromotersPage() {
  const router = useRouter()
  const [promoters, setPromoters] = useState<PromoterDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const pageSize = 10


  const loadPromoters = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await PromotersService.getPromoters({
        pageNumber: currentPage,
        pageSize: pageSize,
        searchTerm: searchTerm || undefined,
        status: statusFilter || undefined
      })
      
      setPromoters(response.promoters)
      setTotalPages(response.totalPages)
    } catch (err: any) {
      console.error('❌ Erro ao carregar promoters:', err)
      setError(err.message || 'Erro ao carregar promoters')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm, statusFilter])

  useEffect(() => {
    loadPromoters()
  }, [loadPromoters])


  const handleDelete = async (id: string) => {
    if (!id) {
      setError('ID do promoter não fornecido')
      return
    }
    
    setIsDeleting(true)
    setError('')
    
    try {
      console.log('🔍 Iniciando exclusão do promoter:', id)
      
      await PromotersService.deletePromoter(id)
      
      console.log('✅ Promoter excluído com sucesso')
      setShowDeleteModal(false)
      setDeletingId(null)
      setError('') // Limpar qualquer erro anterior
      
      // Recarregar a lista
      await loadPromoters()
    } catch (err: any) {
      console.error('❌ Erro ao excluir promoter:', err)
      const errorMessage = err?.message || 'Erro ao excluir promoter. Verifique se o promoter pode ser excluído.'
      setError(errorMessage)
      // Não fechar o modal em caso de erro para o usuário ver a mensagem
    } finally {
      setIsDeleting(false)
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

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || value === null) {
      return 'N/A'
    }
    return `${value.toFixed(2)}%`
  }

  // Calcular estatísticas
  const totalPromoters = promoters?.length || 0
  const activePromoters = promoters?.filter(p => p.status === 'Active').length || 0
  const inactivePromoters = promoters?.filter(p => p.status === 'Inactive').length || 0
  const suspendedPromoters = promoters?.filter(p => p.status === 'Suspended').length || 0
  const totalSales = promoters?.reduce((sum, p) => sum + (p.totalSales || 0), 0) || 0

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Promoters</h1>
          <p className="text-sm sm:text-base text-gray-600">Gerencie promoters de eventos</p>
        </div>
        <Button onClick={() => router.push('/promoters/create')} size="sm" className="flex items-center gap-2 flex-shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Atribuir Promoter</span>
        </Button>
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
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{totalPromoters}</p>
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
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Ativos</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{activePromoters}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-gray-100 rounded-lg flex-shrink-0">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Inativos</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{inactivePromoters}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg flex-shrink-0">
                <AlertCircle className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Suspensos</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{suspendedPromoters}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Nome, email, código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Active' | 'Inactive' | 'Suspended')}
            className="flex h-10 min-w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="all">Todos os status</option>
            <option value="Active">Ativo</option>
            <option value="Inactive">Inativo</option>
            <option value="Suspended">Suspenso</option>
          </select>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('')
              setCurrentPage(1)
            }}
            className="flex-shrink-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Limpar</span>
          </Button>
          
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

      {/* Promoters List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : promoters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum promoter encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Não há promoters cadastrados na organização.
            </p>
            <Button onClick={() => router.push('/promoters/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Promoter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {promoters.map((promoter) => (
            <Card key={promoter.id}>
              {viewMode === 'grid' ? (
                // Grid Layout
                <>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg truncate">
                        {promoter.userName}
                      </CardTitle>
                      <Badge className={`${getStatusColor(promoter.status)} flex-shrink-0`}>
                        {getStatusText(promoter.status)}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 break-words">
                      {promoter.userEmail}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Comissão</p>
                        <p className="font-semibold text-base">{formatPercentage(promoter.commissionRate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Vendas</p>
                        <p className="font-semibold text-base">{formatCurrency(promoter.totalSales)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="truncate">Evento: {promoter.eventName}</div>
                      {promoter.promoterCode && (
                        <div className="truncate">Código: {promoter.promoterCode}</div>
                      )}
                      {promoter.campaignName && (
                        <div className="truncate">Campanha: {promoter.campaignName}</div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/promoters/${promoter.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push(`/promoters/${promoter.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setDeletingId(promoter.id)
                          setShowDeleteModal(true)
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                // List Layout
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {promoter.userName}
                        </h3>
                        <Badge className={getStatusColor(promoter.status)}>
                          {getStatusText(promoter.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{promoter.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 flex-shrink-0" />
                          <span>Comissão: {formatPercentage(promoter.commissionRate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Target className="h-4 w-4 flex-shrink-0" />
                          <span>Vendas: {formatCurrency(promoter.totalSales)}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                        <span className="break-words">Evento: {promoter.eventName}</span>
                        {promoter.promoterCode && (
                          <span className="break-words">Código: {promoter.promoterCode}</span>
                        )}
                        {promoter.campaignName && (
                          <span className="break-words">Campanha: {promoter.campaignName}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => router.push(`/promoters/${promoter.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => router.push(`/promoters/${promoter.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                        onClick={() => {
                          setDeletingId(promoter.id)
                          setShowDeleteModal(true)
                        }}
                        title="Excluir promoter"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isDeleting) {
            setShowDeleteModal(false)
            setDeletingId(null)
            setError('') // Limpar erro ao fechar modal
          }
        }}
        onConfirm={() => {
          if (deletingId && !isDeleting) {
            handleDelete(deletingId)
          }
        }}
        title="Excluir Promoter"
        message="Tem certeza que deseja excluir este promoter? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}