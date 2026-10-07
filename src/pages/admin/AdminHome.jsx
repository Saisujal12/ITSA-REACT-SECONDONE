import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, Users } from 'lucide-react'
import { Link } from 'react-router'
import kitswLogo from '../../assets/images/brand/kitsw-logo-transparent.png'
import { EVENTS } from '../../data/events'
import { LOGO, SITE } from '../../data/site'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { fetchPublicRegistrationCount } from '../../services/registrations'
import s from './AdminHome.module.css'

const OPEN_EVENTS = EVENTS.filter(
  (event) => event.type === 'event' && event.status === 'open' && event.registrationEnabled,
)

export default function AdminHome() {
  useDocumentTitle('Registration Overview | IT Department')
  const [counts, setCounts] = useState({ llm: 0 })

  useEffect(() => {
    let active = true
    const loadCounts = async () => {
      const results = await Promise.all([
        fetchPublicRegistrationCount('llm').catch(() => ({ count: 0 })),
        ...OPEN_EVENTS.map((event) =>
          fetchPublicRegistrationCount(event.id).catch(() => ({ count: 0 })),
        ),
      ])

      if (!active) return
      const next = { llm: Math.min(100, Math.max(0, Number(results[0]?.count) || 0)) }
      OPEN_EVENTS.forEach((event, index) => {
        next[event.id] = Math.max(0, Number(results[index + 1]?.count) || 0)
      })
      setCounts(next)
    }

    loadCounts()
    const interval = window.setInterval(loadCounts, 30_000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  return (
    <div className={s.page}>
      <header className={s.header}>
        <Link to="/" className={s.brand} aria-label={`${SITE.name} ${SITE.college} home`}>
          <span className={s.collegeLogo}>
            <img src={kitswLogo} alt="KITSW" />
          </span>
          <span className={s.divider} aria-hidden="true" />
          <span className={s.itLogo}>
            <img src={LOGO.src} srcSet={LOGO.srcSet} sizes="60px" alt="" />
          </span>
          <span className={s.brandText}>
            <strong>{SITE.nameUpper}</strong>
            <small>{SITE.college}</small>
          </span>
        </Link>

        <Link className={s.loginButton} to="/admin/login">
          Login <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </header>

      <main className={s.main}>
        <section className={s.intro} aria-labelledby="overview-title">
          <span className={s.eyebrow}>IT STUDENT&apos;S ASSOCIATION · KITSW</span>
          <h1 id="overview-title">Registration <em>overview.</em></h1>
          <p>Workshop and current event registration counts.</p>
        </section>

        <section className={s.workshopCard} aria-labelledby="workshop-count-title" aria-live="polite">
          <div className={s.cardIcon}><Users aria-hidden="true" /></div>
          <div>
            <span className={s.cardEyebrow}>CURRENT WORKSHOP</span>
            <h2 id="workshop-count-title">No. of workshop registrations till now</h2>
            <strong className={s.workshopCount}>{counts.llm ?? 0}</strong>
          </div>
        </section>

        <section className={s.eventsSection} aria-labelledby="events-title">
          <div className={s.sectionHeading}>
            <div>
              <span className={s.cardEyebrow}>CURRENTLY OPEN</span>
              <h2 id="events-title">Events</h2>
            </div>
            <CalendarDays aria-hidden="true" />
          </div>

          <div className={s.eventGrid}>
            {OPEN_EVENTS.map((event) => (
              <article className={s.eventCard} key={event.id} aria-live="polite">
                <span>{event.category}</span>
                <h3>{event.title}</h3>
                <p>No. of registrations</p>
                <strong>{counts[event.id] ?? 0}</strong>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
