'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Shield, 
  Plus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Key,
  Users,
  Crown,
  Award,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Settings,
  MoreHorizontal,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RolesService, RoleDto } from '@/lib/api/roles'

export default function RolesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // Load roles from API
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const response = await RolesService.getRoles({
          pageNumber: currentPage,
          pageSize: pageSize,
          searchTerm: searchTerm || undefined
        })
        
        setRoles(response.roles)
        setTotalCount(response.totalCount)
      } catch (err) {
        console.error('Erro ao carregar roles:', err)
        setError('Erro ao carregar dados das funções')
      } finally {
        setIsLoading(false)
      }
    }

    loadRoles()
  }, [currentPage, pageSize, searchTerm])

  // API already filters the data, so we use roles directly
  const filteredRoles = roles

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
          <Link href="/admin">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Funções & Permissões</h1>
            <p className="text-gray-600">Gerencie funções e permissões do sistema</p>
          </div>
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
          <Link href="/admin/roles/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Função
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funções</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+1</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funções do Sistema</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {roles.filter(r => r.isSystemRole).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Funções pré-definidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funções Personalizadas</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {roles.filter(r => !r.isSystemRole).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Funções criadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {roles.reduce((sum, role) => sum + role.userCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuários com funções
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar funções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>


      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Roles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => {
          return (
            <Card key={role.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${role.color} rounded-full flex items-center justify-center`}>
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.color}`}>
                    {role.isSystemRole ? 'Sistema' : 'Personalizada'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Usuários</span>
                  <span className="font-semibold">{role.userCount}</span>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">Nível de Acesso</h4>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {role.accessLevel}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                  <Link href={`/admin/roles/edit/${role.id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                  {!role.isSystemRole && (
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Permissions Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Referência de Permissões
          </CardTitle>
          <CardDescription>
            Lista completa de permissões disponíveis no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissions.map((permission) => (
              <div key={permission.id} className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900">{permission.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{permission.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

