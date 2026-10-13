import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { resolveImage } from '../../utils/assets'
import s from './AssociationHighlights.module.css'

// These gallery photos have landscape dimensions; portrait photos are omitted.
const HIGHLIGHTS = [
  {
    image: 'gallery/gallery-1',
    category: 'Department Faculty',
    title: 'IT Department Faculty',
    alt: 'IT Department faculty group photo',
  },
  {
    image: 'gallery/gallery-5',
    category: 'Student Activities',
    title: 'Students',
    alt: 'IT Department students and faculty group photo',
  },
  {
    image: 'gallery/guest-lecture-1',
    category: 'Guest Lecture',
    title: 'Guest Lecture on AI Applications',
    alt: 'IT Department faculty at a guest lecture on AI applications',
  },
  {
    image: 'gallery/guest-lecture-2',
    category: 'Guest Lecture',
    title: 'Learning Through Guest Lectures',
    alt: 'Students attending an IT Department guest lecture',
  },
]

export default function AssociationHighlights() {
  const [activeIndex, setActiveIndex] = useState(0)

  const slides = useMemo(
    () =>
      HIGHLIGHTS.map((item) => ({
        ...item,
        asset: resolveImage(item.image),
      })).filter((item) => item.asset),
    [],
  )

  useEffect(() => {
    if (slides.length < 2) return undefined

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [slides.length])

  if (!slides.length) return null

  const active = slides[activeIndex % slides.length]
  const showPrevious = () => {
    setActiveIndex((index) => (index - 1 + slides.length) % slides.length)
  }
  const showNext = () => {
    setActiveIndex((index) => (index + 1) % slides.length)
  }

  return (
    <section
      className="section"
      aria-labelledby="association-highlights-title"
    >
      <div className="container">
        <div className={s.heading}>
          <div>
            <p className="section-label">DEPARTMENT HIGHLIGHTS</p>
            <h2 id="association-highlights-title">
              Moments from <span className="text-primary">IT DEPT.</span>
            </h2>
          </div>
         
        </div>

        <div className={s.layout}>
          <div className={s.featured}>
            <div className={s.imageWrap}>
              <img
                key={active.image}
                src={active.asset.src}
                srcSet={active.asset.srcSet}
                sizes="(max-width: 900px) 100vw, 70vw"
                alt={active.alt}
                className={s.image}
              />
              <div className={s.overlay} />
              <Link
                to="/gallery#recent-events"
                className={s.caption}
                aria-label={`View ${active.title} in the gallery`}
              >
                <span>{active.category}</span>
                <h3>{active.title}</h3>
              </Link>
            </div>

            {slides.length > 1 && (
              <div className={s.controls} aria-label="Department highlights carousel controls">
                <button
                  type="button"
                  className={s.arrow}
                  onClick={showPrevious}
                  aria-label="Show previous highlight"
                >
                  ←
                </button>
                <div className={s.dots}>
                  {slides.map((slide, index) => (
                    <button
                      key={slide.image}
                      type="button"
                      className={index === activeIndex ? s.dotActive : s.dot}
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Show highlight ${index + 1}: ${slide.title}`}
                      aria-current={index === activeIndex ? 'true' : undefined}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className={s.arrow}
                  onClick={showNext}
                  aria-label="Show next highlight"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
