import { useEffect, useRef, useState } from 'react'
import { useInView } from './useInView'
import { usePrefersReducedMotion } from './useMediaQuery'
import { usePageVisible } from './usePageVisible'

/*
  Slider behaviour shared by the gallery hero and the album sliders
  (legacy gallery.html inline script): 4s autoplay, wrap-around, pause on
  hover, timer restarts after manual navigation. Also pauses while focused,
  off-screen, in a hidden tab or under reduced motion, and supports arrow
  keys and touch swipe.
*/
export function useCarousel(count, { interval = 4000, pauseOnHover = true } = {}) {
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const regionRef = useRef(null)
  const touchStart = useRef(null)

  const inView = useInView(regionRef)
  const pageVisible = usePageVisible()
  const reducedMotion = usePrefersReducedMotion()

  const goTo = (next) => setIndex(((next % count) + count) % count)
  const next = () => setIndex((current) => (current + 1) % count)
  const prev = () => setIndex((current) => (current - 1 + count) % count)

  const running =
    count > 1 && inView && pageVisible && !reducedMotion && !focused && !(pauseOnHover && hovered)

  useEffect(() => {
    if (!running) return undefined
    const id = window.setTimeout(() => setIndex((current) => (current + 1) % count), interval)
    return () => window.clearTimeout(id)
  }, [running, index, count, interval])

  const regionProps = {
    ref: regionRef,
    tabIndex: count > 1 ? 0 : undefined,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setFocused(true),
    onBlur: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
    },
    onKeyDown: (event) => {
      if (count < 2) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        next()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        prev()
      }
    },
    onTouchStart: (event) => {
      touchStart.current = event.touches[0].clientX
    },
    onTouchEnd: (event) => {
      if (touchStart.current === null || count < 2) return
      const delta = event.changedTouches[0].clientX - touchStart.current
      touchStart.current = null
      if (Math.abs(delta) > 40) {
        if (delta < 0) next()
        else prev()
      }
    },
  }

  return { index: Math.min(index, Math.max(count - 1, 0)), goTo, next, prev, regionProps }
}
