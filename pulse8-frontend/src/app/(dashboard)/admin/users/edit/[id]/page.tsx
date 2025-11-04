'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  ArrowLeft,
  Save,
  RefreshCw,
  UserPlus,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
  EyeOff,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UsersService, UserDto } from '@/lib/api/users'
import { OrganizationsService } from '@/lib/api/organizations'
import { OrganizationDto } from '@/lib/api/organizations'

// UserOrganizationType enum values
enum UserOrganizationType {
  Admin = 0,
  Manager = 1,
  Employee = 2,
  Promoter = 3
}

// UserOrganizationStatus enum values
enum UserOrganizationStatus {
  Active = 0,
  Inactive = 1,
  Suspended = 2,
  Pending = 3
}

const roles = [
  { id: UserOrganizationType.Admin, name: 'Administrador', description: 'Acesso total ao sistema' },
  { id: UserOrganizationType.Manager, name: 'Gerente', description: 'Gerenciamento de eventos e equipe' },
  { id: UserOrganizationType.Employee, name: 'Funcionário', description: 'Operações básicas do sistema' },
  { id: UserOrganizationType.Promoter, name: 'Promoter', description: 'Acesso específico para promoters' }
]

const statusOptions = [
  { id: UserOrganizationStatus.Active, name: 'Ativo', description: 'Usuário ativo na organização' },
  { id: UserOrganizationStatus.Inactive, name: 'Inativo', description: 'Usuário inativo na organização' },
  { id: UserOrganizationStatus.Suspended, name: 'Suspenso', description: 'Usuário suspenso na organização' },
  { id: UserOrganizationStatus.Pending, name: 'Pendente', description: 'Aguardando aprovação' }
]

// Funções de máscara
const maskPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) {
    return numbers
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }
}

const maskCPFCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 11) {
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
    }
  } else {
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`
    } else {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`
    }
  }
}

