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
  '$': 'BARATO/POPULAR - gasto máximo R$30-50 por pessoa. Tipos de lugares: churrasquinhos de rua, tapiocarias, lanchonetes de bairro, hamburguerias simples, pizzarias populares, food trucks, espetinhos, açaiterias, creperias simples, pastelarias, cachorro-quente. NÃO são restaurantes sofisticados.',
  '$$': 'MODERADO - gasto entre R$50-150 por pessoa. Tipos de lugares: restaurantes casuais com ambiente agradável, pizzarias gourmet, sushi casual, bistrôs, hamburguerias gourmet, bares com boa comida, restaurantes de bairro bem avaliados.',
  '$$$': 'PREMIUM/CARO - gasto acima de R$150 por pessoa. APENAS: restaurantes fine dining, alta gastronomia, frutos do mar premium, steakhouses de luxo, restaurantes com chef renomado, experiências gastronômicas exclusivas.'
}

const TYPE_DESC: Record<string, string> = {
  'gastronomia': 'gastronomia variada - INCLUA DIFERENTES TIPOS: japonesa (sushi, temaki), italiana (massas, pizzas), brasileira/regional (nordestina, frutos do mar), hamburguerias, churrasquinhos, tapiocarias. VARIE os tipos de culinária nas recomendações.',
  'cultura': 'cultura e entretenimento: museus, teatros, cinemas, galerias de arte, exposições, centros culturais, casas de shows',
  'ao-ar-livre': 'atividades ao ar livre: parques, praias, trilhas, orla, praças, mirantes, jardins',
  'aventura': 'aventura e atividades: escalada, tirolesa, paintball, kart, parques de diversão, passeios de barco',
  'casual': 'lugares casuais: cafeterias, bares tranquilos, sorveterias, docerias, casas de açaí'
}

const AMBIENTE_DESC: Record<string, string> = {
  'intimo': 'íntimo e reservado - mesas afastadas, iluminação baixa, ambiente romântico e privativo',
  'animado': 'animado e movimentado - música, pessoas, ambiente descontraído e festivo',
  'tranquilo': 'tranquilo e relaxante - sem música alta, ambiente calmo para conversar'
}

