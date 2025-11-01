'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  Image, 
  Video, 
  FileText, 
  Download,
  Share,
  Eye,
  Edit,
  Trash2,
  Upload,
  Grid,
  List,
  Calendar,
  User,
  Lock,
  Unlock,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import { formatFileSize } from '@/lib/utils'
import { AssetsService, AssetDto, GetAssetsResponse } from '@/lib/api/assets'

export default function AssetsPage() {
  const [assets, setAssets] = useState<AssetDto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'Image' | 'Video' | 'Document' | 'Audio'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<AssetDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Carregar assets da API
  useEffect(() => {
    const loadAssets = async () => {
      try {
        console.log('🔍 Carregando assets da API...')
        const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
        
        const queryParams = {
          pageNumber: 1,
          pageSize: 50,
          searchTerm: searchTerm || undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          organizationId: organizationId
        }
        
        const response = await AssetsService.getAssets(queryParams)
        console.log('✅ Assets carregados:', response)
        setAssets(response.assets)
        setError('')
      } catch (err: any) {
        console.error('❌ Erro ao carregar assets:', err)
        setError(err.message || 'Erro ao carregar assets')
      } finally {
        setIsLoading(false)
      }
    }

    loadAssets()
  }, [searchTerm, typeFilter])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Image':
        return <Image className="h-5 w-5" />
      case 'Video':
        return <Video className="h-5 w-5" />
      case 'Document':
        return <FileText className="h-5 w-5" />
      case 'Audio':
        return <FileText className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Image':
        return 'bg-green-100 text-green-800'
      case 'Video':
        return 'bg-blue-100 text-blue-800'
      case 'Document':
        return 'bg-yellow-100 text-yellow-800'
      case 'Audio':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDeleteClick = (asset: AssetDto) => {
    setAssetToDelete(asset)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return
    
    setIsDeleting(true)
    try {
      console.log('🗑️ Excluindo asset:', assetToDelete.id)
      await AssetsService.deleteAsset(assetToDelete.id)
      console.log('✅ Asset excluído com sucesso')
      
      const updatedAssets = assets.filter(a => a.id !== assetToDelete.id)
      setAssets(updatedAssets)
      
      setShowDeleteModal(false)
      setAssetToDelete(null)
    } catch (err: any) {
      console.error('❌ Erro ao excluir asset:', err)
      alert('Erro ao excluir asset: ' + (err.message || 'Erro desconhecido'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setAssetToDelete(null)
  }

  const totalAssets = assets.length
  const imageAssets = assets.filter(a => a.type === 'Image').length
  const videoAssets = assets.filter(a => a.type === 'Video').length
  const documentAssets = assets.filter(a => a.type === 'Document').length

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
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Assets de Marketing</h1>
          <p className="text-sm sm:text-base text-gray-600">Gerencie seus assets de marketing</p>
        </div>
        <Link href="/marketing/assets/upload" className="flex-shrink-0">
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Asset</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{totalAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                <Image className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Imagens</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{imageAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <Video className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Vídeos</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{videoAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg flex-shrink-0">
                <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Documentos</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{documentAssets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'Image' | 'Video' | 'Document' | 'Audio')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm flex-shrink-0 min-w-[140px]"
          >
            <option value="all">Todos os Tipos</option>
            <option value="Image">Imagem</option>
            <option value="Video">Vídeo</option>
            <option value="Document">Documento</option>
            <option value="Audio">Áudio</option>
          </select>
          
          {/* View Mode Toggle */}
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
        </div>
      </div>

      {/* Assets List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {assets.map((asset) => (
            <Card key={asset.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      {getTypeIcon(asset.type)}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                      <p className="text-sm text-gray-500">{asset.organizationName}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(asset.type)}`}>
                      {asset.type}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{asset.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tamanho:</span>
                    <span className="text-sm font-semibold">{formatFileSize(asset.fileSize)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {asset.eventName}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/marketing/assets/${asset.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                  <Link href={`/marketing/assets/${asset.id}/edit`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDeleteClick(asset)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {assets.map((asset) => (
            <Card key={asset.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {getTypeIcon(asset.type)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{asset.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 break-words">
                        {asset.type}
                        {asset.description && ` • ${asset.description}`}
                        {asset.organizationName && ` • ${asset.organizationName}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-4 lg:gap-6">
                    {/* Values Grid */}
                    {asset.eventName && (
                      <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:gap-6 sm:flex sm:items-center">
                        <div className="text-center">
                          <p className="text-xs sm:text-sm text-gray-500">Evento</p>
                          <p className="font-semibold text-sm sm:text-base truncate">{asset.eventName}</p>
                        </div>
                      </div>
                    )}
                    {/* Type Badge and Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getTypeColor(asset.type)}`}>
                        {asset.type}
                      </span>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/marketing/assets/${asset.id}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/marketing/assets/${asset.id}/edit`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                          onClick={() => handleDeleteClick(asset)}
                          title="Excluir asset"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {assets.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum asset encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || typeFilter !== 'all'
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece criando um novo asset.'
              }
            </p>
            {!searchTerm && typeFilter === 'all' && (
              <div className="mt-6">
                <Link href="/marketing/assets/upload">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Asset
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Asset"
        message={`Tem certeza que deseja excluir o asset "${assetToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}