// Mapear status string para enum number
const mapStatusToEnum = (status: string): number => {
  switch (status) {
    case 'Active':
      return UserOrganizationStatus.Active
    case 'Inactive':
      return UserOrganizationStatus.Inactive
    case 'Suspended':
      return UserOrganizationStatus.Suspended
    case 'Pending':
      return UserOrganizationStatus.Pending
    default:
      return UserOrganizationStatus.Active
  }
}

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true)
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([])
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    document: '',
    organizationId: '',
    roleId: UserOrganizationType.Employee.toString(),
    status: UserOrganizationStatus.Active.toString()
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Carregar organizações (apenas a organização do usuário logado)
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setIsLoadingOrganizations(true)
        const organizationId = localStorage.getItem('organizationId')
        const response = await OrganizationsService.getOrganizations(1, 1000)
        
        if (organizationId) {
          // Buscar a organização do usuário logado
          const userOrg = response.organizations.find(org => org.id === organizationId)
          if (userOrg) {
            setOrganizations([userOrg])
          } else {
            // Se não encontrar a organização específica, usar a primeira disponível
            console.warn('Organização do usuário logado não encontrada, usando primeira disponível')
            if (response.organizations.length > 0) {
              setOrganizations([response.organizations[0]])
            } else {
              setOrganizations([])
            }
          }
        } else {
          // Se não houver organizationId, usar a primeira disponível
          if (response.organizations.length > 0) {
            setOrganizations([response.organizations[0]])
          } else {
            setOrganizations([])
          }
        }
      } catch (error: any) {
        console.error('Erro ao carregar organizações:', error)
        toast.error(error.message || 'Erro ao carregar organizações')
        setOrganizations([])
      } finally {
        setIsLoadingOrganizations(false)
      }
    }

    loadOrganizations()
  }, [])

  // Carregar dados do usuário (depois que as organizações foram carregadas)
  useEffect(() => {
    const loadUser = async () => {
      if (!userId || isLoadingOrganizations) return

      try {
        setIsLoading(true)
        
        // Buscar usuário da lista (não há endpoint específico por ID)
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        const response = await UsersService.getUsers(1, 1000, undefined, undefined, organizationId)
        
        const user = response.users.find(u => u.id === userId)
        
        if (!user) {
          toast.error('Usuário não encontrado')
          router.push('/admin/users')
          return
        }

        setCurrentUser(user)
        
        // Usar sempre a organização do usuário logado (localStorage) e os dados do UserDto
        // O UserDto já vem com os dados filtrados pela organização correta
        // Garantir que a organização esteja na lista antes de setar
        // Se a lista de organizações estiver vazia, usar o organizationId do localStorage
        const finalOrgId = organizations.length > 0 
          ? organizations[0].id  // Usar a primeira organização (que deve ser a do usuário logado)
          : organizationId       // Fallback para o organizationId do localStorage
        
        // Aplicar máscaras nos campos phone e document
        // As funções de máscara removem caracteres não numéricos antes de aplicar a máscara
        // Isso garante que funcionem mesmo se o valor já vier formatado do backend
        let maskedPhone = ''
        let maskedDocument = ''
        
        if (user.phone) {
          // Remove caracteres não numéricos e aplica a máscara
          const phoneNumbers = user.phone.replace(/\D/g, '')
          if (phoneNumbers.length > 0) {
            maskedPhone = maskPhone(phoneNumbers)
          }
        }
        
        if (user.document) {
          // Remove caracteres não numéricos e aplica a máscara
          const documentNumbers = user.document.replace(/\D/g, '')
          if (documentNumbers.length > 0) {
            maskedDocument = maskCPFCNPJ(documentNumbers)
          }
        }
        
        // Converter roleId string para número e depois para string novamente
        // Isso garante que "0" (Admin) seja tratado corretamente
        const roleIdNum = user.roleId !== undefined && user.roleId !== null && user.roleId !== '' 
          ? parseInt(user.roleId) 
          : null
        const roleIdValue = roleIdNum !== null && !isNaN(roleIdNum)
          ? roleIdNum.toString()
          : UserOrganizationType.Employee.toString()
        
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: maskedPhone,
          document: maskedDocument,
          organizationId: finalOrgId, // Sempre usar a organização do usuário logado
          roleId: roleIdValue,
          status: user.userOrganizationStatus !== undefined ? user.userOrganizationStatus.toString() : UserOrganizationStatus.Active.toString()
        })
      } catch (error: any) {
        console.error('Erro ao carregar usuário:', error)
        toast.error(error.message || 'Erro ao carregar dados do usuário')
        router.push('/admin/users')
      } finally {
        setIsLoading(false)
      }
    }

    if (userId && !isLoadingOrganizations) {
      loadUser()
    }
  }, [userId, router, organizations, isLoadingOrganizations])

  const handleInputChange = (field: string, value: string) => {
    let maskedValue = value
    
    if (field === 'phone') {
      maskedValue = maskPhone(value)
    } else if (field === 'document') {
      maskedValue = maskCPFCNPJ(value)
    }
    
    setFormData(prev => ({ ...prev, [field]: maskedValue }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    }

    if (!formData.document.trim()) {
      newErrors.document = 'CPF/CNPJ é obrigatório'
    } else {
      const normalizedDoc = formData.document.replace(/[.\-\s/]/g, '')
      if (normalizedDoc.length < 11 || normalizedDoc.length > 14) {
        newErrors.document = 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos'
      } else if (!/^\d+$/.test(normalizedDoc)) {
        newErrors.document = 'CPF/CNPJ deve conter apenas números'
      }
    }

    if (!formData.organizationId) {
      newErrors.organizationId = 'Organização é obrigatória'
    }

    if (!formData.roleId) {
      newErrors.roleId = 'Função é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !currentUser) {
      return
    }

    setIsSaving(true)
    
    try {
      // Remove formatação dos campos com máscara antes de enviar
      const cleanPhone = formData.phone.replace(/\D/g, '')
      const cleanDocument = formData.document.replace(/\D/g, '')
      
      const userData = {
        id: currentUser.id,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: cleanPhone,
        document: cleanDocument,
        organizationId: formData.organizationId,
        roleId: parseInt(formData.roleId),
        statusUserOrganization: parseInt(formData.status)
        // Não enviar status - o backend usa o valor padrão do UpdateUserCommand
      }

      await UsersService.updateUser(currentUser.id, userData)
      
      toast.success('Usuário atualizado com sucesso!')
      
      // Redirecionar para a lista de usuários
      router.push('/admin/users')
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error)
      const errorMessage = error.message || 'Erro ao atualizar usuário. Por favor, tente novamente.'
      toast.error(errorMessage)
      setErrors(prev => ({ ...prev, submit: errorMessage }))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Usuário não encontrado</h2>
          <p className="text-gray-600 mb-4">O usuário que você está procurando não existe.</p>
          <Link href="/admin/users">
            <Button>Voltar para Usuários</Button>
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
          <Link href="/admin/users">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Usuário</h1>
            <p className="text-gray-600">Modifique as informações do usuário</p>
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Dados básicos do usuário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Ex: João"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Sobrenome *
                </label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Ex: Silva"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="joao@email.com"
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
                CPF/CNPJ *
              </label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => handleInputChange('document', e.target.value)}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                maxLength={18}
                className={errors.document ? 'border-red-500' : ''}
              />
              {errors.document && (
                <p className="text-red-500 text-sm mt-1">{errors.document}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Organization and Role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organização e Função
            </CardTitle>
            <CardDescription>
              Defina a organização e função do usuário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700 mb-1">
                  Organização *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    id="organizationId"
                    value={formData.organizationId}
                    onChange={(e) => handleInputChange('organizationId', e.target.value)}
                    disabled={true}
                    className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.organizationId ? 'border-red-500' : ''
                    } bg-gray-100 cursor-not-allowed`}
                  >
                    {isLoadingOrganizations ? (
                      <option value="">Carregando organizações...</option>
                    ) : organizations.length === 0 ? (
                      <option value="">Nenhuma organização disponível</option>
                    ) : (
                      <>
                        <option value="">Selecione uma organização</option>
                        {organizations.map(org => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
                {errors.organizationId && (
                  <p className="text-red-500 text-sm mt-1">{errors.organizationId}</p>
                )}
              </div>
              <div>
                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
                  Função *
                </label>
                <select
                  id="roleId"
                  value={formData.roleId}
                  onChange={(e) => handleInputChange('roleId', e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.roleId ? 'border-red-500' : ''
                  }`}
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id.toString()}>{role.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {roles.find(r => r.id.toString() === formData.roleId)?.description}
                </p>
                {errors.roleId && (
                  <p className="text-red-500 text-sm mt-1">{errors.roleId}</p>
                )}
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.status ? 'border-red-500' : ''
                  }`}
                >
                  {statusOptions.map(status => (
                    <option key={status.id} value={status.id.toString()}>{status.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {statusOptions.find(s => s.id.toString() === formData.status)?.description}
                </p>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status}</p>
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
              Como o usuário aparecerá na lista
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    {formData.firstName.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {formData.firstName && formData.lastName 
                      ? `${formData.firstName} ${formData.lastName}` 
                      : 'Nome do usuário'}
                  </h4>
                  <p className="text-sm text-gray-500">{formData.email || 'email@exemplo.com'}</p>
                  <p className="text-xs text-gray-400">
                    {roles.find(r => r.id.toString() === formData.roleId)?.name || 'Função'} • 
                    {organizations.find(org => org.id === formData.organizationId)?.name || ' Organização'}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  formData.status === UserOrganizationStatus.Active.toString() ? 'text-green-600 bg-green-100' :
                  formData.status === UserOrganizationStatus.Inactive.toString() ? 'text-gray-600 bg-gray-100' :
                  formData.status === UserOrganizationStatus.Suspended.toString() ? 'text-red-600 bg-red-100' :
                  'text-yellow-600 bg-yellow-100'
                }`}>
                  {statusOptions.find(s => s.id.toString() === formData.status)?.name || 'Ativo'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/users">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button 
            type="submit"
            disabled={isSaving || isLoadingOrganizations}
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
