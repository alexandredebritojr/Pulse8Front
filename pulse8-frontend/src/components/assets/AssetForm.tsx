'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Package, MapPin, Calendar, DollarSign, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AssetsService, CreateAssetRequest, AssetDto } from '@/lib/api/assets'

interface AssetFormProps {
  mode: 'create' | 'edit'
  assetId?: string
}

export default function AssetForm({ mode, assetId }: AssetFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    filePath: '',
    fileSize: 0,
    mimeType: '',
    organizationId: '',
    eventId: '',
  })

  // Carregar dados do asset para edição
  useEffect(() => {
    if (mode === 'edit' && assetId) {
      const loadAsset = async () => {
        try {
          console.log('🔍 AssetForm: Carregando asset para edição...')
          const asset = await AssetsService.getAssetById(assetId)
          console.log('✅ AssetForm: Asset carregado:', asset)
          
          setFormData({
            name: asset.name,
            description: asset.description,
            type: asset.type,
            filePath: asset.filePath,
            fileSize: asset.fileSize,
            mimeType: asset.mimeType,
            organizationId: asset.organizationId,
            eventId: asset.eventId,
          })
        } catch (err: any) {
          console.error('❌ AssetForm: Erro ao carregar asset:', err)
          setError(err.message || 'Erro ao carregar asset')
        }
      }
      
      loadAsset()
    }
  }, [mode, assetId])

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
    setError('')

    try {
      console.log('🔍 AssetForm: Iniciando operação...')
      console.log('🔍 AssetForm: mode =', mode)
      console.log('🔍 AssetForm: formData =', formData)
      
      // Preparar dados para a API
      const assetData: CreateAssetRequest = {
        name: formData.name,
        description: formData.description,
        filePath: formData.filePath || `/uploads/${formData.name}`,
        fileSize: formData.fileSize,
        type: formData.type,
        mimeType: formData.mimeType || 'application/octet-stream',
        organizationId: formData.organizationId || localStorage.getItem('organizationId') || '00000000-0000-0000-0000-000000000000',
        eventId: formData.eventId || '00000000-0000-0000-0000-000000000000',
      }
      
      console.log('🔍 AssetForm: assetData =', assetData)
      
      if (mode === 'create') {
        const assetId = await AssetsService.createAsset(assetData)
        console.log('✅ AssetForm: Asset criado com ID:', assetId)
      } else if (mode === 'edit' && assetId) {
        await AssetsService.updateAsset(assetId, assetData)
        console.log('✅ AssetForm: Asset atualizado')
      }
      
      router.push('/assets')
    } catch (err: any) {
      console.error('❌ AssetForm: Erro na operação:', err)
      setError(err.message || 'Erro ao salvar asset')
    } finally {
      setIsLoading(false)
    }
  }

  const assetTypes = [
    'Image',
    'Video',
    'Audio',
    'Document',
    'PSD',
    'AI'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => router.push('/assets')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? 'Novo Asset' : 'Editar Asset'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create' 
              ? 'Cadastre um novo asset no sistema' 
              : 'Atualize as informações do asset'
            }
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
                <CardDescription>
                  Dados principais do asset
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Asset *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Mesa de Som Yamaha"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descreva o asset..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    required
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Selecione o tipo</option>
                      {assetTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                </div>
              </CardContent>
            </Card>



          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading 
                    ? (mode === 'create' ? 'Criando...' : 'Salvando...') 
                    : (mode === 'create' ? 'Criar Asset' : 'Salvar Alterações')
                  }
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/assets')}
                >
                  Cancelar
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Dicas</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Mantenha informações de localização atualizadas</p>
                <p>• Registre números de série para rastreamento</p>
                <p>• Acompanhe datas de garantia</p>
                <p>• Documente manutenções realizadas</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}




