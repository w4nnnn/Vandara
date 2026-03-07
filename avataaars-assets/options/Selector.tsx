'use client'

import * as React from 'react'
import { useRef, useEffect, useReducer } from 'react'

import Option from './Option'
import { useOptionContext } from '../AvatarContext'

function getComponentOptionValue (component: React.ComponentClass) {
  const optionValue = (component as any).optionValue
  if (!optionValue) {
    throw new Error(`optionValue should be provided for ${component}`)
  }
  return optionValue
}

export interface Props {
  option: Option
  defaultOption: React.ComponentClass<any> | string
  children?: React.ReactNode
}

export default function Selector ({ option, defaultOption, children }: Props) {
  const optionContext = useOptionContext()
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0)
  const initializedRef = useRef(false)

  // Synchronous init on first render — registers options and defaults
  // so getValue() works immediately. This is safe because listener
  // registration happens in useEffect, so no "setState during render".
  if (!initializedRef.current) {
    initializedRef.current = true
    const defaultValue =
      typeof defaultOption === 'string'
        ? defaultOption
        : getComponentOptionValue(defaultOption)

    optionContext.optionEnterSilent(option.key)

    const values = React.Children.map(
      children,
      child => getComponentOptionValue((child as any).type)
    )
    if (values && new Set(values).size !== values.length) {
      throw new Error('Duplicate values')
    }
    if (values) {
      optionContext.setOptionsSilent(option.key, values)
    }

    const optionState = optionContext.getOptionState(option.key)
    if (optionState) {
      optionContext.setDefaultValueSilent(option.key, defaultValue)
    }
  }

  useEffect(() => {
    optionContext.addStateChangeListener(forceUpdate)
    return () => {
      optionContext.removeStateChangeListener(forceUpdate)
      optionContext.optionExit(option.key)
    }
  }, [optionContext, option.key])

  const value = optionContext.getValue(option.key)!
  let result: React.ReactNode | null = null
  React.Children.forEach(children, child => {
    if (getComponentOptionValue((child as any).type) === value) {
      result = child
    }
  })

  return <>{result}</>
}
