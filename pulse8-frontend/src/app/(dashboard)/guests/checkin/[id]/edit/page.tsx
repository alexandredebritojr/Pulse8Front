'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckinDto, CheckinService } from '@/lib/api/checkin'

export default function EditCheckinPage() {
  const params = useParams()
  const router = useRouter()
  const [checkin, setCheckin] = useState<CheckinDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    checkinTime: '',
    checkoutTime: '',
    status: '',
    notes: '',
    location: '',
    staffMember: ''
  })

  // Carregar dados do check-in
  useEffect(() => {
    const loadCheckin = async () => {
      try {
        console.log('🔍 EditCheckinPage: Carregando checkin com ID:', params.id)
        const checkinData = await CheckinService.getCheckinById(params.id as string)
        console.log('✅ EditCheckinPage: Checkin carregado:', checkinData)
        setCheckin(checkinData)
        
        // Preencher formulário com dados existentes
        setFormData({
          checkinTime: checkinData.checkinTime ? new Date(checkinData.checkinTime).toISOString().slice(0, 16) : '',
          checkoutTime: checkinData.checkoutTime ? new Date(checkinData.checkoutTime).toISOString().slice(0, 16) : '',
          status: checkinData.status || '',
          notes: checkinData.notes || '',
          location: checkinData.location || '',
          staffMember: checkinData.staffMember || ''
        })
        
        setError(null)
      } catch (err: any) {
        console.error('❌ EditCheckinPage: Erro ao carregar checkin:', err)
        setError(err.message || 'Erro ao carregar checkin')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadCheckin()
    }
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      console.log('💾 Salvando alterações do checkin:', formData)
      
      const updateData = {
        id: checkin!.id,
        guestId: checkin!.guestId,
        eventId: checkin!.eventId,
        checkinTime: formData.checkinTime,
        checkoutTime: formData.checkoutTime || undefined,
        status: formData.status,
        notes: formData.notes || undefined,
        location: formData.location || undefined,
        staffMember: formData.staffMember || undefined
      }

      await CheckinService.updateCheckin(checkin!.id, updateData)
      console.log('✅ Checkin atualizado com sucesso')
      router.push(`/guests/checkin/${checkin!.id}`)
    } catch (err: any) {
      console.error('❌ Erro ao salvar checkin:', err)
      setError(err.message || 'Erro ao salvar checkin')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/guests/checkin/${checkin!.id}`)
  }

  const statusOptions = [
    { value: 'checked-in', label: 'Check-in Realizado' },
    { value: 'checked-out', label: 'Check-out Realizado' },
    { value: 'pending', label: 'Pendente' }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dados do check-in...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar check-in</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/guests/checkin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Check-ins
          </Button>
        </div>
      </div>
    )
  }

  if (!checkin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Check-in não encontrado</h3>
          <p className="text-gray-600 mb-4">O check-in solicitado não foi encontrado.</p>
          <Button onClick={() => router.push('/guests/checkin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Check-ins
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/guests/checkin/${checkin.id}`)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Check-in</h1>
            <p className="text-gray-600">Atualize as informações do check-in</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações do Convidado (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Convidado</CardTitle>
            <CardDescription>Dados do convidado (não editáveis)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Convidado</Label>
                <Input value={checkin.guestName} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={checkin.guestEmail} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>Evento</Label>
                <Input value={checkin.eventName} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>Data do Evento</Label>
                <Input value={new Date(checkin.eventStartDate).toLocaleDateString('pt-BR')} disabled className="bg-gray-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Check-in */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Check-in</CardTitle>
            <CardDescription>Atualize os dados do check-in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkinTime">Data e Hora do Check-in</Label>
                <Input
                  id="checkinTime"
                  type="datetime-local"
                  value={formData.checkinTime}
                  onChange={(e) => setFormData({ ...formData, checkinTime: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="checkoutTime">Data e Hora do Check-out</Label>
                <Input
                  id="checkoutTime"
                  type="datetime-local"
                  value={formData.checkoutTime}
                  onChange={(e) => setFormData({ ...formData, checkoutTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Local do check-in"
                />
              </div>
              <div>
                <Label htmlFor="staffMember">Membro da Equipe</Label>
                <Input
                  id="staffMember"
                  value={formData.staffMember}
                  onChange={(e) => setFormData({ ...formData, staffMember: e.target.value })}
                  placeholder="Nome do membro da equipe"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações adicionais sobre o check-in"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Cancelar</span>
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </Button>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </form>
    </div>
  )
}



