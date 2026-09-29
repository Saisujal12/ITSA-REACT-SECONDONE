import { useEffect } from 'react'

/*
  3D floating ID card (port of legacy js/badge3d.js).

  Same behaviour and constants: automatic float, mouse-follow movement,
  direction-based rotation, cursor-following shine, smooth easing, touch
  support and reduced-motion support.

  Improvements over the legacy loop:
  - the requestAnimationFrame loop pauses while the card is off-screen or the
    tab is hidden (it previously ran forever);
  - the responsive scale lives in the CSS variable --scene-scale, because the
    old inline transform silently overrode the media-query scale.
*/

const SETTINGS = {
  maxRotateY: 13,
  maxRotateX: 10,
  maxMoveX: 15,
  maxMoveY: 12,
  maxMoveZ: 10,
  ease: 0.075,
  floatHeight: 6,
  floatSpeed: 0.0017,
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export function useTilt3d(sceneRef, cardRef, hoverClass) {
  useEffect(() => {
    const scene = sceneRef.current
    const card = cardRef.current
    if (!scene || !card) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const target = { rx: 0, ry: 0, mx: 0, my: 0, mz: 0 }
    const current = { rx: 0, ry: 0, mx: 0, my: 0, mz: 0 }
    let isHovering = false
    let isVisible = true
    let frame = null

    const canRun = () => isVisible && !document.hidden

    function start() {
      if (frame === null && canRun()) frame = requestAnimationFrame(animate)
    }

    function stop() {
      if (frame !== null) cancelAnimationFrame(frame)
      frame = null
    }

    function animate(time) {
      for (const key of Object.keys(current)) {
        current[key] += (target[key] - current[key]) * SETTINGS.ease
      }

      const floating =
        !isHovering && !reduceMotion.matches
          ? Math.sin(time * SETTINGS.floatSpeed) * SETTINGS.floatHeight
          : 0

      scene.style.transform = `translate3d(${current.mx}px, ${current.my + floating}px, ${current.mz}px) scale(var(--scene-scale, 1))`
      card.style.transform = `rotateX(${current.rx}deg) rotateY(${current.ry}deg) translateZ(18px)`

      const settled = Object.keys(current).every((key) => Math.abs(target[key] - current[key]) < 0.01)

      if ((isHovering || !settled || !reduceMotion.matches) && canRun()) {
        frame = requestAnimationFrame(animate)
      } else {
        frame = null
      }
    }

    function resetTargets() {
      target.rx = target.ry = target.mx = target.my = target.mz = 0
    }

    function setHovering(value) {
      isHovering = value
      scene.classList.toggle(hoverClass, value)
    }

    function updateShine(event) {
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--pointer-x', `${clamp(event.clientX - rect.left, 0, rect.width)}px`)
      card.style.setProperty('--pointer-y', `${clamp(event.clientY - rect.top, 0, rect.height)}px`)
    }

    function onPointerMove(event) {
      const rect = scene.getBoundingClientRect()
      const nx = (clamp((event.clientX - rect.left) / rect.width, 0, 1) - 0.5) * 2
      const ny = (clamp((event.clientY - rect.top) / rect.height, 0, 1) - 0.5) * 2

      target.mx = nx * SETTINGS.maxMoveX
      target.my = ny * SETTINGS.maxMoveY
      target.ry = nx * SETTINGS.maxRotateY
      target.rx = ny * -SETTINGS.maxRotateX
      target.mz = (1 - Math.min(Math.sqrt(nx * nx + ny * ny), 1)) * SETTINGS.maxMoveZ

      setHovering(true)
      updateShine(event)
      start()
    }

    function onPointerLeave() {
      setHovering(false)
      resetTargets()
      card.style.setProperty('--pointer-x', '50%')
      card.style.setProperty('--pointer-y', '35%')
      start()
    }

    function onTouchStart() {
      setHovering(true)
      start()
    }

    function onResize() {
      resetTargets()
      Object.assign(current, { rx: 0, ry: 0, mx: 0, my: 0, mz: 0 })
      setHovering(false)
      scene.style.transform = ''
      card.style.transform = ''
      start()
    }

    function onReduceMotionChange() {
      if (reduceMotion.matches) resetTargets()
      start()
    }

    function onVisibilityChange() {
      if (document.hidden) stop()
      else start()
    }

    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting
            if (isVisible) start()
            else stop()
          })
        : null

    scene.addEventListener('pointerenter', onPointerMove)
    scene.addEventListener('pointermove', onPointerMove)
    scene.addEventListener('pointerleave', onPointerLeave)
    scene.addEventListener('touchstart', onTouchStart, { passive: true })
    scene.addEventListener('touchend', onPointerLeave, { passive: true })
    scene.addEventListener('touchcancel', onPointerLeave, { passive: true })
    window.addEventListener('resize', onResize)
    reduceMotion.addEventListener('change', onReduceMotionChange)
    document.addEventListener('visibilitychange', onVisibilityChange)
    observer?.observe(scene)

    card.style.setProperty('--pointer-x', '50%')
    card.style.setProperty('--pointer-y', '35%')
    start()

    return () => {
      stop()
      observer?.disconnect()
      scene.removeEventListener('pointerenter', onPointerMove)
      scene.removeEventListener('pointermove', onPointerMove)
      scene.removeEventListener('pointerleave', onPointerLeave)
      scene.removeEventListener('touchstart', onTouchStart)
      scene.removeEventListener('touchend', onPointerLeave)
      scene.removeEventListener('touchcancel', onPointerLeave)
      window.removeEventListener('resize', onResize)
      reduceMotion.removeEventListener('change', onReduceMotionChange)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [sceneRef, cardRef, hoverClass])
}
