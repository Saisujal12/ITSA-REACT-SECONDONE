import { useEffect, useState } from 'react'
import { ArrowLeft, ImageIcon } from 'lucide-react'
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
  width: 'min(94vw, 1400px)',
  height: 'min(86vh, 950px)',
  maxWidth: '94vw',
  maxHeight: '86vh',
  minHeight: 0,
  objectFit: 'contain',
  borderRadius: '12px',
  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45)',
}

export default function PosterPanel({ event, day }) {
  const isWorkshop = event.type === 'workshop'
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

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
            from { opacity: 0; transform: scale(0.96); }
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
              transition:
                'transform 240ms ease, box-shadow 240ms ease',
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

      {isPreviewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${event.title} poster preview`}
          onClick={() => setIsPreviewOpen(false)}
          style={{
            position: 'fixed',
            zIndex: 3000,
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'rgba(20, 16, 17, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            animation: 'posterPreviewFadeIn 180ms ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              animation: 'posterPreviewZoomIn 220ms ease-out',
            }}
          >
            <ImageWithFallback
              imageKey={event.poster}
              alt={event.posterAlt}
              loading="eager"
              style={previewImageStyle}
              fallback={
                <div
                  role="img"
                  aria-label={`${event.title} poster not yet available`}
                  style={{
                    width: 'min(94vw, 900px)',
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
                  <ImageIcon
                    size={44}
                    color="#e8c978"
                    aria-hidden="true"
                  />
                  <strong>
                    {isWorkshop ? 'WORKSHOP POSTER' : 'EVENT POSTER'}
                  </strong>
                  <span style={{ color: '#d9cec1' }}>
                    The official poster will be published here soon.
                  </span>
                </div>
              }
            />

            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              aria-label="Back to registration"
              style={{
                minHeight: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '9px',
                padding: '0 20px',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#fff',
                font: 'inherit',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
              }}
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Back to registration
            </button>
          </div>
        </div>
      )}
    </>
  )
}