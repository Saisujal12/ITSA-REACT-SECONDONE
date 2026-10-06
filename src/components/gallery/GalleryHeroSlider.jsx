import { Camera } from 'lucide-react'
import { SITE } from '../../data/site'
import { useCarousel } from '../../hooks/useCarousel'
import { resolveImage } from '../../utils/assets'
import { cx } from '../../utils/cx'
import s from '../../pages/Gallery.module.css'

const pad = (n) => String(n).padStart(2, '0')

export default function GalleryHeroSlider({ slides }) {
  const available = slides.map((slide) => ({ ...slide, image: resolveImage(slide.image) })).filter((slide) => slide.image)
  // The legacy hero slider never paused on hover; keep that.
  const { index, goTo, regionProps } = useCarousel(available.length, { pauseOnHover: false })

  return (
    <div className={s.galleryHeroArt}>
      <div className={cx(s.galleryOrbit, s.orbitOne)} aria-hidden="true" />
      <div className={cx(s.galleryOrbit, s.orbitTwo)} aria-hidden="true" />
      <div className={cx(s.galleryOrbit, s.orbitThree)} aria-hidden="true" />

      <div
        {...regionProps}
        className={cx(s.galleryHeroPhotoCard, s.carouselRegion)}
        role="region"
        aria-roledescription="carousel"
        aria-label="IT Department photo highlights"
      >
        <div className={s.heroGallerySlider}>
          {available.map((slide, slideIndex) => (
            <div
              key={slide.alt}
              className={cx(s.heroGallerySlide, slideIndex === index && s.active)}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} of ${available.length}`}
              aria-hidden={slideIndex !== index}
            >
              <img
                src={slide.image.src}
                srcSet={slide.image.srcSet}
                sizes="(max-width: 800px) 96vw, 45vw"
                alt={slide.alt}
                loading={slideIndex === index ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
          ))}
        </div>

        <div className={s.heroPhotoOverlay} aria-hidden="true" />
        <div className={s.heroPhotoTop} aria-hidden="true">
          <span>{SITE.nameUpper}</span>
          <span>{SITE.college}</span>
        </div>
        <div className={s.heroPhotoBottom}>
          <span aria-hidden="true">MOMENTS</span>
          <span>
            {pad(index + 1)} / {pad(available.length)}
          </span>
        </div>

        {available.length > 1 && (
          <div className={s.heroPhotoDots}>
            {available.map((slide, slideIndex) => (
              <button
                key={slide.alt}
                type="button"
                className={cx(s.heroPhotoDot, slideIndex === index && s.active)}
                aria-label={`Gallery photo ${slideIndex + 1}`}
                aria-current={slideIndex === index || undefined}
                onClick={() => goTo(slideIndex)}
              />
            ))}
          </div>
        )}
      </div>

      <div className={s.heroArtCaption} aria-hidden="true">
        <Camera />
        CAPTURE · CREATE · CONNECT
      </div>
    </div>
  )
}
