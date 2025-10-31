const getBackendUrl = () => {
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:5001'
  return `${backendBase.replace(/\/$/, '')}/api`
}

export const config = {
  apiUrl: getBackendUrl(),
  environment: process.env.NODE_ENV || 'development',
} as const
