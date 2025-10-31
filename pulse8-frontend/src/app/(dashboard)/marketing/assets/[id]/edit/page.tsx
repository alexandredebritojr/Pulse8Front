'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, X, Image, Video, FileText, Music, Palette, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AssetType } from '@/types/api'
import { EventsService, EventDto } from '@/lib/api/events'
import { AssetsService, AssetDto } from '@/lib/api/assets'

export default function EditAssetPage() {
  const router = useRouter()
  const params = useParams()
  const assetId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [isLoadingAsset, setIsLoadingAsset] = useState(true)
  const [events, setEvents] = useState<EventDto[]>([])
  const [asset, setAsset] = useState<AssetDto | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: AssetType.Image,
    eventId: '',
  })

  // Carregar dados do asset
  useEffect(() => {
    const loadAsset = async () => {
      try {
        setIsLoadingAsset(true)
        const assetData = await AssetsService.getAssetById(assetId)
        setAsset(assetData)
        
        setFormData({
          name: assetData.name,
          description: assetData.description,
          type: assetData.type as AssetType,
          eventId: assetData.eventId || '', // Usar eventId do asset
        })

        // Criar um arquivo virtual baseado no asset existente para mostrar na seção de arquivos
        if (assetData.filePath) {
          const existingFile = new File([''], assetData.name, {
            type: assetData.mimeType || 'application/octet-stream'
          })
          // Adicionar propriedades customizadas para simular o arquivo existente
          Object.defineProperty(existingFile, 'size', { value: assetData.fileSize || 0 })
          setSelectedFiles([existingFile])
        }
      } catch (error) {
        console.error('Erro ao carregar asset:', error)
        alert('Erro ao carregar dados do asset')
      } finally {
        setIsLoadingAsset(false)
      }
    }

    if (assetId) {
      loadAsset()
    }
  }, [assetId])

  // Carregar eventos
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoadingEvents(true)
        const eventsData = await EventsService.getEvents({})
        setEvents(eventsData.events || [])
      } catch (error) {
        console.error('Erro ao carregar eventos:', error)
      } finally {
        setIsLoadingEvents(false)
      }
    }

    loadEvents()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
    
    if (files.length > 0) {
      const file = files[0]
      setFormData(prev => ({
        ...prev,
        name: file.name.split('.')[0], // Nome sem extensão
      }))
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Para edição, permitir atualizar sem trocar o arquivo
      let file = null
      if (selectedFiles.length > 0) {
        file = selectedFiles[0]
      }
      const organizationId = localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000'
      
      // Payload conforme esperado pela API
      const payload = {
        name: formData.name,
        description: formData.description,
        filePath: file ? `/uploads/${file.name}` : asset?.filePath || '', // Usar arquivo existente se não houver novo
        fileSize: file ? file.size : asset?.fileSize || 0, // Usar tamanho do asset existente
        type: formData.type,
        mimeType: file ? file.type : asset?.mimeType || '', // Usar mimeType do asset existente
        organizationId: organizationId,
        eventId: formData.eventId || '00000000-0000-0000-0000-000000000000'
      }

      console.log('📤 Enviando payload:', payload)

      // Usar AssetsService diretamente, seguindo o padrão do MarketingForm
      const updatedAssetId = await AssetsService.updateAsset(assetId, payload)
      console.log('✅ Asset atualizado com ID:', updatedAssetId)
      
      router.push('/marketing/assets')
    } catch (error) {
      console.error('Erro ao atualizar asset:', error)
      alert('Erro ao atualizar o asset')
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

  if (isLoadingAsset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do asset...</p>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Asset</h1>
          <p className="text-gray-600">Atualize as informações do asset de marketing</p>
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
                    {asset && selectedFiles.length === 1 && selectedFiles[0].name === asset.name && (
                      <span className="text-blue-600 ml-2">(Arquivo atual)</span>
                    )}
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
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva o asset..."
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione o tipo</option>
                      <option value={AssetType.Image}>Imagem</option>
                      <option value={AssetType.Video}>Vídeo</option>
                      <option value={AssetType.Audio}>Áudio</option>
                      <option value={AssetType.Document}>Documento</option>
                      <option value={AssetType.PSD}>PSD</option>
                      <option value={AssetType.AI}>AI</option>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isLoadingEvents}
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
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Atualizando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Atualizar Asset
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}