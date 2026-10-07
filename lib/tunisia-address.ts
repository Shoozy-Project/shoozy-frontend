export const TUNISIA_COUNTRY_CODE = 'TN' as const;
export const TUNISIA_MAP_CENTER: [number, number] = [34.0, 9.5];
export const TUNISIA_MAP_BOUNDS: [[number, number], [number, number]] = [[30.2, 7.4], [37.7, 11.7]];

export const TUNISIA_GOVERNORATES = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Sousse', 'Monastir', 'Mahdia', 'Sfax',
  'Nabeul', 'Bizerte', 'Gabès', 'Kairouan', 'Médenine', 'Gafsa', 'Béja', 'Jendouba',
  'Kasserine', 'Kef', 'Siliana', 'Sidi Bouzid', 'Tataouine', 'Tozeur', 'Zaghouan', 'Kebili',
] as const;

export function isTunisianGovernorate(value: string | null | undefined) {
  return typeof value === 'string' && TUNISIA_GOVERNORATES.some((governorate) => governorate === value);
}

export function isWithinTunisiaBounds(latitude: number, longitude: number) {
  const [[south, west], [north, east]] = TUNISIA_MAP_BOUNDS;
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= south && latitude <= north
    && longitude >= west && longitude <= east;
}

export function coordinateString(value: number) {
  return Number.isFinite(value) ? value.toFixed(7) : null;
}

export function hasValidCoordinatePair(latitude: string | null | undefined, longitude: string | null | undefined) {
  if (latitude == null && longitude == null) return true;
  if (!latitude || !longitude) return false;
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);
  return Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude)
    && parsedLatitude >= -90 && parsedLatitude <= 90
    && parsedLongitude >= -180 && parsedLongitude <= 180;
}
