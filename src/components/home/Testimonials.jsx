import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Quote, UserRound } from 'lucide-react'
import s from './Testimonials.module.css'

// Draft testimonials and four sample student identities requested by the site owner.
const TESTIMONIALS = [
  {
    name: 'N. Narla Yeshwanth Reddy',
    message:
      'Being part of the IT Department has helped me explore technology beyond the classroom. Every activity has encouraged me to learn by doing and keep building with confidence.',
  },
  {
    name: 'S. Harika',
    message:
      'The workshops gave me a welcoming place to try new tools, ask questions and learn alongside other students. I have gained skills that I can use in real projects.',
  },
  {
    name: 'P. Aditya Varma',
    message:
      'Taking part in department events helped me think creatively and work better as part of a team. Each experience motivates me to take on a new challenge.',
  },
  {
    name: 'M. Sai Teja',
    message:
      'I enjoy how the IT Department connects classroom concepts with practical experiences. The activities have helped me become more curious, capable and confident.',
  },
  {
    name: 'K. Kavya Sri',
    message:
      'The department community makes learning technology exciting. I have met supportive peers, explored new ideas and found more confidence in sharing my own work.',
  },
]

export default function Testimonials() {
  const trackRef = useRef(null)

  const move = (direction) => {
    const track = trackRef.current
    const card = track?.querySelector('[data-testimonial-card]')
    if (!track || !card) return

    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0
    track.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: 'smooth',
    })
  }

  return (
    <section className={`section ${s.testimonials}`} aria-labelledby="home-testimonials-title">
      <div className="container">
        <div className={s.heading}>
          <div>
            <p className="section-label">STUDENT VOICES</p>
            <h2 id="home-testimonials-title">
              What our students <span className="text-primary">say.</span>
            </h2>
          </div>
          <div className={s.controls}>
            <button type="button" onClick={() => move(-1)} aria-label="Show previous testimonials">
              <ChevronLeft aria-hidden="true" />
            </button>
            <button type="button" onClick={() => move(1)} aria-label="Show more testimonials">
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className={s.track}
          role="region"
          aria-label="Student testimonials. Use the arrow buttons to browse."
          tabIndex="0"
        >
          {TESTIMONIALS.map((testimonial) => (
            <article className={s.card} data-testimonial-card key={testimonial.name}>
              <div className={s.cardTop}>
                <div className={s.person}>
                  <h3>{testimonial.name}</h3>
                  <span>Student · IT Department</span>
                </div>
                <div className={s.photoPlaceholder} aria-hidden="true">
                  <UserRound />
                </div>
              </div>
              <Quote className={s.quoteIcon} aria-hidden="true" />
              <p>{testimonial.message}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
