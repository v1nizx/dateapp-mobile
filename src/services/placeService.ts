import * as Location from 'expo-location';
import { ENV } from '../config/env';
import { Place, PlaceFilters } from '../types/place';

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

// ─── Construção do prompt ─────────────────────────────────────────────────────

function buildPrompt(filters: PlaceFilters): string {
  const period = filters.period === 'dia' ? 'durante o dia' : 'à noite';
  const lines: string[] = [];

  lines.push(`Você é um guia turístico especialista em São Luís, Maranhão, Brasil.`);
  lines.push(`Encontre exatamente 5 lugares REAIS e conhecidos para um casal visitar.`);
  lines.push('');
  lines.push(`## Critérios obrigatórios`);
  lines.push(`- **Orçamento:** ${BUDGET_LABELS[filters.budget] ?? filters.budget}`);
  lines.push(`- **Tipo de experiência:** ${TYPE_LABELS[filters.type] ?? filters.type}`);
  lines.push(`- **Período:** ${period}`);
  lines.push(`- **Localização do casal:** Lat ${filters.latitude}, Lon ${filters.longitude}`);

  if (filters.distancia) {
    lines.push(`- **Distância:** ${DISTANCE_LABELS[filters.distancia]}`);
  }
  if (filters.ambiente) {
    lines.push(`- **Clima do lugar:** ${VIBE_LABELS[filters.ambiente]}`);
  }
  if (filters.temEstacionamento) {
    lines.push(`- **Obrigatório:** ter estacionamento próprio ou acesso fácil`);
  }
  if (filters.acessivel) {
    lines.push(`- **Obrigatório:** ser acessível para cadeirantes`);
  }

  lines.push('');
  lines.push(`## Instruções gerais`);
  lines.push(`1. Use APENAS lugares que EXISTEM DE VERDADE e são conhecidos em São Luís/MA.`);
  lines.push(`2. Verifique que o lugar funciona ${period} antes de incluir.`);
  lines.push(`3. O preço deve ser condizente com o orçamento escolhido.`);
  if (filters.distancia) {
    lines.push(`4. Calcule a distância de cada lugar. Rejeite os que não respeitam o critério.`);
  }

  lines.push('');
  lines.push(`## Regras críticas para endereço (leia com atenção)`);
  lines.push(`- O "address" deve ser o endereço REAL da via pública, verificável no Google Maps.`);
  lines.push(`- ❌ PROIBIDO usar o nome do estabelecimento como nome de rua. Exemplos de erros: "Rua Restaurante X", "Av. Pizzaria Y", "Travessa Bar Z" — isso é alucinação, não faça isso.`);
  lines.push(`- ✅ Use o nome real da via: Av. dos Holandeses, Rua do Sol, Av. Litorânea, Rua Grande, Av. Jerônimo de Albuquerque, etc.`);
  lines.push(`- Se não souber o número exato, use "s/n" ou omita o número. Nunca invente números.`);
  lines.push(`- Forneça "latitude" e "longitude" aproximadas do local (coordenadas reais em São Luís/MA).`);
  lines.push(`- Exemplo CORRETO: { "address": "Av. dos Holandeses, 1600 - Ponta do Farol, São Luís - MA", "latitude": -2.4978, "longitude": -44.2190 }`);
  lines.push(`- Exemplo ERRADO: { "address": "Rua Sushilândia, 10 - Centro, São Luís - MA" } ← nome de rua inventado`);

  lines.push('');
  lines.push(`## Formato de resposta`);
  lines.push(`Retorne APENAS JSON válido, sem texto antes ou depois:`);
  lines.push(`{
  "places": [
    {
      "name": "Nome completo e real do estabelecimento",
      "address": "Nome real da via, Número - Bairro, São Luís - MA",
      "neighborhood": "Nome do bairro",
      "latitude": -2.5123,
      "longitude": -44.2987,
      "priceRange": "${filters.budget}",
      "distanceKm": 2.5,
      "cuisineType": "Tipo (ex: Japonesa, Brasileira, Café)",
      "description": "Por que este lugar é perfeito para um encontro romântico (2-3 frases envolventes)",
      "rating": 4.5,
      "openingHours": "Seg-Sex: 18h-23h, Sáb-Dom: 12h-23h",
      "romanticActivity": "Sugestão de atividade ou momento especial para o casal",
      "specialTip": "Uma dica exclusiva que só um local saberia",
      "temEstacionamento": true,
      "acessivel": false
    }
  ]
}`);

  return lines.join('\n');
}

// ─── Chamada à API Groq ───────────────────────────────────────────────────────

async function getGroqRecommendations(filters: PlaceFilters): Promise<Place[]> {
  const key = ENV.GROQ_API_KEY;
  if (!key) throw new Error('Chave GROQ_API_KEY não configurada em src/config/env.ts');

  const prompt = buildPrompt(filters);
  console.log('🤖 Chamando Groq AI (llama-3.3-70b)...');

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
            'Você é um guia turístico especialista em São Luís, MA. Responda SEMPRE com JSON válido, sem texto extra, sem markdown.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro Groq:', errorText);
    throw new Error(`Erro na API Groq: ${response.status}`);
  }

  const data = await response.json();
  const rawContent: string = data.choices?.[0]?.message?.content ?? '';
  console.log('✅ Groq respondeu:', rawContent.substring(0, 200));

  let parsed: any;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    const match = rawContent.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
    else throw new Error('Groq não retornou JSON válido');
  }

  const raw: any[] = parsed.places ?? parsed.recommendations ?? [];
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('Nenhum lugar retornado pela IA');

  const clean = (s?: string) => (s ?? '').replace(/\s*\[\d+(,\s*\d+)*\]/g, '').trim();

  return raw.map((rec: any, idx: number) => ({
    id: `groq-${Date.now()}-${idx}`,
    name: rec.name ?? 'Lugar sem nome',
    description: clean(rec.description) || 'Descrição não disponível',
    address: rec.address ?? 'São Luís, MA',
    mapUrl: rec.latitude && rec.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${rec.latitude},${rec.longitude}&query_place_id=${encodeURIComponent(rec.name ?? '')}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${rec.name ?? ''} ${rec.address ?? ''} São Luís MA`)}`,
    budget: filters.budget,
    type: filters.type,
    period: filters.period,
    tags: rec.cuisineType
      ? ['romântico', 'groq-recomendado', String(rec.cuisineType).toLowerCase()]
      : ['romântico', 'groq-recomendado'],
    imageUrl: '',
    rating: rec.rating ?? 0,
    suggestedActivity: clean(rec.romanticActivity) || 'Aproveitem o momento juntos',
    openingHours: rec.openingHours ?? 'Consultar horários',
    specialTip: clean(rec.specialTip),
    aiRecommended: true,
    temEstacionamento: rec.temEstacionamento ?? false,
    acessivel: rec.acessivel ?? false,
    cuisineType: rec.cuisineType ?? null,
    distanceKm: rec.distanceKm ?? null,
    priceRange: rec.priceRange ?? filters.budget,
  } as Place));
}

// ─── PlacesService ────────────────────────────────────────────────────────────

export class PlacesService {
  /** Busca recomendações via Groq AI (llama-3.3-70b) */
  static async searchPlaces(filters: PlaceFilters): Promise<Place[]> {
    try {
      console.log('🔍 Buscando recomendações via Groq AI...');
      const results = await getGroqRecommendations(filters);
      console.log(`✅ Encontradas ${results.length} recomendações`);
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
