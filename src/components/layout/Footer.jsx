import { Link } from 'react-router'
import { FOOTER_COLUMNS } from '../../data/navigation'
import { LOGO, SITE } from '../../data/site'
import s from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.grid}>
          <div className={s.brand}>
            <div className={s.brandTitle}>
              <img src={LOGO.src} srcSet={LOGO.srcSet} sizes="44px" width="44" height="44" alt="" />
              <span>{SITE.nameUpper}</span>
            </div>
            <p>
              {SITE.branch.toUpperCase()}
              <br />
              {SITE.department}, {SITE.college}
              <br />
              <br />
              {SITE.motto}
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} className={s.column} aria-label={column.title}>
              <h2>{column.title}</h2>
              {column.links.map((link) => (
                <Link key={link.to + link.label} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className={s.bottom}>
          <p>
            © {SITE.year} {SITE.name}. All rights reserved.
          </p>
          <p>{SITE.motto}</p>
        </div>
      </div>
    </footer>
  )
}
