import { BookOpen, Hammer, Rocket, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import AssociationHighlights from '../components/home/AssociationHighlights'
import IdCard3D from '../components/home/IdCard3D'
import Testimonials from '../components/home/Testimonials'
import { LOGO, SITE } from '../data/site'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import s from './Home.module.css'

const STATS = [
  { value: 'IT', label: 'DEPARTMENT' },
  { value: String(SITE.year), label: 'LEARN · BUILD · GROW' },
  { value: '∞', label: 'POSSIBILITIES' },
]

const ABOUT_POINTS = [
  'Explore technologies and emerging ideas beyond the classroom.',
  'Build practical skills through projects and hands-on activities.',
  'Participate in technical workshops and student events.',
  'Develop communication, teamwork, creativity and leadership skills.',
]

const APPROACH = [
  {
    title: 'Learn',
    text: 'Discover technologies, concepts and ideas that extend learning beyond the regular classroom.',
    icon: BookOpen,
  },
  {
    title: 'Build',
    text: 'Apply knowledge through projects, practical activities and hands-on experiences.',
    icon: Hammer,
  },
  {
    title: 'Experience',
    text: `Take part in workshops, technical activities, competitions and ${SITE.fest} events.`,
    icon: Sparkles,
  },
  {
    title: 'Grow',
    text: 'Develop confidence, communication, teamwork and leadership through real experiences.',
    icon: Rocket,
  },
]

export default function Home() {
  useDocumentTitle('IT Department | KITSW', { raw: true })

  return (
    <>
      {/* HERO */}
      <section className={s.hero} aria-labelledby="home-title">
        <div className={s.heroContainer}>
          <div className={s.heroContent}>
            <h1 id="home-title">
              IT <span>Department.</span>
            </h1>

            <p className={s.heroDescription}>
              The IT Department represents the spirit of the Information Technology branch through
              learning, innovation, practical experiences and student activities.
              <br />
              <strong>Learn. Build. Grow.</strong>
            </p>

            <div className={s.heroButtons}>
              <Link to="/about" className="btn btn-primary">
                Explore IT Department <span aria-hidden="true">→</span>
              </Link>

              <Link to="/sumshodhini" className="btn btn-outline">
                Explore {SITE.fest}
              </Link>
            </div>

            <dl className={s.heroStats}>
              {STATS.map((stat, index) => (
                <div key={stat.label} className={s.heroStatGroup}>
                  {index > 0 && (
                    <span
                      className={s.heroStatDivider}
                      aria-hidden="true"
                    />
                  )}

                  <div className={s.heroStat}>
                    <dt className="visually-hidden">{stat.label}</dt>

                    <dd>
                      <strong
                        aria-hidden={
                          stat.value === '∞' || undefined
                        }
                      >
                        {stat.value}
                      </strong>

                      {stat.value === '∞' && (
                        <span className="visually-hidden">
                          Infinite
                        </span>
                      )}

                      <span aria-hidden="true">
                        {stat.label}
                      </span>
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <IdCard3D />
        </div>
      </section>

      {/* DEPARTMENT HIGHLIGHTS */}
      <AssociationHighlights />

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* ABOUT */}
      <section
        className="section"
        aria-labelledby="home-about-title"
      >
        <div className="container">
          <div className={s.aboutGrid}>
            <div className={s.brandPanel}>
              <div>
                <img
                  className={s.aboutLogoMark}
                  src={LOGO.large}
                  width="180"
                  height="187"
                  loading="lazy"
                  alt={LOGO.alt}
                />

                <div className={s.panelTitle}>
                  {SITE.nameUpper}
                </div>

              </div>
            </div>

            <div className={s.aboutContent}>
              <p className="section-label">
                ABOUT THE IT DEPARTMENT
              </p>

              <h2 id="home-about-title">
                A platform for{' '}
                <span className="text-primary">
                  future technologists.
                </span>
              </h2>

              <p>
                The IT Department is a student-driven platform
                of the Information Technology branch that brings
                together technical learning, practical
                experiences, workshops, events and creative
                ideas.
              </p>

              <p>
                Through every academic year, the Department
                provides opportunities for students to learn new
                technologies, build practical skills, participate
                in activities and experience technology beyond
                the classroom.
              </p>

              <ul className={s.aboutList}>
                {ABOUT_POINTS.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <div className={s.actions}>
                <Link
                  to="/about"
                  className="btn btn-primary"
                >
                  Discover IT Association{' '}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section
        className="section section-soft"
        aria-labelledby="home-approach-title"
      >
        <div className="container">
          <div className="section-heading">
            <p className="section-label">
              OUR APPROACH
            </p>

            <h2 id="home-approach-title">
              Learn.{' '}
              <span className="text-primary">
                Build.
              </span>{' '}
              Grow.
            </h2>

            <p>
              The IT Department is built around a simple idea:
              learn something new, turn that knowledge into
              something practical and grow through the
              experience.
            </p>
          </div>

          <div className={s.grid4}>
            {APPROACH.map((item) => {
              const Icon = item.icon

              return (
                <article
                  key={item.title}
                  className={`card ${s.featureCard}`}
                >
                  <div
                    className={s.featureIcon}
                    aria-hidden="true"
                  >
                    <Icon
                      size={25}
                      strokeWidth={2.1}
                    />
                  </div>

                  <h3>{item.title}</h3>

                  <p>{item.text}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* SUMSHODHINI */}
      <section
        className="section"
        aria-labelledby="home-fest-title"
      >
        <div className="container">
          <div className={s.aboutGrid}>
            <div className={s.brandPanel}>
              <div>
                <div className={s.festLogoCircle}>
                  <ImageWithFallback
                    imageKey="sumshodhini/sumshodhini-logo-512"
                    alt={`${SITE.festUpper} ${SITE.year} logo`}
                    className={s.festLogoMark}
                    loading="lazy"
                  />
                </div>
                <div className={s.panelTitle}>
                  {SITE.festUpper}
                </div>

                <div className={s.panelSubtitle}>
                  WORKSHOPS · EVENTS
                </div>
              </div>
            </div>

            <div className={s.aboutContent}>
              <p className="section-label">
                ANNUAL IT BRANCH EVENT
              </p>

              <h2 id="home-fest-title">
                Experience{' '}
                <span className="text-primary">
                  {SITE.fest}.
                </span>
              </h2>

              <p>
                {SITE.fest} is the annual event of the IT
                branch, bringing together technical workshops and
                engaging student events in a two-day
                technology-focused experience.
              </p>

              <ul className={s.aboutList}>
                <li>
                  <span>
                    <strong>
                      Day 01 — Workshops
                    </strong>
                    <br />
                    Learn through practical,
                    technology-focused workshops.
                  </span>
                </li>

                <li>
                  <span>
                    <strong>
                      Day 02 — Events
                    </strong>
                    <br />
                    Participate in different technical
                    and engaging events.
                  </span>
                </li>

                <li>
                  Explore new ideas and technologies through
                  hands-on experiences.
                </li>

                <li>
                  Take part in activities designed to develop
                  technical and creative skills.
                </li>
              </ul>

              <div className={s.actions}>
                <Link
                  to="/sumshodhini"
                  className="btn btn-primary"
                >
                  Explore {SITE.fest}{' '}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section
        className="section"
        aria-labelledby="home-cta-title"
      >
        <div className="container">
          <div className={s.cta}>
            <p className={s.ctaKicker}>
              LEARN · BUILD · GROW
            </p>

            <h2 id="home-cta-title">
              Learn today. Build tomorrow. Grow through
              experience.
            </h2>

            <p>
              Discover the IT Department, explore{' '}
              {SITE.fest} and take part in the workshops and
              events created for the Information Technology
              branch.
            </p>

            <div className={s.actions}>
              <Link
                to="/sumshodhini"
                className="btn btn-light"
              >
                Explore {SITE.fest}{' '}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
