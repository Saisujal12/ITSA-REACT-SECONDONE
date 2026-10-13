import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ImageIcon, X } from 'lucide-react'
import { SITE } from '../../data/site'
import ImageWithFallback from '../ui/ImageWithFallback'
import s from '../../pages/Register.module.css'

const posterImageStyle = {
  display: 'block',
  width: '100%',
  height: '100%',
  minHeight: 0,
  aspectRatio: '16 / 9',
  objectFit: 'contain',
  transition: 'transform 260ms ease',
}

const previewImageStyle = {
  display: 'block',
  width: 'min(92vw, 1200px)',
  height: 'min(92vh, 1000px)',
  maxWidth: '92vw',
  maxHeight: '92vh',
  minHeight: 0,
  objectFit: 'contain',
  borderRadius: '8px',
  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45)',
}

const closeButtonStyle = {
  position: 'fixed',
  zIndex: 3102,
  top: 'max(18px, env(safe-area-inset-top))',
  right: 'max(18px, env(safe-area-inset-right))',
  width: '56px',
  height: '56px',
  display: 'grid',
  placeItems: 'center',
  padding: 0,
  border: '2px solid #ffffff',
  borderRadius: '50%',
  background: '#ffffff',
  color: '#241719',
  cursor: 'pointer',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.65)',
}

export default function PosterPanel({ event, day }) {
  const isWorkshop = event.type === 'workshop'
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const posterButtonRef = useRef(null)

  useEffect(() => {
    if (!isPreviewOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsPreviewOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      posterButtonRef.current?.focus()
    }
  }, [isPreviewOpen])

  const placeholder = (
    <div
      className={s.posterPlaceholder}
      role="img"
      aria-label={`${event.title} poster not yet available`}
      style={{
        width: '100%',
        minHeight: 0,
        aspectRatio: '16 / 9',
      }}
    >
      <ImageIcon aria-hidden="true" />
      <strong>{isWorkshop ? 'WORKSHOP POSTER' : 'EVENT POSTER'}</strong>
      <span>The official poster will be published here soon.</span>
    </div>
  )

  const previewFallback = (
    <div
      role="img"
      aria-label={`${event.title} poster not yet available`}
      style={{
        width: 'min(92vw, 900px)',
        minHeight: '280px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        padding: '32px',
        border: '1px solid rgba(216, 185, 120, 0.35)',
        borderRadius: '16px',
        background: '#2a1e20',
        color: '#fff',
        textAlign: 'center',
      }}
    >
      <ImageIcon size={44} color="#e8c978" aria-hidden="true" />
      <strong>{isWorkshop ? 'WORKSHOP POSTER' : 'EVENT POSTER'}</strong>
      <span style={{ color: '#d9cec1' }}>
        The official poster will be published here soon.
      </span>
    </div>
  )

  const preview = isPreviewOpen ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${event.title} poster preview`}
      onClick={() => setIsPreviewOpen(false)}
      style={{
        position: 'fixed',
        zIndex: 3100,
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        width: '100vw',
        height: '100vh',
        height: '100dvh',
        margin: 0,
        padding: 0,
        background: 'rgba(20, 16, 17, 0.9)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'posterPreviewFadeIn 180ms ease-out',
      }}
    >
      <button
        type="button"
        autoFocus
        onClick={(e) => {
          e.stopPropagation()
          setIsPreviewOpen(false)
        }}
        aria-label="Close poster and return to registration"
        title="Back to registration"
        style={closeButtonStyle}
      >
        <X size={32} strokeWidth={3} aria-hidden="true" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'grid',
          placeItems: 'center',
          width: '100%',
          height: '100%',
          animation: 'posterPreviewZoomIn 220ms ease-out',
        }}
      >
        <ImageWithFallback
          imageKey={event.poster}
          alt={event.posterAlt}
          loading="eager"
          style={previewImageStyle}
          fallback={previewFallback}
        />
      </div>
    </div>
  ) : null

  return (
    <>
      <style>
        {`
          @media (min-width: 1201px) {
            .${s.directRegistrationLayout} {
              grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
              gap: 28px !important;
            }
          }

          @keyframes posterPreviewFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes posterPreviewZoomIn {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>

      <aside
        className={s.registrationPoster}
        aria-label={`${event.title} poster`}
      >
        <div
          className={s.posterFrame}
          style={{
            minHeight: 0,
            transition: 'box-shadow 240ms ease',
          }}
        >
          <div className={s.posterLabel}>
            <span>{day.shortLabel}</span>
            <span>
              {SITE.nameUpper} · {SITE.college}
            </span>
          </div>

          <button
            ref={posterButtonRef}
            type="button"
            className={s.posterImageWrap}
            onClick={() => setIsPreviewOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label={`Open a large preview of the ${event.title} poster`}
            style={{
              minHeight: 0,
              height: 'auto',
              aspectRatio: '16 / 9',
              padding: 0,
              cursor: 'zoom-in',
              transition: 'transform 240ms ease, box-shadow 240ms ease',
              transform: isHovered ? 'translateY(-3px)' : 'none',
              boxShadow: isHovered
                ? '0 16px 36px rgba(0, 0, 0, 0.25)'
                : 'none',
            }}
          >
            <ImageWithFallback
              key={event.id}
              imageKey={event.poster}
              alt={event.posterAlt}
              className={s.posterImage}
              loading="eager"
              style={{
                ...posterImageStyle,
                transform: isHovered ? 'scale(1.025)' : 'scale(1)',
              }}
              fallback={placeholder}
            />
          </button>

          <div className={s.posterCaption}>
            <span>{isWorkshop ? 'WORKSHOP' : 'EVENT'}</span>
            <strong>{event.title}</strong>
          </div>
        </div>
      </aside>

      {preview && createPortal(preview, document.body)}
    </>
  )
}