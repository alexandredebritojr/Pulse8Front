export interface Address {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

/**
 * Busca endereço pelo CEP usando ViaCEP
 */
export async function fetchAddressByCEP(cep: string): Promise<Address | null> {
  const cleaned = cep.replace(/\D/g, '')
  
  if (cleaned.length !== 8) {
    return null
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`)
    const data: Address = await response.json()
    
    if (data.erro) {
      return null
    }
    
    return data
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    return null
  }
}



