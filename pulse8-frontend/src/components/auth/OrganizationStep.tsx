'use client'

import { useState, useEffect } from 'react'
import { OrganizationData } from '@/types/register'
import { formatCEP, unformatCEP } from '@/lib/utils/masks'
import { formatPhone, unformatPhone } from '@/lib/utils/masks'
import { formatCPFOrCNPJ, unformatCPFOrCNPJ } from '@/lib/utils'
import { validateCNPJ, validateEmail } from '@/lib/utils/validators'
import { fetchAddressByCEP } from '@/lib/utils/cep'
import { BRAZILIAN_STATES } from '@/lib/utils/brazilian-states'

interface OrganizationStepProps {
  data: OrganizationData
  onChange: (data: OrganizationData) => void
  onNext: () => void
  onBack: () => void
}

export function OrganizationStep({ data, onChange, onNext, onBack }: OrganizationStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loadingCEP, setLoadingCEP] = useState(false)

  const handleChange = (field: keyof OrganizationData, value: string) => {
    let formattedValue = value

    // Aplicar máscaras
    if (field === 'cnpj') {
      formattedValue = formatCPFOrCNPJ(value)
    } else if (field === 'zipCode') {
      formattedValue = formatCEP(value)
    } else if (field === 'phone') {
      formattedValue = formatPhone(value)
    }

    onChange({
      ...data,
      [field]: formattedValue
    })

    // Limpar erro do campo
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }

    // Buscar endereço quando CEP estiver completo
    if (field === 'zipCode' && unformatCEP(formattedValue).length === 8) {
      handleCEPBlur()
    }
  }

  const handleCEPBlur = async () => {
    const cepCleaned = unformatCEP(data.zipCode)
    if (cepCleaned.length === 8) {
      setLoadingCEP(true)
      try {
        const address = await fetchAddressByCEP(data.zipCode)
        if (address) {
          onChange({
            ...data,
            address: address.logradouro || '',
            city: address.localidade || '',
            state: address.uf || '',
            zipCode: formatCEP(address.cep)
          })
        } else {
          setErrors({ ...errors, zipCode: 'CEP não encontrado' })
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
        setErrors({ ...errors, zipCode: 'Erro ao buscar CEP' })
      } finally {
        setLoadingCEP(false)
      }
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validar nome
    if (!data.name.trim()) {
      newErrors.name = 'Nome da organização é obrigatório'
    }

    // Validar CNPJ
    if (!data.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório'
    } else {
      const cnpjCleaned = unformatCPFOrCNPJ(data.cnpj)
      if (cnpjCleaned.length !== 14) {
        newErrors.cnpj = 'CNPJ deve ter 14 dígitos'
      } else if (!validateCNPJ(data.cnpj)) {
        newErrors.cnpj = 'CNPJ inválido'
      }
    }

    // Validar email
    if (!data.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Email inválido'
    }

    // Validar CEP
    const zipCodeCleaned = unformatCEP(data.zipCode)
    if (zipCodeCleaned.length > 0 && zipCodeCleaned.length !== 8) {
      newErrors.zipCode = 'CEP inválido'
    }

    // Validar endereço
    if (!data.address.trim()) {
      newErrors.address = 'Endereço é obrigatório'
    }

    // Validar cidade
    if (!data.city.trim()) {
      newErrors.city = 'Cidade é obrigatória'
    }

    // Validar estado
    if (!data.state.trim()) {
      newErrors.state = 'Estado é obrigatório'
    }

    // Validar telefone
    const phoneCleaned = unformatPhone(data.phone)
    if (phoneCleaned.length > 0 && phoneCleaned.length < 10) {
      newErrors.phone = 'Telefone inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onNext()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dados da Organização
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Preencha os dados da sua organização
        </p>
      </div>

      <div>
        <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">
          Nome da Organização <span className="text-red-500">*</span>
        </label>
        <input
          id="organizationName"
          type="text"
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nome da organização"
          value={data.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
            CNPJ <span className="text-red-500">*</span>
          </label>
          <input
            id="cnpj"
            type="text"
            required
            maxLength={18}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.cnpj ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="00.000.000/0000-00"
            value={data.cnpj}
            onChange={(e) => handleChange('cnpj', e.target.value)}
          />
          {errors.cnpj && (
            <p className="mt-1 text-sm text-red-600">{errors.cnpj}</p>
          )}
        </div>

        <div>
          <label htmlFor="organizationEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Email da Organização <span className="text-red-500">*</span>
          </label>
          <input
            id="organizationEmail"
            type="email"
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="organizacao@email.com"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
          CEP <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="zipCode"
            type="text"
            required
            maxLength={9}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.zipCode ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="00000-000"
            value={data.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            onBlur={handleCEPBlur}
          />
          {loadingCEP && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            </div>
          )}
        </div>
        {errors.zipCode && (
          <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Endereço <span className="text-red-500">*</span>
        </label>
        <input
          id="address"
          type="text"
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Rua, Avenida, etc."
          value={data.address}
          onChange={(e) => handleChange('address', e.target.value)}
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            Cidade <span className="text-red-500">*</span>
          </label>
          <input
            id="city"
            type="text"
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Cidade"
            value={data.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            Estado <span className="text-red-500">*</span>
          </label>
          <select
            id="state"
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.state ? 'border-red-500' : 'border-gray-300'
            }`}
            value={data.state}
            onChange={(e) => handleChange('state', e.target.value)}
          >
            <option value="">Selecione o estado</option>
            {BRAZILIAN_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="organizationPhone" className="block text-sm font-medium text-gray-700 mb-1">
          Telefone
        </label>
        <input
          id="organizationPhone"
          type="text"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="(00) 00000-0000"
          value={data.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          ← Voltar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Próximo →
        </button>
      </div>
    </form>
  )
}



