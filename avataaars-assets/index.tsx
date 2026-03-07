'use client'

import * as React from 'react'

import Avatar, { AvatarStyle } from './avatar'
import { OptionContext, allOptions } from './options'
import { AvatarReactContext } from './AvatarContext'

export { default as Avatar, AvatarStyle } from './avatar'
export { Option, OptionContext, allOptions } from './options'

import { default as PieceComponent } from './avatar/piece'

export interface Props {
  avatarStyle: string
  className?: string
  style?: React.CSSProperties
  topType?: string
  accessoriesType?: string
  hatColor?: string
  hairColor?: string
  facialHairType?: string
  facialHairColor?: string
  clotheType?: string
  clotheColor?: string
  graphicType?: string
  eyeType?: string
  eyebrowType?: string
  mouthType?: string
  skinColor?: string
  pieceType?: string
  pieceSize?: string
  viewBox?: string
}

function buildAvatarData(props: Props) {
  const data: { [index: string]: string } = {}
  for (const option of allOptions) {
    const value = (props as any)[option.key]
    if (!value) continue
    data[option.key] = value
  }
  return data
}

export default function AvatarComponent(props: Props) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const optionContextRef = React.useRef<OptionContext | null>(null)
  if (!optionContextRef.current) {
    optionContextRef.current = new OptionContext(allOptions)
  }
  const optionContext = optionContextRef.current

  // Set data silently during render (no listener notifications)
  const data = buildAvatarData(props)
  optionContext.setDataSilent(data)

  // Notify listeners after render (for prop changes)
  React.useEffect(() => {
    optionContext.setData(data)
  })

  if (!mounted) {
    return <div style={props.style} className={props.className} />
  }

  const { avatarStyle, style, className } = props
  return (
    <AvatarReactContext.Provider value={optionContext}>
      <Avatar
        avatarStyle={avatarStyle as AvatarStyle}
        style={style}
        className={className}
      />
    </AvatarReactContext.Provider>
  )
}

export function Piece(props: Props) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const optionContextRef = React.useRef<OptionContext | null>(null)
  if (!optionContextRef.current) {
    optionContextRef.current = new OptionContext(allOptions)
  }
  const optionContext = optionContextRef.current

  const data = buildAvatarData(props)
  optionContext.setDataSilent(data)

  React.useEffect(() => {
    optionContext.setData(data)
  })

  if (!mounted) {
    return <div style={props.style} />
  }

  const { avatarStyle, style, pieceType, pieceSize, viewBox } = props
  return (
    <AvatarReactContext.Provider value={optionContext}>
      <PieceComponent
        avatarStyle={avatarStyle as AvatarStyle}
        style={style}
        pieceType={pieceType}
        pieceSize={pieceSize}
        viewBox={viewBox}
      />
    </AvatarReactContext.Provider>
  )
}
