
// ── Geoapify Places API v2 ────────────────────────────────────────────────────
// Docs: https://apidocs.geoapify.com/docs/places/
// Auth: apiKey query param — sem headers especiais
// Gratuito: 3.000 créditos/dia (cada 20 lugares = 1 crédito)
const BASE = 'https://api.geoapify.com/v2/places';

// ─── Mapeamento de categorias ─────────────────────────────────────────────────
// Geoapify usa hierarquia com pontos: catering.restaurant, entertainment.museum…
// Passamos múltiplas categorias separadas por vírgula em uma só requisição.
//
// Para cada tipo de experiência, definimos categorias distintas por faixa de preço
// garantindo que a busca traga lugares coerentes com o orçamento selecionado.

type BudgetTier = '$' | '$$' | '$$$';

const GEO_CATEGORIES_BY_BUDGET: Record<string, Record<BudgetTier, string>> = {
  gastronomia: {
    '$':   'catering.fast_food,catering.food_court,catering.cafe',
    '$$':  'catering.restaurant,catering.cafe,catering.bar,catering.pub',
    '$$$': 'catering.restaurant,catering.bar',
  },
  cultura: {
    '$':   'entertainment.museum,tourism.sights,tourism.attraction',
    '$$':  'entertainment.museum,entertainment.culture.gallery,entertainment.cinema,tourism.attraction',
    '$$$': 'entertainment.museum,entertainment.culture.gallery,entertainment.culture.theatre,tourism.attraction,tourism.sights',
  },
  'ao-ar-livre': {
    '$':   'leisure.park,beach,leisure.park.garden,leisure.playground',
    '$$':  'leisure.park,beach,leisure.park.garden,sport.pitch',
    '$$$': 'beach,leisure.park,maritime.marina,sport',
  },
  aventura: {
    '$':   'sport,leisure.playground,sport.pitch',
    '$$':  'sport,entertainment.theme_park,tourism.attraction',
    '$$$': 'sport,entertainment.theme_park,tourism.attraction,entertainment.water_park',
  },
  casual: {
    '$':   'catering.cafe,catering.ice_cream,catering.fast_food',
    '$$':  'catering.cafe,catering.bar,catering.ice_cream,catering.pub',
    '$$$': 'catering.cafe,catering.bar,catering.restaurant',
  },
};

function getCategoriesByBudget(type: string, budget: BudgetTier): string {
  const byType = GEO_CATEGORIES_BY_BUDGET[type];
  if (!byType) return 'catering.restaurant';
  return byType[budget] ?? byType['$$'];
}

// ─── Tipos exportados ─────────────────────────────────────────────────────────

export interface RealPlace {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  /** Score de relevância contextual calculado localmente (0–1) */
  rating: number;
  priceLevel: number | null;
  categories: string[];
  openNow: boolean | null;
  /** Distância em metros até o usuário (retornada pela API quando bias=proximity) */
  distance: number | null;
}

// ─── Função principal ─────────────────────────────────────────────────────────

/**
 * Busca lugares REAIS via Geoapify e os classifica por relevância contextual:
 *   40% — proximidade ao usuário (distância em metros)
 *   30% — aberto agora (parsing de opening_hours)
 *   20% — popularidade interna (campo rank.popularity da API)
 *   10% — completude do dado (tem nome + endereço)
 */
export async function fetchRealPlaces(filters: {
  type: string;
  budget: string;
  period: string;
  latitude: number;
  longitude: number;
  distancia?: string;
}): Promise<RealPlace[]> {
  const budget = (filters.budget as BudgetTier) ?? '$$';
  const categories = getCategoriesByBudget(filters.type, budget);

  const radiusMap: Record<string, number> = {
    perto:  3_000,
    medio: 10_000,
    longe: 25_000,
  };
  const radius = radiusMap[filters.distancia ?? 'medio'];

  // ── Retry automático com raio 2× se não houver resultados ──────────────────
  let places = await fetchByCategories(
    categories,
    filters.latitude,
    filters.longitude,
    radius,
  );

  if (places.length === 0) {
    const expandedRadius = Math.min(radius * 2, 40_000);
    console.log(`⚠️ Sem resultados — expandindo raio para ${expandedRadius / 1000} km...`);
    places = await fetchByCategories(
      categories,
      filters.latitude,
      filters.longitude,
      expandedRadius,
    );
  }

  if (places.length === 0) return [];

  // ── Score de relevância contextual ────────────────────────────────────────
  const scored = places.map(p => {
    // 1. Proximidade (0–1): quanto mais perto, maior
    const distScore = p.distance !== null
      ? Math.max(0, 1 - p.distance / radius)
      : 0.5;

    // 2. Aberto agora (0 | 0.5 | 1)
    const openScore = p.openNow === true ? 1 : p.openNow === false ? 0 : 0.5;

    // 3. Popularidade interna — já normalizada 0–1 pela API
    const popScore = p.rating; // valor original de rank.popularity

    // 4. Completude do dado
    const dataScore = (p.name && p.address) ? 1 : 0.5;

    const score = distScore * 0.4 + openScore * 0.3 + popScore * 0.2 + dataScore * 0.1;
    return { place: p, score };
  });

  // Ordena pelo score mas adiciona leve aleatoriedade nos top-15
  // para garantir variedade entre buscas consecutivas com os mesmos filtros
  const top15 = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  // Embaralha levemente: mantém os melhores no topo mas com variação
  const shuffled = top15
    .map(item => ({ item, rand: item.score + Math.random() * 0.15 }))
    .sort((a, b) => b.rand - a.rand)
    .slice(0, 10)
    .map(({ item }) => item);

  return shuffled.map(s => {
    // Converte score interno (0–1) para escala de estrelas (1–5),
    // arredondado para o 0.5 mais próximo. Score < 0.6 → sem exibição (0).
    const stars = s.score >= 0.6
      ? Math.round(s.score * 5 * 2) / 2   // ex: 0.7 → 3.5 | 0.9 → 4.5
      : 0;
    return { ...s.place, rating: Math.min(5, stars) };
  });
}

