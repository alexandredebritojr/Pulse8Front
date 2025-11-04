'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import EventForm from '@/components/events/EventForm'

export default function CreateEventPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  // Verificar se o usuário é Promoter (UserOrganizationType = 3)
  const isPromoter = user?.userOrganizationType === 3

  useEffect(() => {
    if (isPromoter) {
      router.push('/events')
    }
  }, [isPromoter, router])

  if (isPromoter) {
    return null
  }

  return <EventForm mode="create" />
}