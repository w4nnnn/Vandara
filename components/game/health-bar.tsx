'use client'

export function HealthBar({
    label,
    current,
    max,
    color,
}: {
    label: string
    current: number
    max: number
    color: string
}) {
    const pct = Math.max(0, Math.round((current / max) * 100))
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm font-medium">
                <span>{label}</span>
                <span className={current <= 0 ? 'text-red-500' : ''}>
                    {Math.max(0, current)} / {max}
                </span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    )
}
