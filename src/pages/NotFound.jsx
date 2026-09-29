import { Link } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import s from './NotFound.module.css'

export default function NotFound() {
  useDocumentTitle('Page Not Found')

  return (
    <section className={s.page}>
      <div className={s.inner}>
        <span className={s.code} aria-hidden="true">
          404
        </span>
        <p className="section-label">PAGE NOT FOUND</p>
        <h1>
          This page <span>doesn’t exist.</span>
        </h1>
        <p className={s.text}>
          The link may be outdated, or the page may have moved during the website update.
        </p>
        <div className={s.actions}>
          <Link to="/" className="btn btn-primary">
            Back to Home <span aria-hidden="true">→</span>
          </Link>
          <Link to="/events" className="btn btn-outline">
            View Events
          </Link>
        </div>
      </div>
    </section>
  )
}
