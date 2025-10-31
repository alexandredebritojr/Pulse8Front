'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, X, Image, Video, FileText, Music, Palette, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AssetType } from '@/types/api'
import { EventsService, EventDto } from '@/lib/api/events'
import { AssetsService } from '@/lib/api/assets'

export default function UploadAssetPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [events, setEvents] = useState<EventDto[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    filePath: '',
    originalName: '',
    contentType: '',
    fileSize: 0,
    type: AssetType.Image,
    eventId: '',
  })

  // Carregar eventos da API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoadingEvents(true)
        const eventsResponse = await EventsService.getEvents({ pageSize: 100 })
        setEvents(eventsResponse.events)
      } catch (err: any) {
        console.error('❌ Erro ao carregar eventos:', err)
      } finally {
        setIsLoadingEvents(false)
      }
    }

    loadEvents()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
    
    // Preencher campos do arquivo automaticamente
    if (files.length > 0) {
      const file = files[0]
      setFormData(prev => ({
        ...prev,
        originalName: file.name,
        contentType: file.type,
        fileSize: file.size,
        name: file.name.split('.')[0], // Nome sem extensão
      }))
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (selectedFiles.length === 0) {
        alert('Por favor, selecione pelo menos um arquivo')
        return
      }

      const file = selectedFiles[0]
      const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
      
      // Payload conforme esperado pela API
      const payload = {
        name: formData.name,
        description: formData.description,
        filePath: `/uploads/${file.name}`, // Caminho do arquivo
        fileSize: file.size,
        type: formData.type,
        mimeType: file.type,
        organizationId: organizationId,
        eventId: formData.eventId || '00000000-0000-0000-0000-000000000000'
      }

      console.log('📤 Enviando payload:', payload)

      // Usar AssetsService diretamente, seguindo o padrão do MarketingForm
      const assetId = await AssetsService.createAsset(payload)
      console.log('✅ Asset criado com ID:', assetId)
      
      router.push('/marketing/assets')
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao fazer upload do arquivo')
    } finally {
      setIsLoading(false)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-6 w-6 text-blue-500" />
    if (file.type.startsWith('video/')) return <Video className="h-6 w-6 text-red-500" />
    if (file.type.startsWith('audio/')) return <Music className="h-6 w-6 text-purple-500" />
    if (file.type.includes('pdf') || file.type.includes('document')) return <FileText className="h-6 w-6 text-gray-500" />
    if (file.type.includes('psd')) return <Palette className="h-6 w-6 text-pink-500" />
    return <FileText className="h-6 w-6 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload de Assets</h1>
          <p className="text-gray-600">Faça upload de novos assets para seu marketing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Selecionar Arquivos
                </CardTitle>
                <CardDescription>
                  Selecione os arquivos que deseja fazer upload
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Clique para selecionar arquivos ou arraste e solte aqui
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Suporta imagens, vídeos, áudios, documentos e arquivos de design
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.psd,.ai"
                />
              </CardContent>
            </Card>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Arquivos Selecionados</CardTitle>
                  <CardDescription>
                    {selectedFiles.length} arquivo{selectedFiles.length !== 1 ? 's' : ''} selecionado{selectedFiles.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file)}
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Asset Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Asset</CardTitle>
                <CardDescription>
                  Preencha as informações sobre o asset
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Banner Festival Verão 2024"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descreva o asset..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo *
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={AssetType.Image}>Imagem</option>
                      <option value={AssetType.Video}>Vídeo</option>
                      <option value={AssetType.Audio}>Áudio</option>
                      <option value={AssetType.Document}>Documento</option>
                      <option value={AssetType.PSD}>PSD</option>
                      <option value={AssetType.AI}>AI</option>
                      <option value={AssetType.Other}>Outros</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-1">
                      Evento *
                    </label>
                    <select
                      id="eventId"
                      name="eventId"
                      value={formData.eventId}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Selecione um evento</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/marketing/assets">
            <Button variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading || selectedFiles.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Fazendo Upload...' : 'Fazer Upload'}
          </Button>
        </div>
      </form>
    </div>
  )
}

