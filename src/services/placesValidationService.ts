
// ── Geoapify Places API v2 ────────────────────────────────────────────────────
// Docs: https://apidocs.geoapify.com/docs/places/
// Auth: apiKey query param — sem headers especiais
// Gratuito: 3.000 créditos/dia (cada 20 lugares = 1 crédito)
const BASE = 'https://api.geoapify.com/v2/places';

// ─── Mapeamento de categorias ─────────────────────────────────────────────────
// Geoapify usa hierarquia com pontos: catering.restaurant, entertainment.museum…
// Passamos múltiplas categorias separadas por vírgula em uma só requisição.
const GEO_CATEGORIES: Record<string, string> = {
  gastronomia:   'catering.restaurant,catering.cafe,catering.bar',
  cultura:       'entertainment.museum,entertainment.gallery,tourism.attraction,tourism.sights',
  'ao-ar-livre': 'leisure.park,natural.beach,leisure.garden,sport',
  aventura:      'sport,entertainment.theme_park,tourism.attraction,leisure.water_park',
  casual:        'catering.cafe,catering.bar,catering.ice_cream,catering.fast_food',
};

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
  const categories = GEO_CATEGORIES[filters.type] ?? 'catering.restaurant';

  const radiusMap: Record<string, number> = {
    perto:  3_000,
    medio: 10_000,
    longe: 25_000,
  };
  const radius = radiusMap[filters.distancia ?? 'medio'];

  const places = await fetchByCategories(
    categories,
    filters.latitude,
    filters.longitude,
    radius,
  );

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

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(s => ({ ...s.place, rating: parseFloat(s.score.toFixed(3)) }));
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
    apiKey:  process.env['EXPO_PUBLIC_GEOAPIFY_KEY'] ?? '',
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