'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Megaphone, Calendar, DollarSign, Users, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MarketingService, CreateMarketingRequest, MarketingDto } from '@/lib/api/marketing'

interface MarketingFormProps {
  mode: 'create' | 'edit'
  marketingId?: string
}

export default function MarketingForm({ mode, marketingId }: MarketingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    status: 'Active',
    startDate: '',
    endDate: '',
    budget: '',
    targetAudience: '',
    channels: [] as string[],
  })

  // Carregar dados do marketing para edição
  useEffect(() => {
    if (mode === 'edit' && marketingId) {
      const loadMarketing = async () => {
        try {
          console.log('🔍 MarketingForm: Carregando marketing para edição...')
          const marketing = await MarketingService.getMarketingById(marketingId)
          console.log('✅ MarketingForm: Marketing carregado:', marketing)
          
          setFormData({
            name: marketing.name,
            description: marketing.description,
            type: marketing.type,
            status: marketing.status,
            startDate: marketing.startDate.split('T')[0],
            endDate: marketing.endDate ? marketing.endDate.split('T')[0] : '',
            budget: marketing.budget?.toString() || '',
            targetAudience: marketing.targetAudience || '',
            channels: marketing.channels,
          })
        } catch (err: any) {
          console.error('❌ MarketingForm: Erro ao carregar marketing:', err)
          setError(err.message || 'Erro ao carregar marketing')
        }
      }
      
      loadMarketing()
    }
  }, [mode, marketingId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleChannelChange = (channel: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      channels: checked 
        ? [...prev.channels, channel]
        : prev.channels.filter(c => c !== channel)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('🔍 MarketingForm: Iniciando operação...')
      console.log('🔍 MarketingForm: mode =', mode)
      console.log('🔍 MarketingForm: formData =', formData)
      
      // Preparar dados para a API
      const marketingData: CreateMarketingRequest = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        targetAudience: formData.targetAudience,
        channels: formData.channels,
      }
      
      console.log('🔍 MarketingForm: marketingData =', marketingData)
      
      if (mode === 'create') {
        const marketingId = await MarketingService.createMarketing(marketingData)
        console.log('✅ MarketingForm: Marketing criado com ID:', marketingId)
      } else if (mode === 'edit' && marketingId) {
        await MarketingService.updateMarketing(marketingId, marketingData)
        console.log('✅ MarketingForm: Marketing atualizado')
      }
      
      router.push('/marketing')
    } catch (err: any) {
      console.error('❌ MarketingForm: Erro na operação:', err)
      setError(err.message || 'Erro ao salvar marketing')
    } finally {
      setIsLoading(false)
    }
  }

  const marketingTypes = [
    'Campaign',
    'Event',
    'Social Media',
    'Email Marketing',
    'Content Marketing',
    'Influencer',
    'Advertising',
    'PR'
  ]

  const channelOptions = [
    'Social Media',
    'Email',
    'Print',
    'Radio',
    'TV',
    'Online',
    'Outdoor',
    'Influencer'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => router.push('/marketing')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? 'Nova Campanha' : 'Editar Campanha'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create' 
              ? 'Crie uma nova campanha de marketing' 
              : 'Atualize as informações da campanha'
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
                  <Megaphone className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
                <CardDescription>
                  Dados principais da campanha
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descreva os objetivos e estratégia da campanha..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={4}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Selecione o tipo</option>
                      {marketingTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
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
                      <option value="Active">Ativa</option>
                      <option value="Inactive">Inativa</option>
                      <option value="Completed">Concluída</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates and Budget */}
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
              </CardContent>
            </Card>

            {/* Target Audience and Channels */}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canais de Comunicação
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {channelOptions.map(channel => (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes(channel)}
                          onChange={(e) => handleChannelChange(channel, e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/marketing')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading 
              ? (mode === 'create' ? 'Criando...' : 'Salvando...') 
              : (mode === 'create' ? 'Criar Campanha' : 'Salvar Alterações')
            }
          </Button>
        </div>
      </form>
    </div>
  )
}

