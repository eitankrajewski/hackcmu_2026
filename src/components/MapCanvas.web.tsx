import { createElement, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { isGoogleConfigured, loadGoogleMaps } from '../google';
import { googleDarkMapStyle } from '../theme';
import type { GeoPoint, MapPin } from '../types';

const PIN_COLOR: Record<MapPin['kind'], string> = {
  stop: '#C8F542',
  candidate: '#7B5CFF',
  person: '#FF4D6D',
  meet: '#4AE3A8',
};

type Props = {
  camera: GeoPoint;
  pins?: MapPin[];
  path?: GeoPoint[];
  onTapCoordinate?: (point: GeoPoint) => void;
  onSelectPin?: (pin: MapPin) => void;
  style?: StyleProp<ViewStyle>;
};

export function MapCanvas({ camera, pins = [], path = [], onTapCoordinate, onSelectPin, style }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlays = useRef<{ markers: google.maps.Marker[]; line?: google.maps.Polyline }>({ markers: [] });
  const tapRef = useRef(onTapCoordinate);
  const selectRef = useRef(onSelectPin);
  const [mapReady, setMapReady] = useState(false);
  tapRef.current = onTapCoordinate;
  selectRef.current = onSelectPin;

  useEffect(() => {
    if (!isGoogleConfigured()) return;
    let dead = false;
    (async () => {
      try {
        const g = await loadGoogleMaps();
        if (dead || !hostRef.current || mapRef.current) return;
        const map = new g.maps.Map(hostRef.current, {
          center: { lat: camera.latitude, lng: camera.longitude },
          zoom: 13.4,
          styles: googleDarkMapStyle,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          const loc = e.latLng;
          if (!loc) return;
          tapRef.current?.({ latitude: loc.lat(), longitude: loc.lng() });
        });
        mapRef.current = map;
        setMapReady(true);
      } catch {
        /* demo catalog still works */
      }
    })();
    return () => {
      dead = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isGoogleConfigured()) return;
    map.panTo({ lat: camera.latitude, lng: camera.longitude });
  }, [camera.latitude, camera.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    const g = (typeof window !== 'undefined' ? (window as Window & { google?: typeof google }).google : undefined);
    if (!map || !g?.maps || !mapReady) return;
    overlays.current.markers.forEach((m) => m.setMap(null));
    overlays.current.line?.setMap(null);
    overlays.current.markers = pins.map((pin) => {
      const marker = new g.maps.Marker({
        map,
        position: { lat: pin.coordinate.latitude, lng: pin.coordinate.longitude },
        title: pin.title,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: PIN_COLOR[pin.kind],
          fillOpacity: 1,
          strokeColor: '#0B1020',
          strokeWeight: 2,
        },
      });
      marker.addListener('click', () => selectRef.current?.(pin));
      return marker;
    });
    if (path.length >= 2) {
      overlays.current.line = new g.maps.Polyline({
        map,
        path: path.map((p) => ({ lat: p.latitude, lng: p.longitude })),
        strokeColor: '#C8F542',
        strokeWeight: 4,
      });
    }
  }, [pins, path, mapReady]);

  if (!isGoogleConfigured()) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackTitle}>Demo map · Mission District</Text>
        {pins.map((pin) => (
          <Text key={pin.id} style={styles.fallbackPin}>
            {pin.title}
          </Text>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.fill, style]}>
      {createElement('div', {
        ref: (node: HTMLDivElement | null) => {
          hostRef.current = node;
        },
        style: { width: '100%', height: '100%', minHeight: 220, borderRadius: 22, overflow: 'hidden' },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { overflow: 'hidden', borderRadius: 22, minHeight: 220, backgroundColor: '#151B2E' },
  fallback: {
    minHeight: 220,
    borderRadius: 22,
    backgroundColor: '#151B2E',
    padding: 16,
    justifyContent: 'center',
    gap: 6,
  },
  fallbackTitle: { color: '#C8F542', fontWeight: '800', marginBottom: 8 },
  fallbackPin: { color: '#F4F1EA' },
});
