'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import EventForm from '@/components/events/EventForm'

interface EditEventPageProps {
  params: {
    id: string
  }
  searchParams: {
    tab?: string
  }
}

export default function EditEventPage({ params, searchParams }: EditEventPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  
  // Verificar se o usuário é Promoter (UserOrganizationType = 3)
  const isPromoter = user?.userOrganizationType === 3

  useEffect(() => {
    if (isPromoter) {
      router.push(`/events/${params.id}`)
    }
  }, [isPromoter, router, params.id])

  if (isPromoter) {
    return null
  }

  return <EventForm mode="edit" eventId={params.id} initialTab={searchParams.tab} />
}