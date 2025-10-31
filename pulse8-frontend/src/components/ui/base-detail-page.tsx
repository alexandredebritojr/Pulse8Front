'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BaseDetailPageProps {
  title: string
  subtitle: string
  backUrl: string
  editUrl?: string
  onDelete?: () => void
  isLoading?: boolean
  error?: string
  children: ReactNode
}

export default function BaseDetailPage({
  title,
  subtitle,
  backUrl,
  editUrl,
  onDelete,
  isLoading = false,
  error,
  children
}: BaseDetailPageProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <button onClick={() => router.push(backUrl)}>
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Button>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <button onClick={() => router.push(backUrl)}>
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Button>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <button onClick={() => router.push(backUrl)}>
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-gray-500">{subtitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {editUrl && (
            <Button asChild>
              <a href={editUrl}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </a>
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" onClick={onDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  )
}



