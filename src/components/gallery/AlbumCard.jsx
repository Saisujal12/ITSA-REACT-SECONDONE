import { ArrowLeft, ArrowRight, Camera, FolderOpen } from 'lucide-react'
import { useCarousel } from '../../hooks/useCarousel'
import { resolveImage } from '../../utils/assets'
import { cx } from '../../utils/cx'
import s from '../../pages/Gallery.module.css'

const pad = (n) => String(n).padStart(2, '0')

export default function AlbumCard({ album, number, reverse }) {
  const photos = album.photos.map((photo) => ({ ...photo, image: resolveImage(photo.image) })).filter((photo) => photo.image)
  const { index, goTo, next, prev, regionProps } = useCarousel(photos.length)
  const titleId = `album-${album.id}`

  return (
    <article className={cx(s.eventPhotoCard, reverse && s.eventPhotoCardReverse)} aria-labelledby={titleId}>
      <div className={s.eventPhotoFrame}>
        {photos.length === 0 ? (
          <div className={s.photoPending}>
            <Camera aria-hidden="true" />
            <strong>PHOTOS TO BE ADDED</strong>
            <span>Photos from this event will appear here once they are uploaded.</span>
          </div>
        ) : (
          <div
            {...regionProps}
            className={cx(s.eventSlider, s.carouselRegion)}
            role="region"
            aria-roledescription="carousel"
            aria-label={`${album.title} photos`}
          >
            {photos.map((photo, photoIndex) => (
              <div
                key={photo.alt + photoIndex}
                className={cx(s.eventSlide, photoIndex === index && s.active)}
                role="group"
                aria-roledescription="slide"
                aria-label={`${photoIndex + 1} of ${photos.length}`}
                aria-hidden={photoIndex !== index}
              >
                <img
                  src={photo.image.src}
                  srcSet={photo.image.srcSet}
                  sizes="(max-width: 1100px) 100vw, 65vw"
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}

            <div className={s.eventPhotoOverlay} aria-hidden="true" />
            <span className={s.eventPhotoNumber} aria-hidden="true">
              {number}
            </span>
            <span className={s.eventSlideCounter} aria-hidden="true">
              {pad(index + 1)} / {pad(photos.length)}
            </span>

            {photos.length > 1 && (
              <>
                <button type="button" className={cx(s.eventSliderButton, s.eventPrev)} aria-label="Previous photo" onClick={prev}>
                  <ArrowLeft size={18} aria-hidden="true" />
                </button>
                <button type="button" className={cx(s.eventSliderButton, s.eventNext)} aria-label="Next photo" onClick={next}>
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
                <div className={s.eventSliderDots}>
                  {photos.map((photo, photoIndex) => (
                    <button
                      key={photo.alt + photoIndex}
                      type="button"
                      className={cx(s.eventDot, photoIndex === index && s.active)}
                      aria-label={`Photo ${photoIndex + 1}`}
                      aria-current={photoIndex === index || undefined}
                      onClick={() => goTo(photoIndex)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className={s.eventPhotoDetails}>
        <div className={s.eventDate}>
          <span>{album.date}</span>
          <span className={s.eventCategory}>{album.category}</span>
        </div>
        <h3 id={titleId}>{album.title}</h3>
        <p>{album.description}</p>
        {album.driveUrl && (
          <a href={album.driveUrl} target="_blank" rel="noopener noreferrer" className={s.eventDriveLink}>
            <FolderOpen size={14} aria-hidden="true" />
            {album.driveLabel}
            <ArrowRight size={14} aria-hidden="true" />
            <span className="visually-hidden">(Google Drive, opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  )
}
