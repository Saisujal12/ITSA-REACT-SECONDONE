import manuOverseasLogo from '../../assets/images/brand/manu-overseas-logo.webp'
import s from './Sponsor.module.css'

export default function Sponsor() {
  return (
    <section
      className={`section ${s.sponsors}`}
      aria-labelledby="site-sponsor-title"
    >
      <div className="container">
        <h2 id="site-sponsor-title" className={s.heading}>
          Sponsored by
        </h2>

        <a
          className={s.wordmark}
          href="https://www.manuoverseas.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit the Manu Overseas website (opens in a new tab)"
        >
          <img
            className={s.logo}
            src={manuOverseasLogo}
            alt=""
          />
          <span>MANU OVERSEAS</span>
        </a>
      </div>
    </section>
  )
}