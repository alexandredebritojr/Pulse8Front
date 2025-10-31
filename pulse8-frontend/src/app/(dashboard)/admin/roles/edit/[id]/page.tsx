'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Save,
  RefreshCw,
  Shield,
  Key,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function EditRolePage() {
  const router = useRouter()
  const params = useParams()
  const roleId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
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

  // Mock data - em produção viria da API
  const mockRoles = [
    {
      id: '1',
      name: 'Administrador',
      description: 'Acesso total ao sistema',
      permissions: ['all'],
      isSystem: true
    },
    {
      id: '2',
      name: 'Gerente',
      description: 'Gerenciamento de eventos e equipe',
      permissions: ['events', 'guests', 'reports', 'team'],
      isSystem: false
    },
    {
      id: '3',
      name: 'Coordenador',
      description: 'Coordenação de eventos e convidados',
      permissions: ['events', 'guests', 'marketing'],
      isSystem: false
    },
    {
      id: '4',
      name: 'Operador',
      description: 'Operações básicas do sistema',
      permissions: ['guests', 'checkin'],
      isSystem: false
    },
    {
      id: '5',
      name: 'Visualizador',
      description: 'Apenas visualização de relatórios',
      permissions: ['reports'],
      isSystem: false
    }
  ]

  useEffect(() => {
    // Simular carregamento dos dados da função
    const loadRole = async () => {
      setIsLoading(true)
      
      try {
        // Simular chamada à API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const role = mockRoles.find(r => r.id === roleId)
        if (role) {
          setFormData({
            name: role.name,
            description: role.description,
            permissions: role.permissions
          })
        } else {
          // Função não encontrada
          router.push('/admin/roles')
        }
      } catch (error) {
        console.error('Erro ao carregar função:', error)
        router.push('/admin/roles')
      } finally {
        setIsLoading(false)
      }
    }

    loadRole()
  }, [roleId, router])

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

    setIsSaving(true)
    
    try {
      // Simular atualização da função
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Em produção, aqui seria feita a chamada para a API
      console.log('Atualizando função:', { id: roleId, ...formData })
      
      // Redirecionar para a lista de funções
      router.push('/admin/roles')
    } catch (error) {
      console.error('Erro ao atualizar função:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta função? Esta ação não pode ser desfeita.')) {
      return
    }

    setIsDeleting(true)
    
    try {
      // Simular exclusão da função
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Em produção, aqui seria feita a chamada para a API
      console.log('Excluindo função:', roleId)
      
      // Redirecionar para a lista de funções
      router.push('/admin/roles')
    } catch (error) {
      console.error('Erro ao excluir função:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const currentRole = mockRoles.find(r => r.id === roleId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!currentRole) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Função não encontrada</h2>
          <p className="text-gray-600 mb-4">A função que você está procurando não existe.</p>
          <Link href="/admin/roles">
            <Button>Voltar para Funções</Button>
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
          <Link href="/admin/roles">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Função</h1>
            <p className="text-gray-600">Modifique as informações e permissões da função</p>
          </div>
        </div>
        {!currentRole.isSystem && (
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
        )}
      </div>

      {currentRole.isSystem && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800">
              <strong>Atenção:</strong> Esta é uma função do sistema. Algumas permissões podem não ser editáveis.
            </p>
          </div>
        </div>
      )}

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
                  disabled={currentRole.isSystem}
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
                      disabled={currentRole.isSystem && permission.id === 'all'}
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
                  <h4 className="font-medium text-gray-900">{formData.name}</h4>
                  <p className="text-sm text-gray-500">{formData.description}</p>
                </div>
                <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                  {currentRole.isSystem ? 'Sistema' : 'Personalizada'}
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










