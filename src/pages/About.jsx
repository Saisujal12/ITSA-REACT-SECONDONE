import { useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import {
  ArrowDown,
  ArrowUpRight,
  CodeXml,
  Lightbulb,
  Presentation,
  Trophy,
  Users,
  UsersRound,
} from 'lucide-react'
import AboutTeam from '../components/team/AboutTeam'
import { LOGO, SITE } from '../data/site'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cx } from '../utils/cx'
import s from './About.module.css'

const MINI_STATS = [
  { title: 'LEARN', text: 'Beyond classrooms' },
  { title: 'BUILD', text: 'Real experiences' },
  { title: 'CONNECT', text: 'As one community' },
]

const FLOAT_CARDS = [
  { className: s.floatCode, icon: CodeXml, title: 'CODE', text: 'CREATE' },
  { className: s.floatCommunity, icon: Users, title: 'CONNECT', text: 'GROW' },
  { className: s.floatInnovation, icon: Lightbulb, title: 'INNOVATE', text: 'EXPLORE' },
]

const WHAT_WE_DO = [
  {
    icon: Presentation,
    tag: 'LEARNING',
    title: 'Workshops',
    text: 'Practical sessions focused on modern technologies, tools and real-world applications.',
  },
  {
    icon: Trophy,
    tag: 'CHALLENGE',
    title: 'Competitions',
    text: 'Technical and creative challenges that encourage students to test their skills.',
  },
  {
    icon: Lightbulb,
    tag: 'IDEAS',
    title: 'Innovation',
    text: 'A space where students can turn ideas into prototypes, projects and useful solutions.',
  },
  {
    icon: UsersRound,
    tag: 'COMMUNITY',
    title: 'Collaboration',
    text: 'Connecting students through teamwork, communication and shared learning.',
  },
]

