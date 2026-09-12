import { GOOGLE_MAPS_API_KEY, isGoogleConfigured, loadGoogleMaps } from './google';
import { isOpen, milesBetween } from './matching';
import { CATALOG } from './sampleData';
import type { GeoPoint, Place } from './types';

export type PlaceQuery = {
  near: GeoPoint;
  radiusMeters?: number;
  keyword?: string;
  openNow?: boolean;
  maxPrice?: number;
  types?: string[];
};

function dtoToPlace(dto: {
  place_id?: string;
  name?: string;
  vicinity?: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types?: string[];
  geometry?: { location: { lat: number; lng: number } };
  opening_hours?: { open_now?: boolean };
}): Place {
  const loc = dto.geometry?.location;
  return {
    id: dto.place_id ?? nidPlace(),
    name: dto.name ?? 'Unknown place',
    address: dto.formatted_address ?? dto.vicinity ?? '',
    coordinate: { latitude: loc?.lat ?? 0, longitude: loc?.lng ?? 0 },
    category: dto.types?.find((t) => t !== 'point_of_interest' && t !== 'establishment') ?? 'point_of_interest',
    priceLevel: Math.max(1, dto.price_level ?? 1),
    rating: dto.rating ?? 0,
    userRatingsTotal: dto.user_ratings_total ?? 0,
    openNowOverride: dto.opening_hours?.open_now ?? null,
    googlePlaceID: dto.place_id ?? null,
  };
}

function nidPlace() {
  return `place-${Math.random().toString(36).slice(2, 10)}`;
}

export function filterCatalog(query: PlaceQuery, catalog: Place[] = CATALOG): Place[] {
  const radius = query.radiusMeters ?? 2500;
  return catalog
    .filter((place) => {
      if (query.openNow && !isOpen(place)) return false;
      if (query.maxPrice != null && place.priceLevel > query.maxPrice) return false;
      if (query.keyword) {
        const blob = `${place.name} ${place.category} ${place.address}`.toLowerCase();
        if (!blob.includes(query.keyword.toLowerCase())) return false;
      }
      if (query.types?.length && !query.types.includes(place.category)) return false;
      return milesBetween(place.coordinate, query.near) <= radius / 1609.344 + 0.2;
    })
    .sort((a, b) => milesBetween(a.coordinate, query.near) - milesBetween(b.coordinate, query.near));
}

export function catalogMatches(input: string, near: GeoPoint, catalog: Place[] = CATALOG): Place[] {
  const q = input.trim().toLowerCase();
  const list = !q
    ? catalog
    : catalog.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q),
      );
  return [...list].sort((a, b) => milesBetween(a.coordinate, near) - milesBetween(b.coordinate, near));
}

export function alternatives(place: Place, near: GeoPoint, maxPrice?: number) {
  return filterCatalog({
    near,
    radiusMeters: 3200,
    openNow: true,
    maxPrice,
    types: [place.category],
  }).filter((p) => p.id !== place.id);
}

function jsPlaceToPlace(result: google.maps.places.PlaceResult): Place {
  const loc = result.geometry?.location;
  return {
    id: result.place_id ?? nidPlace(),
    name: result.name ?? 'Unknown place',
    address: result.formatted_address ?? result.vicinity ?? '',
    coordinate: { latitude: loc?.lat() ?? 0, longitude: loc?.lng() ?? 0 },
    category: result.types?.find((t) => t !== 'point_of_interest' && t !== 'establishment') ?? 'point_of_interest',
    priceLevel: Math.max(1, result.price_level ?? 1),
    rating: result.rating ?? 0,
    userRatingsTotal: result.user_ratings_total ?? 0,
    openNowOverride: result.opening_hours?.open_now ?? null,
    googlePlaceID: result.place_id ?? null,
  };
}

async function nearbyGoogleJS(query: PlaceQuery): Promise<Place[]> {
  const g = await loadGoogleMaps();
  const node = document.createElement('div');
  const service = new g.maps.places.PlacesService(node);
  return new Promise((resolve, reject) => {
    const request: google.maps.places.PlaceSearchRequest = {
      location: new g.maps.LatLng(query.near.latitude, query.near.longitude),
      radius: query.radiusMeters ?? 2500,
      keyword: query.keyword,
      openNow: query.openNow,
      type: query.types?.[0],
    };
    service.nearbySearch(request, (results, status) => {
      if (status === g.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([]);
        return;
      }
      if (status !== g.maps.places.PlacesServiceStatus.OK || !results) {
        reject(new Error(`Places nearby failed: ${status}`));
        return;
      }
      resolve(results.map(jsPlaceToPlace));
    });
  });
}

