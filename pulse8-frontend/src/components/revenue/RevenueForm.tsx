'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, DollarSign, Calendar, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RevenueService, CreateRevenueRequest, UpdateRevenueRequest, RevenueDto } from '@/lib/api/revenue'

interface RevenueFormProps {
  mode: 'create' | 'edit'
  revenueId?: string
}

export default function RevenueForm({ mode, revenueId }: RevenueFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    date: '',
    reference: '',
    notes: '',
    eventId: '',
  })

  // Carregar dados da receita para edição
  useEffect(() => {
    if (mode === 'edit' && revenueId) {
      const loadRevenue = async () => {
        try {
          console.log('🔍 RevenueForm: Carregando receita para edição...')
          const revenue = await RevenueService.getRevenueById(revenueId)
          console.log('✅ RevenueForm: Receita carregada:', revenue)
          
          setFormData({
            source: revenue.source,
            amount: revenue.amount.toString(),
            date: revenue.date.split('T')[0],
            reference: revenue.reference || '',
            notes: revenue.notes || '',
            eventId: revenue.eventId || '',
          })
        } catch (err: any) {
          console.error('❌ RevenueForm: Erro ao carregar receita:', err)
          setError(err.message || 'Erro ao carregar receita')
        }
      }
      
      loadRevenue()
    }
  }, [mode, revenueId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      console.log('🔍 RevenueForm: Iniciando operação...')
      console.log('🔍 RevenueForm: mode =', mode)
      console.log('🔍 RevenueForm: formData =', formData)
      
      if (mode === 'create') {
        // Preparar dados para criação
        const revenueData: CreateRevenueRequest = {
          source: formData.source,
          amount: parseFloat(formData.amount),
          date: new Date(formData.date).toISOString(),
          reference: formData.reference,
          notes: formData.notes,
          eventId: formData.eventId,
        }
        
        console.log('🔍 RevenueForm: revenueData =', revenueData)
        const newRevenueId = await RevenueService.createRevenue(revenueData)
        console.log('✅ RevenueForm: Receita criada com ID:', newRevenueId)
      } else if (mode === 'edit' && revenueId) {
        // Preparar dados para atualização
        const revenueData: UpdateRevenueRequest = {
          id: revenueId,
          source: formData.source,
          amount: parseFloat(formData.amount),
          date: new Date(formData.date).toISOString(),
          reference: formData.reference,
          notes: formData.notes,
          eventId: formData.eventId,
        }
        
        console.log('🔍 RevenueForm: revenueData =', revenueData)
        await RevenueService.updateRevenue(revenueId, revenueData)
        console.log('✅ RevenueForm: Receita atualizada')
      }

      router.push('/finance/revenue')
    } catch (err: any) {
      console.error('❌ RevenueForm: Erro na operação:', err)
      setError(err.message || 'Erro ao processar receita')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? 'Nova Receita' : 'Editar Receita'}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Dados principais da receita
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                Fonte *
              </label>
              <Input
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="Ex: Venda de ingressos para evento"
                required
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Valor (R$) *
              </label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                  Referência
                </label>
                <Input
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="Ex: REF-001"
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Observações adicionais"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Datas
            </CardTitle>
            <CardDescription>
              Datas importantes da receita
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Data da Receita *
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Evento
            </CardTitle>
            <CardDescription>
              Associar receita a um evento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-1">
                Evento *
              </label>
              <Input
                id="eventId"
                name="eventId"
                value={formData.eventId}
                onChange={handleChange}
                placeholder="ID do evento"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Salvando...' : (mode === 'create' ? 'Criar Receita' : 'Salvar Alterações')}
          </Button>
        </div>
      </form>
    </div>
  )
}