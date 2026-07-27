export interface Place {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  latitude: number | null;
  longitude: number | null;

  // Filtros aplicados
  budget: '$' | '$$' | '$$$';
  type: 'gastronomia' | 'cultura' | 'ao-ar-livre' | 'aventura' | 'casual';
  cuisineSubtype?: string | null;  // subcategoria de gastronomia (churrasco, sushi, etc.)
  period: 'dia' | 'noite';

  // Dados do estabelecimento
  priceRange: '$' | '$$' | '$$$';
  distanceKm: number | null;
  cuisineType: string | null;
  rating: number;
  openingHours: string;

  // Conteúdo gerado pela IA
  description: string;
  suggestedActivity: string;   // vem de romanticActivity na API
  specialTip: string;

  // Flags
  aiRecommended: boolean;
  temEstacionamento: boolean;
  acessivel: boolean;

  // Extras
  tags: string[];
  imageUrl: string;
}

export interface PlaceFilters {
  budget: '$' | '$$' | '$$$';
  type: 'gastronomia' | 'cultura' | 'ao-ar-livre' | 'aventura' | 'casual';
  cuisineSubtype?: string;  // subcategoria de gastronomia
  period: 'dia' | 'noite';
  latitude: number;
  longitude: number;

  // Filtros opcionais
  distancia?: 'perto' | 'medio' | 'longe';
  ambiente?: 'intimo' | 'animado' | 'tranquilo';
  temEstacionamento?: boolean;
  acessivel?: boolean;
}