import manuOverseasLogo from '../../assets/images/brand/manu-overseas-logo.webp'
import teamInspireLogo from '../../assets/images/brand/team-inspire-logo.png'
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

        <div className={s.sponsorGrid}>
          {/* Manu Overseas */}
          <a
            className={s.sponsorCard}
            href="https://www.manuoverseas.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit the Manu Overseas website (opens in a new tab)"
          >
            <div className={s.logoContainer}>
              <img
                className={s.manuLogo}
                src={manuOverseasLogo}
                alt="Manu Overseas logo"
              />
            </div>

            <h3 className={s.sponsorName}>
              MANU OVERSEAS
            </h3>
          </a>

          {/* Enagic */}
          <a
            className={s.sponsorCard}
            href="https://enagic.co.in/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit the Enagic India website (opens in a new tab)"
          >
            <div className={s.logoContainer}>
              <img
                className={s.enagicLogo}
                src={teamInspireLogo}
                alt="Team Inspire logo"
              />
            </div>

            <h3 className={s.sponsorName}>
              Enagic
            </h3>

            <p className={s.sponsorCaption}>
              change your water change your life
            </p>
          </a>
        </div>
      </div>
    </section>
  )
}
