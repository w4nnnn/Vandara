'use client'

import { createContext, useContext } from 'react'
import OptionContext from './options/OptionContext'

export const AvatarReactContext = createContext<OptionContext | null>(null)

export function useOptionContext(): OptionContext {
  const ctx = useContext(AvatarReactContext)
  if (!ctx) {
    throw new Error('useOptionContext must be used within an AvatarProvider')
  }
  return ctx
}
