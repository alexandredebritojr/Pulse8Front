'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Megaphone, Calendar, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import BaseForm from '@/components/ui/BaseForm'
import { CampaignsService } from '@/lib/api/campaigns'
import { EventsService, EventDto } from '@/lib/api/events'

export default function CreateCampaignPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [events, setEvents] = useState<EventDto[]>([])
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    status: 'Pending',
    startDate: '',
    endDate: '',
    budget: '',
    commissionValue: '',
    commissionRate: '',
    eventId: '',
    targetAudience: '',
    channels: [] as string[]
  })


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }



  // Carregar eventos da API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoadingEvents(true)
        setError('')
        
        const eventsResponse = await EventsService.getEvents({ pageSize: 100 })
        
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    // Validação adicional para campos obrigatórios
    if (!formData.eventId) {
      setError('Por favor, selecione um evento')
      setIsSaving(false)
      return
    }

    if (!formData.type) {
      setError('Por favor, selecione um tipo de campanha')
      setIsSaving(false)
      return
    }

    try {
      await CampaignsService.createCampaign({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        commissionValue: formData.commissionValue ? parseFloat(formData.commissionValue) : 0,
        commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : 0,
        eventId: formData.eventId,
        targetAudience: formData.targetAudience,
        channels: formData.channels
      })

      router.push('/marketing/campaigns')
    } catch (err: any) {
      console.error('❌ Erro ao criar campanha:', err)
      setError(err.message || 'Erro ao criar campanha')
    } finally {
      setIsSaving(false)
    }
  }

  const campaignTypes = [
    { value: 'SocialMedia', label: 'Social Media' },
    { value: 'Email', label: 'Email' },
    { value: 'Print', label: 'Print' },
    { value: 'Digital', label: 'Digital' },
    { value: 'Event', label: 'Event' },
    { value: 'Partnership', label: 'Partnership' }
  ]

  const statusOptions = [
    { value: 'Active', label: 'Ativa' },
    { value: 'Inactive', label: 'Inativa' },
    { value: 'Completed', label: 'Concluída' },
    { value: 'Cancelled', label: 'Cancelada' },
    { value: 'Pending', label: 'Pendente' }
  ]

  return (
    <BaseForm
      mode="create"
      title="Criar Nova Campanha"
      subtitle="Configure uma campanha de marketing completa"
      backUrl="/marketing/campaigns"
      isSaving={isSaving}
      error={error}
      onSubmit={handleSubmit}
    >
      <div className="space-y-6">
        {/* Card: Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Dados principais da campanha
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

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Campanha *
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Campanha Verão 2024"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva os objetivos e estratégia da campanha..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Campanha *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione o tipo</option>
                  {campaignTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Datas e Orçamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Datas e Orçamento
            </CardTitle>
            <CardDescription>
              Período e investimento da campanha
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Início *
                </label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Fim
                </label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                  Orçamento (R$)
                </label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label htmlFor="commissionValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor da Comissão (R$)
                </label>
                <Input
                  id="commissionValue"
                  name="commissionValue"
                  type="number"
                  step="0.01"
                  value={formData.commissionValue}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Taxa de Comissão (%)
                </label>
                <Input
                  id="commissionRate"
                  name="commissionRate"
                  type="number"
                  step="0.01"
                  value={formData.commissionRate}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Público e Canais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Público e Canais
            </CardTitle>
            <CardDescription>
              Defina o público-alvo e canais de comunicação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-1">
                Público-Alvo
              </label>
              <Input
                id="targetAudience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                placeholder="Ex: Jovens de 18-35 anos, interessados em música eletrônica"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseForm>
  )
}



