import * as Location from 'expo-location';
import OpenAI from 'openai';
import { Place, PlaceFilters } from '../types/place';
import { fetchRealPlaces, RealPlace } from './placesValidationService';

// ─── Helpers de descrição ─────────────────────────────────────────────────────

const BUDGET_LABELS: Record<string, string> = {
  '$':   'Econômico — até R$50/pessoa (churrasquinhos, tapiocarias, lanchonetes, food trucks, espetinhos)',
  '$$':  'Moderado — R$50 a R$150/pessoa (restaurantes casuais, pizzarias, hamburguerias gourmet, bistrôs)',
  '$$$': 'Premium — acima de R$150/pessoa (fine dining, alta gastronomia, experiências exclusivas)',
};

const TYPE_LABELS: Record<string, string> = {
  gastronomia:   'Gastronomia (varie os tipos: japonesa, italiana, regional, frutos do mar, hamburguerias, etc.)',
  cultura:       'Cultura e entretenimento (museus, teatros, cinemas, galerias, centros culturais)',
  'ao-ar-livre': 'Ao ar livre (parques, praias, orla, trilhas, praças, mirantes)',
  aventura:      'Aventura e atividades (kart, paintball, tirolesa, passeios de barco, parques)',
  casual:        'Casual e relaxado (cafeterias, sorveterias, docerias, bares tranquilos)',
};

// ─── Subcategorias de gastronomia ────────────────────────────────────────────
// Mapeamento de subcategorias para keywords usadas no prompt da IA.
export const GASTRONOMY_SUBTYPES: { key: string; label: string; emoji: string }[] = [
  { key: 'churrasco',    label: 'Churrasco',    emoji: '🥩' },
  { key: 'sushi',        label: 'Sushi / Japonês',  emoji: '🍣' },
  { key: 'pizza',        label: 'Pizza',         emoji: '🍕' },
  { key: 'hamburguer',   label: 'Hamburguer',    emoji: '🍔' },
  { key: 'frutos-do-mar',label: 'Frutos do Mar', emoji: '🦐' },
  { key: 'italiana',     label: 'Italiana',      emoji: '🍝' },
  { key: 'nordestina',   label: 'Nordestina',    emoji: '🍲' },
  { key: 'mexicana',     label: 'Mexicana',      emoji: '🌮' },
  { key: 'vegetariana',  label: 'Vegetariana',   emoji: '🥗' },
  { key: 'doceria',      label: 'Doceria / Sobremesas', emoji: '🍰' },
];

const VIBE_LABELS: Record<string, string> = {
  intimo:    'Íntimo e romântico — mesas afastadas, iluminação baixa, ambiente privativo',
  animado:   'Animado e festivo — música, movimento, ambiente descontraído',
  tranquilo: 'Tranquilo — sem barulho excessivo, ideal para conversar',
};

const DISTANCE_LABELS: Record<string, string> = {
  perto: 'MÁXIMO 3 km — rejeite qualquer lugar acima disso',
  medio: 'Entre 3 km e 10 km — não inclua nem mais perto nem mais longe',
  longe: 'Acima de 10 km — bairros novos para explorar',
};

// ─── Âncoras geográficas de São Luís ─────────────────────────────────────────
// Coordenadas reais dos principais bairros, usadas como referência no prompt
// para reduzir alucinações geográficas do modelo.

const SAO_LUIS_GEO_ANCHORS = `
## Referência geográfica — bairros e coordenadas reais de São Luís/MA

Use esta tabela para calibrar as coordenadas de cada lugar recomendado.
As coordenadas do estabelecimento DEVEM ser coerentes com o bairro listado.

| Bairro                  | Lat (aprox.) | Lon (aprox.) | Referência visual                        |
|-------------------------|--------------|--------------|------------------------------------------|
| Centro Histórico        | -2.5307      | -44.3068     | Praia Grande, Rua Portugal, Rua do Sol   |
| São Francisco           | -2.5200      | -44.2900     | Próximo ao Terminal da Praia Grande      |
| Ponta d'Areia           | -2.4950      | -44.2700     | Orla da Ponta d'Areia, Praia             |
| Ponta do Farol          | -2.4978      | -44.2190     | Av. dos Holandeses, shoppings, restaurantes|
| Calhau                  | -2.4830      | -44.2450     | Praia do Calhau, quiosques               |
| Renascença II           | -2.5050      | -44.2350     | Av. dos Holandeses (trecho sul)          |
| Jardim Renascença       | -2.5150      | -44.2500     | Av. Jerônimo de Albuquerque              |
| Cohama                  | -2.5300      | -44.2600     | Av. dos Holandeses (trecho residencial)  |
| Turu                    | -2.5400      | -44.2800     | Av. dos Sarney, bairro residencial       |
| Olho d'Água             | -2.5500      | -44.2900     | Bairro residencial, interior             |
| Bequimão                | -2.5600      | -44.3100     | Bairro sul, mais afastado                |
| Vinhais                 | -2.5700      | -44.2400     | Grande Vinhais, interior                 |
| Anil                    | -2.5650      | -44.2900     | Av. Colares Moreira, comércio            |
| Lagoa da Jansen         | -2.5180      | -44.2730     | Parque da Lagoa, orla da lagoa           |
| Araçagy / Paço do Lumiar| -2.5650      | -44.1800     | Próximo ao aeroporto                     |

Vias principais conhecidas (use como referência de endereço):
- Av. dos Holandeses (Ponta do Farol / Renascença / Cohama)
- Av. Litorânea (Calhau / Ponta d'Areia)
- Av. Jerônimo de Albuquerque (Jardim Renascença)
- Av. Colares Moreira (Anil / centro expandido)
- Rua do Sol / Rua Portugal / Rua da Palma (Centro Histórico)
- Rua Grande (Centro)
- Av. dos Sarney (Turu)
- Av. São Luís Rei de França (Cohama)
`.trim();

