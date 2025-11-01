'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Building, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  DollarSign,
  Star,
  CheckCircle,
  AlertCircle,
  Users,
  FileText,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatPhone } from '@/lib/utils'
import { SuppliersService, SupplierDto } from '@/lib/api/suppliers'

export default function SupplierDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [supplier, setSupplier] = useState<SupplierDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Carregar dados do fornecedor da API
  useEffect(() => {
    const loadSupplier = async () => {
      try {
        console.log('🔍 SupplierDetailsPage: Carregando fornecedor...')
        const supplierData = await SuppliersService.getSupplierById(params.id as string)
        console.log('✅ SupplierDetailsPage: Fornecedor carregado:', supplierData)
        setSupplier(supplierData)
        setError('')
      } catch (err: any) {
        console.error('❌ SupplierDetailsPage: Erro ao carregar fornecedor:', err)
        setError(err.message || 'Erro ao carregar fornecedor')
      } finally {
        setIsLoading(false)
      }
    }

    loadSupplier()
  }, [params.id])

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

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      // Simular exclusão
      router.push('/suppliers')
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
        <Button onClick={() => router.push('/suppliers')}>Voltar</Button>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">Fornecedor não encontrado</div>
        <Button onClick={() => router.push('/suppliers')}>Voltar</Button>
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
            onClick={() => router.push('/suppliers')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{supplier.name}</h1>
            <p className="text-sm sm:text-base text-gray-600">{getStatusText(supplier.status)}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/suppliers/${supplier.id}/edit`}>
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
                <Building className="h-5 w-5" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600 break-words">{supplier.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Telefone</p>
                    <p className="text-sm text-gray-600 break-words">{formatPhone(supplier.phone)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:col-span-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Endereço</p>
                    <p className="text-sm text-gray-600 break-words">
                      {supplier.address}
                      {supplier.city && `, ${supplier.city}`}
                      {supplier.state && ` - ${supplier.state}`}
                      {supplier.zipCode && `, ${supplier.zipCode}`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Categoria e Especialização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getCategoryIcon(supplier.name)}</span>
                <div>
                  <p className="font-medium">{getCategoryName(supplier.name)}</p>
                  <p className="text-sm text-gray-500">Categoria principal do fornecedor</p>
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
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Fornecedor cadastrado</p>
                    <p className="text-sm text-gray-500">{formatDate(supplier.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Edit className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Informações atualizadas</p>
                    <p className="text-sm text-gray-500">{formatDate(supplier.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Eventos Contratados</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Valor Total</span>
                <span className="font-semibold">R$ 45.000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Avaliação Média</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-semibold">4.8</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Novo Orçamento
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Reunião
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Ver Contratos
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Star className="h-4 w-4 mr-2" />
                Avaliar Serviço
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
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                Ver no Mapa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

