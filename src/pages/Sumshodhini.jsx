import { Link } from 'react-router'
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Boxes,
  Code,
  Compass,
  Laptop,
  Lightbulb,
  Share2,
  Trophy,
  Users,
  WandSparkles,
} from 'lucide-react'
import MobileOrbitCard from '../components/sumshodhini/MobileOrbitCard'
import { SITE } from '../data/site'
import ImageWithFallback from '../components/ui/ImageWithFallback'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cx } from '../utils/cx'
import s from './Sumshodhini.module.css'

const ORBIT_WORDS = [
  { word: 'LEARN', icon: BookOpen },
  { word: 'CREATE', icon: WandSparkles },
  { word: 'EXPLORE', icon: Compass },
  { word: 'BUILD', icon: Boxes },
  { word: 'SHARE', icon: Share2 },
]

const DAYS = [
  {
    id: 'day1',
    label: 'DAY-1',
    title: 'WORKSHOP',
    heading: 'Workshop',
    to: '/workshops',
    text: 'Learn, experiment and build through practical technical workshops designed to turn curiosity into useful skills.',
    icon: Laptop,
  },
  {
    id: 'day2',
    label: 'DAY-2',
    title: 'EVENTS',
    heading: 'Events',
    to: '/events',
    text: 'Take part in competitions, activities and experiences that bring technology, creativity and collaboration together.',
    icon: Trophy,
  },
]

const FEATURES = [
  {
    tone: s.featureDark,
    icon: Lightbulb,
    tag: 'IDEATION',
    title: 'Start with a question.',
    text: 'Explore problems, identify possibilities and transform curiosity into an idea worth pursuing.',
  },
  {
    tone: s.featureRed,
    icon: Code,
    tag: 'INNOVATION',
    title: 'Build something meaningful.',
    text: 'Turn ideas into practical solutions through technology, experimentation and creativity.',
  },
  {
    tone: s.featureLight,
    icon: Users,
    tag: 'COLLABORATION',
    title: 'Learn together.',
    text: 'Meet people with different perspectives and create better ideas through collaboration.',
  },
  {
    tone: s.featureOutline,
    icon: Trophy,
    tag: 'CHALLENGE',
    title: 'Put ideas to the test.',
    text: 'Participate in challenges that encourage creativity, technical thinking and confidence.',
  },
]

const FLOW = [
  {
    tag: 'DISCOVER',
    title: 'Find your direction.',
    text: 'Discover themes, technologies and problems that spark your interest.',
  },
  {
    tag: 'EXPLORE',
    title: 'Go deeper.',
    text: 'Research, experiment and develop your understanding through practical exploration.',
  },
  {
    tag: 'CREATE',
    title: 'Turn thought into action.',
    text: 'Build your solution and bring your concept to life.',
  },
  {
    tag: 'SHARE',
    title: 'Put your work out there.',
    text: 'Present your work, exchange ideas and learn from the people around you.',
  },
]

