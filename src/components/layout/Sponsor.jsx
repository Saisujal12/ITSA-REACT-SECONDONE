import manuOverseasLogo from '../../assets/images/brand/manu-overseas-logo.webp'
import s from './Sponsor.module.css'

export default function Sponsor() {
  return (
    <section className={`section ${s.sponsors}`} aria-labelledby="site-sponsor-title">
      <div className="container">
        <h2 id="site-sponsor-title" className={s.heading}>
          Sponsored by
        </h2>
        <div className={s.wordmark} aria-label="Manu Overseas">
          <img
            className={s.logo}
            src={manuOverseasLogo}
            alt="Manu Overseas sponsor logo"
          />
          <span>MANU OVERSEAS</span>
        </div>
      </div>
    </section>
  )
}
