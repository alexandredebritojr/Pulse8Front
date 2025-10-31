'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, User, Phone, Mail, MapPin, Tag, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PromotersService, CreatePromoterRequest, PromoterDto } from '@/lib/api/promoters'
import { EventsService } from '@/lib/api/events'
import { UsersService } from '@/lib/api/users'

interface PromoterFormProps {
  mode: 'create' | 'edit'
  promoterId?: string
}

export default function PromoterForm({ mode, promoterId }: PromoterFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [events, setEvents] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    eventId: '',
    userId: '',
    promoterCode: '',
    utmCode: '',
    commissionRate: '',
    campaignId: '',
    isActive: true,
  })

  // Carregar eventos e pessoas
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar eventos
        const eventsResponse = await EventsService.getEvents()
        setEvents(eventsResponse.events || [])

        // Carregar usuários
        const usersResponse = await UsersService.getUsers()
        setUsers(usersResponse.users || [])
      } catch (err: any) {
        console.error('❌ Erro ao carregar dados:', err)
        setError(err.message || 'Erro ao carregar dados')
      }
    }

    loadData()
  }, [])

  // Carregar dados do promoter para edição
  useEffect(() => {
    if (mode === 'edit' && promoterId) {
      const loadPromoter = async () => {
        try {
          console.log('🔍 PromoterForm: Carregando promoter para edição...')
          const promoter = await PromotersService.getPromoterById(promoterId)
          console.log('✅ PromoterForm: Promoter carregado:', promoter)
          
          setFormData({
            eventId: promoter.eventId,
            userId: promoter.userId,
            promoterCode: promoter.promoterCode || '',
            utmCode: promoter.utmCode || '',
            commissionRate: promoter.commissionRate.toString(),
            campaignId: promoter.campaignId || '',
            isActive: promoter.status === 'Active',
          })
        } catch (err: any) {
          console.error('❌ PromoterForm: Erro ao carregar promoter:', err)
          setError(err.message || 'Erro ao carregar promoter')
        }
      }
      
      loadPromoter()
    }
  }, [mode, promoterId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('🔍 PromoterForm: Iniciando operação...')
      console.log('🔍 PromoterForm: mode =', mode)
      console.log('🔍 PromoterForm: formData =', formData)
      
      // Validar campos obrigatórios
      if (!formData.eventId || !formData.userId) {
        setError('Evento e Usuário são obrigatórios')
        return
      }

      // Preparar dados para a API
      const promoterData: CreatePromoterRequest = {
        eventId: formData.eventId,
        userId: formData.userId,
        promoterCode: formData.promoterCode || undefined,
        utmCode: formData.utmCode || undefined,
        commissionRate: parseFloat(formData.commissionRate) || 0,
        campaignId: formData.campaignId || undefined
      }
      
      console.log('🔍 PromoterForm: promoterData =', promoterData)
      
      if (mode === 'create') {
        const promoterId = await PromotersService.createPromoter(promoterData)
        console.log('✅ PromoterForm: Promoter criado com ID:', promoterId)
      } else if (mode === 'edit' && promoterId) {
        await PromotersService.updatePromoter(promoterId, promoterData)
        console.log('✅ PromoterForm: Promoter atualizado')
      }
      
      router.push('/promoters')
    } catch (err: any) {
      console.error('❌ PromoterForm: Erro na operação:', err)
      setError(err.message || 'Erro ao salvar promoter')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => router.push('/promoters')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? 'Novo Promoter' : 'Editar Promoter'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create' 
              ? 'Cadastre um novo promoter no sistema' 
              : 'Atualize as informações do promoter'
            }
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
                <CardDescription>
                  Dados principais do promoter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-1">
                    Evento *
                  </label>
                  <Select
                    name="eventId"
                    value={formData.eventId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, eventId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um evento" />
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
                    onValueChange={(value) => setFormData(prev => ({ ...prev, userId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                    Taxa de Comissão (%) *
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
                    required
                  />
                </div>

                <div>
                  <label htmlFor="campaignId" className="block text-sm font-medium text-gray-700 mb-1">
                    Campanha (Opcional)
                  </label>
                  <Input
                    id="campaignId"
                    name="campaignId"
                    value={formData.campaignId}
                    onChange={handleChange}
                    placeholder="ID da campanha"
                  />
                </div>
              </CardContent>
            </Card>


            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Status do Promoter
                </CardTitle>
                <CardDescription>
                  Status de disponibilidade do promoter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.isActive}
                      onChange={() => setFormData(prev => ({ ...prev, isActive: true }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Ativo - Disponível para eventos</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={!formData.isActive}
                      onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Inativo - Temporariamente indisponível</span>
                  </label>
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/promoters')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading 
              ? (mode === 'create' ? 'Criando...' : 'Salvando...') 
              : (mode === 'create' ? 'Criar Promoter' : 'Salvar Alterações')
            }
          </Button>
        </div>
      </form>
    </div>
  )
}