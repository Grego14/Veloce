export const languages = {
  es: 'Español',
  en: 'English',
}

export const defaultLang = 'es'
export const appName = 'Veloce'
export const categories = [
  'boots',
  'converse',
  'crocs',
  'louboutin',
  'men_shoes',
  'sandals',
  'shoelaces',
  'slippers',
  'vans',
] as const

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/')

  if (lang in languages) return lang as keyof typeof languages
  return defaultLang
}
