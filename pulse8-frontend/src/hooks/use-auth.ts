'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useRequireAuth() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  return { user, isLoading }
}

export function useRequireGuest() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      // Redirecionar Promoters para eventos, outros para dashboard
      if (user.userOrganizationType === 3) {
        router.push('/events')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, isLoading, router])

  return { user, isLoading }
}

