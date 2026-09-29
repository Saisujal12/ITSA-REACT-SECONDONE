import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ArrowLeft, ArrowRight, LoaderCircle, Lock, ShieldHalf, User } from 'lucide-react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { loginAdmin } from '../../services/admin'
import { cx } from '../../utils/cx'
import s from './Admin.module.css'

export default function AdminLogin() {
  useDocumentTitle('Admin Login | IT Association', { raw: true })
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(
    searchParams.get('expired') ? { tone: 'error', text: 'Your admin session has expired. Please login again.' } : null,
  )

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting) return

    if (!username.trim() || !password) {
      setStatus({ tone: 'error', text: 'Please enter username and password.' })
      return
    }

    setSubmitting(true)
    setStatus(null)
    try {
      await loginAdmin(username.trim(), password)
      setStatus({ tone: 'success', text: 'Login successful. Redirecting...' })
      navigate('/admin', { replace: true })
    } catch (error) {
      setStatus({
        tone: 'error',
        text: error.status === 401 ? 'Invalid username or password.' : error.message || 'Unable to login. Please try again.',
      })
      setSubmitting(false)
    }
  }

  return (
    <div className={s.loginPage}>
      <div className={s.loginCard}>
        <div className={s.loginIcon} aria-hidden="true">
          <ShieldHalf />
        </div>
        <h1>
          IT <span>ASSOCIATION</span>
        </h1>
        <p className={s.loginTitle}>ADMIN PANEL</p>
        <p className={s.loginDescription}>Login to manage registrations and payment verification.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={s.field}>
            <label htmlFor="admin-username">Username</label>
            <div className={s.fieldInput}>
              <User aria-hidden="true" />
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                placeholder="Enter admin username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>
          </div>
          <div className={s.field}>
            <label htmlFor="admin-password">Password</label>
            <div className={s.fieldInput}>
              <Lock aria-hidden="true" />
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter admin password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </div>

          <div aria-live="polite">
            {status && (
              <p className={cx(s.loginStatus, status.tone === 'success' && s.loginStatusSuccess)} role={status.tone === 'error' ? 'alert' : 'status'}>
                {status.text}
              </p>
            )}
          </div>

          <button type="submit" className={cx(s.button, s.loginButton)} disabled={submitting}>
            {submitting ? 'Logging in…' : 'Login'}
            {submitting ? <LoaderCircle className={s.spin} aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          </button>
        </form>

        <Link to="/" className={s.backHome}>
          <ArrowLeft size={14} aria-hidden="true" />
          Back to Website
        </Link>
      </div>
    </div>
  )
}
