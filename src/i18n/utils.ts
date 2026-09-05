export const languages = {
  es: 'Español',
  en: 'English',
}

export const defaultLang = 'es'
export const appName = 'Veloce'

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/')

  if (lang in languages) return lang as keyof typeof languages
  return defaultLang
}
