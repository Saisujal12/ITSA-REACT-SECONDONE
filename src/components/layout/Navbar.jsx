import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { MAIN_NAV, REGISTER_LINK } from '../../data/navigation'
import { LOGO, SITE } from '../../data/site'
import { useMagnetic } from '../../hooks/useMagnetic'
import { useScrolled } from '../../hooks/useScrolled'
import { cx } from '../../utils/cx'
import s from './Navbar.module.css'

const DESKTOP_BREAKPOINT = 900

export default function Navbar() {
  const { pathname } = useLocation()
  // The menu belongs to the page it was opened on, so any navigation closes it.
  const [openOnPath, setOpenOnPath] = useState(null)
  const open = openOnPath === pathname
  const scrolled = useScrolled(25)

  const headerRef = useRef(null)
  const menuButtonRef = useRef(null)
  const firstMobileLinkRef = useRef(null)
  const registerRef = useRef(null)
  useMagnetic(registerRef)

  const close = () => setOpenOnPath(null)

  useEffect(() => {
    if (!open) return undefined

    document.body.classList.add('menu-open')
    firstMobileLinkRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenOnPath(null)
        menuButtonRef.current?.focus()
      }
    }
    const onPointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) setOpenOnPath(null)
    }
    const onResize = () => {
      if (window.innerWidth > DESKTOP_BREAKPOINT) setOpenOnPath(null)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.classList.remove('menu-open')
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  // Close when keyboard focus leaves the header.
  const onBlur = (event) => {
    if (open && !headerRef.current?.contains(event.relatedTarget)) close()
  }

  return (
    <header ref={headerRef} className={cx(s.navbar, scrolled && s.scrolled)} onBlur={onBlur}>
      <div className={s.navContainer}>
        <Link to="/" className={s.brand} aria-label={`${SITE.name} ${SITE.college} — home`}>
          <span className={s.brandSymbol}>
            <img src={LOGO.src} srcSet={LOGO.srcSet} sizes="58px" width="58" height="58" alt="" />
          </span>
          <span className={s.brandText}>
            <strong>{SITE.nameUpper}</strong>
            <span>{SITE.collegeSpaced}</span>
          </span>
        </Link>

        <nav className={s.desktopNav} aria-label="Main">
          {MAIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cx(s.navLink, isActive && s.active)}
            >
              <span className={s.navLinkText}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={s.navActions}>
          <Link ref={registerRef} to={REGISTER_LINK.to} className={s.registerBtn}>
            <span>{REGISTER_LINK.label}</span>
            <span className={s.registerArrow} aria-hidden="true">
              →
            </span>
          </Link>

          <button
            ref={menuButtonRef}
            className={cx(s.menuButton, open && s.active)}
            type="button"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpenOnPath(open ? null : pathname)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={cx(s.mobileMenu, open && s.open)} inert={!open}>
        <nav className={s.mobileMenuInner} aria-label="Mobile">
          <div className={s.mobileMenuHeader} aria-hidden="true">
            <span>NAVIGATION</span>
            <span className={s.mobileMenuLine} />
          </div>

          {MAIN_NAV.map((item, index) => (
            <NavLink
              key={item.to}
              ref={index === 0 ? firstMobileLinkRef : undefined}
              to={item.to}
              end={item.end}
              onClick={close}
              className={({ isActive }) => cx(s.mobileNavLink, isActive && s.active)}
            >
              <span className={s.mobileNavNumber} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <strong>{item.label}</strong>
              <span className={s.mobileNavArrow} aria-hidden="true">
                →
              </span>
            </NavLink>
          ))}

          <Link to={REGISTER_LINK.to} className={s.mobileRegister} onClick={close}>
            <span>Register Now</span>
            <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
