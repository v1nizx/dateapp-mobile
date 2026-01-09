import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY')

interface RecommendationRequest {
  budget: string
  type: string
  period: string
  ambiente?: string
  distancia?: string
  temEstacionamento?: boolean
  acessivel?: boolean
  latitude: number
  longitude: number
}

const BUDGET_DESC: Record<string, string> = {
  '$': 'econômico e acessível (até R$50 por pessoa)',
  '$$': 'preço moderado (R$50-150 por pessoa)',
  '$$$': 'sofisticado e premium (acima de R$150 por pessoa)'
}

const TYPE_DESC: Record<string, string> = {
  'gastronomia': 'gastronomia, incluindo restaurantes, cafés, bares, pizzarias, sushi, hamburguerias',
  'cultura': 'cultura e entretenimento, como museus, teatros, cinemas, galerias de arte, exposições',
  'ao-ar-livre': 'atividades ao ar livre, como parques, praias, trilhas, jardins, mirantes',
  'aventura': 'aventura e atividades radicais, como escalada, tirolesa, paintball, kart, parques de diversão',
  'casual': 'lugares casuais e descontraídos, como cafés, bares tranquilos, lounges, sorveterias'
}

const AMBIENTE_DESC: Record<string, string> = {
  'intimo': 'íntimo e reservado, com mesas afastadas, iluminação baixa, ambiente romântico e privativo',
  'animado': 'animado e movimentado, com música, outras pessoas, ambiente descontraído e festivo',
  'tranquilo': 'tranquilo e relaxante, sem música alta, ambiente calmo e aconchegante'
}

const DISTANCIA_DESC: Record<string, string> = {
  'perto': 'muito próximo, no máximo 5km de distância',
  'medio': 'distância moderada, entre 5km e 15km',
  'longe': 'mais distante, acima de 15km, ideal para explorar novos lugares'
}

