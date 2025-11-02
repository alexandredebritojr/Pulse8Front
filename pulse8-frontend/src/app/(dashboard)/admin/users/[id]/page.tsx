'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Shield,
  Users,
  FileText,
  Award,
  Key,
  Settings,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatDateTime, formatPhone } from '@/lib/utils'
import { UsersService, UserDto } from '@/lib/api/users'

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<UserDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Carregar dados do usuário da API
  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('🔍 UserDetailsPage: Carregando usuário...')
        const userData = await UsersService.getUserById(params.id as string)
        console.log('✅ UserDetailsPage: Usuário carregado:', userData)
        setUser(userData)
        setError('')
      } catch (err: any) {
        console.error('❌ UserDetailsPage: Erro ao carregar usuário:', err)
        setError(err.message || 'Erro ao carregar usuário')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active':
        return 'Ativo'
      case 'Inactive':
        return 'Inativo'
      case 'Pending':
        return 'Pendente'
      case 'Suspended':
        return 'Suspenso'
      default:
        return 'Desconhecido'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-4 w-4" />
      case 'Inactive':
        return <AlertCircle className="h-4 w-4" />
      case 'Pending':
        return <Clock className="h-4 w-4" />
      case 'Suspended':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'administrador':
        return 'text-red-600 bg-red-100'
      case 'gerente':
        return 'text-purple-600 bg-purple-100'
      case 'coordenador':
        return 'text-blue-600 bg-blue-100'
      case 'operador':
        return 'text-green-600 bg-green-100'
      case 'visualizador':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await UsersService.deleteUser(user!.id)
        router.push('/admin/users')
      } catch (err: any) {
        alert('Erro ao excluir usuário: ' + (err.message || 'Erro desconhecido'))
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <Button onClick={() => router.push('/admin/users')}>Voltar</Button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">Usuário não encontrado</div>
        <Button onClick={() => router.push('/admin/users')}>Voltar</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.push('/admin/users')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                {getStatusIcon(user.status)}
                {getStatusText(user.status)}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/admin/users/edit/${user.id}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </Link>
          <Button 
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Excluir</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600 break-words">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Telefone</p>
                    <p className="text-sm text-gray-600 break-words">{formatPhone(user.phone)}</p>
                  </div>
                </div>
                {user.document && (
                  <div className="flex items-center gap-3 md:col-span-2">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Documento</p>
                      <p className="text-sm text-gray-600 break-words">{user.document}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role and Organization Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Função e Organização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Função</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.roleName)}`}>
                    {user.roleName}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Organização</p>
                  <p className="text-sm text-gray-600">{user.organizationName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.lastLoginAt && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <Activity className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">Último login</p>
                      <p className="text-sm text-gray-500">{formatDateTime(user.lastLoginAt)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Usuário cadastrado</p>
                    <p className="text-sm text-gray-500">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                {user.updatedAt && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <Edit className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Informações atualizadas</p>
                      <p className="text-sm text-gray-500">{formatDate(user.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-2xl">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{user.firstName} {user.lastName}</h3>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.roleName)}`}>
                  {user.roleName}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/admin/users/edit/${user.id}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Usuário
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Key className="h-4 w-4 mr-2" />
                Redefinir Senha
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </CardContent>
          </Card>

          {/* Contact Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Ligar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

