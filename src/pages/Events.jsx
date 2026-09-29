import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import EventCard from '../components/events/EventCard'
import { EVENTS, eventsByDay, REGISTRATION_DAYS } from '../data/events'
import { SITE } from '../data/site'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cx } from '../utils/cx'
import s from './Events.module.css'

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']

export default function Events() {
  useDocumentTitle(`Events | ${SITE.fest} ${SITE.year}`, { raw: true })

  const workshops = eventsByDay('day1')
  const dayTwoEvents = eventsByDay('day2')
  const total = EVENTS.length
  const totalWord = NUMBER_WORDS[total] ?? String(total)

  return (
    <div className={s.page}>
      <section className={s.eventsHero} aria-labelledby="events-title">
        <div className={s.eventsHeroInner}>
          <div className={s.eventsKicker}>
            <span aria-hidden="true" />
            {SITE.festUpper} {SITE.year} · DAYS 01–02
            <span aria-hidden="true" />
          </div>

          <div className={s.eventsHeroGrid}>
            <div>
              <div className={s.eventsIndex} aria-hidden="true">
                02
              </div>
              <h1 id="events-title">
                EVENTS <em>THAT CONNECT.</em>
              </h1>
              <p>
                {totalWord} events covering technology, creativity, problem solving and
                collaboration. Select an event to open its dedicated registration flow.
              </p>
            </div>

            <div className={s.eventsOrbitMark} aria-hidden="true">
              <span>{String(total).padStart(2, '0')}</span>
              <small>
                EVENTS
                <br />
                {SITE.year}
              </small>
            </div>
          </div>
        </div>
      </section>

      <section className={s.eventsPageContent} aria-labelledby="events-choose-title">
        <div className={s.eventsHeading}>
          <div>
            <div className={s.eventsEyebrow}>
              <span>01</span>
              {SITE.festUpper} {SITE.year}
            </div>
            <h2 id="events-choose-title">
              Choose your <strong>event.</strong>
            </h2>
          </div>
          <p>
            Click an event&apos;s Register button to open that event&apos;s registration directly.
            The selected event, poster and payment QR will load automatically.
          </p>
        </div>

        <div className={s.eventGroup}>
          <div className={s.eventGroupHeading}>
            <h3>
              <span>{REGISTRATION_DAYS.day1.shortLabel}</span> · WORKSHOP
            </h3>
            <Link to="/workshops" className={s.eventGroupLink}>
              WORKSHOP DETAILS <ArrowRight size="1.2em" aria-hidden="true" />
            </Link>
          </div>
          <div className={cx(s.eventsGrid, workshops.length === 1 && s.eventsGridSingle)}>
            {workshops.map((event) => (
              <EventCard key={event.id} event={event} featured />
            ))}
          </div>
        </div>

        <div className={s.eventGroup}>
          <div className={s.eventGroupHeading}>
            <h3>
              <span>{REGISTRATION_DAYS.day2.shortLabel}</span> · EVENTS
            </h3>
          </div>
          <div className={s.eventsGrid}>
            {dayTwoEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
