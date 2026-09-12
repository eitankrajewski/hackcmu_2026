import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { isGoogleConfigured } from '../google';
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
  return (
    <MapView
      style={[styles.fill, style]}
      provider={isGoogleConfigured() ? PROVIDER_GOOGLE : undefined}
      initialRegion={{
        latitude: camera.latitude,
        longitude: camera.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }}
      region={{
        latitude: camera.latitude,
        longitude: camera.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }}
      onPress={(e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        onTapCoordinate?.({ latitude, longitude });
      }}>
      {path.length >= 2 ? (
        <Polyline
          coordinates={path}
          strokeColor="#C8F542"
          strokeWidth={4}
        />
      ) : null}
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          coordinate={pin.coordinate}
          title={pin.title}
          pinColor={PIN_COLOR[pin.kind]}
          onPress={() => onSelectPin?.(pin)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  fill: { minHeight: 220, borderRadius: 22, overflow: 'hidden' },
});
