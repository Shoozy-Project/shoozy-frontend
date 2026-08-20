// Tunisian Governorates for the registration form
export const GOVERNORATES: { code: string; name: string }[] = [
  { code: 'tunis', name: 'Tunis' },
  { code: 'ariana', name: 'Ariana' },
  { code: 'ben-arous', name: 'Ben Arous' },
  { code: 'manouba', name: 'Manouba' },
  { code: 'nabeul', name: 'Nabeul' },
  { code: 'zaghouan', name: 'Zaghouan' },
  { code: 'bizerte', name: 'Bizerte' },
  { code: 'beja', name: 'Béja' },
  { code: 'jendouba', name: 'Jendouba' },
  { code: 'le-kef', name: 'Le Kef' },
  { code: 'siliana', name: 'Siliana' },
  { code: 'sousse', name: 'Sousse' },
  { code: 'monastir', name: 'Monastir' },
  { code: 'mahdia', name: 'Mahdia' },
  { code: 'sfax', name: 'Sfax' },
  { code: 'kairouan', name: 'Kairouan' },
  { code: 'kasserine', name: 'Kasserine' },
  { code: 'sidi-bouzid', name: 'Sidi Bouzid' },
  { code: 'gabes', name: 'Gabès' },
  { code: 'medenine', name: 'Médenine' },
  { code: 'tataouine', name: 'Tataouine' },
  { code: 'gafsa', name: 'Gafsa' },
  { code: 'tozeur', name: 'Tozeur' },
  { code: 'kebili', name: 'Kébili' },
];

// API base URL
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v1';