async function getPerplexityRecommendations(filters: RecommendationRequest): Promise<any[]> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY não configurada')
  }

  const budgetDesc = BUDGET_DESC[filters.budget] || 'variado'
  const typeDesc = TYPE_DESC[filters.type] || 'variado'
  const periodDesc = filters.period === 'dia' ? 'durante o dia' : 'à noite'

  // Novos filtros opcionais
  const ambienteDesc = filters.ambiente ? AMBIENTE_DESC[filters.ambiente] : ''
  const distanciaDesc = filters.distancia ? DISTANCIA_DESC[filters.distancia] : ''
  const estacionamentoReq = filters.temEstacionamento ? 'DEVE ter estacionamento próprio ou fácil acesso a estacionamento' : ''
  const acessivelReq = filters.acessivel ? 'DEVE ser acessível para cadeirantes (rampas, banheiros adaptados, etc)' : ''

  const prompt = `Você é um especialista em recomendações românticas para casais em São Luís, Maranhão, Brasil.

🎯 MISSÃO: Encontre os 5 MELHORES lugares REAIS em São Luís/MA para um casal com as seguintes preferências:

📍 LOCALIZAÇÃO:
- Latitude: ${filters.latitude}
- Longitude: ${filters.longitude}
- Cidade: São Luís, Maranhão, Brasil

💰 ORÇAMENTO: ${budgetDesc}
🎭 TIPO DE EXPERIÊNCIA: ${typeDesc}
⏰ PERÍODO: ${periodDesc}
${ambienteDesc ? `🎵 AMBIENTE: ${ambienteDesc}` : ''}
${distanciaDesc ? `📏 DISTÂNCIA: ${distanciaDesc}` : ''}
${estacionamentoReq ? `🅿️ ${estacionamentoReq}` : ''}
${acessivelReq ? `♿ ${acessivelReq}` : ''}

🔍 INSTRUÇÕES:
1. Pesquise na web lugares REAIS e ATUAIS em São Luís/MA
2. Priorize estabelecimentos com boa reputação e avaliações positivas
3. Ambiente adequado para casais (romântico)
4. Preços compatíveis com o orçamento
5. Horário de funcionamento adequado (${periodDesc})
${filters.ambiente ? `6. O ambiente deve ser ${ambienteDesc}` : ''}
${filters.distancia ? `7. Respeite a preferência de distância: ${distanciaDesc}` : ''}

📝 PARA CADA LUGAR (MUITO IMPORTANTE - SIGA EXATAMENTE):
- Nome EXATO e COMPLETO do estabelecimento (como está no Google Maps)
- Endereço COMPLETO e PRECISO no formato: "Rua/Avenida Nome, Número - Bairro, São Luís - MA, CEP"
  * OBRIGATÓRIO: Nome da rua/avenida
  * OBRIGATÓRIO: Número do estabelecimento
  * OBRIGATÓRIO: Nome do bairro
  * Exemplo: "Av. Litorânea, 1000 - Calhau, São Luís - MA, 65071-360"
- Descrição de por que é perfeito (2-3 frases) - NÃO inclua referências numéricas entre colchetes
- Avaliação (nota de 0 a 5, se disponível)
- Horário de funcionamento
- Sugestão de atividade romântica
- Dica especial
- Se tem estacionamento (true/false)
- Se é acessível para cadeirantes (true/false)

🎨 RETORNE JSON NESTE FORMATO EXATO:
{
  "recommendations": [
    {
      "name": "Nome Exato do Estabelecimento",
      "address": "Rua/Av. Nome Completo, Número - Bairro, São Luís - MA",
      "neighborhood": "Nome do Bairro",
      "description": "Por que é perfeito para um encontro romântico",
      "rating": 4.5,
      "openingHours": "Seg-Sex: 18h-23h, Sáb-Dom: 12h-23h",
      "romanticActivity": "Sugestão de atividade romântica",
      "specialTip": "Dica especial para o casal",
      "temEstacionamento": true,
      "acessivel": false
    }
  ]
}

⚠️ REGRAS CRÍTICAS DE ENDEREÇO:
1. NÃO use endereços genéricos como "Centro" ou "Região Central" - seja ESPECÍFICO
2. SEMPRE inclua o número do estabelecimento
3. SEMPRE inclua o nome do bairro (ex: Calhau, Renascença, Centro Histórico, Ponta d'Areia)
4. Se não souber o endereço exato, NÃO inclua o lugar na lista
5. Verifique se o endereço está correto pesquisando no Google Maps

IMPORTANTE: 
- BUSQUE informações REAIS na web. NÃO invente endereços.
- Retorne APENAS JSON válido.
- NÃO inclua referências numéricas entre colchetes.
- Endereços imprecisos fazem o usuário ir para o lugar ERRADO - seja PRECISO!`

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em recomendações de lugares românticos. Sempre responda em JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4096
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro Perplexity:', errorText)
      throw new Error(`Erro na API Perplexity: ${response.status}`)
    }

    const data = await response.json()
    const responseText = data.choices[0]?.message?.content || ''

    console.log('Perplexity respondeu:', responseText.substring(0, 300))

    let jsonResponse
    try {
      jsonResponse = JSON.parse(responseText)
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/s)
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Perplexity não retornou JSON válido')
      }
    }

    if (!jsonResponse.recommendations || !Array.isArray(jsonResponse.recommendations)) {
      throw new Error('Formato de resposta inválido')
    }

    const recommendations = jsonResponse.recommendations.map((rec: any, idx: number) => {
      // Remove referências numéricas entre colchetes [1], [2, 3], etc.
      const cleanDescription = (rec.description || 'Descrição não disponível').replace(/\s*\[\d+(,\s*\d+)*\]/g, '')
      const cleanActivity = (rec.romanticActivity || 'Aproveitem juntos').replace(/\s*\[\d+(,\s*\d+)*\]/g, '')
      const cleanTip = (rec.specialTip || '').replace(/\s*\[\d+(,\s*\d+)*\]/g, '')

      return {
        id: `pplx-${Date.now()}-${idx}`,
        name: rec.name || 'Lugar sem nome',
        description: cleanDescription.trim(),
        address: rec.address || 'São Luís, MA',
        mapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(rec.name + ' ' + rec.address + ' São Luís MA')}`,
        budget: filters.budget,
        type: filters.type,
        period: filters.period,
        tags: ['romântico', 'perplexity-recomendado'],
        imageUrl: '',
        rating: rec.rating || 0,
        suggestedActivity: cleanActivity.trim(),
        openingHours: rec.openingHours || 'Consultar horários',
        specialTip: cleanTip.trim(),
        aiRecommended: true,
        temEstacionamento: rec.temEstacionamento || false,
        acessivel: rec.acessivel || false
      }
    })

    return recommendations

  } catch (error) {
    console.error('Erro ao gerar recomendações:', error)
    throw error
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  try {
    const filters: RecommendationRequest = await req.json()

    if (!filters.budget || !filters.type || !filters.period || !filters.latitude || !filters.longitude) {
      return new Response(
        JSON.stringify({ error: 'Filtros incompletos' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    console.log('🤖 Processando recomendações com filtros:', {
      budget: filters.budget,
      type: filters.type,
      period: filters.period,
      ambiente: filters.ambiente,
      distancia: filters.distancia,
      temEstacionamento: filters.temEstacionamento,
      acessivel: filters.acessivel
    })

    const recommendations = await getPerplexityRecommendations(filters)

    return new Response(
      JSON.stringify({
        places: recommendations,
        totalFound: recommendations.length,
        source: 'perplexity-search'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )

  } catch (error) {
    console.error('❌ Erro:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
})
