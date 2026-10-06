import {
  ArrowUpRight,
  CalendarDays,
} from 'lucide-react'
import { Link } from 'react-router'
import s from './LatestUpdates.module.css'

const UPDATES = [
  {
    date: '16 SEP 2026',
    category: 'GUEST LECTURE',
    title:
      'Exploring AI Applications Across Industries',
    text:
      'A guest lecture introduced students to practical applications, possibilities and impact of Artificial Intelligence across industries.',
    to: '/gallery',
  },
  {
    date: '05 SEP 2026',
    category: 'ASSOCIATION ACTIVITY',
    title: "Teachers' Day",
    text:
      'The IT Department celebrated Teachers’ Day with a special activity focused on appreciation, interaction and community.',
    to: '/gallery',
  },
  {
    date: '29 JUL 2026',
    category: 'ASSOCIATION',
    title:
      'IT Department 2026 Inaugural',
    text:
      'A new academic year of learning, collaboration, innovation and student activities began with the IT Department.',
    to: '/about',
  },
]

export default function LatestUpdates() {
  return (
    <section
      className="section section-soft"
      aria-labelledby="latest-updates-title"
    >
      <div className="container">
        <div className={s.header}>
          <div>
            <p className="section-label">
              LATEST UPDATES
            </p>

            <h2 id="latest-updates-title">
              What&apos;s happening at{' '}
              <span className="text-primary">
                IT DEPT.
              </span>
            </h2>
          </div>

          <p>
            Keep up with recent IT Department
            activities, learning sessions and
            student events.
          </p>
        </div>

        <div className={s.grid}>
          {UPDATES.map((update) => (
            <article
              key={
                update.date +
                update.title
              }
              className={`card ${s.card}`}
            >
              <div className={s.top}>
                <span className={s.date}>
                  <CalendarDays
                    size={14}
                    aria-hidden="true"
                  />

                  {update.date}
                </span>

                <span
                  className={s.category}
                >
                  {update.category}
                </span>
              </div>

              <h3>{update.title}</h3>

              <p>{update.text}</p>

              <Link
                to={update.to}
                className={s.link}
              >
                Explore update

                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
