'use client'

import { useParams } from 'next/navigation'
import MarketingForm from '@/components/marketing/MarketingForm'

export default function EditMarketingPage() {
  const params = useParams()
  const marketingId = params.id as string

  return <MarketingForm mode="edit" marketingId={marketingId} />
}







