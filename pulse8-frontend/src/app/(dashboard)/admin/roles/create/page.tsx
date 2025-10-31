'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Save,
  RefreshCw,
  Shield,
  Key,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateRolePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const permissions = [
    { id: 'all', name: 'Todas as permissões', description: 'Acesso total ao sistema' },
    { id: 'events', name: 'Eventos', description: 'Gerenciar eventos' },
    { id: 'guests', name: 'Convidados', description: 'Gerenciar convidados' },
    { id: 'checkin', name: 'Check-in', description: 'Realizar check-in' },
    { id: 'reports', name: 'Relatórios', description: 'Visualizar relatórios' },
    { id: 'team', name: 'Equipe', description: 'Gerenciar equipe' },
    { id: 'marketing', name: 'Marketing', description: 'Gerenciar marketing' },
    { id: 'finance', name: 'Financeiro', description: 'Gerenciar finanças' },
    { id: 'suppliers', name: 'Fornecedores', description: 'Gerenciar fornecedores' },
    { id: 'admin', name: 'Administração', description: 'Acesso administrativo' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(id => id !== permissionId)
    }))
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da função é obrigatório'
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'Selecione pelo menos uma permissão'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      // Simular criação da função
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Em produção, aqui seria feita a chamada para a API
      console.log('Criando função:', formData)
      
      // Redirecionar para a lista de funções
      router.push('/admin/roles')
    } catch (error) {
      console.error('Erro ao criar função:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/roles">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Criar Nova Função</h1>
            <p className="text-gray-600">Defina uma nova função com permissões específicas</p>
          </div>
        </div>
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
              Defina o nome e descrição da função
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Função *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Coordenador de Eventos"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descrição da função"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Permissões
            </CardTitle>
            <CardDescription>
              Selecione as permissões que esta função terá
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id={permission.id}
                      checked={formData.permissions.includes(permission.id)}
                      onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                      className="mt-1 rounded"
                    />
                    <div className="flex-1">
                      <label htmlFor={permission.id} className="block text-sm font-medium text-gray-900 cursor-pointer">
                        {permission.name}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              {errors.permissions && (
                <p className="text-red-500 text-sm">{errors.permissions}</p>
              )}
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
              Como a função aparecerá na lista
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {formData.name || 'Nome da função'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {formData.description || 'Descrição da função'}
                  </p>
                </div>
                <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                  Personalizada
                </span>
              </div>
              {formData.permissions.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Permissões selecionadas:</h5>
                  <div className="flex flex-wrap gap-1">
                    {formData.permissions.map((permissionId) => {
                      const permission = permissions.find(p => p.id === permissionId)
                      return (
                        <span
                          key={permissionId}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {permission?.name}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/roles">
            <Button variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Criar Função
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}










