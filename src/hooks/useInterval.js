import { useEffect, useEffectEvent } from 'react'

/** Calls `callback` every `delay` ms. Pass `null` to pause. */
export function useInterval(callback, delay) {
  const onTick = useEffectEvent(callback)

  useEffect(() => {
    if (delay === null) return undefined
    const id = window.setInterval(() => onTick(), delay)
    return () => window.clearInterval(id)
  }, [delay])
}
