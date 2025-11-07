'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { RegisterStepper } from '@/components/auth/RegisterStepper'
import { OrganizationData, UserData } from '@/types/register'
import { unformatPhone, unformatCEP } from '@/lib/utils/masks'
import { unformatCPFOrCNPJ } from '@/lib/utils'
import { EventInvitesService, ValidateInviteTokenResponse } from '@/lib/api/invites'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register } = useAuth()
  const inviteToken = searchParams.get('inviteToken')
  
  const [inviteData, setInviteData] = useState<ValidateInviteTokenResponse | null>(null)
  const [isLoadingInvite, setIsLoadingInvite] = useState(false)

  // Buscar dados do invite se houver token
  useEffect(() => {
    const fetchInviteData = async () => {
      if (!inviteToken) return
      
      setIsLoadingInvite(true)
      try {
        const data = await EventInvitesService.validateInviteToken(inviteToken)
        setInviteData(data)
      } catch (err: any) {
        console.error('❌ Erro ao validar token do invite:', err)
        setError('Token de convite inválido ou expirado')
      } finally {
        setIsLoadingInvite(false)
      }
    }
    
    fetchInviteData()
  }, [inviteToken])

  const handleComplete = async (data: { organization: OrganizationData; user: UserData }) => {
    setIsLoading(true)
    setError('')

    try {
      console.log('🔐 Tentando registrar usuário e organização...')
      
      // Se for cadastro via invite (promoter), usar dados do invite
      const isPromoterRegistration = !!inviteToken && !!inviteData
      
      // Preparar dados para o backend (remover formatações)
      await register({
        // Dados do usuário
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        userEmail: data.user.email,
        password: data.user.password,
        userPhone: unformatPhone(data.user.phone),
        document: unformatCPFOrCNPJ(data.user.document),
        profilePicture: data.user.profilePicture,
        
        // Dados da organização (só se não for promoter)
        organizationName: isPromoterRegistration ? '' : data.organization.name,
        organizationCnpj: isPromoterRegistration ? '' : unformatCPFOrCNPJ(data.organization.cnpj),
        organizationAddress: isPromoterRegistration ? '' : data.organization.address,
        organizationCity: isPromoterRegistration ? '' : data.organization.city,
        organizationState: isPromoterRegistration ? '' : data.organization.state,
        organizationZipCode: isPromoterRegistration ? '' : unformatCEP(data.organization.zipCode),
        organizationPhone: isPromoterRegistration ? '' : unformatPhone(data.organization.phone),
        organizationEmail: isPromoterRegistration ? '' : data.organization.email,
        
        // Dados específicos para promoter
        organizationId: isPromoterRegistration ? inviteData!.organizationId : undefined,
        userType: isPromoterRegistration ? 'promoter' : undefined
      })
      
      console.log('✅ Registro realizado com sucesso!')
      
      // Se for promoter, redirecionar para aceitar o invite
      if (isPromoterRegistration && inviteToken) {
        router.push(`/invite/${inviteToken}`)
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('❌ Erro no registro:', err)
      setError(err.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {inviteToken && inviteData ? 'Cadastro de Promoter' : 'Crie sua conta'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {inviteToken && inviteData ? (
              <>
                Você foi convidado para ser Promoter na organização <strong>{inviteData.organizationName}</strong>
              </>
            ) : (
              <>
                Ou{' '}
                <Link
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  faça login em sua conta existente
                </Link>
              </>
            )}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {isLoadingInvite ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Carregando dados do convite...</p>
          </div>
        ) : (
          <RegisterStepper 
            onComplete={handleComplete} 
            inviteToken={inviteToken || undefined}
            inviteData={inviteData}
          />
        )}
      </div>
    </div>
  )
}

