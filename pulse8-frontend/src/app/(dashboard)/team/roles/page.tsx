'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  Briefcase, 
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Grid,
  List,
  Award,
  BarChart3,
  Clock,
  Target,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { RolesService, RoleDto, GetRolesResponse } from '@/lib/api/roles'


export default function RolesPage() {
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<'all' | 'Produção' | 'Marketing' | 'Operações' | 'Financeiro' | 'RH' | 'Tecnologia' | 'Vendas' | 'Atendimento'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Carregar dados da API
  useEffect(() => {
    const loadRoles = async () => {
      try {
        console.log('🔍 Carregando roles da API...')
        const response = await RolesService.getRoles({
          pageNumber: 1,
          pageSize: 50,
          searchTerm: searchTerm || undefined,
          sortBy: 'name'
        })
        console.log('✅ Roles carregados:', response)
        setRoles(response.roles)
        setError('')
      } catch (err: any) {
        console.error('❌ Erro ao carregar roles:', err)
        setError(err.message || 'Erro ao carregar roles')
      } finally {
        setIsLoading(false)
      }
    }

    loadRoles()
  }, [searchTerm])

  const filteredRoles = roles.filter(role => {
    // A busca já é feita na API, então só aplicamos o filtro de departamento se necessário
    // Por enquanto, vamos manter todos os roles já que não temos departamento na API
    return true
  })

  const getStatusColor = (isSystemRole: boolean) => {
    return isSystemRole 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800'
  }

  const getStatusText = (isSystemRole: boolean) => {
    return isSystemRole ? 'Sistema' : 'Personalizado'
  }

  const getStatusIcon = (isSystemRole: boolean) => {
    return isSystemRole 
      ? <Award className="h-4 w-4" />
      : <CheckCircle className="h-4 w-4" />
  }


  // Calcular estatísticas
  const totalRoles = roles.length
  const systemRoles = roles.filter(r => r.isSystemRole).length
  const customRoles = roles.filter(r => !r.isSystemRole).length
  const totalMembers = roles.reduce((sum, r) => sum + r.userCount, 0)

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
          <h1 className="text-3xl font-bold text-gray-900">Funções e Cargos</h1>
          <p className="text-gray-600">Gerencie funções, cargos e responsabilidades da equipe</p>
        </div>
        <Link href="/team/roles/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Função
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funções</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRoles}</div>
            <p className="text-xs text-muted-foreground">
              Funções cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funções do Sistema</CardTitle>
            <Award className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{systemRoles}</div>
            <p className="text-xs text-muted-foreground">
              Pré-definidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Membros alocados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funções Personalizadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{customRoles}</div>
            <p className="text-xs text-muted-foreground">
              Criadas pela organização
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
              placeholder="Buscar funções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value as 'all' | 'Produção' | 'Marketing' | 'Operações' | 'Financeiro' | 'RH' | 'Tecnologia' | 'Vendas' | 'Atendimento')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos os departamentos</option>
            <option value="Produção">Produção</option>
            <option value="Marketing">Marketing</option>
            <option value="Operações">Operações</option>
            <option value="Financeiro">Financeiro</option>
            <option value="RH">RH</option>
            <option value="Tecnologia">Tecnologia</option>
            <option value="Vendas">Vendas</option>
            <option value="Atendimento">Atendimento</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          {filteredRoles.length} função{filteredRoles.length !== 1 ? 'ões' : ''} encontrada{filteredRoles.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Roles Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <CardDescription>
                      <span className="text-sm text-gray-500">
                        Nível de Acesso: {role.accessLevel}
                      </span>
                    </CardDescription>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(role.isSystemRole)}`}>
                    {getStatusIcon(role.isSystemRole)}
                    <span className="ml-1">{getStatusText(role.isSystemRole)}</span>
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{role.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Usuários:</span>
                    <span className="font-medium">{role.userCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cor:</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border" 
                        style={{ backgroundColor: role.color }}
                      ></div>
                      <span className="text-xs text-gray-500">{role.color}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/team/roles/${role.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/team/roles/${role.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{role.name}</h3>
                        <p className="text-sm text-gray-500">{role.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                          <span className="font-medium">Nível: {role.accessLevel}</span>
                          <span className="text-blue-600">{role.userCount} usuário{role.userCount !== 1 ? 's' : ''}</span>
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-3 h-3 rounded-full border" 
                              style={{ backgroundColor: role.color }}
                            ></div>
                            <span className="text-xs">{role.color}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(role.isSystemRole)}`}>
                      {getStatusIcon(role.isSystemRole)}
                      <span className="ml-1">{getStatusText(role.isSystemRole)}</span>
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/team/roles/${role.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/team/roles/${role.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredRoles.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma função encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || departmentFilter !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece criando sua primeira função.'
            }
          </p>
          {!searchTerm && departmentFilter === 'all' && (
            <div className="mt-6">
              <Link href="/team/roles/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Função
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

