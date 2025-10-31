'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Key, 
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Users,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  Globe,
  Smartphone,
  Monitor,
  MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessService, AccessLogDto } from '@/lib/api/access'

export default function AccessPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [accessLogs, setAccessLogs] = useState<AccessLogDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // Load access logs from API
  useEffect(() => {
    const loadAccessLogs = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const response = await AccessService.getAccessLogs(
          currentPage,
          pageSize,
          searchTerm || undefined,
          filterType === 'all' ? undefined : filterType,
          filterStatus === 'all' ? undefined : filterStatus
        )
        
        setAccessLogs(response.accessLogs)
        setTotalCount(response.totalCount)
      } catch (err) {
        console.error('Erro ao carregar logs de acesso:', err)
        setError('Erro ao carregar dados de acesso')
      } finally {
        setIsLoading(false)
      }
    }

    loadAccessLogs()
  }, [currentPage, pageSize, searchTerm, filterType, filterStatus])

  const accessTypes = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'login', label: 'Login' },
    { value: 'permission', label: 'Permissão' },
    { value: 'resource', label: 'Recurso' },
    { value: 'api', label: 'API' }
  ]

  const statuses = [
    { value: 'all', label: 'Todos os status' },
    { value: 'granted', label: 'Concedido' },
    { value: 'denied', label: 'Negado' },
    { value: 'pending', label: 'Pendente' },
    { value: 'expired', label: 'Expirado' }
  ]

  // API already filters the data, so we use accessLogs directly
  const filteredLogs = accessLogs

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'text-green-600 bg-green-100'
      case 'Failed':
        return 'text-red-600 bg-red-100'
      case 'Blocked':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Success':
        return 'Sucesso'
      case 'Failed':
        return 'Falhou'
      case 'Blocked':
        return 'Bloqueado'
      default:
        return 'Desconhecido'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return <CheckCircle className="h-4 w-4" />
      case 'Failed':
        return <AlertCircle className="h-4 w-4" />
      case 'Blocked':
        return <Lock className="h-4 w-4" />
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Controle de Acesso</h1>
            <p className="text-gray-600">Monitore e gerencie acessos ao sistema</p>
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
          <Link href="/admin/access/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Regra
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Acessos</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos Concedidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {accessLogs.filter(log => log.status === 'Success').length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos Negados</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {accessLogs.filter(log => log.status === 'Failed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+3%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((accessLogs.filter(log => log.status === 'Success').length / accessLogs.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2%</span> vs mês anterior
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
              placeholder="Buscar acessos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {accessTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
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

      {/* Access Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Logs de Acesso
          </CardTitle>
          <CardDescription>
            Histórico detalhado de acessos ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    log.status === 'Success' ? 'bg-green-100' :
                    log.status === 'Failed' ? 'bg-red-100' :
                    log.status === 'Blocked' ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
                    {getStatusIcon(log.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{log.userName}</h4>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{log.action}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{log.resource}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        {log.ipAddress}
                      </span>
                      <span className="flex items-center gap-1">
                        {log.device.includes('iPhone') || log.device.includes('Android') ? (
                          <Smartphone className="h-4 w-4" />
                        ) : (
                          <Monitor className="h-4 w-4" />
                        )}
                        {log.device}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {log.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                    {getStatusIcon(log.status)}
                    <span className="ml-1">{getStatusText(log.status)}</span>
                  </span>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Access Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Regras de Acesso
          </CardTitle>
          <CardDescription>
            Configure regras de acesso e permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Acesso Administrativo',
                description: 'Acesso total ao sistema',
                users: 2,
                status: 'active',
                color: 'text-red-600 bg-red-100'
              },
              {
                name: 'Acesso a Eventos',
                description: 'Gerenciar eventos e convidados',
                users: 5,
                status: 'active',
                color: 'text-blue-600 bg-blue-100'
              },
              {
                name: 'Acesso a Relatórios',
                description: 'Visualizar relatórios',
                users: 3,
                status: 'active',
                color: 'text-green-600 bg-green-100'
              },
              {
                name: 'Acesso Limitado',
                description: 'Apenas visualização',
                users: 2,
                status: 'inactive',
                color: 'text-gray-600 bg-gray-100'
              }
            ].map((rule, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{rule.name}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rule.color}`}>
                    {rule.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{rule.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{rule.users} usuários</span>
                  <div className="flex gap-2">
                    <Link href={`/admin/access/edit/${index + 1}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Alertas de Segurança
          </CardTitle>
          <CardDescription>
            Alertas e notificações de segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: 'warning',
                title: 'Múltiplas tentativas de login',
                description: 'Usuário João Oliveira tentou fazer login 5 vezes em 10 minutos',
                timestamp: '2024-01-15T14:30:00Z'
              },
              {
                type: 'info',
                title: 'Novo dispositivo detectado',
                description: 'Ana Silva fez login de um novo dispositivo',
                timestamp: '2024-01-15T12:15:00Z'
              },
              {
                type: 'error',
                title: 'Acesso negado a recurso restrito',
                description: 'Carlos Santos tentou acessar configurações administrativas',
                timestamp: '2024-01-15T10:45:00Z'
              }
            ].map((alert, index) => (
              <div key={index} className={`p-4 border rounded-lg ${
                alert.type === 'error' ? 'border-red-200 bg-red-50' :
                alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    alert.type === 'error' ? 'bg-red-100' :
                    alert.type === 'warning' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    {alert.type === 'error' ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : alert.type === 'warning' ? (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <Activity className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm text-gray-500">{alert.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(alert.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

