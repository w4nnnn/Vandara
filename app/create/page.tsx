'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import AvatarComponent from '@/avataaars-assets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createCharacter } from '@/app/actions/character'
import { AVATAR_OPTIONS, type AvatarOptionKey } from '@/lib/game/constants'

function formatLabel(value: string): string {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/(\d+)/g, ' $1')
    .trim()
}

type AvatarState = Record<AvatarOptionKey, string>

const DEFAULTS: AvatarState = {
  topType: 'LongHairStraight',
  accessoriesType: 'Blank',
  hatColor: 'Gray01',
  hairColor: 'BrownDark',
  facialHairType: 'Blank',
  facialHairColor: 'BrownDark',
  clotheType: 'BlazerShirt',
  clotheColor: 'Gray01',
  graphicType: 'Skull',
  eyeType: 'Default',
  eyebrowType: 'Default',
  mouthType: 'Default',
  skinColor: 'Light',
}

const OPTION_LABELS: Record<AvatarOptionKey, string> = {
  topType: 'Hairstyle',
  accessoriesType: 'Accessories',
  hatColor: 'Hat Color',
  hairColor: 'Hair Color',
  facialHairType: 'Facial Hair',
  facialHairColor: 'Facial Hair Color',
  clotheType: 'Clothing',
  clotheColor: 'Clothing Color',
  graphicType: 'Shirt Graphic',
  eyeType: 'Eyes',
  eyebrowType: 'Eyebrows',
  mouthType: 'Mouth',
  skinColor: 'Skin Color',
}

function AvatarSelect({
  optionKey,
  value,
  onChange,
}: {
  optionKey: AvatarOptionKey
  value: string
  onChange: (key: AvatarOptionKey, value: string) => void
}) {
  const options = AVATAR_OPTIONS[optionKey]
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {OPTION_LABELS[optionKey]}
      </Label>
      <Select value={value} onValueChange={(v) => onChange(optionKey, v)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {formatLabel(opt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default function CreateCharacterPage() {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<AvatarState>({ ...DEFAULTS })
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleAvatarChange(key: AvatarOptionKey, value: string) {
    setAvatar((prev) => ({ ...prev, [key]: value }))
  }

  function randomize() {
    const randomized = { ...avatar }
    for (const key of Object.keys(AVATAR_OPTIONS) as AvatarOptionKey[]) {
      const options = AVATAR_OPTIONS[key]
      randomized[key] = options[Math.floor(Math.random() * options.length)]
    }
    setAvatar(randomized)
  }

  function handleSubmit() {
    setError(null)
    const formData = new FormData()
    formData.set('name', name)
    for (const [key, value] of Object.entries(avatar)) {
      formData.set(key, value)
    }

    startTransition(async () => {
      const result = await createCharacter(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-[300px_1fr]">
        {/* Avatar Preview */}
        <div className="flex flex-col items-center gap-4">
          <Card className="w-full">
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pb-6">
              <div className="rounded-full bg-muted p-2">
                <AvatarComponent
                  avatarStyle="Circle"
                  topType={avatar.topType}
                  accessoriesType={avatar.accessoriesType}
                  hatColor={avatar.hatColor}
                  hairColor={avatar.hairColor}
                  facialHairType={avatar.facialHairType}
                  facialHairColor={avatar.facialHairColor}
                  clotheType={avatar.clotheType}
                  clotheColor={avatar.clotheColor}
                  graphicType={avatar.graphicType}
                  eyeType={avatar.eyeType}
                  eyebrowType={avatar.eyebrowType}
                  mouthType={avatar.mouthType}
                  skinColor={avatar.skinColor}
                  style={{ width: '200px', height: '200px' }}
                />
              </div>
              <p className="text-lg font-semibold">
                {name || 'Your Character'}
              </p>
              <Button variant="outline" size="sm" onClick={randomize}>
                🎲 Randomize
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Customization Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Create Your Character</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Character Name</Label>
              <Input
                id="name"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Tabs defaultValue="head">
              <TabsList className="w-full">
                <TabsTrigger value="head" className="flex-1">
                  Head
                </TabsTrigger>
                <TabsTrigger value="face" className="flex-1">
                  Face
                </TabsTrigger>
                <TabsTrigger value="body" className="flex-1">
                  Body
                </TabsTrigger>
              </TabsList>

              <TabsContent value="head" className="space-y-3 pt-2">
                <AvatarSelect
                  optionKey="topType"
                  value={avatar.topType}
                  onChange={handleAvatarChange}
                />
                <AvatarSelect
                  optionKey="hairColor"
                  value={avatar.hairColor}
                  onChange={handleAvatarChange}
                />
                <AvatarSelect
                  optionKey="hatColor"
                  value={avatar.hatColor}
                  onChange={handleAvatarChange}
                />
                <AvatarSelect
                  optionKey="accessoriesType"
                  value={avatar.accessoriesType}
                  onChange={handleAvatarChange}
                />
                <AvatarSelect
                  optionKey="facialHairType"
                  value={avatar.facialHairType}
                  onChange={handleAvatarChange}
                />
                <AvatarSelect
                  optionKey="facialHairColor"
                  value={avatar.facialHairColor}
                  onChange={handleAvatarChange}
                />
              </TabsContent>

              <TabsContent value="face" className="space-y-3 pt-2">
                <AvatarSelect
                  optionKey="eyeType"
                  value={avatar.eyeType}
                  onChange={handleAvatarChange}
                />
                <AvatarSelect
                  optionKey="eyebrowType"
                  value={avatar.eyebrowType}
                  onChange={handleAvatarChange}
                />
                <AvatarSelect
                  optionKey="mouthType"
                  value={avatar.mouthType}
                  onChange={handleAvatarChange}
                />
                <AvatarSelect
                  optionKey="skinColor"
                  value={avatar.skinColor}
                  onChange={handleAvatarChange}
                />
              </TabsContent>

              <TabsContent value="body" className="space-y-3 pt-2">
                <AvatarSelect
                  optionKey="clotheType"
                  value={avatar.clotheType}
                  onChange={handleAvatarChange}
                />
                <AvatarSelect
                  optionKey="clotheColor"
                  value={avatar.clotheColor}
                  onChange={handleAvatarChange}
                />
                <AvatarSelect
                  optionKey="graphicType"
                  value={avatar.graphicType}
                  onChange={handleAvatarChange}
                />
              </TabsContent>
            </Tabs>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={isPending || !name.trim()}
            >
              {isPending ? 'Creating...' : '⚔️ Enter the City'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
