import { Outlet, ScrollRestoration } from 'react-router'
import s from '../../pages/admin/Admin.module.css'

export default function AdminLayout() {
  return (
    <div className={s.admin}>
      <meta name="robots" content="noindex, nofollow" />
      <main id="main">
        <Outlet />
      </main>
      <ScrollRestoration />
    </div>
  )
}
