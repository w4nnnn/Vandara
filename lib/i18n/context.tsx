'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { DirectionProvider } from '@/components/ui/direction'
import { translations, type Locale } from './translations'

type Dir = 'ltr' | 'rtl'

type LanguageContextValue = {
  locale: Locale
  dir: Dir
  setLocale: (locale: Locale) => void
  setDir: (dir: Dir) => void
  toggleDir: () => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id')
  const [dir, setDirState] = useState<Dir>('ltr')

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale')
    if (storedLocale === 'id' || storedLocale === 'en') {
      setLocaleState(storedLocale)
    }
    const storedDir = localStorage.getItem('direction')
    if (storedDir === 'ltr' || storedDir === 'rtl') {
      setDirState(storedDir)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    localStorage.setItem('locale', locale)
  }, [locale])

  useEffect(() => {
    document.documentElement.dir = dir
    localStorage.setItem('direction', dir)
  }, [dir])

  const setLocale = useCallback((l: Locale) => setLocaleState(l), [])
  const setDir = useCallback((d: Dir) => setDirState(d), [])
  const toggleDir = useCallback(() => setDirState(d => d === 'ltr' ? 'rtl' : 'ltr'), [])

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let value = translations[locale]?.[key] ?? translations['id']?.[key] ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, String(v))
      }
    }
    return value
  }, [locale])

  return (
    <LanguageContext.Provider value={{ locale, dir, setLocale, setDir, toggleDir, t }}>
      <DirectionProvider dir={dir}>
        {children}
      </DirectionProvider>
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider')
  return ctx
}
