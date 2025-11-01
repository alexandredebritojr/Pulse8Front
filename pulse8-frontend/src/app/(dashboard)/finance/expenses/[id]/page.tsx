'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Receipt, 
  Calendar, 
  DollarSign, 
  User,
  Tag,
  FileText
} from 'lucide-react'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExpensesService, ExpenseDto } from '@/lib/api/expenses'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ExpenseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const expenseId = params.id as string

  const [expense, setExpense] = useState<ExpenseDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadExpense = async () => {
      try {
        setIsLoading(true)
        setError('')

        console.log('🔍 Carregando despesa:', expenseId)
        const expenseData = await ExpensesService.getExpenseById(expenseId)
        console.log('✅ Despesa carregada:', expenseData)
        
        setExpense(expenseData)
      } catch (err: any) {
        console.error('❌ Erro ao carregar despesa:', err)
        setError(err.message || 'Erro ao carregar despesa')
      } finally {
        setIsLoading(false)
      }
    }

    if (expenseId) {
      loadExpense()
    }
  }, [expenseId])

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!expense) return
    
    setIsDeleting(true)
    try {
      console.log('🔍 Excluindo despesa:', expenseId)
      
      await ExpensesService.deleteExpense(expenseId)
      console.log('✅ Despesa excluída com sucesso')

      router.push('/finance/expenses')
    } catch (err: any) {
      console.error('❌ Erro ao excluir despesa:', err)
      setError(err.message || 'Erro ao excluir despesa')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
  }

  const getStatusColor = (status: string | number) => {
    // Converter para string se for número
    const statusStr = String(status)
    
    switch (statusStr) {
      case 'Paid':
      case '1':
        return 'bg-green-100 text-green-800'
      case 'Pending':
      case '0':
        return 'bg-yellow-100 text-yellow-800'
      case 'Overdue':
      case '2':
        return 'bg-red-100 text-red-800'
      case 'Cancelled':
      case '3':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string | number) => {
    // Converter para string se for número
    const statusStr = String(status)
    
    switch (statusStr) {
      case 'Paid':
      case '1':
        return 'Pago'
      case 'Pending':
      case '0':
        return 'Pendente'
      case 'Overdue':
      case '2':
        return 'Vencido'
      case 'Cancelled':
      case '3':
        return 'Cancelado'
      default:
        return statusStr
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
        <Button onClick={() => router.push('/finance/expenses')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">Despesa não encontrada</div>
        <Button onClick={() => router.push('/finance/expenses')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
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
            onClick={() => router.push('/finance/expenses')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{expense.title}</h1>
            <p className="text-sm sm:text-base text-gray-600">Detalhes da despesa</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/finance/expenses/${expense.id}/edit`}>
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

      {/* Status */}
      <div className="flex items-center space-x-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(expense.status)}`}>
          {getStatusText(expense.status)}
        </span>
        {expense.invoiceNumber && (
          <span className="text-sm text-gray-600">
            Fatura: {expense.invoiceNumber}
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                Informações da Despesa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Título</label>
                  <p className="text-sm text-gray-900">{expense.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Valor</label>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Descrição</label>
                <p className="text-sm text-gray-900">{expense.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Vencimento</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(expense.dueDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Vencimento</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(expense.dueDate)}
                  </p>
                </div>
              </div>

              {expense.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Observações</label>
                  <p className="text-sm text-gray-900">{expense.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Nome do Evento</label>
                <p className="text-sm text-gray-900">{expense.eventName}</p>
              </div>
            </CardContent>
          </Card>

          {/* Category & Supplier */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Categoria e Fornecedor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Categoria</label>
                <p className="text-sm text-gray-900">{expense.categoryName}</p>
              </div>
              
              {expense.supplierName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Fornecedor</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {expense.supplierName}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Informações de Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {expense.createdBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Criado por</label>
                  <p className="text-sm text-gray-900">{expense.createdBy}</p>
                </div>
              )}
              
              {expense.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Última atualização</label>
                  <p className="text-sm text-gray-900">{formatDate(expense.updatedAt)}</p>
                </div>
              )}
              
              {expense.updatedBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Atualizado por</label>
                  <p className="text-sm text-gray-900">{expense.updatedBy}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Despesa"
        message={`Tem certeza que deseja excluir a despesa "${expense?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}
