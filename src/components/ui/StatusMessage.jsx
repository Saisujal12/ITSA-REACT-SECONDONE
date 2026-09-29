import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import { cx } from '../../utils/cx'
import s from './StatusMessage.module.css'

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info }

/**
 * Inline status/notice. `tone` is success | error | info.
 * Errors are announced assertively, everything else politely.
 */
export default function StatusMessage({ tone = 'info', title, children, className, id }) {
  const Icon = ICONS[tone]

  return (
    <div
      id={id}
      className={cx(s.message, s[tone], className)}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Icon className={s.icon} size={18} aria-hidden="true" />
      <div>
        {title && <strong className={s.title}>{title}</strong>}
        <div className={s.body}>{children}</div>
      </div>
    </div>
  )
}
