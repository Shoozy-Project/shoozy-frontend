const TUNISIAN_LOCAL_PHONE_PATTERN = /^(?:2\d|4\d|5\d|9\d)\d{6}$/;
const PHONE_SEPARATORS = /[\s().-]/g;

export function sanitizeTunisianLocalPhone(value: string) {
  return value.replace(/\D/g, '').slice(0, 8);
}

export function extractTunisianLocalPhone(value: string | null | undefined) {
  if (!value) return '';

  const compact = value.trim().replace(PHONE_SEPARATORS, '');
  if (compact.startsWith('+216')) return sanitizeTunisianLocalPhone(compact.slice(4));
  if (compact.startsWith('00216')) return sanitizeTunisianLocalPhone(compact.slice(5));
  if (compact.startsWith('216') && compact.length > 8) return sanitizeTunisianLocalPhone(compact.slice(3));
  return sanitizeTunisianLocalPhone(compact);
}

export function isValidTunisianLocalPhone(value: string) {
  return TUNISIAN_LOCAL_PHONE_PATTERN.test(value);
}

export function toTunisianCanonicalPhone(value: string | null | undefined) {
  const local = extractTunisianLocalPhone(value);
  return isValidTunisianLocalPhone(local) ? `+216${local}` : null;
}
