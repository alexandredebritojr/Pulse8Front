'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  Clock, 
  Megaphone,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Image,
  FileText,
  Plus,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PostingSchedule, PostingStatus } from '@/types/api'

export default function CreateSchedulePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    platform: 'Instagram',
    scheduledTime: '',
    eventId: '',
    assetId: ''
  })

  const [attachments, setAttachments] = useState<Array<{
    id: string
    name: string
    type: string
    size: number
  }>>([])

  const platforms = [
    { value: 'Instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { value: 'Facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { value: 'Twitter', label: 'Twitter', icon: Twitter, color: 'text-blue-400' },
    { value: 'LinkedIn', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
    { value: 'YouTube', label: 'YouTube', icon: Youtube, color: 'text-red-600' }
  ]

  const events = [
    { id: 'event-1', name: 'Festival de Verão 2024' },
    { id: 'event-2', name: 'Workshop Marketing Digital' },
    { id: 'event-3', name: 'Conferência Tech 2024' }
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newAttachments = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size
      }))
      setAttachments(prev => [...prev, ...newAttachments])
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simular criação do post
      const newSchedule: PostingSchedule = {
        id: Date.now().toString(),
        eventId: formData.eventId,
        title: formData.title,
        content: formData.content,
        scheduledTime: formData.scheduledTime,
        platform: formData.platform,
        status: PostingStatus.Scheduled,
        assetId: formData.assetId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log('Novo post criado:', newSchedule)
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirecionar para a lista
      window.location.href = '/marketing/schedules'
    } catch (error) {
      console.error('Erro ao criar post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.value === platform)
    if (platformData) {
      const Icon = platformData.icon
      return <Icon className={`h-5 w-5 ${platformData.color}`} />
    }
    return <Megaphone className="h-5 w-5 text-gray-600" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/marketing/schedules">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Criar Novo Post</h1>
          <p className="text-gray-600">Agende um post para suas redes sociais</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Informações do Post
            </CardTitle>
            <CardDescription>
              Configure o conteúdo e plataforma do seu post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Post
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Post Instagram - Lineup"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plataforma
                </label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {platforms.map(platform => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Digite o conteúdo do seu post..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evento
                </label>
                <select
                  name="eventId"
                  value={formData.eventId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Selecione um evento</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data e Hora de Publicação
                </label>
                <Input
                  name="scheduledTime"
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anexos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Anexos
            </CardTitle>
            <CardDescription>
              Adicione imagens, vídeos ou outros arquivos ao seu post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Plus className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Clique para adicionar arquivos ou arraste e solte aqui
                </span>
                <span className="text-xs text-gray-500">
                  Imagens, vídeos, PDFs e documentos são aceitos
                </span>
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Arquivos Anexados</h4>
                {attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPlatformIcon(formData.platform)}
              Preview do Post
            </CardTitle>
            <CardDescription>
              Como seu post aparecerá na plataforma selecionada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                {getPlatformIcon(formData.platform)}
                <div>
                  <p className="font-medium text-gray-900">{formData.platform}</p>
                  <p className="text-sm text-gray-500">
                    {formData.scheduledTime 
                      ? new Date(formData.scheduledTime).toLocaleString('pt-BR')
                      : 'Data não selecionada'
                    }
                  </p>
                </div>
              </div>
              {formData.title && (
                <h3 className="font-semibold text-gray-900 mb-2">{formData.title}</h3>
              )}
              {formData.content && (
                <p className="text-gray-700 whitespace-pre-wrap">{formData.content}</p>
              )}
              {attachments.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center gap-2 bg-white rounded p-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{attachment.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/marketing/schedules">
            <Button variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Criando...' : 'Criar Post'}
          </Button>
        </div>
      </form>
    </div>
  )
}










