import ImageWithFallback from '../ui/ImageWithFallback'
import s from '../../pages/Sumshodhini.module.css'

/**
 * Compact mobile version of the SUMSHODHINI visual. The empty center is kept
 * ready for the event logo when it is provided.
 */
export default function MobileOrbitCard() {
  return (
    <div className={s.samMobileOrbitCard}>
      <div className={s.samMobileOrbitGlow} aria-hidden="true" />
      <div className={s.samMobileOrbitRing} aria-hidden="true" />
      <div className={`${s.samMobileOrbitRing} ${s.samMobileRingTwo}`} aria-hidden="true" />

      <div className={s.samMobileOrbitCore}>
        <ImageWithFallback
          imageKey="sumshodhini/sumshodhini-logo-512"
          alt="SUMSHODHINI 2026 logo"
          className={s.samMobileLogo}
          loading="eager"
        />
      </div>
    </div>
  )
}
