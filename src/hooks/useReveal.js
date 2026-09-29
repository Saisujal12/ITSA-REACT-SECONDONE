import { useEffect } from 'react'

/**
 * Scroll reveal for every [data-reveal] element inside `rootRef`.
 * Elements already in view are left alone; the rest are hidden only after
 * the observer is attached, then shown as they enter the viewport.
 * Pass a changing `key` (e.g. the location) to rescan after navigation.
 */
export function useReveal(rootRef, key) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || !('IntersectionObserver' in window)) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const viewportBottom = window.innerHeight
    const targets = [...root.querySelectorAll('[data-reveal]:not([data-reveal="shown"])')].filter(
      (element) => element.getBoundingClientRect().top > viewportBottom - 40,
    )

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.dataset.reveal = 'shown'
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )

    targets.forEach((element) => {
      element.dataset.reveal = 'pending'
      observer.observe(element)
    })

    return () => {
      observer.disconnect()
      targets.forEach((element) => {
        element.dataset.reveal = 'shown'
      })
    }
  }, [rootRef, key])
}