async function autocompleteGoogleJS(input: string, near: GeoPoint): Promise<Place[]> {
  const g = await loadGoogleMaps();
  const auto = new g.maps.places.AutocompleteService();
  const predictions: google.maps.places.AutocompletePrediction[] = await new Promise((resolve, reject) => {
    auto.getPlacePredictions(
      { input, location: new g.maps.LatLng(near.latitude, near.longitude), radius: 4000 },
      (res, status) => {
        if (status === g.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([]);
          return;
        }
        if (status !== g.maps.places.PlacesServiceStatus.OK || !res) {
          reject(new Error(`Autocomplete failed: ${status}`));
          return;
        }
        resolve(res);
      },
    );
  });
  const node = document.createElement('div');
  const details = new g.maps.places.PlacesService(node);
  const places: Place[] = [];
  for (const prediction of predictions.slice(0, 8)) {
    const place = await new Promise<Place | null>((resolve) => {
      details.getDetails({ placeId: prediction.place_id, fields: ['place_id', 'name', 'formatted_address', 'geometry', 'rating', 'user_ratings_total', 'price_level', 'opening_hours', 'types'] }, (res, status) => {
        if (status === g.maps.places.PlacesServiceStatus.OK && res) resolve(jsPlaceToPlace(res));
        else resolve(null);
      });
    });
    if (place) places.push(place);
    else {
      places.push({
        id: prediction.place_id,
        name: prediction.structured_formatting?.main_text ?? prediction.description,
        address: prediction.description,
        coordinate: near,
        category: 'point_of_interest',
        priceLevel: 1,
        rating: 0,
        userRatingsTotal: 0,
        googlePlaceID: prediction.place_id,
      });
    }
  }
  return places;
}

export async function reverseGeocode(point: GeoPoint): Promise<Place> {
  const fallback: Place = {
    id: `pin-${point.latitude}-${point.longitude}`,
    name: 'Custom pin',
    address: `${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`,
    coordinate: point,
    category: 'point_of_interest',
    priceLevel: 1,
    rating: 0,
    userRatingsTotal: 0,
  };
  if (!isGoogleConfigured()) return fallback;
  try {
    const g = await loadGoogleMaps();
    const geo = new g.maps.Geocoder();
    const response = await geo.geocode({ location: { lat: point.latitude, lng: point.longitude } });
    const first = response.results[0];
    if (!first) return fallback;
    const poi = first.address_components.find((c) => c.types.includes('point_of_interest'));
    return {
      ...fallback,
      id: first.place_id ?? fallback.id,
      name: poi?.long_name ?? first.formatted_address.split(',')[0] ?? 'Dropped pin',
      address: first.formatted_address,
      googlePlaceID: first.place_id,
    };
  } catch {
    return fallback;
  }
}

export async function searchPlaces(query: PlaceQuery): Promise<Place[]> {
  if (isGoogleConfigured()) {
    try {
      if (typeof document !== 'undefined') return await nearbyGoogleJS(query);
      return await nearbyGoogleREST(query);
    } catch {
      return filterCatalog(query);
    }
  }
  return filterCatalog(query);
}

export async function autocompletePlaces(input: string, near: GeoPoint): Promise<Place[]> {
  const trimmed = input.trim();
  if (isGoogleConfigured() && trimmed) {
    try {
      if (typeof document !== 'undefined') return await autocompleteGoogleJS(trimmed, near);
      return await autocompleteGoogleREST(trimmed, near);
    } catch {
      return catalogMatches(trimmed, near);
    }
  }
  return catalogMatches(trimmed, near);
}

async function nearbyGoogleREST(query: PlaceQuery): Promise<Place[]> {
  const params = new URLSearchParams({
    location: `${query.near.latitude},${query.near.longitude}`,
    radius: String(query.radiusMeters ?? 2500),
    key: GOOGLE_MAPS_API_KEY,
  });
  if (query.openNow) params.set('opennow', 'true');
  if (query.keyword) params.set('keyword', query.keyword);
  if (query.maxPrice != null) params.set('maxprice', String(Math.min(4, Math.max(0, query.maxPrice))));
  if (query.types?.[0]) params.set('type', query.types[0]);
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`);
  const json = await res.json();
  if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') throw new Error(json.status);
  return (json.results ?? []).map(dtoToPlace);
}

async function autocompleteGoogleREST(input: string, near: GeoPoint): Promise<Place[]> {
  const params = new URLSearchParams({
    input,
    location: `${near.latitude},${near.longitude}`,
    radius: '4000',
    key: GOOGLE_MAPS_API_KEY,
  });
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`);
  const json = await res.json();
  if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') throw new Error(json.status);
  return (json.predictions ?? []).slice(0, 8).map((prediction: { description: string; place_id: string; structured_formatting?: { main_text?: string } }) => ({
    id: prediction.place_id,
    name: prediction.structured_formatting?.main_text ?? prediction.description,
    address: prediction.description,
    coordinate: near,
    category: 'point_of_interest',
    priceLevel: 1,
    rating: 0,
    userRatingsTotal: 0,
    googlePlaceID: prediction.place_id,
  }));
}
