import { atom } from 'nanostores'
import type { TranslationKeys } from '@i18n/locales/es'

export type Dictionary = Record<TranslationKeys, string>

export const $dictionary = atom<Dictionary | null>(null)

export async function setLanguage(lang: 'es' | 'en') {
  if (lang !== 'es' && lang !== 'en') throw Error(`Invalid language -> ${lang}`)

  if (lang === 'en') {
    const { en } = await import('@i18n/locales/en')
    $dictionary.set(en)
  } else {
    const { es } = await import('@i18n/locales/es')
    $dictionary.set(es)
  }
}
