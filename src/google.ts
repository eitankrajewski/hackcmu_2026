export const GOOGLE_MAPS_API_KEY = (
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? 'YOUR_GOOGLE_MAPS_API_KEY'
).trim();

export function isGoogleConfigured() {
  return GOOGLE_MAPS_API_KEY.length > 0 && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';
}

let mapsPromise: Promise<typeof google> | null = null;

export function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps is only available in the browser'));
  }
  const g = (window as Window & { google?: typeof google }).google;
  if (g?.maps?.places) return Promise.resolve(g);

  if (!mapsPromise) {
    mapsPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById('google-maps-js');
      const done = () => {
        const loaded = (window as Window & { google?: typeof google }).google;
        if (loaded?.maps) resolve(loaded);
        else reject(new Error('Google Maps failed to load'));
      };
      if (existing) {
        existing.addEventListener('load', done);
        existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')));
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-maps-js';
      script.async = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&libraries=places`;
      script.onload = done;
      script.onerror = () => reject(new Error('Google Maps failed to load'));
      document.head.appendChild(script);
    });
  }
  return mapsPromise;
}
