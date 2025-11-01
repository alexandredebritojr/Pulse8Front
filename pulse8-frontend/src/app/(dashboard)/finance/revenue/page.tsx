'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Ticket,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Trash2,
  Grid,
  List,
  BarChart3,
  AlertCircle,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import { formatCurrency, formatDate } from '@/lib/utils'
import { RevenueService, RevenueDto, GetRevenueResponse } from '@/lib/api/revenue'

export default function RevenuePage() {
  const [revenues, setRevenues] = useState<RevenueDto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [revenueToDelete, setRevenueToDelete] = useState<RevenueDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Carregar revenues da API
  useEffect(() => {
    const loadRevenues = async () => {
      try {
        console.log('🔍 Carregando revenues da API...')
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        const queryParams = {
          pageNumber: 1,
          pageSize: 50,
          searchTerm: searchTerm || undefined,
          organizationId: organizationId
        }
        
        const response = await RevenueService.getRevenue(queryParams)
        console.log('✅ Revenues carregados:', response)
        setRevenues(response.revenues || [])
        setError('')
      } catch (err: any) {
        console.error('❌ Erro ao carregar revenues:', err)
        setError(err.message || 'Erro ao carregar revenues')
      } finally {
        setIsLoading(false)
      }
    }

    loadRevenues()
  }, [searchTerm])

  const handleDeleteClick = (revenue: RevenueDto) => {
    setRevenueToDelete(revenue)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!revenueToDelete) return
    
    setIsDeleting(true)
    try {
      console.log('🗑️ Excluindo receita:', revenueToDelete.id)
      await RevenueService.deleteRevenue(revenueToDelete.id)
      console.log('✅ Receita excluída com sucesso')
      
      // Recarregar a lista de receitas
      const updatedRevenues = revenues.filter(r => r.id !== revenueToDelete.id)
      setRevenues(updatedRevenues)
      
      setShowDeleteModal(false)
      setRevenueToDelete(null)
    } catch (err: any) {
      console.error('❌ Erro ao excluir receita:', err)
      alert('Erro ao excluir receita: ' + (err.message || 'Erro desconhecido'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setRevenueToDelete(null)
  }

  const totalRevenues = revenues?.length || 0
  const totalAmount = revenues?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receitas</h1>
          <p className="text-gray-600">Gerencie as receitas dos eventos</p>
        </div>
        <Link href="/finance/revenue/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Receita
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-2 sm:gap-6">
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{totalRevenues}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Valor Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  {formatCurrency(totalAmount)}
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
              placeholder="Buscar receitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
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

      {/* Revenues List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {revenues?.map((revenue) => (
            <Card key={revenue.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{revenue.source}</h3>
                      <p className="text-sm text-gray-500">{revenue.eventName}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Valor:</span>
                    <span className="font-semibold text-lg">{formatCurrency(revenue.amount || 0)}</span>
                  </div>
                  {revenue.date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(revenue.date)}
                    </div>
                  )}
                  {revenue.reference && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Ticket className="h-4 w-4 mr-2" />
                      {revenue.reference}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/finance/revenue/${revenue.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                  <Link href={`/finance/revenue/${revenue.id}/edit`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDeleteClick(revenue)}
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
                  {revenues?.map((revenue) => (
            <Card key={revenue.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-indigo-600" />
                          </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{revenue.source}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 break-words">
                        {revenue.eventName}
                        {revenue.notes && ` • ${revenue.notes}`}
                      </p>
                          </div>
                        </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-4 lg:gap-6">
                    {/* Values Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 lg:gap-6 sm:flex sm:items-center">
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-500">Valor</p>
                        <p className="font-semibold text-sm sm:text-base">{formatCurrency(revenue.amount || 0)}</p>
                      </div>
                      {revenue.date && (
                        <div className="text-center">
                          <p className="text-xs sm:text-sm text-gray-500">Data</p>
                          <p className="font-semibold text-sm sm:text-base">{formatDate(revenue.date)}</p>
                        </div>
                      )}
                      {revenue.reference && (
                        <div className="text-center">
                          <p className="text-xs sm:text-sm text-gray-500">Referência</p>
                          <p className="font-semibold text-sm sm:text-base truncate">{revenue.reference}</p>
                        </div>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 sm:gap-4">
                      <div className="flex gap-2 flex-shrink-0">
                          <Link href={`/finance/revenue/${revenue.id}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/finance/revenue/${revenue.id}/edit`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                          onClick={() => handleDeleteClick(revenue)}
                          title="Excluir receita"
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

      {(revenues?.length || 0) === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma receita encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece criando uma nova receita.'
              }
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link href="/finance/revenue/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Receita
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
        title="Excluir Receita"
        message={`Tem certeza que deseja excluir a receita "${revenueToDelete?.source}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}
