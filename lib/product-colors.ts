const COLOR_OPTION_NAMES = new Set(['color', 'colour', 'couleur', 'اللون', 'لون']);

const COMMON_COLOR_HEX: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  red: '#DC2626',
  blue: '#2563EB',
  navy: '#1E3A8A',
  green: '#16A34A',
  olive: '#708238',
  yellow: '#FACC15',
  orange: '#F97316',
  purple: '#9333EA',
  pink: '#EC4899',
  brown: '#92400E',
  tan: '#D2B48C',
  beige: '#F5F5DC',
  grey: '#6B7280',
  gray: '#6B7280',
  silver: '#C0C0C0',
  gold: '#D4AF37',
};

export const NEUTRAL_COLOR_HEX = '#737373';

export function isColorOptionName(name: string) {
  return COLOR_OPTION_NAMES.has(name.trim().toLocaleLowerCase('en-US'));
}

export function isValidColorHex(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

export function commonColorHex(name: string | null | undefined) {
  if (!name) return null;
  return COMMON_COLOR_HEX[name.trim().toLocaleLowerCase('en-US')] ?? null;
}

export function resolveProductColor(colorHex: string | null | undefined, name: string | null | undefined) {
  if (isValidColorHex(colorHex)) return colorHex;
  return commonColorHex(name) ?? NEUTRAL_COLOR_HEX;
}
