'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  User,
  Users,
  Activity,
  Key,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ViewUserPage() {
  const params = useParams()
  const userId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Mock data - em produção viria da API
  const mockUsers = [
    {
      id: '1',
      name: 'Ana Silva',
      email: 'ana@email.com',
      phone: '11999887766',
      role: 'admin',
      status: 'active',
      department: 'Administração',
      position: 'Diretora',
      permissions: ['all'],
      lastLogin: '2024-01-15T14:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      avatar: 'AS',
      location: 'São Paulo, SP',
      bio: 'Diretora executiva com mais de 10 anos de experiência em gestão de eventos.'
    },
    {
      id: '2',
      name: 'Carlos Santos',
      email: 'carlos@email.com',
      phone: '11888776655',
      role: 'manager',
      status: 'active',
      department: 'Operações',
      position: 'Gerente',
      permissions: ['events', 'guests', 'reports'],
      lastLogin: '2024-01-15T12:15:00Z',
      createdAt: '2024-01-05T00:00:00Z',
      avatar: 'CS',
      location: 'Rio de Janeiro, RJ',
      bio: 'Gerente de operações especializado em logística de eventos.'
    },
    {
      id: '3',
      name: 'Maria Costa',
      email: 'maria@email.com',
      phone: '11777665544',
      role: 'coordinator',
      status: 'active',
      department: 'Marketing',
      position: 'Coordenadora',
      permissions: ['events', 'guests', 'marketing'],
      lastLogin: '2024-01-15T10:45:00Z',
      createdAt: '2024-01-10T00:00:00Z',
      avatar: 'MC',
      location: 'Belo Horizonte, MG',
      bio: 'Coordenadora de marketing com foco em eventos corporativos.'
    },
    {
      id: '4',
      name: 'João Oliveira',
      email: 'joao@email.com',
      phone: '11666554433',
      role: 'operator',
      status: 'inactive',
      department: 'Operações',
      position: 'Operador',
      permissions: ['guests', 'checkin'],
      lastLogin: '2024-01-14T16:20:00Z',
      createdAt: '2024-01-12T00:00:00Z',
      avatar: 'JO',
      location: 'Salvador, BA',
      bio: 'Operador especializado em check-in e atendimento ao público.'
    },
    {
      id: '5',
      name: 'Fernanda Lima',
      email: 'fernanda@email.com',
      phone: '11555443322',
      role: 'viewer',
      status: 'pending',
      department: 'Financeiro',
      position: 'Analista',
      permissions: ['reports'],
      lastLogin: null,
      createdAt: '2024-01-14T00:00:00Z',
      avatar: 'FL',
      location: 'Porto Alegre, RS',
      bio: 'Analista financeira responsável por relatórios e análises.'
    }
  ]

  const roles = [
    { id: 'admin', name: 'Administrador', description: 'Acesso total ao sistema', color: 'text-red-600 bg-red-100' },
    { id: 'manager', name: 'Gerente', description: 'Gerenciamento de eventos e equipe', color: 'text-purple-600 bg-purple-100' },
    { id: 'coordinator', name: 'Coordenador', description: 'Coordenação de eventos e convidados', color: 'text-blue-600 bg-blue-100' },
    { id: 'operator', name: 'Operador', description: 'Operações básicas do sistema', color: 'text-green-600 bg-green-100' },
    { id: 'viewer', name: 'Visualizador', description: 'Apenas visualização de relatórios', color: 'text-gray-600 bg-gray-100' }
  ]

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

  useEffect(() => {
    // Simular carregamento dos dados do usuário
    const loadUser = async () => {
      setIsLoading(true)
      
      try {
        // Simular chamada à API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const foundUser = mockUsers.find(u => u.id === userId)
        setUser(foundUser)
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [userId])

  const getRoleInfo = (roleId: string) => {
    return roles.find(r => r.id === roleId) || { name: 'Desconhecido', color: 'text-gray-600 bg-gray-100' }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'Ativo', color: 'text-green-600 bg-green-100' }
      case 'inactive':
        return { text: 'Inativo', color: 'text-gray-600 bg-gray-100' }
      case 'pending':
        return { text: 'Pendente', color: 'text-yellow-600 bg-yellow-100' }
      case 'suspended':
        return { text: 'Suspenso', color: 'text-red-600 bg-red-100' }
      default:
        return { text: 'Desconhecido', color: 'text-gray-600 bg-gray-100' }
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleString('pt-BR')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Usuário não encontrado</h2>
          <p className="text-gray-600 mb-4">O usuário que você está procurando não existe.</p>
          <Link href="/admin">
            <Button>Voltar para Administração</Button>
          </Link>
        </div>
      </div>
    )
  }

  const roleInfo = getRoleInfo(user.role)
  const statusInfo = getStatusInfo(user.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalhes do Usuário</h1>
            <p className="text-gray-600">Informações completas do usuário</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/users/edit/${user.id}`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-2xl">
                    {user.avatar}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                <p className="text-gray-500">{user.position}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user.department}</span>
                </div>
              </div>

              {user.bio && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Biografia</h4>
                  <p className="text-sm text-gray-600">{user.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Role and Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Função e Permissões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Função Atual</h4>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleInfo.color}`}>
                    {roleInfo.name}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Permissões</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {user.permissions.map((permissionId: string) => {
                    const permission = permissions.find(p => p.id === permissionId)
                    return (
                      <div key={permissionId} className="flex items-center gap-2 p-3 border rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{permission?.name}</p>
                          <p className="text-xs text-gray-500">{permission?.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Último Login</p>
                    <p className="text-sm text-gray-500">{formatDate(user.lastLogin)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Membro Desde</p>
                    <p className="text-sm text-gray-500">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Autenticação de Dois Fatores</p>
                      <p className="text-xs text-gray-500">Proteção adicional da conta</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Não configurado</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Settings className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Configurações de Acesso</p>
                      <p className="text-xs text-gray-500">Horários e locais permitidos</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Padrão</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}