export default function Sumshodhini() {
  useDocumentTitle(`${SITE.fest} ${SITE.year}`, { raw: true })

  return (
    <div className={s.page}>
      {/* HERO */}
      <section className={s.samHero} aria-labelledby="sam-title">
        <div className={s.samHeroInner}>
          <div className={s.samTitleArea}>
            <div className={s.samTitleReveal}>
              <div className={s.samTitleTopLine} aria-hidden="true">
                <span />
                <small>{SITE.college}</small>
                <span />
              </div>
              <h1 id="sam-title">
                <span className={s.samTitleMain}>{SITE.festUpper}</span>
                <span className={s.samTitleAccent}>’26</span>
              </h1>
              <div className={s.samTitleBottom} aria-hidden="true">
                <span className={s.samTitleRule} />
                <span>{SITE.year}</span>
                <span className={s.samTitleRule} />
              </div>
            </div>
          </div>

          <div className={s.samHeroContent}>
            <nav className={s.samDayArea} aria-label="Event schedule">
              <div className={s.samDayHeading}>
                <span>EVENT SCHEDULE</span>
                <div aria-hidden="true" />
              </div>
              {DAYS.map((day) => (
                <Link key={day.id} to={day.to} className={s.samDayItem}>
                  <div className={s.samDayText}>
                    <span className={s.samDayLabel}>{day.label}</span>
                    <strong>{day.title}</strong>
                  </div>
                  <ArrowRight className={s.samDayArrow} aria-hidden="true" />
                </Link>
              ))}
            </nav>

            <div className={s.samSolarSystem} aria-hidden="true">
              <div className={cx(s.samOrbit, s.samOrbitOne)} />
              <div className={cx(s.samOrbit, s.samOrbitTwo)} />
              <div className={cx(s.samOrbit, s.samOrbitThree)} />

              <div className={s.samCardOrbit}>
                {ORBIT_WORDS.map(({ word, icon: Icon }, index) => (
                  <div key={word} className={cx(s.samOrbitCard, s[`samCard${index + 1}`])}>
                    <span className={s.samCardIcon}>
                      <Icon size="1em" />
                    </span>
                    <span className={s.samCardWord}>{word}</span>
                  </div>
                ))}
              </div>

              <div className={s.samFloatingCircle}>
                <div className={s.samCircleGlow} />
                <div className={s.samCircleInner}>
                  <ImageWithFallback
                    imageKey="sumshodhini/sumshodhini-logo-512"
                    alt={`${SITE.festUpper} ${SITE.year} logo`}
                    className={s.samCircleLogo}
                    loading="eager"
                  />
                </div>
              </div>

            </div>

            <MobileOrbitCard />
          </div>

          <div className={s.samScrollIndicator} aria-hidden="true">
            SCROLL TO EXPLORE
            <ArrowDown size="1em" />
          </div>
        </div>
      </section>

      {/* DAY DETAILS */}
      <div className={s.samDetails}>
        {DAYS.map((day) => {
          const Icon = day.icon
          return (
            <section key={day.id} id={day.id} className={s.samDetailSection} aria-labelledby={`${day.id}-title`}>
              <div className={s.samDetailContent}>
                <span className={s.samDetailLabel}>{day.label}</span>
                <h2 id={`${day.id}-title`}>{day.heading}</h2>
                <p>{day.text}</p>
              </div>
              <div className={s.samDetailIcon} aria-hidden="true">
                <Icon size="1em" />
              </div>
            </section>
          )
        })}
      </div>

      {/* ABOUT */}
      <section className={s.samIntro} id="about" aria-labelledby="sam-about-title">
        <div className={s.samIntroGrid}>
          <div className={s.samSectionLabel}>
            ABOUT THE EVENT
          </div>
          <div className={s.samIntroContent}>
            <h2 id="sam-about-title">
              Where <strong>ideas</strong> become possibilities.
            </h2>
            <p>
              {SITE.fest} is the flagship technical event of the IT Department, designed to give
              students a space to question, experiment, collaborate and present ideas beyond the
              classroom.
            </p>
            <p>
              From emerging technologies and technical challenges to creative problem solving,{' '}
              {SITE.fest} brings together different ways of thinking under one roof.
            </p>
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className={s.samExperience} aria-labelledby="sam-experience-title">
        <div className={s.samSectionHeading}>
          <div>
            <span>THE EXPERIENCE</span>
            <h2 id="sam-experience-title">
              Think. <strong>Make.</strong> Share.
            </h2>
          </div>
          <p>Every part of {SITE.fest} is designed to turn participation into an experience.</p>
        </div>

        <div className={s.samFeatureGrid}>
          {FEATURES.map(({ tone, icon: Icon, tag, title, text }) => (
            <article key={tag} className={cx(s.samFeature, tone)}>
              <div className={s.featureIcon} aria-hidden="true">
                <Icon size="1em" />
              </div>
              <span>{tag}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* EVENT FLOW */}
      <section className={s.samFlow} aria-labelledby="sam-flow-title">
        <div className={s.samFlowHeading}>
          <span>EVENT FLOW</span>
          <h2 id="sam-flow-title">
            From curiosity <strong>to creation.</strong>
          </h2>
        </div>

        <ol className={s.samTimeline}>
          {FLOW.map((step, index) => (
            <li key={step.tag} className={s.samTimelineItem}>
              <div className={s.timelineDot} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className={s.timelineContent}>
                <span>{step.tag}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className={s.samCta} aria-labelledby="sam-cta-title">
        <div className={s.samCtaInner}>
          <span className={s.samCtaLabel}>READY TO EXPLORE?</span>
          <h2 id="sam-cta-title" className={s.samCtaTitle}>
            <span className={s.ctaDarkText}>Your next idea</span>
            <strong className={s.ctaAccentText}>starts here.</strong>
          </h2>
          <p className={s.samCtaDescription}>
            Step into {SITE.fest} and become part of a community that believes in questioning,
            creating and discovering.
          </p>
          <div className={s.samCtaButtons}>
            <Link to="/workshops" className={s.samCtaBtn}>
              <span>EXPLORE DAY 1</span>
              <ArrowRight size="1em" aria-hidden="true" />
            </Link>
            <Link to="/events" className={s.samCtaBtn}>
              <span>EXPLORE DAY 2</span>
              <ArrowRight size="1em" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}


