import { useEffect, useRef } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { useReveal } from '../../hooks/useReveal'
import Footer from './Footer'
import Navbar from './Navbar'
import Sponsor from './Sponsor'
import s from './SiteLayout.module.css'

export default function SiteLayout() {
  const { pathname, search } = useLocation()
  const mainRef = useRef(null)
  const previousPath = useRef(pathname)

  useReveal(mainRef, pathname + search)
  const showSponsor =
    pathname === '/' ||
    pathname === '/workshops' ||
    pathname === '/events' ||
    pathname.startsWith('/register')

  // Move keyboard/screen-reader focus to the new page after client-side navigation.
  useEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <>
      <a className={s.skipLink} href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main" ref={mainRef} tabIndex={-1} className={s.main}>
        <Outlet />
      </main>
      {showSponsor && <Sponsor />}
      <Footer />
      <ScrollRestoration />
    </>
  )
}
