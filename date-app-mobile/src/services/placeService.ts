import * as Location from 'expo-location';
import { invokeFunction } from '../lib/supabase';
import { Place, PlaceFilters, RecommendationsResponse } from '../types/place';

export class PlacesService {
  // Função principal - usando Supabase Edge Function
  static async searchPlaces(filters: PlaceFilters): Promise<Place[]> {
    try {
      console.log('🔍 Buscando recomendações via Supabase Edge Function...');

      const data = await invokeFunction<RecommendationsResponse>(
        'perplexity-recommendations',
        filters
      );

      console.log(`✅ Encontradas ${data.places?.length || 0} recomendações`);
      return data.places || [];
    } catch (error) {
      console.error('❌ Erro ao buscar recomendações:', error);
      throw error;
    }
  }

  // Obter localização atual usando expo-location
  static async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    try {
      // Solicitar permissão
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        const error = new Error('Permissão de localização negada');
        Object.assign(error, { type: 'PERMISSION_DENIED' });
        throw error;
      }

      // Obter localização atual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Erro ao obter localização:', error);

      if (error instanceof Error && (error as any).type) {
        throw error;
      }

      const newError = new Error('Erro ao obter localização');
      Object.assign(newError, { type: 'UNKNOWN' });
      throw newError;
    }
  }

  // Localização padrão (São Luís, MA) caso a real não esteja disponível
  static getDefaultLocation(): { latitude: number; longitude: number } {
    return {
      latitude: -2.5307,
      longitude: -44.3068,
    };
  }

  static getRandomPlace(places: Place[]): Place | null {
    if (places.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * places.length);
    return places[randomIndex];
  }
}

export { PlaceFilters, Place };
