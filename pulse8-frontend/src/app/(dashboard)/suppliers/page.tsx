'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Building, 
  Phone, 
  Mail, 
  MapPin,
  Star,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Grid,
  List
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatPhone } from '@/lib/utils'
import { SuppliersService, SupplierDto, GetSuppliersResponse } from '@/lib/api/suppliers'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Carregar fornecedores da API
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        console.log('🔍 Carregando fornecedores da API...')
        console.log('🔍 SuppliersService =', SuppliersService)
        console.log('🔍 SuppliersService.getSuppliers =', SuppliersService.getSuppliers)
        console.log('🔍 statusFilter =', statusFilter)
        console.log('🔍 searchTerm =', searchTerm)
        
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        const queryParams = {
          pageNumber: 1,
          pageSize: 50,
          searchTerm: searchTerm || undefined,
          status: statusFilter !== 'all' ? (statusFilter === 'active' ? 'Active' : 'Inactive') : undefined,
          organizationId: organizationId
        }
        console.log('🔍 Query params =', queryParams)
        
        const response = await SuppliersService.getSuppliers(queryParams)
        console.log('✅ Fornecedores carregados:', response)
        console.log('✅ Total de fornecedores:', response.suppliers.length)
        console.log('✅ Fornecedores:', response.suppliers.map(s => ({ id: s.id, name: s.name, status: s.status })))
        setSuppliers(response.suppliers)
        setError('')
      } catch (err: any) {
        console.error('❌ Erro ao carregar fornecedores:', err)
        console.error('❌ Stack trace:', err.stack)
        setError(err.message || 'Erro ao carregar fornecedores')
      } finally {
        setIsLoading(false)
      }
    }

    loadSuppliers()
  }, [searchTerm, statusFilter])

  // A filtragem agora é feita pela API

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const getStatusText = (status: string) => {
    return status === 'Active' ? 'Ativo' : 'Inativo'
  }

  const getStatusIcon = (status: string) => {
    return status === 'Active' 
      ? <CheckCircle className="h-4 w-4" />
      : <AlertCircle className="h-4 w-4" />
  }

  const getCategoryIcon = (name: string) => {
    if (name.toLowerCase().includes('som') || name.toLowerCase().includes('luz')) return '🎵'
    if (name.toLowerCase().includes('catering') || name.toLowerCase().includes('alimentação')) return '🍽️'
    if (name.toLowerCase().includes('segurança')) return '🛡️'
    if (name.toLowerCase().includes('decoração') || name.toLowerCase().includes('arte')) return '🎨'
    if (name.toLowerCase().includes('transporte')) return '🚗'
    return '🏢'
  }

  const getCategoryName = (name: string) => {
    if (name.toLowerCase().includes('som') || name.toLowerCase().includes('luz')) return 'Som & Iluminação'
    if (name.toLowerCase().includes('catering') || name.toLowerCase().includes('alimentação')) return 'Alimentação'
    if (name.toLowerCase().includes('segurança')) return 'Segurança'
    if (name.toLowerCase().includes('decoração') || name.toLowerCase().includes('arte')) return 'Decoração'
    if (name.toLowerCase().includes('transporte')) return 'Transporte'
    return 'Outros'
  }

  // Calcular estatísticas
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter(s => s.status === 'Active').length
  const inactiveSuppliers = suppliers.filter(s => s.status === 'Inactive').length

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
        <Button onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fornecedores</h1>
          <p className="text-gray-600">Gerencie todos os fornecedores e parceiros</p>
        </div>
        <Link href="/suppliers/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Fornecedor
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Fornecedores</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              Fornecedores cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              Em funcionamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Inativos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              Temporariamente indisponíveis
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
              placeholder="Buscar fornecedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
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
          {suppliers.length} fornecedor{suppliers.length !== 1 ? 'es' : ''} encontrado{suppliers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Suppliers Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(supplier.name)}</span>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                    {getStatusIcon(supplier.status)}
                    <span className="ml-1">{getStatusText(supplier.status)}</span>
                  </span>
                </div>
                <CardDescription>
                  {getCategoryName(supplier.name)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{formatPhone(supplier.phone)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{supplier.address}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Link href={`/suppliers/${supplier.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                  <Link href={`/suppliers/${supplier.id}/edit`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{getCategoryIcon(supplier.name)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{supplier.name}</h3>
                      <p className="text-sm text-gray-500">{getCategoryName(supplier.name)}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {supplier.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {formatPhone(supplier.phone)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {supplier.address}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                      {getStatusIcon(supplier.status)}
                      <span className="ml-1">{getStatusText(supplier.status)}</span>
                    </span>
                    <div className="flex gap-2">
                      <Link href={`/suppliers/${supplier.id}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/suppliers/${supplier.id}/edit`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
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
      {suppliers.length === 0 && (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum fornecedor encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece cadastrando seu primeiro fornecedor.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <div className="mt-6">
              <Link href="/suppliers/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Fornecedor
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

