// Script para testar a API
const requireE2EEnv = (name) => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const testApi = async () => {
  try {
    console.log('🔍 Testando conexão com a API...')

    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: requireE2EEnv('E2E_API_EMAIL'),
        password: requireE2EEnv('E2E_API_PASSWORD')
      })
    })

    console.log('📊 Status:', response.status)
    console.log('📊 Status Text:', response.statusText)

    const data = await response.json()
    console.log('📊 Response Data:', data)

    if (!response.ok) {
      console.log('❌ Erro da API:', data.message)
    } else {
      console.log('✅ Sucesso:', data)
    }

  } catch (error) {
    console.error('❌ Erro de conexão:', error.message)
  }
}

testApi()
