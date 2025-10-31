'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Edit, Trash2, Eye, Users, DollarSign, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)
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
    try {
      await PromotersService.deletePromoter(id)
      setShowDeleteModal(false)
      setDeletingId(null)
      loadPromoters()
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promoters</h1>
          <p className="text-gray-600">Gerencie promoters de eventos</p>
        </div>
        <Button onClick={() => router.push('/promoters/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Atribuir Promoter
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="Active">Ativo</SelectItem>
                  <SelectItem value="Inactive">Inativo</SelectItem>
                  <SelectItem value="Suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                  setCurrentPage(1)
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
        <div className="grid gap-4">
          {promoters.map((promoter) => (
            <Card key={promoter.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {promoter.userName}
                      </h3>
                      <Badge className={getStatusColor(promoter.status)}>
                        {getStatusText(promoter.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{promoter.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>Comissão: {formatPercentage(promoter.commissionRate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Target className="h-4 w-4" />
                        <span>Vendas: {formatCurrency(promoter.totalSales)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Evento: {promoter.eventName}</span>
                      {promoter.promoterCode && (
                        <span>Código: {promoter.promoterCode}</span>
                      )}
                      {promoter.campaignName && (
                        <span>Campanha: {promoter.campaignName}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/promoters/${promoter.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/promoters/${promoter.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDeletingId(promoter.id)
                        setShowDeleteModal(true)
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
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
          setShowDeleteModal(false)
          setDeletingId(null)
        }}
        onConfirm={() => deletingId && handleDelete(deletingId)}
        title="Excluir Promoter"
        message="Tem certeza que deseja excluir este promoter? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}