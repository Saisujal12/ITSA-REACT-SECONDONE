import { Link } from 'react-router'
import { UserRound } from 'lucide-react'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import { SITE } from '../data/site'
import { ASSOCIATION_CORE_BODY, ASSOCIATION_FACULTY, getPerson } from '../data/team'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cx } from '../utils/cx'
import s from './Association.module.css'

const INTERACTION_POINTS = [
  'Senior–junior interaction',
  'Knowledge sharing',
  'Technical activities',
  'Leadership opportunities',
]

const photoFallback = (
  <div className={s.photoFallback} aria-hidden="true">
    <UserRound />
    PHOTO
  </div>
)

function FacultyCard({ member }) {
  const person = getPerson(member.person)
  return (
    <article className={s.facultyCard}>
      <div className={s.personImage}>
        <ImageWithFallback imageKey={person.photo} alt={person.name ?? member.alt} sizes="(max-width: 650px) 100vw, 33vw" fallback={photoFallback} />
      </div>
      <div className={s.personInfo}>
        <span className={s.personRole}>{member.role}</span>
        <h3 data-placeholder={person.name ? undefined : ''}>{person.name ?? person.placeholderName}</h3>
      </div>
    </article>
  )
}

function StudentCard({ member }) {
  const person = getPerson(member.person)
  return (
    <article className={cx(s.studentCard, member.featured && s.featuredCard)}>
      <div className={s.studentPhoto}>
        <ImageWithFallback imageKey={person.photo} alt={person.name ?? member.alt} sizes="(max-width: 650px) 100vw, 50vw" fallback={photoFallback} />
      </div>
      <div className={s.namePaper}>
        <ImageWithFallback
          imageKey={person.nameImage}
          alt={person.name ?? `${member.alt} name`}
          fallback={person.name ? <span className={s.nameText}>{person.name}</span> : null}
        />
      </div>
      <h3 className={s.studentRole}>{member.role}</h3>
    </article>
  )
}

export default function Association() {
  useDocumentTitle('Association Body')

  return (
    <div className={s.page}>
      <section className={s.associationHero} aria-labelledby="association-title">
        <div className={s.associationHeroContent}>
          <p className={s.sectionLabel}>{SITE.nameUpper}</p>
          <h1 id="association-title">
            ASSOCIATION
            <br />
            <span>BODY.</span>
          </h1>
          <p className={s.heroDescription}>
            A student-led structure that brings together faculty guidance, student leadership,
            senior-junior interaction, and technical activities throughout the academic year.
          </p>
        </div>
      </section>

      <section className={s.facultySection} aria-labelledby="faculty-title">
        <div className={s.sectionHeading}>
          <p className={s.sectionLabel}>FACULTY LEADERSHIP</p>
          <h2 id="faculty-title">Guided by experience.</h2>
          <p>
            The IT Association works under the guidance of the department leadership and faculty
            coordinators.
          </p>
        </div>
        <div className={s.facultyGrid}>
          {ASSOCIATION_FACULTY.map((member) => (
            <FacultyCard key={member.person} member={member} />
          ))}
        </div>
      </section>

      <section className={s.studentBodySection} aria-labelledby="core-title">
        <div className={s.sectionHeading}>
          <p className={s.sectionLabel}>FOURTH YEAR</p>
          <h2 id="core-title">Core Association Body.</h2>
          <p>The fourth-year students form the main student leadership body of the IT Association.</p>
        </div>
        <div className={s.leadershipGrid}>
          {ASSOCIATION_CORE_BODY.map((member) => (
            <StudentCard key={member.person} member={member} />
          ))}
        </div>
      </section>

      <section className={s.yearSection} aria-labelledby="third-year-title">
        <div className={s.yearNumber} aria-hidden="true">
          03
        </div>
        <div className={s.yearContent}>
          <p className={s.sectionLabel}>THIRD YEAR</p>
          <h2 id="third-year-title">Joint Secretaries.</h2>
          <p>
            All third-year IT students are part of the Association as Joint Secretaries, supporting
            activities, events, workshops, and student coordination.
          </p>
        </div>
      </section>

      <section className={cx(s.yearSection, s.secondYear)} aria-labelledby="second-year-title">
        <div className={s.yearNumber} aria-hidden="true">
          02
        </div>
        <div className={s.yearContent}>
          <p className={s.sectionLabel}>SECOND YEAR</p>
          <h2 id="second-year-title">Executive Members.</h2>
          <p>
            All second-year IT students form the Executive Members, creating an opportunity to
            participate, learn from seniors, and take responsibility in Association activities.
          </p>
        </div>
      </section>

      <section className={s.interactionSection} aria-labelledby="interaction-title">
        <div className={s.interactionContent}>
          <p className={s.sectionLabel}>SENIOR × JUNIOR</p>
          <h2 id="interaction-title">Learn from each other.</h2>
          <p>
            The Association creates a platform where juniors can interact with seniors, ask
            questions, share ideas, understand opportunities, and learn from their experiences.
          </p>
          <ol className={s.interactionPoints}>
            {INTERACTION_POINTS.map((point, index) => (
              <li key={point}>
                <strong aria-hidden="true">{String(index + 1).padStart(2, '0')}</strong>
                <span>{point}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={s.samshodiniSection} aria-labelledby="association-fest-title">
        <div className={s.sectionHeading}>
          <p className={s.sectionLabel}>ANNUAL IT EVENT</p>
          <h2 id="association-fest-title">{SITE.fest}.</h2>
          <p>
            The Association&apos;s major annual activity is conducted across two days, bringing
            together workshops and events.
          </p>
        </div>
        <div className={s.samshodiniGrid}>
          <article className={s.samshodiniCard}>
            <div>
              <span className={s.dayNumber}>DAY 01</span>
              <h3>Workshops</h3>
              <p>
                Each branch conducts a workshop where students get practical exposure to a
                technical or industry-related topic.
              </p>
            </div>
            <div className={s.example}>
              <span>Previous example</span>
              <strong>HPTK Workshop</strong>
            </div>
          </article>
          <article className={s.samshodiniCard}>
            <div>
              <span className={s.dayNumber}>DAY 02</span>
              <h3>Events</h3>
              <p>
                The second day focuses on technical, creative, competitive, and fun events for
                students.
              </p>
            </div>
            <Link to="/events" className={s.samshodiniLink}>
              Explore Events →
            </Link>
          </article>
        </div>
      </section>

      <section className={s.associationClosing} aria-labelledby="association-closing-title">
        <p className={s.sectionLabel}>{SITE.nameUpper}</p>
        <h2 id="association-closing-title">
          Learn.
          <br />
          Build.
          <br />
          Grow.
        </h2>
        <p>A platform for students to participate, lead, connect, and create.</p>
      </section>
    </div>
  )
}
