import { Link } from 'react-router'
import { getDay, hasVerifiedFee } from '../../data/events'
import { backTarget } from '../../utils/registrationRoute'
import { cx } from '../../utils/cx'
import PosterPanel from './PosterPanel'
import RegistrationForm from './RegistrationForm'
import s from '../../pages/Register.module.css'

export default function RegistrationView({ event, from }) {
  const day = getDay(event.day)
  const back = backTarget(from)
  const feeKnown = hasVerifiedFee(event)

  return (
    <section className={s.registrationFormView} aria-labelledby="register-form-title">
      <Link to={back.to} className={s.backLink}>
        <span aria-hidden="true">←</span>
        {back.label}
      </Link>

      <div className={s.selectedDayBanner}>
        <div>
          <span className={s.selectedDayLabel}>{day.label}</span>
          <h1 id="register-form-title">{event.title}</h1>
        </div>
        <span className={cx(s.selectedDayStatus, !feeKnown && s.pending)}>
          <span aria-hidden="true" />
          {feeKnown ? 'REGISTRATION OPEN' : 'FEE TO BE ANNOUNCED'}
        </span>
      </div>

      <div className={s.directRegistrationLayout}>
        <PosterPanel event={event} day={day} />
        <RegistrationForm key={event.id} event={event} day={day} />
      </div>
    </section>
  )
}
