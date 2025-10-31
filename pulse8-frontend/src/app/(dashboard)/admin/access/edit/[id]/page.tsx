'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Save,
  RefreshCw,
  Shield,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  MapPin,
  Trash2,
  Edit,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function EditAccessRulePage() {
  const router = useRouter()
  const params = useParams()
  const ruleId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'resource',
    status: 'active',
    conditions: {
      timeRestriction: false,
      locationRestriction: false,
      deviceRestriction: false,
      ipRestriction: false
    },
    timeRange: {
      start: '09:00',
      end: '18:00'
    },
    allowedLocations: [] as string[],
    allowedDevices: [] as string[],
    allowedIPs: [] as string[],
    priority: 1
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Mock data - em produção viria da API
  const mockRules = [
    {
      id: '1',
      name: 'Acesso Administrativo',
      description: 'Acesso total ao sistema',
      type: 'resource',
      status: 'active',
      users: 2,
      conditions: {
        timeRestriction: true,
        locationRestriction: false,
        deviceRestriction: false,
        ipRestriction: true
      },
      timeRange: { start: '08:00', end: '18:00' },
      allowedLocations: [],
      allowedDevices: [],
      allowedIPs: ['192.168.1.0/24', '10.0.0.0/8'],
      priority: 1
    },
    {
      id: '2',
      name: 'Acesso a Eventos',
      description: 'Gerenciar eventos e convidados',
      type: 'resource',
      status: 'active',
      users: 5,
      conditions: {
        timeRestriction: false,
        locationRestriction: true,
        deviceRestriction: true,
        ipRestriction: false
      },
      timeRange: { start: '09:00', end: '18:00' },
      allowedLocations: ['São Paulo, SP', 'Rio de Janeiro, RJ'],
      allowedDevices: ['desktop', 'mobile'],
      allowedIPs: [],
      priority: 2
    },
    {
      id: '3',
      name: 'Acesso a Relatórios',
      description: 'Visualizar relatórios',
      type: 'resource',
      status: 'active',
      users: 3,
      conditions: {
        timeRestriction: true,
        locationRestriction: false,
        deviceRestriction: false,
        ipRestriction: false
      },
      timeRange: { start: '09:00', end: '17:00' },
      allowedLocations: [],
      allowedDevices: [],
      allowedIPs: [],
      priority: 3
    },
    {
      id: '4',
      name: 'Acesso Limitado',
      description: 'Apenas visualização',
      type: 'resource',
      status: 'inactive',
      users: 2,
      conditions: {
        timeRestriction: false,
        locationRestriction: false,
        deviceRestriction: false,
        ipRestriction: false
      },
      timeRange: { start: '09:00', end: '18:00' },
      allowedLocations: [],
      allowedDevices: [],
      allowedIPs: [],
      priority: 4
    }
  ]

  const ruleTypes = [
    { id: 'login', name: 'Login', description: 'Regras para autenticação' },
    { id: 'resource', name: 'Recurso', description: 'Acesso a recursos específicos' },
    { id: 'api', name: 'API', description: 'Acesso a APIs' },
    { id: 'permission', name: 'Permissão', description: 'Concessão de permissões' }
  ]

  const deviceTypes = [
    { id: 'desktop', name: 'Desktop', icon: Monitor },
    { id: 'mobile', name: 'Mobile', icon: Smartphone },
    { id: 'tablet', name: 'Tablet', icon: Monitor }
  ]

  useEffect(() => {
    // Simular carregamento dos dados da regra
    const loadRule = async () => {
      setIsLoading(true)
      
      try {
        // Simular chamada à API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const rule = mockRules.find(r => r.id === ruleId)
        if (rule) {
          setFormData({
            name: rule.name,
            description: rule.description,
            type: rule.type,
            status: rule.status,
            conditions: rule.conditions,
            timeRange: rule.timeRange,
            allowedLocations: rule.allowedLocations,
            allowedDevices: rule.allowedDevices,
            allowedIPs: rule.allowedIPs,
            priority: rule.priority
          })
        } else {
          // Regra não encontrada
          router.push('/admin/access')
        }
      } catch (error) {
        console.error('Erro ao carregar regra:', error)
        router.push('/admin/access')
      } finally {
        setIsLoading(false)
      }
    }

    loadRule()
  }, [ruleId, router])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleConditionChange = (condition: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      conditions: { ...prev.conditions, [condition]: checked }
    }))
  }

  const handleArrayChange = (field: string, value: string, action: 'add' | 'remove') => {
    setFormData(prev => ({
      ...prev,
      [field]: action === 'add' 
        ? [...prev[field as keyof typeof prev] as string[], value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }))
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da regra é obrigatório'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    
    try {
      // Simular atualização da regra
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Em produção, aqui seria feita a chamada para a API
      console.log('Atualizando regra de acesso:', { id: ruleId, ...formData })
      
      // Redirecionar para a lista de regras
      router.push('/admin/access')
    } catch (error) {
      console.error('Erro ao atualizar regra:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta regra? Esta ação não pode ser desfeita.')) {
      return
    }

    setIsDeleting(true)
    
    try {
      // Simular exclusão da regra
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Em produção, aqui seria feita a chamada para a API
      console.log('Excluindo regra:', ruleId)
      
      // Redirecionar para a lista de regras
      router.push('/admin/access')
    } catch (error) {
      console.error('Erro ao excluir regra:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const currentRule = mockRules.find(r => r.id === ruleId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!currentRule) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Regra não encontrada</h2>
          <p className="text-gray-600 mb-4">A regra que você está procurando não existe.</p>
          <Link href="/admin/access">
            <Button>Voltar para Controle de Acesso</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/access">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Regra de Acesso</h1>
            <p className="text-gray-600">Modifique as configurações da regra de segurança</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="text-red-600 hover:text-red-700"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Excluindo...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Defina o nome, descrição e tipo da regra
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Regra *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Acesso Administrativo"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo da Regra *
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {ruleTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrição da regra de acesso"
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                  placeholder="1-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Condições de Acesso
            </CardTitle>
            <CardDescription>
              Configure as condições que devem ser atendidas para aplicar a regra
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Restrições de Tempo</h4>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="timeRestriction"
                    checked={formData.conditions.timeRestriction}
                    onChange={(e) => handleConditionChange('timeRestriction', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="timeRestriction" className="text-sm">
                    Aplicar restrição de horário
                  </label>
                </div>
                {formData.conditions.timeRestriction && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Início
                      </label>
                      <Input
                        type="time"
                        value={formData.timeRange.start}
                        onChange={(e) => handleInputChange('timeRange', { ...formData.timeRange, start: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fim
                      </label>
                      <Input
                        type="time"
                        value={formData.timeRange.end}
                        onChange={(e) => handleInputChange('timeRange', { ...formData.timeRange, end: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Restrições de Localização</h4>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="locationRestriction"
                    checked={formData.conditions.locationRestriction}
                    onChange={(e) => handleConditionChange('locationRestriction', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="locationRestriction" className="text-sm">
                    Aplicar restrição de localização
                  </label>
                </div>
                {formData.conditions.locationRestriction && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Adicionar localização (ex: São Paulo, SP)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const value = (e.target as HTMLInputElement).value
                          if (value.trim()) {
                            handleArrayChange('allowedLocations', value.trim(), 'add')
                            ;(e.target as HTMLInputElement).value = ''
                          }
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      {formData.allowedLocations.map((location, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          <MapPin className="h-3 w-3" />
                          {location}
                          <button
                            type="button"
                            onClick={() => handleArrayChange('allowedLocations', location, 'remove')}
                            className="ml-1 hover:text-blue-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Restrições de Dispositivo</h4>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="deviceRestriction"
                    checked={formData.conditions.deviceRestriction}
                    onChange={(e) => handleConditionChange('deviceRestriction', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="deviceRestriction" className="text-sm">
                    Aplicar restrição de dispositivo
                  </label>
                </div>
                {formData.conditions.deviceRestriction && (
                  <div className="space-y-2">
                    {deviceTypes.map(device => (
                      <div key={device.id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={device.id}
                          checked={formData.allowedDevices.includes(device.id)}
                          onChange={(e) => handleArrayChange('allowedDevices', device.id, e.target.checked ? 'add' : 'remove')}
                          className="rounded"
                        />
                        <label htmlFor={device.id} className="flex items-center gap-2 text-sm">
                          <device.icon className="h-4 w-4" />
                          {device.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Restrições de IP</h4>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="ipRestriction"
                    checked={formData.conditions.ipRestriction}
                    onChange={(e) => handleConditionChange('ipRestriction', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="ipRestriction" className="text-sm">
                    Aplicar restrição de IP
                  </label>
                </div>
                {formData.conditions.ipRestriction && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Adicionar IP (ex: 192.168.1.0/24)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const value = (e.target as HTMLInputElement).value
                          if (value.trim()) {
                            handleArrayChange('allowedIPs', value.trim(), 'add')
                            ;(e.target as HTMLInputElement).value = ''
                          }
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      {formData.allowedIPs.map((ip, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          <Globe className="h-3 w-3" />
                          {ip}
                          <button
                            type="button"
                            onClick={() => handleArrayChange('allowedIPs', ip, 'remove')}
                            className="ml-1 hover:text-green-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Pré-visualização
            </CardTitle>
            <CardDescription>
              Como a regra aparecerá na lista
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{formData.name}</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  formData.status === 'active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                }`}>
                  {formData.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{formData.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{currentRule.users} usuários</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/access">
            <Button variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button 
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}










