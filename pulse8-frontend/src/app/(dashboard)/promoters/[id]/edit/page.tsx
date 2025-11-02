'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Users, DollarSign, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import BaseForm from '@/components/ui/BaseForm'
import { PromotersService, PromoterDto } from '@/lib/api/promoters'
import { EventsService } from '@/lib/api/events'
import { UsersService } from '@/lib/api/users'
import { MarketingService } from '@/lib/api/marketing'

export default function EditPromoterPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const promoterId = params.id as string
  const eventId = searchParams.get('eventId') || undefined
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [promoter, setPromoter] = useState<PromoterDto | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [formData, setFormData] = useState({
    eventId: '',
    userId: '',
    promoterCode: '',
    utmCode: '',
    commissionRate: '',
    campaignId: ''
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError('')

        // Carregar dados do promoter
        const promoterData = await PromotersService.getPromoterById(promoterId)
        setPromoter(promoterData)
        
        // Preencher formulário com dados do promoter
        setFormData({
          eventId: promoterData.eventId,
          userId: promoterData.userId,
          promoterCode: promoterData.promoterCode || '',
          utmCode: promoterData.utmCode || '',
          commissionRate: promoterData.commissionRate?.toString() || '',
          campaignId: promoterData.campaignId || ''
        })

        // Carregar eventos
        const eventsResponse = await EventsService.getEvents()
        setEvents(eventsResponse.events || [])

        // Carregar usuários
        const usersResponse = await UsersService.getUsers()
        setUsers(usersResponse.users || [])

        // Carregar campanhas
        const campaignsResponse = await MarketingService.getMarketingCampaigns()
        setCampaigns(campaignsResponse.campaigns || [])
      } catch (err: any) {
        console.error('❌ Erro ao carregar dados:', err)
        setError(err.message || 'Erro ao carregar dados do promoter')
      } finally {
        setIsLoading(false)
      }
    }

    if (promoterId) {
      loadData()
    }
  }, [promoterId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      await PromotersService.updatePromoter(promoterId, {
        eventId: formData.eventId,
        userId: formData.userId,
        promoterCode: formData.promoterCode || undefined,
        utmCode: formData.utmCode || undefined,
        commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : undefined,
        campaignId: formData.campaignId || undefined
      })

      // Redirecionar baseado no contexto
      const currentEventId = eventId || formData.eventId
      if (currentEventId) {
        router.push(`/events/${currentEventId}/edit?tab=promoter`)
      } else {
        router.push('/promoters')
      }
    } catch (err: any) {
      console.error('❌ Erro ao atualizar promoter:', err)
      setError(err.message || 'Erro ao atualizar promoter')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dados do promoter...</p>
        </div>
      </div>
    )
  }

  // Determinar URL de retorno baseada no contexto
  const getBackUrl = () => {
    const currentEventId = eventId || formData.eventId
    if (currentEventId) {
      return `/events/${currentEventId}/edit?tab=promoter`
    }
    return '/promoters'
  }

  if (!promoter) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">Promoter não encontrado</p>
          <button 
            onClick={() => router.push(getBackUrl())}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Voltar para a listagem
          </button>
        </div>
      </div>
    )
  }

  return (
    <BaseForm
      mode="edit"
      title="Editar Promoter"
      subtitle={`Editando promoter: ${promoter.userName}`}
      backUrl={getBackUrl()}
      isSaving={isSaving}
      error={error}
      onSubmit={handleSubmit}
    >
      <div className="space-y-6">
        {/* Card: Seleção de Evento e Pessoa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Seleção de Evento e Pessoa
            </CardTitle>
            <CardDescription>
              Escolha o evento e a pessoa que será atribuída como promoter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-1">
                  Evento *
                </label>
                <Select
                  name="eventId"
                  value={formData.eventId}
                  onValueChange={(value) => handleSelectChange('eventId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                  Usuário *
                </label>
                <Select
                  name="userId"
                  value={formData.userId}
                  onValueChange={(value) => handleSelectChange('userId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Configurações do Promoter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Configurações do Promoter
            </CardTitle>
            <CardDescription>
              Defina as configurações de comissão e códigos de rastreamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="promoterCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Código do Promoter
                </label>
                <Input
                  id="promoterCode"
                  name="promoterCode"
                  value={formData.promoterCode}
                  onChange={handleChange}
                  placeholder="Ex: PROMO001"
                />
              </div>
              <div>
                <label htmlFor="utmCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Código UTM
                </label>
                <Input
                  id="utmCode"
                  name="utmCode"
                  value={formData.utmCode}
                  onChange={handleChange}
                  placeholder="Ex: utm_source=promoter"
                />
              </div>
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
                min="0"
                max="100"
                value={formData.commissionRate}
                onChange={handleChange}
                placeholder="Ex: 5.00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card: Campanha (Opcional) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Campanha (Opcional)
            </CardTitle>
            <CardDescription>
              Associe o promoter a uma campanha de marketing específica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="campaignId" className="block text-sm font-medium text-gray-700 mb-1">
                Campanha
              </label>
              <Select
                name="campaignId"
                value={formData.campaignId}
                onValueChange={(value) => handleSelectChange('campaignId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma campanha (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma campanha</SelectItem>
                  {campaigns.map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseForm>
  )
}