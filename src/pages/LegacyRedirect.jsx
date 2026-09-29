import { Navigate, useLocation, useParams } from 'react-router'

// Old static-site entry points → React routes. Query strings and hashes are
// preserved, so links like register.html?event=llm&from=events keep working.
const LEGACY_PAGES = {
  'index.html': '/',
  'about.html': '/about',
  'association.html': '/association',
  'contact.html': '/contact',
  'events.html': '/events',
  'gallery.html': '/gallery',
  'register.html': '/register',
  'workshop.html': '/workshops',
  'sumshodini.html': '/sumshodhini',
  'samshodini.html': '/sumshodhini',
  'samshodhini.html': '/sumshodhini',
  'sumshodhini.html': '/sumshodhini',
  'admin-login.html': '/admin/login',
  'admin-dashboard.html': '/admin',
}

export default function LegacyRedirect({ to }) {
  const { file } = useParams()
  const { search, hash } = useLocation()
  const target = to ?? LEGACY_PAGES[file?.toLowerCase()] ?? '/'

  return <Navigate to={{ pathname: target, search, hash }} replace />
}
