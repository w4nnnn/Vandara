'use client'

import * as LucideIcons from 'lucide-react'

type Spot = {
    id: string
    label: string
    hint: string
    icon: string
}

type SpotSelectorProps = {
    spots: Spot[]
    selectedSpotId: string | null
    onSelectSpot: (id: string | null) => void
}

export function SpotSelector({ spots, selectedSpotId, onSelectSpot }: SpotSelectorProps) {
    if (spots.length === 0) return null

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">Pilih Tempat Memulung:</p>
            <div className="grid grid-cols-2 gap-2">
                {spots.map(spot => {
                    const IconComp = (LucideIcons as any)[spot.icon + 'Icon'] ?? LucideIcons.MapPinIcon
                    const isSelected = selectedSpotId === spot.id
                    return (
                        <button
                            key={spot.id}
                            onClick={() => onSelectSpot(isSelected ? null : spot.id)}
                            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${isSelected
                                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                : 'hover:bg-muted/50 text-muted-foreground'
                                }`}
                        >
                            <IconComp className="size-5 shrink-0" />
                            <div>
                                <div className="text-sm font-medium">{spot.label}</div>
                                <div className="text-[10px] opacity-70">{spot.hint}</div>
                            </div>
                        </button>
                    )
                })}
            </div>
            {!selectedSpotId && (
                <p className="text-[10px] text-muted-foreground">Tidak memilih = tempat acak</p>
            )}
        </div>
    )
}
