'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Receipt, DollarSign, Calendar, Tag, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventsService, EventDto } from '@/lib/api/events'
import { SuppliersService, SupplierDto } from '@/lib/api/suppliers'
import { ExpensesService, CreateExpenseRequest, UpdateExpenseRequest, ExpenseDto, ExpenseType, ExpenseStatus } from '@/lib/api/expenses'
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/utils'

interface ExpenseFormProps {
  expenseId?: string
  mode: 'create' | 'edit'
  eventId?: string
}

export default function ExpenseForm({ expenseId, mode, eventId }: ExpenseFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [events, setEvents] = useState<EventDto[]>([])
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([])
  const [error, setError] = useState('')

  // Função auxiliar para redirecionamento baseado no contexto
  const handleGoBack = () => {
    if (eventId) {
      router.push(`/events/${eventId}/edit?tab=expense`)
    } else {
      router.push('/finance/expenses')
    }
  }
  const [formData, setFormData] = useState({
    eventId: eventId || '',
    title: '',
    description: '',
    amount: '',
    type: ExpenseType.Other,
    status: ExpenseStatus.Pending,
    supplierId: '',
    dueDate: '',
    notes: '',
    invoiceNumber: '',
  })

  // Carregar dados da API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true)
        setError('')
        
        // Carregar dados básicos em paralelo
        const [eventsResponse, suppliersResponse] = await Promise.all([
          EventsService.getEvents({ pageSize: 100 }),
          SuppliersService.getSuppliers({ pageSize: 100 })
        ])

        setEvents(eventsResponse.events)
        setSuppliers(suppliersResponse.suppliers)

        // Se for edição, carregar dados da despesa
        if (mode === 'edit' && expenseId) {
          console.log('🔍 Carregando despesa para edição:', expenseId)
          const expense = await ExpensesService.getExpenseById(expenseId)
          console.log('✅ Despesa carregada:', expense)
          
          // Formatar o valor corretamente quando vem do backend (já está em decimal, não precisa dividir por 100)
          const formattedAmount = typeof expense.amount === 'number' 
            ? expense.amount.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            : formatCurrencyInput(String(expense.amount || 0))
          
          setFormData({
            eventId: expense.eventId,
            title: expense.title,
            description: expense.description,
            amount: formattedAmount,
            type: expense.type,
            status: expense.status,
            supplierId: expense.supplierId || '',
            dueDate: expense.dueDate.split('T')[0],
            notes: expense.notes || '',
            invoiceNumber: expense.invoiceNumber || '',
          })
        }

        console.log('✅ Dados carregados:', {
          events: eventsResponse.events.length,
          suppliers: suppliersResponse.suppliers.length,
          mode
        })
      } catch (err: any) {
        console.error('❌ Erro ao carregar dados:', err)
        setError(err.message || 'Erro ao carregar dados')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [mode, expenseId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Aplica máscara decimal para o campo amount
    if (name === 'amount') {
      const formatted = formatCurrencyInput(value)
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: (name === 'type' || name === 'status') ? parseInt(value) : value
      }))
    }
  }

  // Função helper para converter data para UTC
  const toUTCString = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00.000Z')
    return date.toISOString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log(`🔍 ${mode === 'edit' ? 'Atualizando' : 'Criando'} despesa...`, formData)
      
      if (mode === 'edit' && expenseId) {
        // Para edição, usar UpdateExpenseRequest
        const expenseData: UpdateExpenseRequest = {
          id: expenseId,
          eventId: formData.eventId,
          title: formData.title,
          description: formData.description,
          amount: parseCurrencyInput(formData.amount),
          dueDate: formData.dueDate ? toUTCString(formData.dueDate) : new Date().toISOString(),
          type: formData.type,
          status: formData.status,
          supplierId: formData.supplierId || undefined,
          notes: formData.notes || undefined,
          invoiceNumber: formData.invoiceNumber || undefined
        }

        console.log('🔍 Dados da despesa para atualização:', expenseData)
        console.log('🔍 ExpenseId sendo enviado:', expenseId)
        console.log('🔍 Payload completo:', JSON.stringify(expenseData, null, 2))
        await ExpensesService.updateExpense(expenseId, expenseData)
        console.log('✅ Despesa atualizada com sucesso')
        
        // Redirecionar usando a função auxiliar
        handleGoBack()
        return
      } else {
        // Para criação, usar CreateExpenseRequest
        const expenseData: CreateExpenseRequest = {
          eventId: formData.eventId,
          title: formData.title,
          description: formData.description,
          amount: parseCurrencyInput(formData.amount),
          dueDate: formData.dueDate ? toUTCString(formData.dueDate) : new Date().toISOString(),
          type: formData.type,
          status: formData.status,
          supplierId: formData.supplierId || undefined,
          notes: formData.notes || undefined,
          invoiceNumber: formData.invoiceNumber || undefined
        }

        console.log('🔍 Dados da despesa para criação:', expenseData)
        const newExpenseId = await ExpensesService.createExpense(expenseData)
        console.log('✅ Despesa criada com sucesso:', newExpenseId)
      }

      // Redirecionar usando a função auxiliar
      handleGoBack()
    } catch (err: any) {
      console.error(`❌ Erro ao ${mode === 'edit' ? 'atualizar' : 'criar'} despesa:`, err)
      setError(err.message || `Erro ao ${mode === 'edit' ? 'atualizar' : 'criar'} despesa`)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
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
        <Button onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === 'edit' ? 'Editar Despesa' : 'Nova Despesa'}
            </h1>
            <p className="text-gray-600">
              {mode === 'edit' ? 'Atualize as informações da despesa' : 'Cadastre uma nova despesa para um evento'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Informações da Despesa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Informações da Despesa
            </CardTitle>
            <CardDescription>
              Dados principais da despesa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Título */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Aluguel do espaço"
                  required
                />
              </div>

              {/* Valor */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor *
                </label>
                <Input
                  type="text"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Descreva detalhadamente a despesa"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Data de Vencimento */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Vencimento *
              </label>
              <Input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Evento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Evento
            </CardTitle>
            <CardDescription>
              Selecione o evento relacionado à despesa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-1">
                Evento *
              </label>
              <select
                id="eventId"
                name="eventId"
                value={formData.eventId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione um evento</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tipo e Fornecedor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tipo e Fornecedor
            </CardTitle>
            <CardDescription>
              Classifique a despesa e associe a um fornecedor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tipo */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={ExpenseType.Venue}>Local</option>
                  <option value={ExpenseType.Catering}>Alimentação</option>
                  <option value={ExpenseType.Equipment}>Equipamentos</option>
                  <option value={ExpenseType.Marketing}>Marketing</option>
                  <option value={ExpenseType.Staff}>Staff</option>
                  <option value={ExpenseType.Transportation}>Transporte</option>
                  <option value={ExpenseType.Other}>Outros</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={ExpenseStatus.Pending}>Pendente</option>
                  <option value={ExpenseStatus.Paid}>Pago</option>
                  <option value={ExpenseStatus.Overdue}>Vencido</option>
                  <option value={ExpenseStatus.Cancelled}>Cancelado</option>
                </select>
              </div>

              {/* Fornecedor */}
              <div>
                <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor
                </label>
                <select
                  id="supplierId"
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione um fornecedor (Opcional)</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Adicionais
            </CardTitle>
            <CardDescription>
              Observações e detalhes extras sobre a despesa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Número da Nota Fiscal */}
            <div>
              <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Número da Nota Fiscal
              </label>
              <Input
                id="invoiceNumber"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                placeholder="Ex: 123456789"
              />
            </div>

            {/* Observações */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Adicione observações importantes sobre a despesa..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoBack}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isLoading ? (mode === 'edit' ? 'Atualizando...' : 'Salvando...') : (mode === 'edit' ? 'Atualizar' : 'Salvar')}
          </Button>
        </div>
      </form>
    </div>
  )
}