'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Globe, 
  Plus,
  Settings,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCw,
  Trash2,
  Edit,
  Key,
  Database,
  Mail,
  CreditCard,
  Wifi,
  Smartphone,
  Calendar,
  BarChart3,
  Shield,
  Zap,
  Star,
  Download,
  Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function IntegrationsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // Mock data - em produção viria da API
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  const categories = [
    { value: 'all', label: 'Todas as categorias' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'payments', label: 'Pagamentos' },
    { value: 'social', label: 'Redes Sociais' },
    { value: 'crm', label: 'CRM' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'communication', label: 'Comunicação' }
  ]

  const integrations = [
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Email marketing e automação',
      category: 'marketing',
      icon: Mail,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      status: 'connected',
      lastSync: '2024-01-15T10:30:00Z',
      features: ['Email Marketing', 'Automação', 'Segmentação']
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Processamento de pagamentos',
      category: 'payments',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      status: 'connected',
      lastSync: '2024-01-15T09:15:00Z',
      features: ['Pagamentos', 'Cobrança', 'Relatórios']
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Integração com Facebook e Instagram',
      category: 'social',
      icon: Wifi,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      status: 'disconnected',
      lastSync: null,
      features: ['Posts', 'Anúncios', 'Analytics']
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'CRM e automação de marketing',
      category: 'crm',
      icon: Database,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      status: 'disconnected',
      lastSync: null,
      features: ['CRM', 'Automação', 'Leads']
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Análise de tráfego e comportamento',
      category: 'analytics',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      status: 'connected',
      lastSync: '2024-01-15T08:45:00Z',
      features: ['Analytics', 'Relatórios', 'Conversões']
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Comunicação e notificações',
      category: 'communication',
      icon: Smartphone,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      status: 'disconnected',
      lastSync: null,
      features: ['Notificações', 'Chat', 'Integrações']
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sincronização de calendários',
      category: 'communication',
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      status: 'connected',
      lastSync: '2024-01-15T11:20:00Z',
      features: ['Calendário', 'Eventos', 'Sincronização']
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automação entre aplicações',
      category: 'marketing',
      icon: Zap,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      status: 'disconnected',
      lastSync: null,
      features: ['Automação', 'Workflows', 'Integrações']
    }
  ]

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || integration.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100'
      case 'disconnected':
        return 'text-gray-600 bg-gray-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Conectado'
      case 'disconnected':
        return 'Desconectado'
      case 'error':
        return 'Erro'
      default:
        return 'Desconectado'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4" />
      case 'disconnected':
        return <AlertCircle className="h-4 w-4" />
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Integrações</h1>
            <p className="text-gray-600">Conecte com serviços externos para expandir funcionalidades</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Integração
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar integrações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Integrações</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.length}</div>
            <p className="text-xs text-muted-foreground">
              Integrações disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conectadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {integrations.filter(i => i.status === 'connected').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Integrações ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desconectadas</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {integrations.filter(i => i.status === 'disconnected').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Integrações inativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Sincronização</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">15/01</div>
            <p className="text-xs text-muted-foreground">
              Última sincronização
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => {
          const IconComponent = integration.icon
          return (
            <Card key={integration.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${integration.bgColor} rounded-full flex items-center justify-center`}>
                      <IconComponent className={`h-6 w-6 ${integration.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                    {getStatusIcon(integration.status)}
                    <span className="ml-1">{getStatusText(integration.status)}</span>
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">Funcionalidades</h4>
                  <div className="flex flex-wrap gap-1">
                    {integration.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {integration.lastSync && (
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Última sincronização:</span>
                    <br />
                    {new Date(integration.lastSync).toLocaleString('pt-BR')}
                  </div>
                )}

                <div className="flex gap-2">
                  {integration.status === 'connected' ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sincronizar
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" className="flex-1">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Conectar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Integrações Disponíveis
          </CardTitle>
          <CardDescription>
            Novas integrações que podem ser adicionadas ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'WhatsApp Business', icon: Smartphone, color: 'text-green-600' },
              { name: 'Telegram', icon: Smartphone, color: 'text-blue-600' },
              { name: 'Discord', icon: Wifi, color: 'text-indigo-600' },
              { name: 'Zoom', icon: Calendar, color: 'text-blue-600' },
              { name: 'Microsoft Teams', icon: Smartphone, color: 'text-blue-600' },
              { name: 'Trello', icon: BarChart3, color: 'text-blue-600' },
              { name: 'Asana', icon: BarChart3, color: 'text-orange-600' },
              { name: 'Notion', icon: Database, color: 'text-gray-600' }
            ].map((integration, index) => (
              <div key={index} className="p-4 border rounded-lg hover:border-indigo-500 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <integration.icon className={`h-6 w-6 ${integration.color}`} />
                  <span className="font-medium">{integration.name}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Help */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Ajuda com Integrações
          </CardTitle>
          <CardDescription>
            Recursos para configurar e gerenciar suas integrações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Documentação</h4>
              <p className="text-sm text-gray-500 mb-3">
                Guias completos para configurar cada integração
              </p>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Ver Documentação
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Suporte</h4>
              <p className="text-sm text-gray-500 mb-3">
                Precisa de ajuda? Entre em contato com nosso suporte
              </p>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Contatar Suporte
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">API</h4>
              <p className="text-sm text-gray-500 mb-3">
                Desenvolva suas próprias integrações usando nossa API
              </p>
              <Button variant="outline" size="sm">
                <Key className="h-4 w-4 mr-2" />
                Ver API Docs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