// ─── Requisição à API ─────────────────────────────────────────────────────────

async function fetchByCategories(
  categories: string,
  lat: number,
  lng: number,
  radius: number,
): Promise<RealPlace[]> {
  // ⚠️ Geoapify usa coordenadas na ordem lon,lat (GeoJSON) em filter e bias
  const params = new URLSearchParams({
    categories,
    filter:  `circle:${lng},${lat},${radius}`,
    bias:    `proximity:${lng},${lat}`,
    limit:   '20',
    lang:    'pt',
    apiKey: process.env.EXPO_PUBLIC_GEOAPIFY_KEY ?? '',
  });

  const url = `${BASE}?${params.toString()}`;
  console.log(`🌍 Geoapify: [${categories}] raio=${radius}m`);

  try {
    const res = await fetch(url, {
      method:  'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Geoapify erro ${res.status}:`, errText);
      return [];
    }

    const data = await res.json();
    const features: any[] = data.features ?? [];

    console.log(`✅ Geoapify: ${features.length} lugares encontrados`);

    return features
      .filter((f: any) => f.properties?.name) // só lugares com nome
      .map((f: any) => {
        const p  = f.properties;
        // GeoJSON: coordinates é [longitude, latitude]
        const [fLng, fLat] = f.geometry?.coordinates ?? [lng, lat];

        return {
          placeId:    p.place_id ?? `geo-${fLat}-${fLng}`,
          name:       p.name,
          address:    buildAddress(p),
          lat:        fLat,
          lng:        fLng,
          // rank.popularity é 0–1; rank.importance é outro score de relevância OSM
          rating:     p.rank?.popularity ?? p.rank?.importance ?? 0,
          priceLevel: null, // Geoapify não retorna faixa de preço
          categories: p.categories ?? [],
          openNow:    parseOpenNow(p.opening_hours),
          distance:   p.distance ?? null,
        } as RealPlace;
      });

  } catch (err) {
    console.error('Erro ao buscar lugares no Geoapify:', err);
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Monta endereço legível a partir das propriedades do Geoapify */
function buildAddress(p: any): string {
  const parts = [
    p.address_line1,
    p.address_line2,
  ].filter(Boolean);

  if (parts.length) return parts.join(', ');

  // Fallback para o endereço formatado completo
  return p.formatted ?? '';
}

/**
 * Interpreta a string OSM de horário de funcionamento e retorna
 * se o lugar está aberto agora.
 * Formato OSM simplificado: "Mo-Fr 09:00-17:00; Sa 10:00-15:00" | "24/7"
 * Retorna null quando não há informação de horário.
 */
function parseOpenNow(openingHours: string | null | undefined): boolean | null {
  if (!openingHours) return null;
  if (openingHours === '24/7') return true;

  try {
    const now        = new Date();
    const dayIdx     = now.getDay();                         // 0=Dom … 6=Sáb
    const OSM_DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const todayCode  = OSM_DAYS[dayIdx];
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const rules = openingHours.split(';').map(r => r.trim());

    for (const rule of rules) {
      // Suporta: "Mo-Fr 09:00-22:00" e "Mo,We,Fr 10:00-18:00"
      const match = rule.match(/^([\w,\-]+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
      if (!match) continue;

      const [, daysStr, startStr, endStr] = match;
      if (!isDayIncluded(daysStr, todayCode, OSM_DAYS)) continue;

      const [sh, sm] = startStr.split(':').map(Number);
      const [eh, em] = endStr.split(':').map(Number);
      const start = sh * 60 + sm;
      const end   = eh * 60 + em;

      if (nowMinutes >= start && nowMinutes <= end) return true;
    }

    return false;
  } catch {
    return null;
  }
}

/** Verifica se o código de dia (ex: "Mo") está incluso na expressão OSM */
function isDayIncluded(daysStr: string, todayCode: string, osmDays: string[]): boolean {
  for (const part of daysStr.split(',')) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [from, to] = trimmed.split('-');
      const fromIdx = osmDays.indexOf(from);
      const toIdx   = osmDays.indexOf(to);
      const todayIdx = osmDays.indexOf(todayCode);
      if (fromIdx !== -1 && toIdx !== -1 && todayIdx >= fromIdx && todayIdx <= toIdx) {
        return true;
      }
    } else if (trimmed === todayCode) {
      return true;
    }
  }
  return false;
}