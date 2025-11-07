'use client'

import { useState } from 'react'
import { OrganizationData, UserData } from '@/types/register'
import { ValidateInviteTokenResponse } from '@/lib/api/invites'

interface ConfirmationStepProps {
  organizationData: OrganizationData
  userData: UserData
  onSubmit: () => void
  onBack: () => void
  isPromoterRegistration?: boolean
  inviteData?: ValidateInviteTokenResponse | null
}

export function ConfirmationStep({
  organizationData,
  userData,
  onSubmit,
  onBack,
  isPromoterRegistration = false,
  inviteData
}: ConfirmationStepProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (acceptedTerms) {
      onSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Confirmação dos Dados
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Revise os dados antes de finalizar o cadastro
        </p>
      </div>

      {/* Dados do Usuário */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Dados do Usuário</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Nome:</span>
            <p className="font-medium text-gray-900">
              {userData.firstName} {userData.lastName}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Email:</span>
            <p className="font-medium text-gray-900">{userData.email}</p>
          </div>
          {userData.phone && (
            <div>
              <span className="text-gray-600">Telefone:</span>
              <p className="font-medium text-gray-900">{userData.phone}</p>
            </div>
          )}
          {userData.document && (
            <div>
              <span className="text-gray-600">CPF/CNPJ:</span>
              <p className="font-medium text-gray-900">{userData.document}</p>
            </div>
          )}
        </div>
      </div>

      {/* Dados da Organização - só exibir se não for promoter */}
      {!isPromoterRegistration && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Dados da Organização</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Nome:</span>
              <p className="font-medium text-gray-900">{organizationData.name}</p>
            </div>
            <div>
              <span className="text-gray-600">CNPJ:</span>
              <p className="font-medium text-gray-900">{organizationData.cnpj}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-600">Endereço:</span>
              <p className="font-medium text-gray-900">
                {organizationData.address}, {organizationData.city} - {organizationData.state}
              </p>
              <p className="font-medium text-gray-900">CEP: {organizationData.zipCode}</p>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-medium text-gray-900">{organizationData.email}</p>
            </div>
            {organizationData.phone && (
              <div>
                <span className="text-gray-600">Telefone:</span>
                <p className="font-medium text-gray-900">{organizationData.phone}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Informações do Convite - só exibir se for promoter */}
      {isPromoterRegistration && inviteData && (
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <h4 className="font-semibold text-gray-900 mb-3">Organização do Convite</h4>
          <div className="text-sm">
            <div className="mb-2">
              <span className="text-gray-600">Você será cadastrado como Promoter na organização:</span>
              <p className="font-medium text-gray-900 mt-1">{inviteData.organizationName}</p>
            </div>
            {inviteData.eventName && (
              <div>
                <span className="text-gray-600">Evento:</span>
                <p className="font-medium text-gray-900">{inviteData.eventName}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Termos de uso */}
      <div className="flex items-start">
        <input
          id="terms"
          type="checkbox"
          required
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
          Eu aceito os{' '}
          <a href="/terms" target="_blank" className="text-indigo-600 hover:underline">
            termos de uso
          </a>{' '}
          e a{' '}
          <a href="/privacy" target="_blank" className="text-indigo-600 hover:underline">
            política de privacidade
          </a>
        </label>
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
          disabled={!acceptedTerms}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Finalizar Cadastro
        </button>
      </div>
    </form>
  )
}



