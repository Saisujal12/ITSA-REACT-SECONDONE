import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import s from './ITBuddy.module.css'

const pages = [
  { to: '/events', label: 'Explore events', icon: '✦' },
  { to: '/workshops', label: 'Find a workshop', icon: '</>' },
  { to: '/sumshodhini', label: 'Visit Sumshodhini', icon: '⚡' },
  { to: '/about#team-title', label: 'Meet the IT crew', icon: '♡' },
]

const POSITION_KEY = 'itsa-it-buddy-position'
const REACTION_EVENT = 'itsa:mascot-reaction'

function readSavedPosition() {
  try {
    const saved = window.localStorage.getItem(POSITION_KEY)
    const position = saved ? JSON.parse(saved) : null
    return Number.isFinite(position?.left) && Number.isFinite(position?.top)
      ? position
      : null
  } catch {
    return null
  }
}

export default function ITBuddy() {
  const [isOpen, setIsOpen] = useState(false)
  const [color, setColor] = useState('burgundy')
  const [position, setPosition] = useState(readSavedPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [mood, setMood] = useState('idle')
  const [reactionMessage, setReactionMessage] = useState('')
  const reactionTimer = useRef(null)
  const dragRef = useRef(null)
  const suppressClickRef = useRef(false)
  const widgetRef = useRef(null)
  const panelRef = useRef(null)
  const speechBubbleRef = useRef(null)

  const clampPosition = useCallback((left, top) => {
    const widget = widgetRef.current
    if (!widget) return { left, top }

    const maxLeft = Math.max(0, window.innerWidth - widget.offsetWidth)
    const maxTop = Math.max(0, window.innerHeight - widget.offsetHeight)
    const attachedBox = isOpen ? panelRef.current : speechBubbleRef.current
    const boxRect = attachedBox?.getBoundingClientRect()
    const gap = isOpen ? 10 : 8
    const minLeft = boxRect
      ? Math.min(maxLeft, Math.max(0, boxRect.width - widget.offsetWidth))
      : 0
    const minTop = boxRect
      ? Math.min(maxTop, boxRect.height + gap)
      : 0

    return {
      left: Math.min(maxLeft, Math.max(minLeft, left)),
      top: Math.min(maxTop, Math.max(minTop, top)),
    }
  }, [isOpen])

  const showReaction = (nextMood, message, duration = 1500) => {
    setMood(nextMood)
    setReactionMessage(message)
    window.clearTimeout(reactionTimer.current)
    reactionTimer.current = null
    if (duration === null) return

    reactionTimer.current = window.setTimeout(() => {
      setMood('idle')
      setReactionMessage('')
      reactionTimer.current = null
    }, duration)
  }

  useEffect(() => {
    const keepBotOnScreen = () => {
      const widget = widgetRef.current
      if (!widget) return

      setPosition((current) => {
        const left = Number.isFinite(current?.left)
          ? current.left
          : window.innerWidth - widget.offsetWidth - 14
        const top = Number.isFinite(current?.top)
          ? current.top
          : window.innerHeight - widget.offsetHeight - 12
        const next = clampPosition(left, top)
        if (current && next.left === current.left && next.top === current.top) return current
        return next
      })
    }

    const frame = window.requestAnimationFrame(keepBotOnScreen)
    window.addEventListener('resize', keepBotOnScreen)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', keepBotOnScreen)
    }
  }, [clampPosition, reactionMessage])

  useEffect(() => {
    if (!isOpen) return
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      widgetRef.current?.querySelector('button[aria-expanded]')?.focus()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  useEffect(() => {
    const handleUniversalClick = (event) => {
      const control = event.target instanceof Element && event.target.closest(
        'button, a, [role="button"], input[type="submit"]'
      )
      if (!control) return

      const smiling = Math.random() < 0.45
      showReaction(smiling ? 'smile' : 'dance', smiling ? 'Nice click! 😊' : 'Let’s go! ✨')
    }

    const handleRegistrationReaction = (event) => {
      const { mood: nextMood, message } = event.detail || {}
      if (!['angry', 'sad', 'smile', 'dance'].includes(nextMood)) return
      showReaction(nextMood, message || '', null)
    }

    document.addEventListener('click', handleUniversalClick)
    window.addEventListener(REACTION_EVENT, handleRegistrationReaction)
    return () => {
      document.removeEventListener('click', handleUniversalClick)
      window.removeEventListener(REACTION_EVENT, handleRegistrationReaction)
      window.clearTimeout(reactionTimer.current)
    }
  }, [])

  const startDrag = (event) => {
    if (event.button !== 0) return
    event.preventDefault()
    const widget = widgetRef.current
    if (!widget) return
    suppressClickRef.current = false

    const rect = widget.getBoundingClientRect()
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY
    if (!drag.moved && Math.hypot(deltaX, deltaY) < 5) return

    drag.moved = true
    setIsDragging(true)
    const widget = widgetRef.current
    if (!widget) return

    setPosition(clampPosition(drag.startLeft + deltaX, drag.startTop + deltaY))
  }

  const finishDrag = (event, canceled = false) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    suppressClickRef.current = drag.moved || canceled

    if (drag.moved) {
      const rect = widgetRef.current?.getBoundingClientRect()
      const savedPosition = rect ? { left: rect.left, top: rect.top } : position
      try {
        window.localStorage.setItem(POSITION_KEY, JSON.stringify(savedPosition))
      } catch {
        // The mascot remains draggable if browser storage is unavailable.
      }
    }

    dragRef.current = null
    setIsDragging(false)
  }

  const changeColor = () => {
    setColor((current) => {
      if (current === 'burgundy') return 'blue'
      if (current === 'blue') return 'purple'
      if (current === 'purple') return 'pink'
      return 'burgundy'
    })
  }

  const positionStyle = position
    ? { left: `${position.left}px`, top: `${position.top}px`, right: 'auto', bottom: 'auto' }
    : undefined

  return (
    <div
      ref={widgetRef}
      className={s.widget}
      data-color={color}
      data-dragging={isDragging}
      style={positionStyle}
    >
      {isOpen && (
        <section id="it-buddy-menu" ref={panelRef} className={s.panel} aria-labelledby="it-buddy-title">
          <div className={s.panelHeader}>
            <div>
              <p className={s.eyebrow}>YOUR CODING BUDDY</p>
              <h2 id="it-buddy-title">Hey, code star!</h2>
            </div>
            <button
              className={s.closeButton}
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close coding buddy menu"
            >
              ×
            </button>
          </div>

          <p className={s.message}>Pick your next adventure.</p>

          <nav className={s.links} aria-label="Explore the IT Department">
            {pages.map((page) => (
              <Link key={page.to} to={page.to} onClick={() => setIsOpen(false)}>
                <span aria-hidden="true">{page.icon}</span>
                {page.label}
                <span className={s.arrow} aria-hidden="true">→</span>
              </Link>
            ))}
          </nav>

          <p className={s.footer}>Keep coding. Keep creating. ✨</p>
        </section>
      )}

      <button
        className={s.mascotButton}
        type="button"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={finishDrag}
        onPointerCancel={(event) => finishDrag(event, true)}
        onClick={(event) => {
          if (event.detail === 0 || !suppressClickRef.current) {
            setIsOpen((open) => !open)
          }
        }}
        aria-label={isDragging ? 'Moving coding buddy' : 'Drag coding buddy or click to open menu'}
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'it-buddy-menu' : undefined}
      >
        {!isOpen && (
          <span ref={speechBubbleRef} className={s.speechBubble} aria-live="polite" aria-atomic="true">
            {reactionMessage || 'Need a hand?'}
          </span>
        )}

        <svg
          className={`${s.bot} ${mood === 'dance' ? s.dancing : ''} ${mood === 'smile' ? s.smiling : ''}`}
          viewBox="0 0 180 200"
          role="img"
          aria-label="Pixel coding robot"
          shapeRendering="crispEdges"
        >
          <path
            className={s.head}
            d="M44 35h12V23h18V15h42v8h18v12h12v12h9v54h-9v13h-12v11H48v-11H36v-13h-9V47h9V35z"
          />
          <path
            className={`${s.screen} ${mood === 'angry' ? s.angryScreen : ''}`}
            d="M51 53h78v43H51z"
          />

          {mood === 'angry' ? (
            <g className={s.angryFace}>
              <path d="M64 68l17 5m35-5l-17 5" className={s.eyebrowFace} />
              <path d="M66 79h14m24 0h14" className={s.eyeFace} />
              <path d="M80 91c5-7 15-7 20 0" className={s.mouthFace} />
            </g>
          ) : mood === 'sad' ? (
            <g className={s.sadFace}>
              <path d="M64 70h17m22 0h17" className={s.eyeFace} />
              <path d="M66 82c4 6 10 6 14 0m23 0c4 6 10 6 14 0" className={s.eyeFace} />
              <path d="M80 91c5-7 15-7 20 0" className={s.mouthFace} />
              <path d="M122 80c0 5-5 9-5 13a5 5 0 0010 0c0-4-5-8-5-13z" className={s.tearFace} />
            </g>
          ) : mood === 'smile' ? (
            <g className={s.smileFace}>
              <path d="M63 76c5-10 15-10 20 0m22 0c5-10 15-10 20 0" className={s.eyeFace} />
              <path d="M79 84c6 9 16 9 22 0" className={s.mouthFace} />
            </g>
          ) : (
            <g className={s.idleFace}>
              <path d="M62 68h10v7h9v-7h7v12H76v6H66v-6h-4z" className={s.faceMark} />
              <path d="M104 68h10v7h9v-7h7v12h-12v6h-10v-6h-4z" className={s.faceMark} />
            </g>
          )}

          <path
            className={s.body}
            d="M58 111h64v11h10v42h-10v8h-18v-8H78v8H60v-8H49v-42h9z"
          />
          <path className={s.codeMark} d="M72 126h8v7h8v7h-8v7h-8v-7h8v-7h-8z" />
          <path className={s.codeMark} d="M96 132h21v8H96z" />
          <path className={s.body} d="M48 122h10v30H47v9H36v-9h-8v-23h8v-7h12z" />
          <path className={s.body} d="M122 122h10v7h8v23h-8v9h-11v-9h-9v-30z" />
          <path className={s.body} d="M62 168h18v13H67v7H53v-7h9z" />
          <path className={s.body} d="M101 168h18v13h9v7h-14v-7h-13z" />
        </svg>
      </button>

      <button
        className={s.colorButton}
        type="button"
        onClick={changeColor}
        aria-label="Change coding bot color"
        title="Change bot color"
      >
        🎨
      </button>
    </div>
  )
}
