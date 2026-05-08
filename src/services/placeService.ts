import * as Location from 'expo-location';
import { ENV } from '../config/env';
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

  const placesList = realPlaces
    .map((p, i) =>
      `${i + 1}. ${p.name} | ${p.address} | lat: ${p.lat}, lng: ${p.lng} | rating: ${p.rating}`
    )
    .join('\n');

  return `Você é um especialista em experiências românticas em São Luís, MA.

Abaixo está uma lista de lugares REAIS confirmados pelo Google Maps.
Escolha os 5 melhores para um casal e escreva o conteúdo criativo de cada um.

## Lugares disponíveis (REAIS — não altere nome, endereço ou coordenadas):
${placesList}

## Critérios de seleção:
- Período: ${period}
- Orçamento: ${filters.budget}
- Tipo: ${filters.type}
${filters.ambiente ? `- Clima desejado: ${filters.ambiente}` : ''}

## Sua tarefa:
Para cada lugar escolhido, escreva:
- description: por que é perfeito para um casal (2-3 frases envolventes)
- romanticActivity: sugestão de atividade especial para o casal
- specialTip: dica exclusiva sobre o lugar
- openingHours: horário de funcionamento se souber, ou "Consultar horários"

## REGRA CRÍTICA:
NÃO altere name, address, latitude nem longitude — use EXATAMENTE os valores da lista acima.

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

// ─── Chamada à API Groq ───────────────────────────────────────────────────────

async function getGroqRecommendations(filters: PlaceFilters): Promise<Place[]> {
  const key = ENV.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY não configurada');

  // 1. Busca lugares reais primeiro
  console.log('📍 [Geoapify] Buscando lugares reais...');
  const realPlaces = await fetchRealPlaces(filters);

  if (realPlaces.length === 0) {
    throw new Error('Nenhum lugar encontrado na sua região. Tente ampliar a distância.');
  }
  console.log(`✅ [Geoapify] ${realPlaces.length} lugares encontrados e ranqueados`);

  // 2. IA só escreve o conteúdo criativo com base nos lugares reais
  console.log('🤖 [Groq] Gerando descrições românticas...');
  const prompt = buildPromptWithRealPlaces(realPlaces, filters);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'Você cria descrições românticas para lugares reais. ' +
            'Nunca altere nome, endereço ou coordenadas fornecidos. ' +
            'Responda APENAS com JSON válido.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7, // Pode ser mais alto — criatividade nas descrições é ok
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API erro ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Resposta vazia da Groq');

  const parsed = JSON.parse(content);
  const aiPlaces: any[] = parsed.places ?? [];

  // 3. Mescla: dados reais (Geoapify) + conteúdo criativo (Groq)
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

export class PlacesService {
  /** Busca recomendações via Groq AI (llama-3.3-70b) */
  static async searchPlaces(filters: PlaceFilters): Promise<Place[]> {
    try {
      console.log('🔍 [PlacesService] Iniciando busca...');
      const results = await getGroqRecommendations(filters);
      console.log(`✅ [PlacesService] ${results.length} recomendações prontas`);
      return results;
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
