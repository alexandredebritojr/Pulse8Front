'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Clock, User, Calendar, MapPin, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckinService, CreateCheckinRequest, UpdateCheckinRequest, CheckinDto } from '@/lib/api/checkin'

interface CheckinFormProps {
  mode: 'create' | 'edit'
  checkinId?: string
}

export default function CheckinForm({ mode, checkinId }: CheckinFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    guestId: '',
    eventId: '',
    checkinTime: '',
    checkoutTime: '',
    status: 'Checked In',
    notes: '',
    location: '',
    staffMember: '',
  })

  // Carregar dados do checkin para edição
  useEffect(() => {
    if (mode === 'edit' && checkinId) {
      const loadCheckin = async () => {
        try {
          console.log('🔍 CheckinForm: Carregando checkin para edição...')
          const checkin = await CheckinService.getCheckinById(checkinId)
          console.log('✅ CheckinForm: Checkin carregado:', checkin)
          
          setFormData({
            guestId: checkin.guestId,
            eventId: checkin.eventId,
            checkinTime: checkin.checkinTime.split('T')[0] + 'T' + checkin.checkinTime.split('T')[1].substring(0, 5),
            checkoutTime: checkin.checkoutTime ? checkin.checkoutTime.split('T')[0] + 'T' + checkin.checkoutTime.split('T')[1].substring(0, 5) : '',
            status: checkin.status,
            notes: checkin.notes || '',
            location: checkin.location || '',
            staffMember: checkin.staffMember || '',
          })
        } catch (err: any) {
          console.error('❌ CheckinForm: Erro ao carregar checkin:', err)
          setError(err.message || 'Erro ao carregar checkin')
        }
      }
      
      loadCheckin()
    }
  }, [mode, checkinId])

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
      console.log('🔍 CheckinForm: Iniciando operação...')
      console.log('🔍 CheckinForm: mode =', mode)
      console.log('🔍 CheckinForm: formData =', formData)
      
      // Preparar dados para a API
      const checkinData: CreateCheckinRequest = {
        guestId: formData.guestId,
        eventId: formData.eventId,
        checkinTime: new Date(formData.checkinTime).toISOString(),
        checkoutTime: formData.checkoutTime ? new Date(formData.checkoutTime).toISOString() : undefined,
        status: formData.status,
        notes: formData.notes,
        location: formData.location,
        staffMember: formData.staffMember,
      }
      
      console.log('🔍 CheckinForm: checkinData =', checkinData)
      
      if (mode === 'create') {
        const checkinId = await CheckinService.createCheckin(checkinData)
        console.log('✅ CheckinForm: Checkin criado com ID:', checkinId)
      } else if (mode === 'edit' && checkinId) {
        const updateData: UpdateCheckinRequest = {
          ...checkinData,
          id: checkinId
        }
        await CheckinService.updateCheckin(checkinId, updateData)
        console.log('✅ CheckinForm: Checkin atualizado')
      }
      
      router.push('/guests/checkin')
    } catch (err: any) {
      console.error('❌ CheckinForm: Erro na operação:', err)
      // Capturar mensagem de erro detalhada do backend
      const errorMessage = err?.message || err?.response?.data?.message || 'Erro ao salvar check-in. Verifique se os dados estão corretos e tente novamente.'
      setError(errorMessage)
      
      // Log detalhado para debug
      if (err?.response?.data) {
        console.error('❌ Detalhes do erro:', err.response.data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions = [
    'Checked In',
    'Checked Out',
    'No Show'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => router.push('/guests/checkin')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? 'Novo Check-in' : 'Editar Check-in'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create' 
              ? 'Registre um novo check-in' 
              : 'Atualize as informações do check-in'
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
                  <User className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
                <CardDescription>
                  Dados principais do check-in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="guestId" className="block text-sm font-medium text-gray-700 mb-1">
                      ID do Convidado *
                    </label>
                    <Input
                      id="guestId"
                      name="guestId"
                      value={formData.guestId}
                      onChange={handleChange}
                      placeholder="Ex: 123e4567-e89b-12d3-a456-426614174000"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-1">
                      ID do Evento *
                    </label>
                    <Input
                      id="eventId"
                      name="eventId"
                      value={formData.eventId}
                      onChange={handleChange}
                      placeholder="Ex: 123e4567-e89b-12d3-a456-426614174000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Time Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horários
                </CardTitle>
                <CardDescription>
                  Horários de entrada e saída
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkinTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Horário de Entrada *
                    </label>
                    <Input
                      id="checkinTime"
                      name="checkinTime"
                      type="datetime-local"
                      value={formData.checkinTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="checkoutTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Horário de Saída
                    </label>
                    <Input
                      id="checkoutTime"
                      name="checkoutTime"
                      type="datetime-local"
                      value={formData.checkoutTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location and Staff */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localização e Staff
                </CardTitle>
                <CardDescription>
                  Informações sobre local e responsável
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Localização
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ex: Portão Principal"
                  />
                </div>

                <div>
                  <label htmlFor="staffMember" className="block text-sm font-medium text-gray-700 mb-1">
                    Membro da Equipe
                  </label>
                  <Input
                    id="staffMember"
                    name="staffMember"
                    value={formData.staffMember}
                    onChange={handleChange}
                    placeholder="Ex: João Silva"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
                <CardDescription>
                  Informações adicionais sobre o check-in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Observações adicionais sobre o check-in..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
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
                    : (mode === 'create' ? 'Criar Check-in' : 'Salvar Alterações')
                  }
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/guests/checkin')}
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
                <p>• Registre horários precisos</p>
                <p>• Mantenha localização atualizada</p>
                <p>• Documente observações importantes</p>
                <p>• Acompanhe status dos convidados</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

