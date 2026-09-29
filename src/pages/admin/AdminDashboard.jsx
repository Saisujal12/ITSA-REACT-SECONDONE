import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock,
  Eye,
  FolderOpen,
  LoaderCircle,
  LogOut,
  Microchip,
  RotateCw,
  UserCog,
  Users,
} from 'lucide-react'
import RegistrationDialog from '../../components/admin/RegistrationDialog'
import PageLoader from '../../components/ui/PageLoader'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { checkAdmin, fetchRegistrations, logoutAdmin, updateRegistrationStatus } from '../../services/admin'
import { cx } from '../../utils/cx'
import s from './Admin.module.css'

const BADGES = { PENDING: s.badgePending, VERIFIED: s.badgeVerified, REJECTED: s.badgeRejected }

const COLUMNS = ['Registration ID', 'Student', 'Roll No', 'Year', 'Branch', 'Workshop', 'Amount', 'Transaction ID', 'Status', 'Action']

export default function AdminDashboard() {
  useDocumentTitle('Admin Dashboard | IT Association', { raw: true })
  const navigate = useNavigate()

  const [authState, setAuthState] = useState('checking') // checking | ok
  const [registrations, setRegistrations] = useState([])
  const [loadState, setLoadState] = useState('loading') // loading | ready | error
  const [selected, setSelected] = useState(null)
  const [notice, setNotice] = useState(null)

  const toLogin = useCallback((expired) => navigate(expired ? '/admin/login?expired=1' : '/admin/login', { replace: true }), [navigate])

  const load = useCallback(
    async (signal) => {
      setLoadState('loading')
      try {
        const rows = await fetchRegistrations({ signal })
        setRegistrations(rows)
        setLoadState('ready')
      } catch (error) {
        if (error.name === 'AbortError') return
        if (error.status === 401) return toLogin(true)
        setLoadState('error')
      }
    },
    [toLogin],
  )

  useEffect(() => {
    const controller = new AbortController()

    checkAdmin({ signal: controller.signal })
      .then((data) => {
        if (!data.authenticated) return toLogin(false)
        setAuthState('ok')
        return load(controller.signal)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') toLogin(false)
      })

    return () => controller.abort()
  }, [load, toLogin])

  async function handleUpdateStatus(registration, status) {
    try {
      const result = await updateRegistrationStatus(registration.rowNumber, status)
      setSelected(null)
      setNotice({ tone: 'success', text: result.message || `Registration marked as ${status}.` })
      await load()
    } catch (error) {
      if (error.status === 401) return toLogin(true)
      throw error
    }
  }

  async function handleLogout() {
    try {
      await logoutAdmin()
    } catch {
      // The session may already be gone; return to login either way.
    }
    toLogin(false)
  }

  if (authState === 'checking') return <PageLoader label="Checking admin session" />

  const count = (status) => registrations.filter((row) => row.status === status).length
  const stats = [
    { label: 'Total Registrations', value: registrations.length, icon: Users },
    { label: 'Pending', value: count('PENDING'), icon: Clock, tone: s.statPending },
    { label: 'Verified', value: count('VERIFIED'), icon: CircleCheck, tone: s.statVerified },
    { label: 'Rejected', value: count('REJECTED'), icon: CircleX, tone: s.statRejected },
  ]

  return (
    <>
      <header className={s.navbar}>
        <div className={s.brand}>
          <Microchip size={18} aria-hidden="true" />
          IT <span>ASSOCIATION</span>
        </div>
        <div className={s.navRight}>
          <span className={s.adminLabel}>
            <UserCog size={14} aria-hidden="true" />
            ADMIN
          </span>
          <button type="button" className={s.button} onClick={handleLogout}>
            <LogOut aria-hidden="true" />
            Logout
          </button>
        </div>
      </header>

      <div className={s.dashboard}>
        <div className={s.heading}>
          <div>
            <p className={s.smallTitle}>IT ASSOCIATION</p>
            <h1>
              Registration <span>Dashboard</span>
            </h1>
            <p>Manage workshop registrations and payment verification.</p>
          </div>
          <button type="button" className={s.button} onClick={() => load()} disabled={loadState === 'loading'}>
            <RotateCw className={loadState === 'loading' ? s.spin : undefined} aria-hidden="true" />
            Refresh
          </button>
        </div>

        <dl className={s.statsGrid}>
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className={cx(s.statCard, tone)}>
              <div className={s.statIcon} aria-hidden="true">
                <Icon size={20} />
              </div>
              <div>
                <dt>{label}</dt>
                <dd>{loadState === 'ready' ? value : '—'}</dd>
              </div>
            </div>
          ))}
        </dl>

        {notice && (
          <p className={cx(s.notice, notice.tone === 'error' && s.noticeError)} role="status">
            {notice.text}
          </p>
        )}

        <section className={s.section} aria-labelledby="registrations-title" aria-busy={loadState === 'loading'}>
          <div className={s.sectionHeading}>
            <div>
              <h2 id="registrations-title">Registrations</h2>
              <p>Student registration records</p>
            </div>
            {loadState === 'loading' && (
              <span className={s.inlineStatus} role="status">
                <LoaderCircle size={14} className={s.spin} aria-hidden="true" />
                Loading...
              </span>
            )}
          </div>

          {loadState === 'error' ? (
            <div className={s.errorState} role="alert">
              <CircleAlert aria-hidden="true" />
              <p>Unable to load registrations.</p>
              <button type="button" className={s.button} onClick={() => load()}>
                Try again
              </button>
            </div>
          ) : loadState === 'ready' && registrations.length === 0 ? (
            <div className={s.empty}>
              <FolderOpen aria-hidden="true" />
              <p>No registrations found.</p>
            </div>
          ) : (
            <div className={s.tableContainer}>
              <table className={s.table}>
                <thead>
                  <tr>
                    {COLUMNS.map((column) => (
                      <th key={column} scope="col">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((row) => (
                    <tr key={row.rowNumber}>
                      <td className={s.mono}>{row.registrationId}</td>
                      <td>{row.name}</td>
                      <td>{row.rollNo}</td>
                      <td>{row.year}</td>
                      <td>{row.branch}</td>
                      <td>{row.workshop}</td>
                      <td>{row.amount ? `₹${row.amount}` : '—'}</td>
                      <td className={s.mono}>{row.transactionId}</td>
                      <td>
                        <span className={cx(s.badge, BADGES[row.status] ?? s.badgePending)}>{row.status}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={cx(s.button, s.viewButton)}
                          onClick={() => {
                            setNotice(null)
                            setSelected(row)
                          }}
                          aria-label={`View registration ${row.registrationId} for ${row.name}`}
                        >
                          <Eye aria-hidden="true" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selected && (
        <RegistrationDialog
          key={selected.rowNumber}
          registration={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </>
  )
}
