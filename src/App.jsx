import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import AdminLayout from './components/layout/AdminLayout'
import SiteLayout from './components/layout/SiteLayout'
import PageLoader from './components/ui/PageLoader'
import Home from './pages/Home'
import LegacyRedirect from './pages/LegacyRedirect'
import NotFound from './pages/NotFound'
import RouteError from './pages/RouteError'

// Route modules are code-split; the router waits for the chunk before navigating.
const page = (load) => async () => ({ Component: (await load()).default })

const router = createBrowserRouter([
  {
    path: 'admin',
    Component: AdminLayout,
    HydrateFallback: PageLoader,
    errorElement: <RouteError />,
    children: [
      { index: true, lazy: page(() => import('./pages/admin/AdminDashboard')) },
      { path: 'login', lazy: page(() => import('./pages/admin/AdminLogin')) },
    ],
  },
  {
    Component: SiteLayout,
    HydrateFallback: PageLoader,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { index: true, Component: Home },
          { path: 'sumshodhini', lazy: page(() => import('./pages/Sumshodhini')) },
          { path: 'events', lazy: page(() => import('./pages/Events')) },
          { path: 'workshops', lazy: page(() => import('./pages/Workshops')) },
          { path: 'register', lazy: page(() => import('./pages/Register')) },
          { path: 'about', lazy: page(() => import('./pages/About')) },
          { path: 'association', lazy: page(() => import('./pages/Association')) },
          { path: 'gallery', lazy: page(() => import('./pages/Gallery')) },
          { path: 'contact', lazy: page(() => import('./pages/Contact')) },

          // Legacy static-site URLs and spelling variants
          { path: 'index.html', element: <LegacyRedirect to="/" /> },
          { path: 'pages/:file', Component: LegacyRedirect },
          { path: 'samshodini', element: <LegacyRedirect to="/sumshodhini" /> },
          { path: 'sumshodini', element: <LegacyRedirect to="/sumshodhini" /> },
          { path: 'samshodhini', element: <LegacyRedirect to="/sumshodhini" /> },
          { path: 'workshop', element: <LegacyRedirect to="/workshops" /> },

          { path: '*', Component: NotFound },
        ],
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
