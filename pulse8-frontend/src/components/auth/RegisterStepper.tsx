'use client'

import { useState, useEffect } from 'react'
import { OrganizationData, UserData } from '@/types/register'
import { UserStep } from './UserStep'
import { OrganizationStep } from './OrganizationStep'
import { ConfirmationStep } from './ConfirmationStep'
import { ValidateInviteTokenResponse } from '@/lib/api/invites'

interface RegisterStepperProps {
  onComplete: (data: { organization: OrganizationData; user: UserData }) => Promise<void>
  inviteToken?: string
  inviteData?: ValidateInviteTokenResponse | null
}

export function RegisterStepper({ onComplete, inviteToken, inviteData }: RegisterStepperProps) {
  const isPromoterRegistration = !!inviteToken && !!inviteData
  const maxStep = isPromoterRegistration ? 2 : 3 // Se for promoter, só tem 2 steps (Usuário e Confirmação)
  
  const [currentStep, setCurrentStep] = useState(1)
  const [organizationData, setOrganizationData] = useState<OrganizationData>({
    name: '',
    cnpj: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: ''
  })
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    document: '',
    profilePicture: undefined
  })
  
  // Se for promoter, usar dados da organização do invite e pré-preencher email se disponível
  useEffect(() => {
    if (isPromoterRegistration && inviteData) {
      setOrganizationData(prev => {
        // Só atualizar se ainda não tiver o nome
        if (!prev.name) {
          return {
            ...prev,
            name: inviteData.organizationName
          }
        }
        return prev
      })
      
      // Pré-preencher email do usuário se o invite tiver um email específico
      if (inviteData.invitedEmail) {
        setUserData(prev => {
          // Só atualizar se ainda não tiver email
          if (!prev.email) {
            return {
              ...prev,
              email: inviteData.invitedEmail!
            }
          }
          return prev
        })
      }
    }
  }, [isPromoterRegistration, inviteData?.organizationName, inviteData?.invitedEmail])
  
  const steps = isPromoterRegistration
    ? [
        { number: 1, title: 'Usuário' },
        { number: 2, title: 'Confirmação' }
      ]
    : [
        { number: 1, title: 'Usuário' },
        { number: 2, title: 'Organização' },
        { number: 3, title: 'Confirmação' }
      ]
  
  const handleNext = () => {
    if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const handleSubmit = async () => {
    await onComplete({ organization: organizationData, user: userData })
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep >= step.number
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? '✓' : step.number}
                </div>
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors ${
                    currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {currentStep === 1 && (
          <UserStep
            data={userData}
            onChange={setUserData}
            onNext={handleNext}
            isPromoterRegistration={isPromoterRegistration}
          />
        )}
        {!isPromoterRegistration && currentStep === 2 && (
          <OrganizationStep
            data={organizationData}
            onChange={setOrganizationData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {((isPromoterRegistration && currentStep === 2) || (!isPromoterRegistration && currentStep === 3)) && (
          <ConfirmationStep
            organizationData={organizationData}
            userData={userData}
            onSubmit={handleSubmit}
            onBack={handleBack}
            isPromoterRegistration={isPromoterRegistration}
            inviteData={inviteData}
          />
        )}
      </div>
    </div>
  )
}



