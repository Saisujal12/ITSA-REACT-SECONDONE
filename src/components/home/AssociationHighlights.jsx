import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { resolveImage } from '../../utils/assets'
import s from './AssociationHighlights.module.css'

const HIGHLIGHTS = [
  {
    image: 'gallery/guest-lecture-1',
    title: 'Guest Lecture on AI Applications',
    label: 'Guest Lecture',
    to: '/gallery#recent-events',
  },
  {
    image: 'gallery/gallery-1',
    title: "Teachers' Day",
    label: 'Celebration',
    to: '/gallery#recent-events',
  },
  {
    image: 'gallery/gallery-2',
    title: 'IT Department 2026 Inaugural',
    label: 'Association',
    to: '/gallery#recent-events',
  },
  {
    image: 'gallery/gallery-3',
    title: 'Workshops & Learning',
    label: 'Learning',
    to: '/gallery#recent-events',
  },
]

const INTERVAL_MS = 3500

export default function AssociationHighlights() {
  const slides = useMemo(
    () =>
      HIGHLIGHTS.map((item) => ({
        ...item,
        asset: resolveImage(item.image),
      })).filter((item) => item.asset),
    [],
  )

  const [activeIndex, setActiveIndex] =
    useState(0)

  useEffect(() => {
    if (slides.length < 2) {
      return undefined
    }

    const timer = window.setInterval(
      () => {
        setActiveIndex(
          (current) =>
            (current + 1) %
            slides.length,
        )
      },
      INTERVAL_MS,
    )

    return () =>
      window.clearInterval(timer)
  }, [slides.length])

  if (!slides.length) {
    return null
  }

  const active = slides[activeIndex]

  const goTo = (index) => {
    setActiveIndex(
      (index + slides.length) %
        slides.length,
    )
  }

  return (
    <section
      className="section"
      aria-labelledby="association-highlights-title"
    >
      <div className="container">
        <div className={s.heading}>
          <div>
            <p className="section-label">
              DEPARTMENT HIGHLIGHTS
            </p>

            <h2 id="association-highlights-title">
              Moments from{' '}
              <span className="text-primary">
                IT DEPT.
              </span>
            </h2>
          </div>

          <p className={s.headingText}>
            A rotating look at workshops,
            celebrations, guest lectures and
            student activities.
          </p>
        </div>

        <div className={s.layout}>
          <div className={s.featured}>
            <div className={s.imageWrap}>
              <img
                key={active.image}
                src={active.asset.src}
                srcSet={active.asset.srcSet}
                sizes="(max-width: 900px) 100vw, 70vw"
                alt={active.title}
                className={s.image}
              />

              <div className={s.overlay} />

              <Link to={active.to} className={s.caption} aria-label={`View ${active.title} in Moments worth remembering`}>
                <span>{active.label}</span>
                <h3>{active.title}</h3>
              </Link>

            </div>

            <div className={s.controls}>
              <button
                type="button"
                className={s.arrow}
                onClick={() =>
                  goTo(activeIndex - 1)
                }
                aria-label="Previous highlight"
              >
                <ChevronLeft size={18} />
              </button>

              <div
                className={s.dots}
                aria-label="Highlight slides"
              >
                {slides.map(
                  (slide, index) => (
                    <button
                      key={slide.image}
                      type="button"
                      className={
                        index ===
                        activeIndex
                          ? s.dotActive
                          : s.dot
                      }
                      onClick={() =>
                        goTo(index)
                      }
                      aria-label={`Show highlight ${
                        index + 1
                      }: ${slide.title}`}
                      aria-current={
                        index ===
                        activeIndex
                          ? 'true'
                          : undefined
                      }
                    />
                  ),
                )}
              </div>

              <button
                type="button"
                className={s.arrow}
                onClick={() =>
                  goTo(activeIndex + 1)
                }
                aria-label="Next highlight"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
