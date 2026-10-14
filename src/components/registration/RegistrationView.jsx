import { Link } from 'react-router'
import { getDay, hasVerifiedFee } from '../../data/events'
import { backTarget } from '../../utils/registrationRoute'
import PosterPanel from './PosterPanel'
import RegistrationForm from './RegistrationForm'
import s from '../../pages/Register.module.css'

export default function RegistrationView({ event, from }) {
  const day = getDay(event.day)
  const back = backTarget(from)
  const feeKnown = hasVerifiedFee(event)

  return (
    <section
      className={s.registrationFormView}
      aria-labelledby="register-form-title"
    >
      <Link to={back.to} className={s.backLink}>
        <span aria-hidden="true">←</span>
        {back.label}
      </Link>

      <h1 id="register-form-title" className="visually-hidden">
        Register for {event.title}
      </h1>

      <div className={s.directRegistrationLayout}>
        <PosterPanel
          event={event}
          day={day}
          status={feeKnown ? 'REGISTRATION OPEN' : 'FEE TO BE ANNOUNCED'}
          statusPending={!feeKnown}
        />
        <RegistrationForm key={event.id} event={event} day={day} />
      </div>
    </section>
  )
}
