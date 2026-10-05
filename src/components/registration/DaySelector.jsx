import { Link } from 'react-router'
import { DAY1_DEFAULT_EVENT_ID, REGISTRATION_DAYS } from '../../data/events'
import { SITE } from '../../data/site'
import { registrationPath } from '../../utils/registrationRoute'
import { cx } from '../../utils/cx'
import s from '../../pages/Register.module.css'

const CARDS = [
  { day: REGISTRATION_DAYS.day1, to: registrationPath(DAY1_DEFAULT_EVENT_ID, 'day1'), tone: null },
  { day: REGISTRATION_DAYS.day2, to: '/events', tone: s.dayCardEvents },
]

export default function DaySelector() {
  return (
    <section className={s.registrationSelector} aria-labelledby="register-days-title">
      <div className={s.selectorHeading}>
        <div className={s.selectorKicker}>
          <span aria-hidden="true" />
          {SITE.nameUpper} · {SITE.college}
        </div>
        <h1 id="register-days-title">
          Choose your <strong>registration day.</strong>
        </h1>
        <p>
          Select the day you want to register for. Day 02 will take you to the available event
          options.
        </p>
      </div>

      <div className={s.daySelectionGrid}>
        {CARDS.map(({ day, to, tone }) => {
          const Icon = day.icon
          return (
            <Link key={day.key} to={to} className={cx(s.dayCard, tone)}>
              <span className={s.dayCardNumber}>{day.shortLabel}</span>
              <span className={s.dayCardIcon} aria-hidden="true">
                <Icon />
              </span>
              <span className={s.dayCardTitle}>{day.title}</span>
              <span className={s.dayCardDescription}>{day.selectorDescription}</span>
              <span className={s.dayCardAction}>
                {day.selectorAction}
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
