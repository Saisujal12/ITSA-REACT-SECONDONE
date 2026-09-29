import { useSyncExternalStore } from 'react'

function subscribe(onChange) {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

/** False while the browser tab is hidden. */
export function usePageVisible() {
  return useSyncExternalStore(subscribe, () => !document.hidden, () => true)
}
