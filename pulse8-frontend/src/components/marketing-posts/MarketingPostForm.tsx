'use client'

import { useState, useEffect } from 'react'
import { Calendar, MessageSquare, Globe, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MarketingPostDto, CreateMarketingPostRequest, UpdateMarketingPostRequest } from '@/lib/api/marketing-posts'
import { CampaignsService, CampaignDto } from '@/lib/api/campaigns'

interface MarketingPostFormProps {
  mode: 'create' | 'edit'
  postId?: string
  initialData?: MarketingPostDto
  onSubmit: (data: CreateMarketingPostRequest | UpdateMarketingPostRequest) => Promise<void>
  isLoading?: boolean
}

const platforms = [
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Twitter', label: 'Twitter' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Telegram', label: 'Telegram' }
]

const statuses = [
  { value: 'Draft', label: 'Rascunho' },
  { value: 'Scheduled', label: 'Agendado' },
  { value: 'Published', label: 'Publicado' },
  { value: 'Cancelled', label: 'Cancelado' }
]

export default function MarketingPostForm({ mode, postId, initialData, onSubmit, isLoading = false }: MarketingPostFormProps) {
  const [formData, setFormData] = useState({
    content: '',
    platform: '',
    scheduledDate: '',
    status: 'Draft',
    marketingCampaignId: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([])
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        content: initialData.content || '',
        platform: initialData.platform || '',
        scheduledDate: initialData.scheduledDate ? new Date(initialData.scheduledDate).toISOString().slice(0, 16) : '',
        status: initialData.status || 'Draft',
        marketingCampaignId: initialData.marketingCampaignId || ''
      })
    }
  }, [mode, initialData])

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setIsLoadingCampaigns(true)
        const response = await CampaignsService.getCampaigns(1, 100)
        setCampaigns(response.campaigns)
      } catch (error) {
        console.error('Erro ao carregar campanhas:', error)
      } finally {
        setIsLoadingCampaigns(false)
      }
    }

    loadCampaigns()
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório'
    }

    if (!formData.platform) {
      newErrors.platform = 'Plataforma é obrigatória'
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Data de agendamento é obrigatória'
    } else {
      const scheduledDate = new Date(formData.scheduledDate)
      const now = new Date()
      if (scheduledDate < now) {
        newErrors.scheduledDate = 'Data de agendamento deve ser no futuro'
      }
    }

    if (!formData.status) {
      newErrors.status = 'Status é obrigatório'
    }

    if (!formData.marketingCampaignId) {
      newErrors.marketingCampaignId = 'Campanha de marketing é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const payload = {
        content: formData.content,
        platform: formData.platform,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        status: formData.status,
        marketingCampaignId: formData.marketingCampaignId
      }

      await onSubmit(payload)
    } catch (error) {
      console.error('Erro ao salvar post:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
          <CardDescription>
            Configure as informações básicas do post
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Conteúdo *
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Digite o conteúdo do post..."
              rows={4}
              className={`w-full ${errors.content ? 'border-red-500' : ''}`}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                Plataforma *
              </Label>
              <Select value={formData.platform} onValueChange={(value) => handleChange('platform', value)}>
                <SelectTrigger className={errors.platform ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.platform && (
                <p className="text-red-500 text-sm mt-1">{errors.platform}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agendamento
          </CardTitle>
          <CardDescription>
            Configure quando o post será publicado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora de Publicação *
            </Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => handleChange('scheduledDate', e.target.value)}
              className={errors.scheduledDate ? 'border-red-500' : ''}
            />
            {errors.scheduledDate && (
              <p className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Campaign */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Campanha
          </CardTitle>
          <CardDescription>
            Associe o post a uma campanha de marketing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="marketingCampaignId" className="block text-sm font-medium text-gray-700 mb-1">
              Campanha de Marketing *
            </Label>
            <Select 
              value={formData.marketingCampaignId} 
              onValueChange={(value) => handleChange('marketingCampaignId', value)}
            >
              <SelectTrigger className={errors.marketingCampaignId ? 'border-red-500' : ''}>
                <SelectValue placeholder={isLoadingCampaigns ? "Carregando campanhas..." : "Selecione uma campanha"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  Selecione uma campanha
                </SelectItem>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.marketingCampaignId && (
              <p className="text-red-500 text-sm mt-1">{errors.marketingCampaignId}</p>
            )}
            {campaigns.length === 0 && !isLoadingCampaigns && (
              <p className="text-sm text-gray-500 mt-1">
                Nenhuma campanha encontrada. Crie uma campanha primeiro.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Post' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
