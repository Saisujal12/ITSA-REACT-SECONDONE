import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowRight, Camera, Flower2, FolderOpen, X } from 'lucide-react'
import { useCarousel } from '../../hooks/useCarousel'
import { resolveImage } from '../../utils/assets'
import { cx } from '../../utils/cx'
import s from '../../pages/Gallery.module.css'

export default function AlbumCard({ album, reverse }) {
  const photos = album.photos
    .map((photo) => ({ ...photo, image: resolveImage(photo.image) }))
    .filter((photo) => photo.image)
  const { index, regionProps } = useCarousel(photos.length)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const titleId = `album-${album.id}`
  const lightboxOpen = lightboxIndex !== null

  const showPrevious = () => setLightboxIndex((current) => (current - 1 + photos.length) % photos.length)
  const showNext = () => setLightboxIndex((current) => (current + 1) % photos.length)
  const closeLightbox = () => setLightboxIndex(null)

  useEffect(() => {
    if (!lightboxOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeLightbox()
      if (event.key === 'ArrowLeft' && photos.length > 1) setLightboxIndex((current) => (current - 1 + photos.length) % photos.length)
      if (event.key === 'ArrowRight' && photos.length > 1) setLightboxIndex((current) => (current + 1) % photos.length)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [lightboxOpen, photos.length])

  return (
    <article
      className={cx(
        s.eventPhotoCard,
        reverse && s.eventPhotoCardReverse,
        album.id === 'bathukamma-2026' && s.bathukammaEventCard,
      )}
      aria-labelledby={titleId}
    >
      <div className={s.eventPhotoFrame}>
        {photos.length === 0 ? (
          album.id === 'bathukamma-2026' ? (
            <div className={cx(s.photoPending, s.bathukammaVisual)}>
              <div className={s.bathukammaFlower} aria-hidden="true">
                <Flower2 />
              </div>
              <span className={s.bathukammaVisualEyebrow}>A TELANGANA FESTIVAL</span>
              <strong>Bathukamma</strong>
              <span className={s.bathukammaVisualYear}>2026 · CULTURE · COMMUNITY</span>
              <span className={s.bathukammaPhotoNote}>Event photos coming soon</span>
            </div>
          ) : (
            <div className={s.photoPending}>
              <Camera aria-hidden="true" />
              <strong>PHOTOS TO BE ADDED</strong>
              <span>Photos from this event will appear here once they are uploaded.</span>
            </div>
          )
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
                <button
                  type="button"
                  className={s.galleryImageOpen}
                  onClick={() => setLightboxIndex(photoIndex)}
                  aria-label={`Open image ${photoIndex + 1}: ${photo.alt}`}
                  tabIndex={photoIndex === index ? 0 : -1}
                >
                  <img
                    src={photo.image.src}
                    srcSet={photo.image.srcSet}
                    sizes="(max-width: 1100px) 100vw, 65vw"
                    alt={photo.alt}
                    loading={photoIndex === index ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </button>
              </div>
            ))}

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
          <a
            href={album.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={s.eventDriveLink}
          >
            <FolderOpen size={14} aria-hidden="true" />
            {album.driveLabel}
            <ArrowRight size={14} aria-hidden="true" />
            <span className="visually-hidden">(Google Drive, opens in a new tab)</span>
          </a>
        )}
      </div>

      {lightboxOpen && createPortal(
        <div className={s.galleryLightbox} role="dialog" aria-modal="true" aria-label={`${album.title} image viewer`} onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeLightbox()
        }}>
          <button type="button" className={s.galleryLightboxClose} onClick={closeLightbox} aria-label="Close image viewer">
            <X size={28} aria-hidden="true" />
          </button>
          {photos.length > 1 && (
            <button type="button" className={cx(s.galleryLightboxArrow, s.galleryLightboxPrev)} onClick={showPrevious} aria-label="Previous image">
              <ArrowLeft size={28} aria-hidden="true" />
            </button>
          )}
          <div className={s.galleryLightboxImageWrap}>
            <img
              className={s.galleryLightboxImage}
              src={photos[lightboxIndex].image.src}
              srcSet={photos[lightboxIndex].image.srcSet}
              alt={photos[lightboxIndex].alt}
            />
          </div>
          {photos.length > 1 && (
            <button type="button" className={cx(s.galleryLightboxArrow, s.galleryLightboxNext)} onClick={showNext} aria-label="Next image">
              <ArrowRight size={28} aria-hidden="true" />
            </button>
          )}
        </div>,
        document.body,
      )}
    </article>
  )
}
