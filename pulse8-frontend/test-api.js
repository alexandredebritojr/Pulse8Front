// Script para testar a API
const testApi = async () => {
  try {
    console.log('🔍 Testando conexão com a API...')
    
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'wrongpassword'
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
