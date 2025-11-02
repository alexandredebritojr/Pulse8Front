'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  Receipt, 
  DollarSign, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Trash2,
  Grid,
  List,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Eye
} from 'lucide-react'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ExpensesService, ExpenseDto, GetExpensesResponse } from '@/lib/api/expenses'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseDto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Carregar expenses da API
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        console.log('🔍 Carregando expenses da API...')
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        const queryParams = {
          pageNumber: 1,
          pageSize: 50,
          searchTerm: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          organizationId: organizationId
        }
        
        const response = await ExpensesService.getExpenses(queryParams)
        console.log('✅ Expenses carregados:', response)
        setExpenses(response.expenses)
        setError('')
      } catch (err: any) {
        console.error('❌ Erro ao carregar expenses:', err)
        setError(err.message || 'Erro ao carregar expenses')
      } finally {
        setIsLoading(false)
      }
    }

    loadExpenses()
  }, [searchTerm, statusFilter, categoryFilter])

  const getStatusColor = (status: string | number) => {
    // Converter para string se for número
    const statusStr = String(status).toLowerCase()
    
    switch (statusStr) {
      case 'paid':
      case '1':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case '0':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
      case '2':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
      case '3':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string | number) => {
    // Converter para string se for número
    const statusStr = String(status).toLowerCase()
    
    switch (statusStr) {
      case 'paid':
      case '1':
        return 'Pago'
      case 'pending':
      case '0':
        return 'Pendente'
      case 'overdue':
      case '2':
        return 'Vencido'
      case 'cancelled':
      case '3':
        return 'Cancelado'
      default:
        return String(status)
    }
  }

  const getStatusIcon = (status: string | number) => {
    // Converter para string se for número
    const statusStr = String(status).toLowerCase()
    
    switch (statusStr) {
      case 'paid':
      case '1':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
      case '0':
        return <Clock className="h-4 w-4" />
      case 'overdue':
      case '2':
        return <XCircle className="h-4 w-4" />
      case 'cancelled':
      case '3':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleDeleteClick = (expense: ExpenseDto) => {
    setExpenseToDelete(expense)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return
    
    setIsDeleting(true)
    try {
      console.log('🗑️ Excluindo despesa:', expenseToDelete.id)
      await ExpensesService.deleteExpense(expenseToDelete.id)
      console.log('✅ Despesa excluída com sucesso')
      
      // Recarregar a lista de despesas
      const updatedExpenses = expenses.filter(e => e.id !== expenseToDelete.id)
      setExpenses(updatedExpenses)
      
      setShowDeleteModal(false)
      setExpenseToDelete(null)
    } catch (err: any) {
      console.error('❌ Erro ao excluir despesa:', err)
      alert('Erro ao excluir despesa: ' + (err.message || 'Erro desconhecido'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setExpenseToDelete(null)
  }

  const approvedExpenses = expenses?.filter(e => e.status === 1).length || 0 // Paid
  const pendingExpenses = expenses?.filter(e => e.status === 0).length || 0 // Pending
  const totalExpenses = expenses?.length || 0
  const totalAmount = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Despesas</h1>
          <p className="text-sm sm:text-base text-gray-600">Gerencie as despesas dos eventos</p>
        </div>
        <Link href="/finance/expenses/create" className="flex-shrink-0">
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Despesa</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Receipt className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{totalExpenses}</p>
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
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Aprovadas</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{approvedExpenses}</p>
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
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{pendingExpenses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-start sm:items-center gap-2 sm:gap-0">
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-0 sm:ml-4 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Valor Total</p>
                <p className="text-sm sm:text-2xl font-bold text-gray-900 whitespace-normal break-words">
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
              placeholder="Buscar despesas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm flex-shrink-0 min-w-[120px]"
          >
            <option value="all">Todos</option>
            <option value="approved">Aprovadas</option>
            <option value="pending">Pendentes</option>
            <option value="rejected">Rejeitadas</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm flex-shrink-0 min-w-[140px]"
          >
            <option value="all">Todas as Categorias</option>
            <option value="Local">Local</option>
            <option value="Equipamento">Equipamento</option>
            <option value="Marketing">Marketing</option>
            <option value="Alimentação">Alimentação</option>
            <option value="Transporte">Transporte</option>
            <option value="Outros">Outros</option>
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

      {/* Expenses List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expenses?.map((expense) => (
            <Card key={expense.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{expense.title}</h3>
                      <p className="text-sm text-gray-500">{expense.categoryName}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                    {getStatusIcon(expense.status)}
                    <span className="ml-1">{getStatusText(expense.status)}</span>
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Valor:</span>
                    <span className="font-semibold text-lg">{formatCurrency(expense.amount || 0)}</span>
                  </div>
                  {expense.dueDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(expense.dueDate)}
                    </div>
                  )}
                  {expense.eventName && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {expense.eventName}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/finance/expenses/${expense.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                  <Link href={`/finance/expenses/${expense.id}/edit`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDeleteClick(expense)}
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
          {expenses?.map((expense) => (
            <Card key={expense.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Receipt className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{expense.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 break-words">
                        {expense.categoryName}
                        {expense.supplierName && ` • Fornecedor: ${expense.supplierName}`}
                        {expense.description && ` • ${expense.description}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-4 lg:gap-6">
                    {/* Values Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-500">Valor</p>
                        <p className="font-semibold text-sm sm:text-base truncate">{formatCurrency(expense.amount || 0)}</p>
                      </div>
                      {expense.dueDate && (
                        <div className="text-center">
                          <p className="text-xs sm:text-sm text-gray-500">Vencimento</p>
                          <p className="font-semibold text-sm sm:text-base truncate">{formatDate(expense.dueDate)}</p>
                        </div>
                      )}
                      {expense.eventName && (
                        <div className="text-center">
                          <p className="text-xs sm:text-sm text-gray-500">Evento</p>
                          <p className="font-semibold text-sm sm:text-base truncate">{expense.eventName}</p>
                        </div>
                      )}
                    </div>
                    {/* Status and Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(expense.status)}`}>
                        {getStatusIcon(expense.status)}
                        <span className="ml-1 hidden sm:inline">{getStatusText(expense.status)}</span>
                      </span>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/finance/expenses/${expense.id}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/finance/expenses/${expense.id}/edit`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                          onClick={() => handleDeleteClick(expense)}
                          title="Excluir despesa"
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

      {(expenses?.length || 0) === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma despesa encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece criando uma nova despesa.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
              <div className="mt-6">
                <Link href="/finance/expenses/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Despesa
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
        title="Excluir Despesa"
        message={`Tem certeza que deseja excluir a despesa "${expenseToDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}
