'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Download, Eye, Calendar, User, FileText, Image, Video, Music, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import { AssetsService, AssetDto } from '@/lib/api/assets'

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assetId = params.id as string
  
  const [asset, setAsset] = useState<AssetDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const loadAsset = async () => {
      try {
        setIsLoading(true)
        const assetData = await AssetsService.getAssetById(assetId)
        setAsset(assetData)
      } catch (error) {
        console.error('Erro ao carregar asset:', error)
        setError('Erro ao carregar dados do asset')
      } finally {
        setIsLoading(false)
      }
    }

    if (assetId) {
      loadAsset()
    }
  }, [assetId])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Image':
        return <Image className="h-6 w-6 text-blue-500" />
      case 'Video':
        return <Video className="h-6 w-6 text-red-500" />
      case 'Audio':
        return <Music className="h-6 w-6 text-purple-500" />
      case 'Document':
        return <FileText className="h-6 w-6 text-gray-500" />
      case 'PSD':
        return <Palette className="h-6 w-6 text-pink-500" />
      default:
        return <FileText className="h-6 w-6 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleDeleteClick = () => {
    setDeleteError('')
    setShowDeleteModal(true)
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setDeleteError('')
  }

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true)
      setDeleteError('')
      await AssetsService.deleteAsset(assetId)
      router.push('/marketing/assets')
    } catch (error) {
      console.error('Erro ao excluir asset:', error)
      setDeleteError('Erro ao excluir o asset. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteClose = () => {
    setShowDeleteModal(false)
    setDeleteError('')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do asset...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ {error}</div>
          <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Asset não encontrado</div>
          <Link href="/marketing/assets">
            <Button>Voltar para Assets</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/marketing/assets">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{asset.name}</h1>
          <p className="text-gray-600">Detalhes do asset de marketing</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/marketing/assets/${asset.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button variant="outline" onClick={handleDeleteClick} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Asset Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTypeIcon(asset.type)}
                Visualização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                {asset.type === 'Image' ? (
                  <img 
                    src={asset.filePath} 
                    alt={asset.name}
                    className="max-h-full max-w-full object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : (
                  <div className="text-center">
                    {getTypeIcon(asset.type)}
                    <p className="mt-2 text-gray-600">{asset.name}</p>
                    <p className="text-sm text-gray-500">{asset.type}</p>
                  </div>
                )}
                <div className="hidden text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto" />
                  <p className="mt-2 text-gray-600">Preview não disponível</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asset Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Asset</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <p className="text-gray-900">{asset.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <p className="text-gray-900">{asset.description || 'Sem descrição'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(asset.type)}
                    <span className="text-gray-900">{asset.type}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tamanho
                  </label>
                  <p className="text-gray-900">{formatFileSize(asset.fileSize)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caminho do Arquivo
                </label>
                <p className="text-gray-900 font-mono text-sm bg-gray-100 p-2 rounded">
                  {asset.filePath}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo MIME
                </label>
                <p className="text-gray-900">{asset.mimeType}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Organization & Event */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Organização e Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organização
                </label>
                <p className="text-gray-900">{asset.organizationName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evento
                </label>
                <p className="text-gray-900">{asset.eventName}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Link href={`/marketing/assets/${asset.id}/edit`} className="block">
                <Button className="w-full" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Asset
                </Button>
              </Link>

              <Button 
                className="w-full text-red-600 hover:text-red-700" 
                variant="outline"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Asset
              </Button>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-mono text-sm">{asset.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span>{asset.type}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tamanho:</span>
                <span>{formatFileSize(asset.fileSize)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={deleteError ? handleDeleteClose : handleDeleteCancel}
        onConfirm={deleteError ? handleDeleteClose : handleDeleteConfirm}
        title={deleteError ? "Erro ao Excluir Asset" : "Excluir Asset"}
        message={
          deleteError 
            ? deleteError
            : `Tem certeza que deseja excluir o asset "${asset?.name}"? Esta ação não pode ser desfeita.`
        }
        confirmText={deleteError ? "OK" : "Excluir"}
        cancelText={deleteError ? "" : "Cancelar"}
        isLoading={isDeleting}
        variant={deleteError ? "warning" : "danger"}
      />
    </div>
  )
}
