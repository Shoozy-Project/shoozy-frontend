export type TranslationMap<T> = {
  ar?: T;
  en?: T;
};

export interface EntityTranslation {
  name: string;
  description: string | null;
}

