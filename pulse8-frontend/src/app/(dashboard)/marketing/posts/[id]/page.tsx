'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Calendar, MessageSquare, Globe, Target, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ConfirmationModal from '@/components/ui/confirmation-modal'
import { MarketingPostsService, MarketingPostDto } from '@/lib/api/marketing-posts'

export default function MarketingPostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  
  const [post, setPost] = useState<MarketingPostDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const loadPost = async () => {
      try {
        setIsLoading(true)
        const postData = await MarketingPostsService.getMarketingPostById(postId)
        setPost(postData)
      } catch (error) {
        console.error('Erro ao carregar post:', error)
        setError('Erro ao carregar dados do post')
      } finally {
        setIsLoading(false)
      }
    }

    if (postId) {
      loadPost()
    }
  }, [postId])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'Publicado'
      case 'scheduled':
        return 'Agendado'
      case 'draft':
        return 'Rascunho'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return '📘'
      case 'instagram':
        return '📷'
      case 'twitter':
        return '🐦'
      case 'linkedin':
        return '💼'
      case 'youtube':
        return '📺'
      default:
        return '📱'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      await MarketingPostsService.deleteMarketingPost(postId)
      router.push('/marketing/posts')
    } catch (error) {
      console.error('Erro ao excluir post:', error)
      setDeleteError('Erro ao excluir o post. Tente novamente.')
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <Button onClick={() => router.push('/marketing/posts')}>Voltar</Button>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">Post não encontrado</div>
        <Button onClick={() => router.push('/marketing/posts')}>Voltar</Button>
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
            onClick={() => router.push('/marketing/posts')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{post.platform}</h1>
            <p className="text-sm sm:text-base text-gray-600">{getStatusText(post.status)}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/marketing/posts/${post.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </Link>
          <Button 
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Excluir</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conteúdo do Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap break-words">{post.content}</p>
              </div>
            </CardContent>
          </Card>

          {/* Post Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plataforma
                  </label>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl flex-shrink-0">{getPlatformIcon(post.platform)}</span>
                    <span className="text-gray-900 break-words">{post.platform}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Badge className={getStatusColor(post.status)}>
                    {getStatusText(post.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Agendamento
                </label>
                <p className="text-gray-900">{formatDate(post.scheduledDate)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID da Campanha
                </label>
                <p className="text-gray-900 font-mono text-sm bg-gray-100 p-2 rounded break-all overflow-wrap-anywhere">
                  {post.marketingCampaignId}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Platform & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Plataforma e Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plataforma
                </label>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-2xl flex-shrink-0">{getPlatformIcon(post.platform)}</span>
                  <span className="text-gray-900 break-words">{post.platform}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Badge className={getStatusColor(post.status)}>
                  {getStatusText(post.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Campaign */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Campanha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID da Campanha
                </label>
                <p className="text-gray-900 font-mono text-sm break-all">{post.marketingCampaignId}</p>
              </div>
              
              {post.marketingCampaignName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Campanha
                  </label>
                  <p className="text-gray-900 break-words">{post.marketingCampaignName}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/marketing/posts/${post.id}/edit`} className="block">
                <Button className="w-full" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Post
                </Button>
              </Link>

              <Button 
                className="w-full text-red-600 hover:text-red-700" 
                variant="outline"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Post
              </Button>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between gap-2">
                <span className="text-gray-600 flex-shrink-0">ID:</span>
                <span className="font-mono text-sm break-all text-right">{post.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Plataforma:</span>
                <span className="break-words text-right">{post.platform}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-right">{getStatusText(post.status)}</span>
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
        title={deleteError ? "Erro ao Excluir Post" : "Excluir Post"}
        message={
          deleteError 
            ? deleteError
            : `Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.`
        }
        confirmText={deleteError ? "OK" : "Excluir"}
        cancelText={deleteError ? "" : "Cancelar"}
        isLoading={isDeleting}
        variant={deleteError ? "warning" : "danger"}
      />
    </div>
  )
}
