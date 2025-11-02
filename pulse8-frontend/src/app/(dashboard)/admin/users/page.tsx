'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Users, 
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Eye,
  Key,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  UserX,
  Crown,
  Award,
  Shield,
  Lock,
  Unlock,
  Settings,
  MoreHorizontal,
  Grid,
  List
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import { UsersService, UserDto } from '@/lib/api/users'

export default function UsersPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [users, setUsers] = useState<UserDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        const response = await UsersService.getUsers(
          currentPage,
          pageSize,
          searchTerm || undefined,
          filterStatus === 'all' ? undefined : filterStatus,
          organizationId,
          filterRole === 'all' ? undefined : filterRole
        )
        
        setUsers(response.users)
        setTotalCount(response.totalCount)
      } catch (err) {
        console.error('Erro ao carregar usuários:', err)
        setError('Erro ao carregar dados dos usuários')
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [currentPage, pageSize, searchTerm, filterStatus, filterRole])

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

  // API already filters the data, so we use users directly
  const filteredUsers = users

  const handleDeleteClick = (user: UserDto) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    
    setIsDeleting(true)
    try {
      console.log('🗑️ Excluindo usuário:', userToDelete.id)
      await UsersService.deleteUser(userToDelete.id)
      console.log('✅ Usuário excluído com sucesso')
      
      const updatedUsers = users.filter(u => u.id !== userToDelete.id)
      setUsers(updatedUsers)
      
      setShowDeleteModal(false)
      setUserToDelete(null)
    } catch (err: any) {
      console.error('❌ Erro ao excluir usuário:', err)
      alert('Erro ao excluir usuário: ' + (err.message || 'Erro desconhecido'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-100'
      case 'Inactive':
        return 'text-gray-600 bg-gray-100'
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'Suspended':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
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
        return <UserX className="h-4 w-4" />
      case 'Pending':
        return <Clock className="h-4 w-4" />
      case 'Suspended':
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
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link href="/admin" className="flex-shrink-0">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
            <p className="text-sm sm:text-base text-gray-600">Gerencie usuários e suas permissões</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
          <Link href="/admin/users/create" className="flex-shrink-0">
            <Button size="sm" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Usuário</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Total</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold truncate">{users.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
              <span className="text-green-600">+12%</span> vs anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Ativos</CardTitle>
            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600 truncate">
              {users.filter(u => u.status === 'Active').length}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
              <span className="text-green-600">+8%</span> vs anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Admins</CardTitle>
            <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-purple-600 truncate">
              {users.filter(u => u.roleName === 'admin').length}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
              <span className="text-green-600">+2%</span> vs anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Pendentes</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-yellow-600 truncate">
              {users.filter(u => u.status === 'Pending').length}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
              <span className="text-yellow-600">+1</span> vs anterior
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
        <div className="flex flex-wrap gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm flex-shrink-0 min-w-[140px]"
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm flex-shrink-0 min-w-[120px]"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              size="sm"
            >
              <Grid className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              size="sm"
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Users List/Grid */}
      {viewMode === 'list' ? (
        <div className="space-y-4 sm:gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 font-semibold">{user.firstName.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h4 className="font-medium text-lg truncate">{user.firstName} {user.lastName}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.roleName)}`}>
                          {user.roleName}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {getStatusIcon(user.status)}
                          <span className="ml-1">{getStatusText(user.status)}</span>
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1 min-w-0">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="break-words">{user.phone}</span>
                        </span>
                        <span className="flex items-center gap-1 min-w-0">
                          <Award className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{user.organizationName}</span>
                        </span>
                        {user.lastLoginAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span className="break-words">Último login: {new Date(user.lastLoginAt).toLocaleString('pt-BR')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => router.push(`/admin/users/edit/${user.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                      onClick={() => handleDeleteClick(user)}
                      title="Excluir usuário"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">{user.firstName.charAt(0)}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
                      <CardDescription>{user.roleName}</CardDescription>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {getStatusIcon(user.status)}
                    <span className="ml-1">{getStatusText(user.status)}</span>
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span>{user.organizationName}</span>
                  </div>
                </div>

                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.roleName)}`}>
                    {user.roleName}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/users/${user.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                  </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => router.push(`/admin/users/edit/${user.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDeleteClick(user)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Nenhum usuário cadastrado no sistema.'
            }
          </p>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Usuário"
        message={`Tem certeza que deseja excluir o usuário "${userToDelete?.firstName} ${userToDelete?.lastName}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}

