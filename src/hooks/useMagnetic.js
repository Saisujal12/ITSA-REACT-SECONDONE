import { useEffect } from 'react'

/**
 * Legacy "magnetic button" effect: the element drifts slightly toward the
 * pointer. Only for fine pointers on screens wider than 700px, and never
 * when the user prefers reduced motion.
 */
export function useMagnetic(ref, strength = 0.06) {
  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    const enabled = () =>
      window.matchMedia('(min-width: 701px) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const onMove = (event) => {
      if (!enabled()) return
      const rect = element.getBoundingClientRect()
      const x = event.clientX - rect.left - rect.width / 2
      const y = event.clientY - rect.top - rect.height / 2
      element.style.transform = `translate(${x * strength}px, ${y * strength}px)`
    }

    const onLeave = () => {
      element.style.transform = ''
    }

    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerleave', onLeave)
    return () => {
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerleave', onLeave)
    }
  }, [ref, strength])
}
