import { NextRequest, NextResponse } from 'next/server'

// Força renderização dinâmica pois usa request.json()
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Fazer requisição para o backend real
    const backendUrl = process.env.BACKEND_URL || 'https://localhost:5001'
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro na requisição' }))
      return NextResponse.json(
        { error: errorData.message || 'Erro na autenticação' },
        { status: response.status }
      )
    }

    const loginData = await response.json()
    return NextResponse.json(loginData)
  } catch (error) {
    console.error('Erro no endpoint /auth/login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}






