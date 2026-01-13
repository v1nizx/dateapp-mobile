// Tipos para lugares/recomendações

export interface Place {
    id: string;
    name: string;
    description: string;
    address: string;
    mapUrl: string;
    budget: string;
    type: string;
    period: string;
    tags: string[];
    imageUrl: string;
    rating: number;
    suggestedActivity: string;
    openingHours: string;
    specialTip: string;
    aiRecommended: boolean;
    temEstacionamento: boolean;
    acessivel: boolean;
    cuisineType?: string | null;
    distanceKm?: number | null;
    priceRange?: string | null;
}

export interface PlaceFilters {
    budget: string;
    type: string;
    period: string;
    ambiente?: string;
    distancia?: string;
    temEstacionamento?: boolean;
    acessivel?: boolean;
    latitude: number;
    longitude: number;
}

export interface RecommendationsResponse {
    places: Place[];
    totalFound: number;
    source: string;
}
