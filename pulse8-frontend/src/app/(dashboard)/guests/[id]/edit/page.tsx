'use client'

import { useParams } from 'next/navigation'
import GuestForm from '@/components/guests/GuestForm'

export default function EditGuestPage() {
  const params = useParams()
  const guestId = params.id as string

  return <GuestForm mode="edit" guestId={guestId} />
}