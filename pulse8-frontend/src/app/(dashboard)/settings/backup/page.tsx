'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Database, 
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  HardDrive,
  Cloud,
  Shield,
  Settings,
  Plus,
  Play,
  Pause,
  Square,
  Calendar,
  FileText,
  Archive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function BackupPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState('')

  // Mock data - em produção viria da API
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  const backupTypes = [
    { value: 'full', label: 'Backup Completo', description: 'Todos os dados do sistema' },
    { value: 'incremental', label: 'Backup Incremental', description: 'Apenas dados alterados' },
    { value: 'differential', label: 'Backup Diferencial', description: 'Dados desde o último backup completo' },
    { value: 'custom', label: 'Backup Personalizado', description: 'Selecione dados específicos' }
  ]

  const backupHistory = [
    {
      id: '1',
      name: 'Backup Automático - 15/01/2024',
      type: 'full',
      size: '2.5 GB',
      status: 'completed',
      createdAt: '2024-01-15T14:30:00Z',
      duration: '15 min'
    },
    {
      id: '2',
      name: 'Backup Manual - 14/01/2024',
      type: 'incremental',
      size: '450 MB',
      status: 'completed',
      createdAt: '2024-01-14T16:45:00Z',
      duration: '5 min'
    },
    {
      id: '3',
      name: 'Backup Automático - 13/01/2024',
      type: 'full',
      size: '2.3 GB',
      status: 'completed',
      createdAt: '2024-01-13T14:30:00Z',
      duration: '12 min'
    },
    {
      id: '4',
      name: 'Backup de Emergência - 12/01/2024',
      type: 'full',
      size: '2.2 GB',
      status: 'failed',
      createdAt: '2024-01-12T10:15:00Z',
      duration: '0 min'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'in_progress':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído'
      case 'failed':
        return 'Falhou'
      case 'in_progress':
        return 'Em Progresso'
      default:
        return 'Desconhecido'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
        return <AlertCircle className="h-4 w-4" />
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleCreateBackup = () => {
    if (!selectedBackup) {
      alert('Por favor, selecione um tipo de backup')
      return
    }
    
    setIsCreatingBackup(true)
    // Simular criação do backup
    setTimeout(() => {
      setIsCreatingBackup(false)
      alert('Backup criado com sucesso!')
    }, 3000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Backup & Restauração</h1>
            <p className="text-gray-600">Gerencie backups e restaurações do sistema</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Backup
          </Button>
        </div>
      </div>

      {/* Backup Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backupHistory.length}</div>
            <p className="text-xs text-muted-foreground">
              Backups realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Backup</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15/01</div>
            <p className="text-xs text-muted-foreground">
              Há 2 horas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamanho Total</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.5 GB</div>
            <p className="text-xs text-muted-foreground">
              Espaço utilizado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Ativo</div>
            <p className="text-xs text-muted-foreground">
              Sistema funcionando
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create New Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Novo Backup
          </CardTitle>
          <CardDescription>
            Selecione o tipo de backup e configure as opções
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Backup *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {backupTypes.map((type) => (
                <div
                  key={type.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedBackup === type.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedBackup(type.value)}
                >
                  <h4 className="font-medium">{type.label}</h4>
                  <p className="text-sm text-gray-500">{type.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="backupName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Backup
              </label>
              <Input
                id="backupName"
                placeholder="Ex: Backup Manual - Janeiro 2024"
              />
            </div>
            <div>
              <label htmlFor="backupDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <Input
                id="backupDescription"
                placeholder="Descrição opcional do backup"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Criptografia</h4>
              <p className="text-sm text-gray-500">Criptografar o backup para maior segurança</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleCreateBackup}
              disabled={isCreatingBackup || !selectedBackup}
            >
              {isCreatingBackup ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Criando Backup...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Criar Backup
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Histórico de Backups
          </CardTitle>
          <CardDescription>
            Lista de todos os backups realizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Database className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{backup.name}</h4>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {backup.type === 'full' ? 'Completo' : 
                         backup.type === 'incremental' ? 'Incremental' : 
                         backup.type === 'differential' ? 'Diferencial' : 'Personalizado'}
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-4 w-4" />
                        {backup.size}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {backup.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(backup.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                    {getStatusIcon(backup.status)}
                    <span className="ml-1">{getStatusText(backup.status)}</span>
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Restaurar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Backup
          </CardTitle>
          <CardDescription>
            Configure as opções automáticas de backup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Backup Automático</h4>
              <p className="text-sm text-gray-500">Executar backup automático diariamente</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div>
            <label htmlFor="backupTime" className="block text-sm font-medium text-gray-700 mb-1">
              Horário do Backup
            </label>
            <Input
              id="backupTime"
              type="time"
              defaultValue="14:30"
              className="w-32"
            />
          </div>

          <div>
            <label htmlFor="retentionDays" className="block text-sm font-medium text-gray-700 mb-1">
              Retenção de Backups (dias)
            </label>
            <Input
              id="retentionDays"
              type="number"
              defaultValue="30"
              min="1"
              max="365"
              className="w-32"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Backup na Nuvem</h4>
              <p className="text-sm text-gray-500">Sincronizar backups com armazenamento na nuvem</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notificações de Backup</h4>
              <p className="text-sm text-gray-500">Receber notificações sobre status dos backups</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Storage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Informações de Armazenamento
          </CardTitle>
          <CardDescription>
            Status do armazenamento e espaço disponível
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">25 GB</div>
              <div className="text-sm text-gray-500">Espaço Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">17.5 GB</div>
              <div className="text-sm text-gray-500">Espaço Disponível</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">7.5 GB</div>
              <div className="text-sm text-gray-500">Espaço Utilizado</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

