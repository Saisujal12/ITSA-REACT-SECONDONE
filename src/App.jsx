import { Navigate, createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import AdminLayout from './components/layout/AdminLayout'
import SiteLayout from './components/layout/SiteLayout'
import PageLoader from './components/ui/PageLoader'
import Home from './pages/Home'
import LegacyRedirect from './pages/LegacyRedirect'
import NotFound from './pages/NotFound'
import RouteError from './pages/RouteError'

const page = (load) => async () => ({
  Component: (await load()).default,
})

const router = createBrowserRouter([
  {
    path: 'admin',
    Component: AdminLayout,
    HydrateFallback: PageLoader,
    errorElement: <RouteError />,

    children: [
      /*
       * When the user opens:
       * http://localhost:5173/admin
       *
       * send them to the admin login page.
       */
      {
        index: true,
        element: <Navigate to="/admin/login" replace />,
      },

      /*
       * Admin login
       */
      {
        path: 'login',
        lazy: page(() =>
          import('./pages/admin/AdminLogin'),
        ),
      },

      /*
       * Admin dashboard
       */
      {
        path: 'dashboard',
        lazy: page(() =>
          import('./pages/admin/AdminDashboard'),
        ),
      },
    ],
  },

  {
    Component: SiteLayout,
    HydrateFallback: PageLoader,

    children: [
      {
        errorElement: <RouteError />,

        children: [
          {
            index: true,
            Component: Home,
          },

          {
            path: 'sumshodhini',
            lazy: page(() =>
              import('./pages/Sumshodhini'),
            ),
          },

          {
            path: 'events',
            lazy: page(() =>
              import('./pages/Events'),
            ),
          },

          {
            path: 'workshops',
            lazy: page(() =>
              import('./pages/Workshops'),
            ),
          },

          {
            path: 'register',
            lazy: page(() =>
              import('./pages/Register'),
            ),
          },

          {
            path: 'about',
            lazy: page(() =>
              import('./pages/About'),
            ),
          },

          {
            path: 'association',
            lazy: page(() =>
              import('./pages/Association'),
            ),
          },

          {
            path: 'gallery',
            lazy: page(() =>
              import('./pages/Gallery'),
            ),
          },

          {
            path: 'contact',
            lazy: page(() =>
              import('./pages/Contact'),
            ),
          },

          /*
           * Legacy routes
           */
          {
            path: 'index.html',
            element: <LegacyRedirect to="/" />,
          },

          {
            path: 'pages/:file',
            Component: LegacyRedirect,
          },

          {
            path: 'samshodini',
            element: (
              <LegacyRedirect to="/sumshodhini" />
            ),
          },

          {
            path: 'sumshodini',
            element: (
              <LegacyRedirect to="/sumshodhini" />
            ),
          },

          {
            path: 'samshodhini',
            element: (
              <LegacyRedirect to="/sumshodhini" />
            ),
          },

          {
            path: 'workshop',
            element: (
              <LegacyRedirect to="/workshops" />
            ),
          },

          {
            path: '*',
            Component: NotFound,
          },
        ],
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}