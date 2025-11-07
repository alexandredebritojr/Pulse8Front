'use client'

import { useState } from 'react'
import { UserData } from '@/types/register'
import { formatCPFOrCNPJ, unformatCPFOrCNPJ } from '@/lib/utils'
import { formatPhone, unformatPhone } from '@/lib/utils/masks'
import { validateCPF, validateCNPJ, validateEmail, validatePasswordStrength } from '@/lib/utils/validators'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'

interface UserStepProps {
  data: UserData
  onChange: (data: UserData) => void
  onNext: () => void
  isPromoterRegistration?: boolean
}

export function UserStep({ data, onChange, onNext, isPromoterRegistration = false }: UserStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: keyof UserData, value: string) => {
    let formattedValue = value

    // Aplicar máscaras
    if (field === 'document') {
      formattedValue = formatCPFOrCNPJ(value)
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
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validar nome
    if (!data.firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório'
    }

    if (!data.lastName.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório'
    }

    // Validar email
    if (!data.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Email inválido'
    }

    // Validar senha
    if (!data.password) {
      newErrors.password = 'Senha é obrigatória'
    } else {
      const strength = validatePasswordStrength(data.password)
      if (!strength.isValid) {
        newErrors.password = 'Senha não atende aos requisitos mínimos'
      }
    }

    // Validar confirmação de senha
    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }

    // Validar telefone
    const phoneCleaned = unformatPhone(data.phone)
    if (phoneCleaned.length > 0 && phoneCleaned.length < 10) {
      newErrors.phone = 'Telefone inválido'
    }

    // Validar documento
    if (data.document) {
      const docCleaned = unformatCPFOrCNPJ(data.document)
      if (docCleaned.length === 11) {
        if (!validateCPF(data.document)) {
          newErrors.document = 'CPF inválido'
        }
      } else if (docCleaned.length === 14) {
        if (!validateCNPJ(data.document)) {
          newErrors.document = 'CNPJ inválido'
        }
      } else if (docCleaned.length > 0) {
        newErrors.document = 'CPF ou CNPJ inválido'
      }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Converter para base64 (simplificado - em produção, enviar para servidor)
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange({
          ...data,
          profilePicture: reader.result as string
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isPromoterRegistration ? 'Dados do Promoter' : 'Dados do Usuário Administrador'}
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Preencha seus dados pessoais para criar sua conta
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nome"
            value={data.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Sobrenome <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Sobrenome"
            value={data.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="seu@email.com"
          value={data.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Senha <span className="text-red-500">*</span>
        </label>
        <input
          id="password"
          type="password"
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Mínimo 8 caracteres"
          value={data.password}
          onChange={(e) => handleChange('password', e.target.value)}
        />
        <PasswordStrengthIndicator password={data.password} />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar Senha <span className="text-red-500">*</span>
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Confirme sua senha"
          value={data.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <input
            id="phone"
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

        <div>
          <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
            CPF / CNPJ
          </label>
          <input
            id="document"
            type="text"
            maxLength={18}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.document ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            value={data.document}
            onChange={(e) => handleChange('document', e.target.value)}
          />
          {errors.document && (
            <p className="mt-1 text-sm text-red-600">{errors.document}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">
          Foto de Perfil <span className="text-gray-500 text-xs">(opcional)</span>
        </label>
        <input
          id="profilePicture"
          type="file"
          accept="image/*"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={handleFileChange}
        />
        {data.profilePicture && (
          <div className="mt-2">
            <img
              src={data.profilePicture}
              alt="Preview"
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
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



