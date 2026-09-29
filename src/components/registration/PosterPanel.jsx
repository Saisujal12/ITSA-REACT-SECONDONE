import { ImageIcon } from 'lucide-react'
import { SITE } from '../../data/site'
import ImageWithFallback from '../ui/ImageWithFallback'
import s from '../../pages/Register.module.css'

export default function PosterPanel({ event, day }) {
  const isWorkshop = event.type === 'workshop'

  return (
    <aside className={s.registrationPoster} aria-label={`${event.title} poster`}>
      <div className={s.posterFrame}>
        <div className={s.posterLabel}>
          <span>{day.shortLabel}</span>
          <span>
            {SITE.nameUpper} · {SITE.college}
          </span>
        </div>

        <div className={s.posterImageWrap}>
          <ImageWithFallback
            key={event.id}
            imageKey={event.poster}
            alt={event.posterAlt}
            className={s.posterImage}
            loading="eager"
            fallback={
              <div className={s.posterPlaceholder} role="img" aria-label={`${event.title} poster not yet available`}>
                <ImageIcon aria-hidden="true" />
                <strong>{isWorkshop ? 'WORKSHOP POSTER' : 'EVENT POSTER'}</strong>
                <span>The official poster will be published here soon.</span>
              </div>
            }
          />
        </div>

        <div className={s.posterCaption}>
          <span>{isWorkshop ? 'WORKSHOP' : 'EVENT'}</span>
          <strong>{event.title}</strong>
        </div>
      </div>
    </aside>
  )
}
