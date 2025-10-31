'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventsService, EventDto } from '@/lib/api/events'
import { RevenueService, CreateRevenueRequest } from '@/lib/api/revenue'

export default function CreateRevenuePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [events, setEvents] = useState<EventDto[]>([])
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    eventId: '',
    source: '',
    amount: '',
    date: '',
    reference: '',
    notes: '',
  })

  // Carregar eventos da API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoadingEvents(true)
        setError('')
        
        console.log('🔍 Carregando eventos para receita...')
        const eventsResponse = await EventsService.getEvents({ pageSize: 100 })
        console.log('✅ Eventos carregados:', eventsResponse.events.length)
        
        setEvents(eventsResponse.events)
      } catch (err: any) {
        console.error('❌ Erro ao carregar eventos:', err)
        setError(err.message || 'Erro ao carregar eventos')
      } finally {
        setIsLoadingEvents(false)
      }
    }

    loadEvents()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('🔍 Criando receita...', formData)
      
      // Função helper para converter data para UTC
      const toUTCString = (dateString: string): string => {
        if (!dateString) return ''
        // Criar data local e converter para UTC sem alterar o dia
        const date = new Date(dateString + 'T12:00:00')
        return date.toISOString()
      }

      // Mapear dados do formulário para o formato da API
      const revenueData: CreateRevenueRequest = {
        source: formData.source,
        amount: parseFloat(formData.amount),
        date: toUTCString(formData.date),
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
        eventId: formData.eventId,
      }

      console.log('🔍 Dados da receita:', revenueData)
      
      const newRevenueId = await RevenueService.createRevenue(revenueData)
      console.log('✅ Receita criada com sucesso:', newRevenueId)

      router.push('/finance/revenue')
    } catch (err: any) {
      console.error('❌ Erro ao criar receita:', err)
      setError(err.message || 'Erro ao criar receita')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/finance/revenue">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nova Receita</h1>
          <p className="text-gray-600">Registre uma nova receita para um evento</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Informações da Receita
                </CardTitle>
                <CardDescription>
                  Dados principais da receita
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    disabled={isLoadingEvents}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {isLoadingEvents ? 'Carregando eventos...' : 'Selecione um evento'}
                    </option>
                    {events.map(event => (
                      <option key={event.id} value={event.id}>{event.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                    Fonte da Receita *
                  </label>
                  <Input
                    id="source"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    placeholder="Ex: Venda de ingressos, Patrocínio, Merchandising"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Valor *
                    </label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>
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
                </div>

                <div>
                  <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                    Referência
                  </label>
                  <Input
                    id="reference"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    placeholder="Ex: Número da fatura, código da transação"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Observações adicionais sobre a receita..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/finance/revenue">
            <Button variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Criar Receita'}
          </Button>
        </div>
      </form>
    </div>
  )
}

