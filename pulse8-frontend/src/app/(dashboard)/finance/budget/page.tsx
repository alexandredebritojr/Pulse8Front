'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Filter, 
  PieChart, 
  DollarSign, 
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BudgetService, BudgetDto } from '@/lib/api/budget'

// Using BudgetDto from API instead of local interface

export default function BudgetPage() {
  const router = useRouter()
  const [budgetItems, setBudgetItems] = useState<BudgetDto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [budgetToDelete, setBudgetToDelete] = useState<BudgetDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load budget data from API
  useEffect(() => {
    const loadBudgets = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        // Get organization ID from localStorage or context
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        const response = await BudgetService.getBudgets(
          organizationId,
          searchTerm,
          statusFilter === 'all' ? undefined : statusFilter
        )
        
        setBudgetItems(response.budgets)
      } catch (err) {
        console.error('Erro ao carregar orçamentos:', err)
        setError('Erro ao carregar dados do orçamento')
      } finally {
        setIsLoading(false)
      }
    }

    loadBudgets()
  }, [searchTerm, statusFilter])

  // Handle edit budget
  const handleEdit = (id: string) => {
    router.push(`/finance/budget/edit/${id}`)
  }

  // Handle delete budget click
  const handleDeleteClick = (budget: BudgetDto) => {
    setBudgetToDelete(budget)
    setShowDeleteModal(true)
  }

  // Handle delete budget confirmation
  const handleDeleteConfirm = async () => {
    if (!budgetToDelete) return
    
    setIsDeleting(true)
    try {
      console.log('🗑️ Excluindo item de orçamento:', budgetToDelete.id)
      await BudgetService.deleteBudget(budgetToDelete.id)
      console.log('✅ Item de orçamento excluído com sucesso')
      
      // Remove from local state
      setBudgetItems(prev => prev.filter(item => item.id !== budgetToDelete.id))
      
      setShowDeleteModal(false)
      setBudgetToDelete(null)
    } catch (err: any) {
      console.error('❌ Erro ao excluir item de orçamento:', err)
      setError('Erro ao excluir item do orçamento: ' + (err.message || 'Erro desconhecido'))
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setBudgetToDelete(null)
  }

  // API already filters the data, so we use budgetItems directly
  const filteredBudgetItems = budgetItems

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800'
      case 'Completed':
        return 'bg-blue-100 text-blue-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      case 'Cancelled':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-600'
    if (variance < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4" />
    if (variance < 0) return <TrendingDown className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }


  // Calcular totais
  const totalPlanned = budgetItems.reduce((sum, item) => sum + (item.amount || 0), 0)
  const totalActual = budgetItems.reduce((sum, item) => sum + (item.spent || 0), 0)
  const totalVariance = totalActual - totalPlanned
  const overallPercentage = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orçamento</h1>
          <p className="text-gray-600">Acompanhe o orçamento planejado vs gastos reais</p>
        </div>
        <Link href="/finance/budget/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento Planejado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPlanned)}</div>
            <p className="text-xs text-muted-foreground">
              Total planejado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Reais</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalActual)}</div>
            <p className="text-xs text-muted-foreground">
              Total gasto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variação</CardTitle>
            {getVarianceIcon(totalVariance)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getVarianceColor(totalVariance)}`}>
              {formatCurrency(totalVariance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalVariance > 0 ? 'Acima do orçamento' : totalVariance < 0 ? 'Abaixo do orçamento' : 'No orçamento'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% Executado</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Do orçamento total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar itens do orçamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos os status</option>
            <option value="Active">Ativo</option>
            <option value="Inactive">Inativo</option>
            <option value="Completed">Concluído</option>
            <option value="Cancelled">Cancelado</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Budget Items List */}
      <div className="space-y-4">
        {filteredBudgetItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">💰</span>
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Orçado</p>
                    <p className="font-semibold">{formatCurrency(item.amount || 0)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Gasto</p>
                    <p className="font-semibold">{formatCurrency(item.spent || 0)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Variação</p>
                    <div className="flex items-center gap-1">
                      {getVarianceIcon((item.spent || 0) - (item.amount || 0))}
                      <p className={`font-semibold ${getVarianceColor((item.spent || 0) - (item.amount || 0))}`}>
                        {formatCurrency((item.spent || 0) - (item.amount || 0))}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">%</p>
                    <p className="font-semibold">{((item.amount || 0) > 0 ? ((item.spent || 0) / (item.amount || 0)) * 100 : 0).toFixed(1)}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1">{item.status}</span>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleEdit(item.id)}
                      title="Editar item"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteClick(item)}
                      title="Excluir item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredBudgetItems.length === 0 && (
        <div className="text-center py-12">
          <PieChart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum item encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece criando seu primeiro item de orçamento.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <div className="mt-6">
              <Link href="/finance/budget/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Item
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Item de Orçamento"
        message={`Tem certeza que deseja excluir o orçamento "${budgetToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}

