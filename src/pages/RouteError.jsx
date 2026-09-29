import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import NotFound from './NotFound'
import s from './NotFound.module.css'

// Rendered inside the site layout when a route fails to load or render.
export default function RouteError() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />

  return (
    <section className={s.page} role="alert">
      <div className={s.inner}>
        <p className="section-label">SOMETHING WENT WRONG</p>
        <h1>
          This page <span>couldn’t load.</span>
        </h1>
        <p className={s.text}>
          Please check your connection and try again. If the problem continues, return to the home
          page.
        </p>
        <div className={s.actions}>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Try again
          </button>
          <Link to="/" className="btn btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  )
}