// Novo prompt — IA recebe lista real e só escreve o conteúdo criativo
function buildPromptWithRealPlaces(
  realPlaces: RealPlace[],
  filters: PlaceFilters
): string {
  const period = filters.period === 'dia' ? 'durante o dia' : 'à noite';

  const budgetLabel: Record<string, string> = {
    '$':   'Econômico — até R$50/pessoa',
    '$$':  'Moderado — R$50 a R$150/pessoa',
    '$$$': 'Premium — acima de R$150/pessoa',
  };

  const placesList = realPlaces
    .map((p, i) =>
      `${i + 1}. ${p.name} | ${p.address} | lat: ${p.lat}, lng: ${p.lng} | rating: ${p.rating}`
    )
    .join('\n');

  // Bloco de restrição de subcategoria — inserido ANTES das regras críticas
  const subtypeBlock = filters.cuisineSubtype
    ? `
## 🚫 RESTRIÇÃO DE CULINÁRIA — LEIA COM ATENÇÃO:
O usuário escolheu especificamente: **${filters.cuisineSubtype.toUpperCase()}**

REGRA ABSOLUTA: Inclua SOMENTE estabelecimentos que sirvam essa culinária.
- ✅ Permitido: restaurantes, lanchonetes ou quiosques que sirvam ${filters.cuisineSubtype}
- ❌ PROIBIDO: qualquer lugar que NÃO seja ${filters.cuisineSubtype} (ex: se o usuário quer sushi, REJEITE Bob's, Subway, McDonald's, hamburguerias, pizzarias, etc.)
- ❌ PROIBIDO: incluir um lugar "parecido" ou "próximo" — se não for ${filters.cuisineSubtype}, EXCLUA da lista.
- Se houver menos de 5 lugares compatíveis na lista, retorne APENAS os compatíveis (pode retornar menos de 10).
`
    : '';

  return `Você é um especialista em experiências românticas em São Luís, MA.

Abaixo está uma lista de lugares REAIS.
Selecione os melhores para um casal com base nos critérios abaixo e escreva o conteúdo criativo.
${subtypeBlock}
## Lugares disponíveis:
${placesList}

## Critérios de seleção:
- Período: ${period}
- Orçamento: ${filters.budget} — ${budgetLabel[filters.budget] ?? ''}
- Tipo de experiência: ${filters.type}
${filters.cuisineSubtype ? `- Culinária: ${filters.cuisineSubtype} (OBRIGATÓRIO — veja restrição acima)` : ''}
${filters.ambiente ? `- Clima desejado: ${filters.ambiente}` : ''}

## Para cada lugar escolhido, escreva:
- description: por que é perfeito para um casal (2-3 frases envolventes)
- romanticActivity: sugestão de atividade especial para o casal
- specialTip: dica exclusiva sobre o lugar
- openingHours: horário de funcionamento se souber, ou "Consultar horários"

## REGRAS CRÍTICAS:
1. NÃO altere name, address, latitude nem longitude — use EXATAMENTE os valores da lista.
2. Retorne entre 5 e 8 lugares — priorizando qualidade e aderência aos critérios.
3. ${filters.cuisineSubtype ? `REJEITE qualquer lugar que não seja ${filters.cuisineSubtype}. Sem exceções.` : `Os lugares DEVEM refletir o perfil de orçamento "${filters.budget}".`}

Retorne APENAS JSON válido:
{
  "places": [
    {
      "name": "exatamente como na lista",
      "address": "exatamente como na lista",
      "latitude": 0.0000,
      "longitude": 0.0000,
      "description": "...",
      "romanticActivity": "...",
      "specialTip": "...",
      "openingHours": "..."
    }
  ]
}`;
}