export default function About() {
  useDocumentTitle('About IT Association')
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const id = decodeURIComponent(location.hash.slice(1))
    const target = document.getElementById(id)
    if (!target) return
    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [location.hash])

  return (
    <div className={s.page}>
      <section className={s.aboutHero} aria-labelledby="about-title">
        <div className={s.aboutHeroGrid}>
          <div className={s.aboutHeroContent}>
            <div className={s.aboutKicker}>
              <span className={s.kickerLine} aria-hidden="true" />
              IT Student&apos;s Association · {SITE.college}
            </div>

            <h1 id="about-title">
              ABOUT <span>US.</span>
            </h1>

            <p className={s.aboutHeroDescription}>
              A student-driven technology community where curiosity becomes knowledge, ideas become
              projects and students grow together.
            </p>

            <div className={s.aboutHeroActions}>
              <Link to={{ hash: '#about' }} className={s.aboutPrimaryBtn}>
                Explore Association
                <ArrowDown aria-hidden="true" />
              </Link>

              <Link to="/register" className={s.aboutSecondaryBtn}>
                Join Us
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>

            <div className={s.aboutMiniStats}>
              {MINI_STATS.map((stat, index) => (
                <div key={stat.title} className={s.aboutMiniStatGroup}>
                  {index > 0 && <div className={s.aboutMiniDivider} aria-hidden="true" />}
                  <div className={s.aboutMiniStat}>
                    <strong>{stat.title}</strong>
                    <span>{stat.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={s.aboutHeroVisual} aria-hidden="true">
            <div className={s.visualBackNumber}>IT</div>
            <div className={cx(s.visualOrbit, s.orbitOuter)} />
            <div className={cx(s.visualOrbit, s.orbitMiddle)} />
            <div className={cx(s.visualOrbit, s.orbitInner)} />

            <div className={s.visualCore}>
              <div className={s.coreInner}>
                <img className={s.aboutCoreLogo} src={LOGO.large} width="132" height="137" alt="" />
              </div>
            </div>

            {FLOAT_CARDS.map(({ className, icon: Icon, title, text }) => (
              <div key={title} className={cx(s.aboutFloatCard, className)}>
                <div className={s.floatIcon}>
                  <Icon />
                </div>
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </div>
            ))}

            <div className={s.visualCaption}>
              EST. <strong>{SITE.college}</strong> IT DEPARTMENT
            </div>
          </div>
        </div>
      </section>

      <section className={s.aboutIntro} id="about" aria-labelledby="about-intro-title">
        <div className={s.aboutSectionLabel} data-reveal="">
          <strong>WHO WE ARE</strong>
        </div>
        <div className={s.aboutIntroContent}>
          <div className={s.aboutIntroHeading} data-reveal="">
            <h2 id="about-intro-title">
              More than an <span>association.</span>
            </h2>
          </div>
          <div className={s.aboutIntroCopy} data-reveal="">
            <p>
              The IT Department is a student-driven platform that connects students, faculty and
              technology enthusiasts through technical activities, workshops, competitions and
              events.
            </p>
            <p>
              We believe that some of the best learning happens when students move beyond theory
              and start experimenting, building and collaborating.
            </p>
            <p>
              Our community creates opportunities to discover emerging technologies, develop
              practical skills and transform ideas into meaningful experiences.
            </p>
            <div className={s.introHighlight}>
              <span>OUR APPROACH</span>
              <strong>Learn. Build. Collaborate.</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={s.whatWeDo} aria-labelledby="what-title">
        <div className={s.whatHeading} data-reveal="">
          <div>
            <span>WHAT WE DO</span>
            <h2 id="what-title">
              Creating <strong>experiences.</strong>
            </h2>
          </div>
          <p>
            From workshops to competitions, every initiative is designed to give students a place to
            learn, experiment and participate.
          </p>
        </div>
        <div className={s.featureGrid}>
          {WHAT_WE_DO.map(({ icon: Icon, tag, title, text }) => (
            <article key={title} className={s.featureCard} data-reveal="">
              <div className={s.featureIcon} aria-hidden="true">
                <Icon />
              </div>
              <span>{tag}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <div className={s.featureArrow} aria-hidden="true">→</div>
            </article>
          ))}
        </div>
      </section>

      <section className={s.aboutHighlights} aria-labelledby="about-highlights-title">
        <div className={s.aboutHighlightsHeading}>
          <span>ASSOCIATION HIGHLIGHTS</span>
          <h2 id="about-highlights-title">
            Recent moments, <strong>kept together.</strong>
          </h2>
        </div>
        <div className={s.aboutHighlightsGrid}>
          <article id="guest-lecture" className={s.aboutHighlightCard} tabIndex={-1}>
            <span>GUEST LECTURE</span>
            <h3>Exploring AI Applications Across Industries</h3>
            <p>
              A guest lecture introduced students to practical applications, possibilities and
              impact of Artificial Intelligence across industries.
            </p>
          </article>
          <article id="teachers-day" className={s.aboutHighlightCard} tabIndex={-1}>
            <span>ASSOCIATION ACTIVITY</span>
            <h3>Teachers&apos; Day</h3>
            <p>
              The IT Department celebrated Teachers&apos; Day with a special activity focused on
              appreciation, interaction and community.
            </p>
          </article>
          <article id="inaugural" className={s.aboutHighlightCard} tabIndex={-1}>
            <span>ASSOCIATION</span>
            <h3>IT Department 2026 Inaugural</h3>
            <p>
              A new academic year of learning, collaboration, innovation and student activities
              began with the IT Department.
            </p>
          </article>
          <article id="workshops" className={s.aboutHighlightCard} tabIndex={-1}>
            <span>LEARNING</span>
            <h3>Workshops</h3>
            <p>
              Practical sessions focused on modern technologies, tools and real-world applications
              give students opportunities to learn by doing.
            </p>
          </article>
        </div>
      </section>

      <section className={s.teamSection} aria-labelledby="team-title">
        <div className={cx(s.teamHeading, s.associationBodyHeading)} data-reveal="">
          <div>
            <span>ITSA · KITSW</span>
            <h2 id="team-title">
              IT STUDENT&apos;S ASSOCIATION <strong>BODY</strong>
            </h2>
          </div>
          <p>
            Faculty and student leaders working together to guide, coordinate and grow the IT
            Department.
          </p>
        </div>
        <AboutTeam />
      </section>

      <section className={s.aboutFinalCta} aria-labelledby="about-cta-title" data-reveal="">
        <div className={s.ctaContent}>
          <span>CONTACT US</span>
          <h2 id="about-cta-title">Join us</h2>
          <p>
            Anyone who wants to join the association body, contact this number: <strong>8179752006</strong>.
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfktAAXKne4FtAmSGr65tBBjhlpB-uJBXLxhhpBsUcwnoNRfg/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className={s.ctaButton}
          >
            Join the Association
            <ArrowUpRight aria-hidden="true" />
          </a>
          <small className={s.ctaNote}>
            You will be involved in the body activities from your second year.
          </small>
        </div>
        <div className={s.ctaMark} aria-hidden="true">
          <span>IT</span>
          <small>{SITE.college}</small>
        </div>
      </section>
    </div>
  )
}
