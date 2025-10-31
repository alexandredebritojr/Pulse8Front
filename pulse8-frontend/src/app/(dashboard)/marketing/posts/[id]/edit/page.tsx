'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MarketingPostForm from '@/components/marketing-posts/MarketingPostForm'
import { MarketingPostsService, MarketingPostDto, UpdateMarketingPostRequest } from '@/lib/api/marketing-posts'

export default function EditMarketingPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  
  const [post, setPost] = useState<MarketingPostDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

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

  const handleSubmit = async (data: UpdateMarketingPostRequest) => {
    try {
      setIsSaving(true)
      await MarketingPostsService.updateMarketingPost(postId, data)
      router.push('/marketing/posts')
    } catch (error) {
      console.error('Erro ao atualizar post:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do post...</p>
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

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Post não encontrado</div>
          <Link href="/marketing/posts">
            <Button>Voltar para Posts</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/marketing/posts">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Editar Post de Marketing</h1>
          <p className="text-gray-600">Edite as informações do post</p>
        </div>
      </div>

      {/* Form */}
      <MarketingPostForm
        mode="edit"
        postId={postId}
        initialData={post}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      />
    </div>
  )
}
