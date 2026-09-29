import { Link } from 'react-router'
import { eventsByDay } from '../../data/events'
import { registrationPath } from '../../utils/registrationRoute'
import s from '../../pages/Register.module.css'

export default function EventSelector() {
  const events = eventsByDay('day2')

  return (
    <section className={s.eventSelector} aria-labelledby="register-events-title">
      <Link to="/register" className={s.backLink}>
        <span aria-hidden="true">←</span>
        Back to Day Selection
      </Link>

      <div className={s.eventSelectorTop}>
        <div>
          <div className={s.eventSelectorKicker}>
            <span aria-hidden="true" />
            DAY 02 · EVENTS
          </div>
          <h1 id="register-events-title">
            Choose your <strong>event.</strong>
          </h1>
        </div>
        <p>
          Select the event you want to register for. Each event has its own registration details
          and payment QR information.
        </p>
      </div>

      <div className={s.registrationEventsGrid}>
        {events.map((event, index) => {
          const Icon = event.icon
          return (
            <Link key={event.id} to={registrationPath(event.id, 'day2')} className={s.registrationEventCard}>
              <span className={s.registrationEventNumber}>
                EVENT {String(index + 1).padStart(2, '0')}
              </span>
              <span className={s.registrationEventIcon} aria-hidden="true">
                <Icon />
              </span>
              <span className={s.registrationEventType}>{event.category}</span>
              <h2>{event.title}</h2>
              <p>{event.selectorDescription ?? event.description}</p>
              <span className={s.registrationEventAction}>
                <span>Register for event</span>
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
