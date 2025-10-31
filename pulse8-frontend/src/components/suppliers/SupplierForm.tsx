'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Building, Phone, Mail, MapPin, Tag, User, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SuppliersService, CreateSupplierRequest, UpdateSupplierRequest, SupplierDto } from '@/lib/api/suppliers'

interface SupplierFormProps {
  mode: 'create' | 'edit'
  supplierId?: string
}

export default function SupplierForm({ mode, supplierId }: SupplierFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    pixKey: '',
    bankAccount: '',
    notes: '',
    isActive: true,
  })
  const [organizationId, setOrganizationId] = useState<string>('')

  // Carregar dados do fornecedor para edição
  useEffect(() => {
    if (mode === 'edit' && supplierId) {
      const loadSupplier = async () => {
        try {
          console.log('🔍 SupplierForm: Carregando fornecedor para edição...')
          const supplier = await SuppliersService.getSupplierById(supplierId)
          console.log('✅ SupplierForm: Fornecedor carregado:', supplier)
          
          setFormData({
            name: supplier.name,
            document: supplier.document,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address || '',
            city: supplier.city || '',
            state: supplier.state || '',
            zipCode: supplier.zipCode || '',
            pixKey: supplier.pixKey || '',
            bankAccount: supplier.bankAccount || '',
            notes: supplier.notes || '',
            isActive: supplier.status === 'Active',
          })
          setOrganizationId(supplier.organizationId)
        } catch (err: any) {
          console.error('❌ SupplierForm: Erro ao carregar fornecedor:', err)
          setError(err.message || 'Erro ao carregar fornecedor')
        }
      }
      
      loadSupplier()
    }
  }, [mode, supplierId])

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
      console.log('🔍 SupplierForm: Iniciando operação...')
      console.log('🔍 SupplierForm: mode =', mode)
      console.log('🔍 SupplierForm: formData =', formData)
      
      if (mode === 'create') {
        // Preparar dados para criação
        const supplierData: CreateSupplierRequest = {
          name: formData.name,
          document: formData.document,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          pixKey: formData.pixKey,
          bankAccount: formData.bankAccount,
          notes: formData.notes,
          status: formData.isActive ? 'Active' : 'Inactive'
        }
        
        console.log('🔍 SupplierForm: supplierData =', supplierData)
        const newSupplierId = await SuppliersService.createSupplier(supplierData)
        console.log('✅ SupplierForm: Fornecedor criado com ID:', newSupplierId)
      } else if (mode === 'edit' && supplierId) {
        // Preparar dados para atualização
        const supplierData: UpdateSupplierRequest = {
          id: supplierId,
          name: formData.name,
          document: formData.document,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          pixKey: formData.pixKey,
          bankAccount: formData.bankAccount,
          notes: formData.notes,
          status: formData.isActive ? 'Active' : 'Inactive',
          organizationId: organizationId
        }
        
        console.log('🔍 SupplierForm: supplierData =', supplierData)
        await SuppliersService.updateSupplier(supplierId, supplierData)
        console.log('✅ SupplierForm: Fornecedor atualizado')
      }
      
      router.push('/suppliers')
    } catch (err: any) {
      console.error('❌ SupplierForm: Erro na operação:', err)
      setError(err.message || 'Erro ao salvar fornecedor')
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    'Som & Iluminação',
    'Alimentação',
    'Segurança',
    'Decoração',
    'Transporte',
    'Equipamentos',
    'Hospedagem',
    'Marketing',
    'Outros'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => router.push('/suppliers')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? 'Novo Fornecedor' : 'Editar Fornecedor'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create' 
              ? 'Cadastre um novo fornecedor no sistema' 
              : 'Atualize as informações do fornecedor'
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
        <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
                <CardDescription>
                  Dados principais do fornecedor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Empresa *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Som & Luz Eventos"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ/CPF *
                  </label>
                  <Input
                    id="document"
                    name="document"
                    value={formData.document}
                    onChange={handleChange}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contato@empresa.com.br"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone *
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço *
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Rua, número - Bairro"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade *
                    </label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="São Paulo"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado *
                    </label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="SP"
                      maxLength={2}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      CEP *
                    </label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="00000-000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="active">Ativo - Disponível para contratar</option>
                    <option value="inactive">Inativo - Temporariamente indisponível</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Informações Financeiras
                </CardTitle>
                <CardDescription>
                  Dados bancários e de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="pixKey" className="block text-sm font-medium text-gray-700 mb-1">
                    Chave PIX
                  </label>
                  <Input
                    id="pixKey"
                    name="pixKey"
                    value={formData.pixKey}
                    onChange={handleChange}
                    placeholder="chave@empresa.com ou 000.000.000-00"
                  />
                </div>

                <div>
                  <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700 mb-1">
                    Conta Bancária
                  </label>
                  <Input
                    id="bankAccount"
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleChange}
                    placeholder="Banco - Agência - Conta"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
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
                    placeholder="Observações adicionais sobre o fornecedor..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/suppliers')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading 
              ? (mode === 'create' ? 'Criando...' : 'Salvando...') 
              : (mode === 'create' ? 'Criar Fornecedor' : 'Salvar Alterações')
            }
          </Button>
        </div>
      </form>
    </div>
  )
}

