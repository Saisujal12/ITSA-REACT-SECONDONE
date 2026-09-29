import s from './PageLoader.module.css'

export default function PageLoader({ label = 'Loading' }) {
  return (
    <div className={s.loader} role="status" aria-live="polite">
      <span className={s.mark} aria-hidden="true" />
      <span className={s.label}>{label}…</span>
    </div>
  )
}
