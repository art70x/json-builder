import { useRegisterSW } from 'virtual:pwa-register/react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function PWABadge() {
  // periodic sync is disabled, change the value to enable it, the period is in milliseconds
  // You can remove onRegisteredSW callback and registerPeriodicSync function
  const period = 0

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return
      if (r?.active?.state === 'activated') {
        registerPeriodicSync(period, swUrl, r)
      } else if (r?.installing) {
        r.installing.addEventListener('statechange', (event) => {
          const sw = event.target as ServiceWorker
          if (sw.state === 'activated') registerPeriodicSync(period, swUrl, r)
        })
      }
    },
  })

  function close() {
    setNeedRefresh(false)
  }

  if (!needRefresh) return null

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Card className="w-[320px] border bg-background shadow-lg">
        <CardContent className="space-y-4 p-4">
          <p className="text-sm text-muted-foreground">
            New content available. Reload to update the app.
          </p>

          <div className="flex justify-end gap-2">
            <Button size="sm" onClick={() => updateServiceWorker(true)}>
              Reload
            </Button>

            <Button size="sm" variant="outline" onClick={close}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(period: number, swUrl: string, r: ServiceWorkerRegistration) {
  if (period <= 0) return

  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine) return

    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        cache: 'no-store',
        'cache-control': 'no-cache',
      },
    })

    if (resp?.status === 200) await r.update()
  }, period)
}
