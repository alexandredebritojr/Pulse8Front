import { NextRequest, NextResponse } from 'next/server'
import https from 'https'
import { URL } from 'url'

// Força renderização dinâmica pois usa request.json()
export const dynamic = 'force-dynamic'

// Função helper para fazer requisições HTTPS que aceitam certificados auto-assinados
async function fetchWithSelfSignedCert(url: string, options: RequestInit): Promise<Response> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    // O body já vem como string JSON
    const postData = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : ''
    
    const httpsOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(options.headers as Record<string, string>)
      },
      // Aceitar certificados auto-assinados apenas em desenvolvimento
      rejectUnauthorized: !isDevelopment
    }

    const req = https.request(httpsOptions, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        // Criar uma Response real usando o construtor Response
        const status = res.statusCode || 500
        const statusText = res.statusMessage || 'OK'
        
        // Criar headers para a Response
        const headers = new Headers()
        Object.entries(res.headers).forEach(([key, value]) => {
          if (value) {
            if (Array.isArray(value)) {
              value.forEach(v => headers.append(key, v))
            } else {
              headers.set(key, value)
            }
          }
        })

        // Criar Response com o body (dados recebidos)
        const response = new Response(data, {
          status,
          statusText,
          headers
        })

        resolve(response)
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    if (postData) {
      req.write(postData)
    }

    req.end()
  })
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Fazer requisição para o backend real
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:5001'
    
    let response: Response
    try {
      // Tentar primeiro com fetch nativo
      response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })
    } catch (fetchError: any) {
      // Se falhar por causa de certificado SSL, usar função customizada
      if (fetchError.code === 'DEPTH_ZERO_SELF_SIGNED_CERT' || 
          fetchError.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
          fetchError.message?.includes('self-signed certificate')) {
        console.log('⚠️ Usando fetch customizado para certificado auto-assinado')
        response = await fetchWithSelfSignedCert(`${backendUrl}/api/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        })
      } else {
        throw fetchError
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro na requisição' }))
      return NextResponse.json(
        { error: errorData.message || 'Erro ao processar solicitação de recuperação de senha' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro no endpoint /auth/forgot-password:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

