import { Platform } from 'react-native';
import { Linking } from 'react-native';
import { Place } from '../types/place';

/**
 * Monta a URL de mapa correta para cada plataforma no momento da abertura.
 * iOS  → maps:// (nativo, pin com nome do lugar)
 * Android → geo: com intent, fallback para Google Maps web
 */
export function buildMapUrl(place: Pick<Place, 'name' | 'address' | 'latitude' | 'longitude'>): string {
  const name = encodeURIComponent(`${place.name ?? ''}`);
  const query = encodeURIComponent(`${place.name ?? ''} ${place.address ?? ''} São Luís MA`);

  if (place.latitude && place.longitude) {
    const lat = place.latitude;
    const lon = place.longitude;

    if (Platform.OS === 'ios') {
      // maps:// com q= fixa o nome do pin — sem q= o iOS sobrescreve com a rua
      return `maps://?q=${name}&ll=${lat},${lon}`;
    }

    // Android — abre no Google Maps instalado se disponível
    return `geo:${lat},${lon}?q=${name}`;
  }

  // Fallback web (sem coordenadas) — funciona nos dois
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Abre o mapa com tratamento de erro e fallback web.
 */
export async function openMap(place: Pick<Place, 'name' | 'address' | 'latitude' | 'longitude'>): Promise<void> {
  const url = buildMapUrl(place);

  const canOpen = await Linking.canOpenURL(url);

  if (canOpen) {
    await Linking.openURL(url);
    return;
  }

  // Fallback: se geo: ou maps:// não abrirem (emulador, app não instalado)
  const fallback = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${place.name ?? ''} ${place.address ?? ''} São Luís MA`
  )}`;
  await Linking.openURL(fallback);
}