const DISTANCIA_DESC: Record<string, string> = {
  'perto': 'MUITO PERTO - MÁXIMO 3km de distância. Deve ser possível ir a pé ou em menos de 10 minutos de carro. REJEITE qualquer lugar acima de 3km.',
  'medio': 'DISTÂNCIA MÉDIA - entre 3km e 10km. NÃO inclua lugares muito perto (menos de 3km) NEM muito longe (mais de 10km).',
  'longe': 'MAIS LONGE - acima de 10km, para explorar bairros diferentes e novos lugares da cidade.'
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

  const prompt = `Você é um especialista em recomendações para casais em São Luís, Maranhão, Brasil.

🚨🚨🚨 REGRAS CRÍTICAS - LEIA COM ATENÇÃO 🚨🚨🚨

❌ RESTRIÇÃO DE DISTÂNCIA (OBRIGATÓRIA):
${filters.distancia === 'perto' ? `- O usuário quer lugares MUITO PERTO, a NO MÁXIMO 3 QUILÔMETROS de distância.
- Localização do usuário: Latitude ${filters.latitude}, Longitude ${filters.longitude}
- CALCULE a distância de cada lugar antes de incluir.
- Se a distância for maior que 3km, NÃO INCLUA O LUGAR.
- Lugares a 5km, 8km, 10km = REJEITADOS. Apenas lugares até 3km.
- Priorize o MESMO BAIRRO ou bairros IMEDIATAMENTE vizinhos.` : ''}
${filters.distancia === 'medio' ? `- O usuário quer lugares a DISTÂNCIA MÉDIA, entre 3km e 10km.
- Localização: Lat ${filters.latitude}, Lon ${filters.longitude}
- NÃO inclua lugares muito perto (menos de 3km) nem muito longe (mais de 10km).` : ''}
${filters.distancia === 'longe' ? `- O usuário quer EXPLORAR lugares mais distantes, acima de 10km.
- Localização: Lat ${filters.latitude}, Lon ${filters.longitude}` : ''}
${!filters.distancia ? `- Localização do usuário: Lat ${filters.latitude}, Lon ${filters.longitude}
- Priorize lugares relativamente próximos.` : ''}

❌ RESTRIÇÃO DE ORÇAMENTO (OBRIGATÓRIA):
${filters.budget === '$' ? `- O usuário quer opções BARATAS/POPULARES (máximo R$30-50 por pessoa).
- TIPOS DE LUGARES ESPERADOS: churrasquinhos, tapiocarias, lanchonetes de bairro, espetinhos, food trucks, açaiterias, pastelarias, hamburguerias simples.
- NÃO são restaurantes sofisticados, bistrôs ou lugares caros.
- Se o lugar tem preço médio acima de R$50, NÃO INCLUA.` : ''}
${filters.budget === '$$' ? `- O usuário quer opções de PREÇO MODERADO (R$50-150 por pessoa).
- TIPOS DE LUGARES: restaurantes casuais, pizzarias, sushi casual, hamburguerias gourmet, bares com boa comida.
- NÃO inclua churrasquinhos de rua (muito barato) nem fine dining (muito caro).` : ''}
${filters.budget === '$$$' ? `- O usuário quer opções PREMIUM/CARAS (acima de R$150 por pessoa).
- APENAS: restaurantes fine dining, alta gastronomia, experiências exclusivas.
- NÃO inclua lugares simples ou populares.` : ''}

🎯 MISSÃO: Encontre 5 lugares REAIS em São Luís/MA que RESPEITEM AS RESTRIÇÕES ACIMA.

📍 Cidade: São Luís, Maranhão, Brasil
💰 ORÇAMENTO: ${budgetDesc}
🎭 TIPO: ${typeDesc}
${filters.type === 'gastronomia' && filters.budget === '$' ? `
🍽️ PARA OPÇÃO BARATA - INCLUA:
- Churrasquinhos famosos de São Luís
- Tapiocarias bem avaliadas
- Lanchonetes populares com boa comida
- Espetinhos e churrasquinhos de rua
- Food trucks conhecidos
- Lugares simples mas gostosos para casais
` : ''}
${filters.type === 'gastronomia' && filters.budget !== '$' ? `
🍽️ DIVERSIDADE GASTRONÔMICA:
- Varie os tipos de culinária (japonesa, italiana, regional, frutos do mar, etc)
` : ''}
⏰ PERÍODO: ${periodDesc}
${ambienteDesc ? `🎵 AMBIENTE: ${ambienteDesc}` : ''}
${estacionamentoReq ? `🅿️ ${estacionamentoReq}` : ''}
${acessivelReq ? `♿ ${acessivelReq}` : ''}

🔍 ANTES DE INCLUIR CADA LUGAR, VERIFIQUE:
1. A distância está dentro do limite? (${filters.distancia === 'perto' ? 'máximo 3km' : filters.distancia === 'medio' ? '3-10km' : 'qualquer'})
2. O preço está correto? (${filters.budget === '$' ? 'barato, até R$50' : filters.budget === '$$' ? 'moderado, R$50-150' : 'caro, acima de R$150'})
3. É um lugar REAL que existe em São Luís?
4. Funciona no período ${periodDesc}?
${filters.ambiente ? `7. O ambiente DEVE ser ${ambienteDesc}` : ''}

📝 PARA CADA LUGAR:
- Nome EXATO e COMPLETO do estabelecimento
- Endereço COMPLETO: "Rua/Av. Nome, Número - Bairro, São Luís - MA, CEP"
- priceRange: faixa de preço real do estabelecimento ("$", "$$" ou "$$$")
- distanceKm: distância aproximada em km da localização do usuário
- cuisineType: tipo de culinária (ex: "Japonesa", "Italiana", "Frutos do Mar", "Brasileira")
- Descrição romântica (2-3 frases)
- Avaliação (0-5)
- Horário de funcionamento
- Sugestão de atividade romântica
- Dica especial

🎨 RETORNE JSON NESTE FORMATO EXATO:
{
  "recommendations": [
    {
      "name": "Nome Exato do Estabelecimento",
      "address": "Rua/Av. Nome Completo, Número - Bairro, São Luís - MA",
      "neighborhood": "Nome do Bairro",
      "priceRange": "$$",
      "distanceKm": 3.5,
      "cuisineType": "Japonesa",
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

⚠️ VALIDAÇÃO FINAL - CADA LUGAR DEVE PASSAR NESTES TESTES:
${filters.distancia === 'perto' ? `✅ distanceKm <= 3.0? Se distanceKm > 3.0, REJEITE o lugar.` : ''}
${filters.distancia === 'medio' ? `✅ 3.0 <= distanceKm <= 10.0? Se não, REJEITE.` : ''}
${filters.distancia === 'longe' ? `✅ distanceKm > 10.0? Se não, REJEITE.` : ''}
✅ priceRange === "${filters.budget}"? Se não, REJEITE.
✅ Funciona ${filters.period === 'dia' ? 'durante o dia' : 'à noite'}?
${filters.type === 'gastronomia' && filters.budget === '$' ? '✅ É um lugar POPULAR/BARATO (churrasquinho, tapiocaria, lanchonete)?' : ''}

🚫 LUGARES REJEITADOS = NÃO INCLUA NA LISTA. BUSQUE OUTRO QUE PASSE NA VALIDAÇÃO.

IMPORTANTE: 
- BUSQUE informações REAIS na web. NÃO invente.
- Retorne APENAS JSON válido.
- NÃO inclua referências numéricas entre colchetes.
- Se não encontrar 5 lugares que passem na validação, retorne menos lugares.`

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
        tags: rec.cuisineType
          ? ['romântico', 'perplexity-recomendado', rec.cuisineType.toLowerCase()]
          : ['romântico', 'perplexity-recomendado'],
        imageUrl: '',
        rating: rec.rating || 0,
        suggestedActivity: cleanActivity.trim(),
        openingHours: rec.openingHours || 'Consultar horários',
        specialTip: cleanTip.trim(),
        aiRecommended: true,
        temEstacionamento: rec.temEstacionamento || false,
        acessivel: rec.acessivel || false,
        cuisineType: rec.cuisineType || null,
        distanceKm: rec.distanceKm || null,
        priceRange: rec.priceRange || filters.budget
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
