'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from './button'

interface BaseFormProps {
  mode: 'create' | 'edit'
  title: string
  subtitle: string
  backUrl: string
  isSaving: boolean
  error?: string
  onSubmit: (e: React.FormEvent) => void
  children: ReactNode
}

export default function BaseForm({
  mode,
  title,
  subtitle,
  backUrl,
  isSaving,
  error,
  onSubmit,
  children
}: BaseFormProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => router.push(backUrl)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {children}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href={backUrl}>
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving 
              ? (mode === 'create' ? 'Criando...' : 'Salvando...') 
              : (mode === 'create' ? 'Criar' : 'Salvar Alterações')
            }
          </Button>
        </div>
      </form>
    </div>
  )
}



