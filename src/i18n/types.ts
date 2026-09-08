import type { es } from './locales/es'

type EsDictionary = typeof es

type DictionaryValue<T> = T extends string
  ? string
  : T extends string[]
    ? string[]
    : Record<string, string>

export type TranslationKeys = keyof EsDictionary

export type Dictionary = {
  [K in TranslationKeys]: DictionaryValue<EsDictionary[K]>
}

export type LangType = 'es' | 'en'
