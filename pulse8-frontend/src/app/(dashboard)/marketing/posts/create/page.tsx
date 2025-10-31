'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MarketingPostForm from '@/components/marketing-posts/MarketingPostForm'
import { MarketingPostsService, CreateMarketingPostRequest } from '@/lib/api/marketing-posts'

export default function CreateMarketingPostPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: CreateMarketingPostRequest) => {
    try {
      setIsLoading(true)
      await MarketingPostsService.createMarketingPost(data)
      router.push('/marketing/posts')
    } catch (error) {
      console.error('Erro ao criar post:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Criar Post de Marketing</h1>
          <p className="text-gray-600">Crie um novo post para suas campanhas de marketing</p>
        </div>
      </div>

      {/* Form */}
      <MarketingPostForm
        mode="create"
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
