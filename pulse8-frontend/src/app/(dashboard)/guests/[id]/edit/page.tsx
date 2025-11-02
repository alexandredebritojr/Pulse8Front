'use client'

import { useParams, useSearchParams } from 'next/navigation'
import GuestForm from '@/components/guests/GuestForm'

export default function EditGuestPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const guestId = params.id as string
  const eventId = searchParams.get('eventId') || undefined

  return <GuestForm mode="edit" guestId={guestId} eventId={eventId} />
}