// ─── Chamada à API OpenRouter (via OpenAI SDK) ────────────────────────────────
// Modelo: meta-llama/llama-3.3-70b-instruct:free
// Escolhido por ser o mais capaz dos modelos gratuitos no OpenRouter:
//   • 128k de contexto (vs 32k do Gemma 2 9B)
//   • Qualidade de instrução superior ao Qwen 2.5 72B nas tarefas em PT-BR

const OPENROUTER_MODEL = 'meta-llama/llama-3.3-70b-instruct';

function createOpenRouterClient(): OpenAI {
  const key = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  if (!key) throw new Error('EXPO_PUBLIC_OPENROUTER_API_KEY não definida no .env');

  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: key,
    defaultHeaders: {
      'HTTP-Referer': 'https://github.com/v1nizx/dateapp-mobile',
      'X-Title': 'Date App Mobile',
    },
    dangerouslyAllowBrowser: true, // necessário para React Native / Expo
  });
}

async function getAIRecommendations(filters: PlaceFilters): Promise<Place[]> {
  // 1. Busca lugares reais primeiro
  const budgetLabel = { '$': 'Econômico', '$$': 'Moderado', '$$$': 'Premium' }[filters.budget] ?? filters.budget;
  const subtypeLog = filters.cuisineSubtype ? ` | culinária: ${filters.cuisineSubtype}` : '';
  console.log(`📍 [Geoapify] Buscando lugares — tipo: ${filters.type}${subtypeLog} | budget: ${budgetLabel} | distância: ${filters.distancia ?? 'medio'}...`);
  const realPlaces = await fetchRealPlaces(filters);

  if (realPlaces.length === 0) {
    throw new Error(
      'Não encontramos lugares para esses filtros.\n\n' +
      'Tente:\n• Ampliar a distância (Médio ou Explorar)\n• Mudar o tipo de experiência\n• Remover filtros avançados'
    );
  }
  console.log(`✅ [Geoapify] ${realPlaces.length} lugares encontrados e ranqueados`);

  // 2. IA só escreve o conteúdo criativo com base nos lugares reais
  console.log(`🤖 [OpenRouter/${OPENROUTER_MODEL}] Gerando descrições românticas...`);
  const prompt = buildPromptWithRealPlaces(realPlaces, filters);

  const client = createOpenRouterClient();

  // Função interna com retry automático para 429 (rate limit)
  async function callWithRetry(retries = 2): Promise<string> {
    try {
      const completion = await client.chat.completions.create({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente do Date App especialista em experiências românticas. ' +
              'Responda APENAS em JSON no formato: {"places": [{"name": "...", "address": "...", "latitude": 0, "longitude": 0, "description": "...", "romanticActivity": "...", "specialTip": "...", "openingHours": "..."}]}.\n\n' +
              'Exemplo de entrada: Lista de lugares com critérios de busca (ex: jantar romântico econômico)\n' +
              'Exemplo de saída: {"places": [{"name": "Pizzaria Bela Napoli", "address": "Rua das Flores, 123", "latitude": -2.53, "longitude": -44.30, "description": "Lugar charmoso e intimista, perfeito para conversar.", "romanticActivity": "Dividir uma pizza à luz de velas.", "specialTip": "A pizzaria costuma encher aos finais de semana, chegue cedo.", "openingHours": "18h às 23h"}]}',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices?.[0]?.message?.content;
      if (!content) throw new Error('Resposta vazia do OpenRouter');
      return content;
    } catch (err: any) {
      // 429 — rate limit: aguarda e tenta novamente
      const status = err?.status ?? err?.response?.status;
      if (status === 429 && retries > 0) {
        const retryAfter = err?.headers?.['retry-after'];
        const waitMs = retryAfter ? parseFloat(retryAfter) * 1000 : 8000;
        console.warn(`⏳ [OpenRouter] Rate limit atingido — aguardando ${(waitMs / 1000).toFixed(1)}s...`);
        await new Promise(resolve => setTimeout(resolve, waitMs + 500));
        return callWithRetry(retries - 1);
      }
      // 429 após todos os retries — mensagem amigável
      if (status === 429) {
        throw new Error(
          `Muitas buscas em pouco tempo! ⏳\n\n` +
          `Aguarde alguns segundos e tente novamente.\n` +
          `(Limite do plano gratuito atingido)`
        );
      }
      throw new Error(`OpenRouter API erro ${status ?? 'desconhecido'}: ${err?.message ?? err}`);
    }
  }

  const rawContent = await callWithRetry();

  // OpenRouter pode retornar whitespace/\r\n antes do JSON — extrai o bloco { } com regex
  const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Resposta inválida do OpenRouter (sem JSON): ${rawContent.substring(0, 100)}`);
  }
  const parsed = JSON.parse(jsonMatch[0]);
  const aiPlaces: any[] = parsed.places ?? [];

  // 3. Mescla: dados reais (Geoapify) + conteúdo criativo (OpenRouter)
  //    Geoapify sempre tem prioridade sobre o que a IA retornou
  return aiPlaces.map((aiPlace, idx) => {
    // Tenta casar pelo nome; fallback para o índice correspondente
    const real = realPlaces.find(
      r => r.name.toLowerCase() === aiPlace.name?.toLowerCase()
    ) ?? realPlaces[idx];

    return {
      id: `place-${Date.now()}-${idx}`,
      name:              real.name,
      address:           real.address,
      neighborhood:      aiPlace.neighborhood ?? '',
      latitude:          real.lat,
      longitude:         real.lng,
      budget:            filters.budget as any,
      type:              filters.type as any,
      cuisineSubtype:    filters.cuisineSubtype ?? null,
      period:            filters.period as any,
      priceRange:        filters.budget as any,
      distanceKm:        real.distance ? real.distance / 1000 : null,
      cuisineType:       aiPlace.cuisineType ?? null,
      rating:            real.rating,
      openingHours:      aiPlace.openingHours ?? 'Consultar horários',
      description:       aiPlace.description ?? '',
      suggestedActivity: aiPlace.romanticActivity ?? '',
      specialTip:        aiPlace.specialTip ?? '',
      aiRecommended:     true,
      temEstacionamento: aiPlace.temEstacionamento ?? false,
      acessivel:         aiPlace.acessivel ?? false,
      tags:              ['romântico'],
      imageUrl:          '',
    } as Place;
  });
}

// ─── PlacesService ────────────────────────────────────────────────────────────

/** Remove duplicatas de uma lista de lugares com base em coordenadas ou nome.
 *  - Coordenadas: arredondadas a 4 casas decimais (~11 m de precisão)
 *  - Nome: normalizado (lowercase, sem acentos, sem espaços extras)
 *  O primeiro item encontrado sempre é mantido; duplicatas posteriores são descartadas.
 */
function deduplicatePlaces(places: Place[]): Place[] {
  const seenCoords = new Set<string>();
  const seenNames  = new Set<string>();

  return places.filter(p => {
    // Chave de localização: lat e lng arredondados a 4 dígitos
    const lat = p.latitude  != null ? p.latitude.toFixed(4)  : 'null';
    const lng = p.longitude != null ? p.longitude.toFixed(4) : 'null';
    const coordKey = `${lat},${lng}`;

    // Chave de nome: lowercase sem espaços múltiplos
    const nameKey = p.name.toLowerCase().replace(/\s+/g, ' ').trim();

    if (seenCoords.has(coordKey) || seenNames.has(nameKey)) {
      console.warn(`🔁 [Dedup] Removido duplicata: "${p.name}" (${coordKey})`);
      return false;
    }

    seenCoords.add(coordKey);
    seenNames.add(nameKey);
    return true;
  });
}

export class PlacesService {
  /** Busca recomendações via OpenRouter (meta-llama/llama-3.3-70b-instruct:free) */
  static async searchPlaces(filters: PlaceFilters): Promise<Place[]> {
    try {
      console.log('🔍 [PlacesService] Iniciando busca...');
      const results = await getAIRecommendations(filters);
      const unique   = deduplicatePlaces(results);
      if (unique.length < results.length) {
        console.log(`🧹 [Dedup] ${results.length - unique.length} duplicata(s) removida(s)`);
      }
      console.log(`✅ [PlacesService] ${unique.length} recomendações únicas prontas`);
      return unique;
    } catch (error) {
      console.error('❌ Erro ao buscar recomendações:', error);
      throw error;
    }
  }

  /** Obtém localização atual via expo-location */
  static async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const err = Object.assign(new Error('Permissão de localização negada'), { type: 'PERMISSION_DENIED' });
        throw err;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
    } catch (error) {
      if (error instanceof Error && (error as any).type) throw error;
      throw Object.assign(new Error('Erro ao obter localização'), { type: 'UNKNOWN' });
    }
  }

  /** Localização padrão — São Luís, MA */
  static getDefaultLocation(): { latitude: number; longitude: number } {
    return { latitude: -2.5307, longitude: -44.3068 };
  }

  static getRandomPlace(places: Place[]): Place | null {
    if (places.length === 0) return null;
    return places[Math.floor(Math.random() * places.length)];
  }
}

export { PlaceFilters, Place };
