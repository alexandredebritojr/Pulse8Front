'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Shield,
  Key,
  Settings,
  UserPlus,
  UserCheck,
  UserX,
  Crown,
  Award,
  Lock,
  Unlock,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data - em produção viria da API
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  const roles = [
    { value: 'all', label: 'Todas as funções' },
    { value: 'admin', label: 'Administrador' },
    { value: 'manager', label: 'Gerente' },
    { value: 'coordinator', label: 'Coordenador' },
    { value: 'operator', label: 'Operador' },
    { value: 'viewer', label: 'Visualizador' }
  ]

  const statuses = [
    { value: 'all', label: 'Todos os status' },
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
    { value: 'pending', label: 'Pendente' },
    { value: 'suspended', label: 'Suspenso' }
  ]

  const users = [
    {
      id: '1',
      name: 'Ana Silva',
      email: 'ana@email.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15T14:30:00Z',
      permissions: ['all'],
      avatar: 'AS'
    },
    {
      id: '2',
      name: 'Carlos Santos',
      email: 'carlos@email.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-15T12:15:00Z',
      permissions: ['events', 'guests', 'reports'],
      avatar: 'CS'
    },
    {
      id: '3',
      name: 'Maria Costa',
      email: 'maria@email.com',
      role: 'coordinator',
      status: 'active',
      lastLogin: '2024-01-15T10:45:00Z',
      permissions: ['events', 'guests'],
      avatar: 'MC'
    },
    {
      id: '4',
      name: 'João Oliveira',
      email: 'joao@email.com',
      role: 'operator',
      status: 'inactive',
      lastLogin: '2024-01-10T16:20:00Z',
      permissions: ['guests'],
      avatar: 'JO'
    },
    {
      id: '5',
      name: 'Fernanda Lima',
      email: 'fernanda@email.com',
      role: 'viewer',
      status: 'pending',
      lastLogin: null,
      permissions: ['reports'],
      avatar: 'FL'
    }
  ]

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-100'
      case 'manager':
        return 'text-purple-600 bg-purple-100'
      case 'coordinator':
        return 'text-blue-600 bg-blue-100'
      case 'operator':
        return 'text-green-600 bg-green-100'
      case 'viewer':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'manager':
        return 'Gerente'
      case 'coordinator':
        return 'Coordenador'
      case 'operator':
        return 'Operador'
      case 'viewer':
        return 'Visualizador'
      default:
        return 'Desconhecido'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'inactive':
        return 'text-gray-600 bg-gray-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'suspended':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'inactive':
        return 'Inativo'
      case 'pending':
        return 'Pendente'
      case 'suspended':
        return 'Suspenso'
      default:
        return 'Desconhecido'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />
      case 'inactive':
        return <UserX className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'suspended':
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administração & Acesso</h1>
          <p className="text-gray-600">Gerencie usuários, permissões e controle de acesso</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Link href="/admin/users/create">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Login</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15/01</div>
            <p className="text-xs text-muted-foreground">
              Há 2 horas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários do Sistema
          </CardTitle>
          <CardDescription>
            Gerencie usuários e suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">{user.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{user.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        <span className="ml-1">{getStatusText(user.status)}</span>
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </span>
                      {user.lastLogin && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Último login: {new Date(user.lastLogin).toLocaleString('pt-BR')}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {user.permissions.map((permission, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {permission === 'all' ? 'Todas as permissões' : permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/users/view/${user.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </Link>
                  <Link href={`/admin/users/edit/${user.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Key className="h-4 w-4 mr-2" />
                    Permissões
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/users">
          <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
            <Users className="h-6 w-6 mb-2" />
            <span className="text-sm">Gerenciar Usuários</span>
          </Button>
        </Link>
        <Link href="/admin/roles">
          <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
            <Shield className="h-6 w-6 mb-2" />
            <span className="text-sm">Funções & Permissões</span>
          </Button>
        </Link>
        <Link href="/admin/access">
          <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
            <Key className="h-6 w-6 mb-2" />
            <span className="text-sm">Controle de Acesso</span>
          </Button>
        </Link>
        <Link href="/admin/audit">
          <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
            <Activity className="h-6 w-6 mb-2" />
            <span className="text-sm">Auditoria</span>
          </Button>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription>
            Últimas atividades de administração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: 'Usuário criado',
                user: 'Ana Silva',
                timestamp: '2024-01-15T14:30:00Z',
                type: 'success'
              },
              {
                action: 'Permissões alteradas',
                user: 'Carlos Santos',
                timestamp: '2024-01-15T12:15:00Z',
                type: 'info'
              },
              {
                action: 'Usuário suspenso',
                user: 'João Oliveira',
                timestamp: '2024-01-15T10:45:00Z',
                type: 'warning'
              },
              {
                action: 'Login realizado',
                user: 'Maria Costa',
                timestamp: '2024-01-15T09:20:00Z',
                type: 'success'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'success' ? 'bg-green-100' :
                  activity.type === 'warning' ? 'bg-yellow-100' :
                  activity.type === 'info' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {activity.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : activity.type === 'warning' ? (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <Activity className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{activity.action}</h4>
                  <p className="text-sm text-gray-500">
                    {activity.user} • {new Date(activity.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

