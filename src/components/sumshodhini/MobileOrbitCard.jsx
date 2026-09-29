import { useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { SITE } from '../../data/site'
import { useInView } from '../../hooks/useInView'
import { useInterval } from '../../hooks/useInterval'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { usePageVisible } from '../../hooks/usePageVisible'
import s from '../../pages/Sumshodhini.module.css'

/*
  Mobile replacement for the orbit (legacy script.js "SUMSHODHINI MOBILE
  INTERACTIVE HIGHLIGHT"): rotates the theme words every 2.6s while visible,
  with a manual "next" button. Hidden by CSS above 760px, which also stops
  the rotation because the card is then never in view.
*/
export default function MobileOrbitCard({ words }) {
  const cardRef = useRef(null)
  const [index, setIndex] = useState(0)
  const inView = useInView(cardRef)
  const pageVisible = usePageVisible()
  const reducedMotion = usePrefersReducedMotion()

  const next = () => setIndex((current) => (current + 1) % words.length)
  useInterval(next, inView && pageVisible && !reducedMotion ? 2600 : null)

  return (
    <div ref={cardRef} className={s.samMobileOrbitCard}>
      <div className={s.samMobileOrbitGlow} aria-hidden="true" />
      <div className={s.samMobileOrbitRing} aria-hidden="true" />
      <div className={`${s.samMobileOrbitRing} ${s.samMobileRingTwo}`} aria-hidden="true" />

      <div className={s.samMobileOrbitCore}>
        <span className={s.samMobileCoreLabel}>IT · {SITE.college}</span>
        <strong key={index} className={`${s.samMobileCoreWord} ${s.isChanging}`}>
          {words[index]}
        </strong>
        <span className={s.samMobileCoreYear}>{SITE.festUpper} ’26</span>
      </div>

      <button
        className={s.samMobileOrbitNext}
        type="button"
        aria-label={`Show next ${SITE.fest} theme`}
        onClick={next}
      >
        <ArrowRight size="1em" aria-hidden="true" />
      </button>
    </div>
  )
}
