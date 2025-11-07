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
    
    // Se a porta não for especificada na URL, usar 5001 para localhost
    const port = urlObj.port ? parseInt(urlObj.port) : (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1' ? 5001 : 443)
    
    const httpsOptions = {
      hostname: urlObj.hostname,
      port: port,
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
    
    console.log('🔍 fetchWithSelfSignedCert: Opções de conexão:', {
      hostname: httpsOptions.hostname,
      port: httpsOptions.port,
      path: httpsOptions.path,
      rejectUnauthorized: httpsOptions.rejectUnauthorized
    })

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
    
    console.log('🔍 Tentando conectar ao backend:', `${backendUrl}/api/auth/forgot-password`)
    
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
      console.log('⚠️ Fetch nativo falhou, tentando com fetch customizado:', {
        message: fetchError?.message,
        code: fetchError?.code,
        cause: fetchError?.cause
      })
      
      // Se o fetch nativo falhar por qualquer motivo (incluindo "fetch failed"),
      // tentar usar a função customizada que lida com certificados auto-assinados
      try {
        response = await fetchWithSelfSignedCert(`${backendUrl}/api/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        })
      } catch (customFetchError: any) {
        console.error('❌ Fetch customizado também falhou:', {
          message: customFetchError?.message,
          code: customFetchError?.code
        })
        // Se ambos falharem, lançar o erro original
        throw new Error(`Erro ao conectar ao backend: ${fetchError?.message || 'fetch failed'}. Verifique se o backend está rodando em ${backendUrl}`)
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro na requisição' }))
      console.error('❌ Erro na resposta do backend:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      })
      return NextResponse.json(
        { error: errorData.message || 'Erro ao processar solicitação de recuperação de senha' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Erro no endpoint /auth/forgot-password:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
      cause: error?.cause
    })
    
    // Se o erro for de conexão, retornar mensagem mais específica
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND' || error?.message?.includes('fetch failed')) {
      const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:5001'
      return NextResponse.json(
        { error: `Não foi possível conectar ao servidor backend (${backendUrl}). Verifique se o backend está em execução e se a URL está correta.` },
        { status: 503 }
      )
    }
    
    // Extrair mensagem de erro mais útil
    let errorMessage = 'Erro interno do servidor'
    if (error?.message) {
      if (error.message.includes('conectar ao backend')) {
        errorMessage = error.message
      } else {
        errorMessage = `Erro ao processar solicitação: ${error.message}`
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

