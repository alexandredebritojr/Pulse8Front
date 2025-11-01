'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Calendar, MessageSquare, Eye, Edit, Trash2, MoreHorizontal, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MarketingPostsService, MarketingPostDto, GetMarketingPostsResponse } from '@/lib/api/marketing-posts'
import ConfirmationModal from '@/components/ui/confirmation-modal'

export default function MarketingPostsPage() {
  const [posts, setPosts] = useState<MarketingPostDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [postToDelete, setPostToDelete] = useState<MarketingPostDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await MarketingPostsService.getMarketingPosts(currentPage, 10, searchTerm || undefined)
      setPosts(response.posts)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Erro ao carregar posts:', error)
      setError('Erro ao carregar posts de marketing')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleDeleteClick = (post: MarketingPostDto) => {
    setPostToDelete(post)
    setDeleteError('')
    setShowDeleteModal(true)
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setPostToDelete(null)
    setDeleteError('')
  }

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return

    try {
      setIsDeleting(true)
      setDeleteError('')
      await MarketingPostsService.deleteMarketingPost(postToDelete.id)
      await loadPosts()
      setShowDeleteModal(false)
      setPostToDelete(null)
    } catch (error) {
      console.error('Erro ao excluir post:', error)
      setDeleteError('Erro ao excluir o post. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteClose = () => {
    setShowDeleteModal(false)
    setPostToDelete(null)
    setDeleteError('')
  }

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando posts de marketing...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ {error}</div>
          <Button onClick={loadPosts}>Tentar Novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Posts de Marketing</h1>
          <p className="text-sm sm:text-base text-gray-600">Gerencie seus posts de marketing</p>
        </div>
        <Link href="/marketing/posts/create" className="flex-shrink-0">
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Post</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <MessageSquare className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{posts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Publicados</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  {posts.filter(p => p.status.toLowerCase() === 'published').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Agendados</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  {posts.filter(p => p.status.toLowerCase() === 'scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-gray-100 rounded-lg flex-shrink-0">
                <MessageSquare className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Rascunhos</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  {posts.filter(p => p.status.toLowerCase() === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-shrink-0">
            <Filter className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>
          
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

      {/* Posts Display */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-4"
      }>
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            {viewMode === 'grid' ? (
              // Grid Layout
              <>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl flex-shrink-0">{getPlatformIcon(post.platform)}</span>
                      <CardTitle className="text-lg truncate">{post.platform}</CardTitle>
                    </div>
                    <Badge className={`${getStatusColor(post.status)} flex-shrink-0`}>
                      {getStatusText(post.status)}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-3 break-words">
                    {post.content || 'Sem conteúdo'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{formatDate(post.scheduledDate)}</span>
                    </div>
                    {post.marketingCampaignName && (
                      <div className="text-sm text-gray-600 truncate">
                        Campanha: {post.marketingCampaignName}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Link href={`/marketing/posts/${post.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </Link>
                    <Link href={`/marketing/posts/${post.id}/edit`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleDeleteClick(post)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              // List Layout
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-2xl flex-shrink-0">{getPlatformIcon(post.platform)}</span>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{post.platform}</h3>
                      <Badge className={getStatusColor(post.status)}>
                        {getStatusText(post.status)}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 mb-3 line-clamp-2 break-words">{post.content}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="break-words">{formatDate(post.scheduledDate)}</span>
                      </span>
                      {post.marketingCampaignName && (
                        <span className="break-words">Campanha: {post.marketingCampaignName}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/marketing/posts/${post.id}`}>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/marketing/posts/${post.id}/edit`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleDeleteClick(post)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

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
