import { useState, useCallback } from 'react';
import { Place, PlaceFilters } from '../types/place';
import { PlacesService } from '../services/placeService';

interface UseRecommendationsReturn {
    places: Place[];
    loading: boolean;
    error: string | null;
    searchPlaces: (filters: PlaceFilters) => Promise<void>;
    clearPlaces: () => void;
}

export function useRecommendations(): UseRecommendationsReturn {
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchPlaces = useCallback(async (filters: PlaceFilters) => {
        setLoading(true);
        setError(null);
        setPlaces([]);

        try {
            const results = await PlacesService.searchPlaces(filters);
            setPlaces(results);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao buscar recomendações';
            setError(message);
            console.error('useRecommendations error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearPlaces = useCallback(() => {
        setPlaces([]);
        setError(null);
    }, []);

    return {
        places,
        loading,
        error,
        searchPlaces,
        clearPlaces,
    };
}
