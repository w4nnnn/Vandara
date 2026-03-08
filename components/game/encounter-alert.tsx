'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangleIcon } from 'lucide-react'

type EncounterAlertProps = {
    message: string
    onDismiss: () => void
    isPending: boolean
    t: (key: string) => string
}

export function EncounterAlert({ message, onDismiss, isPending, t }: EncounterAlertProps) {
    return (
        <Alert className="border-primary/50 bg-primary/10">
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>{t('hud.encounter')}</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col gap-3">
                <p>{message}</p>
                <Button size="sm" onClick={onDismiss} disabled={isPending} className="w-fit">
                    {isPending ? t('hud.dismissing') : t('hud.continue')}
                </Button>
            </AlertDescription>
        </Alert>
    )
}
