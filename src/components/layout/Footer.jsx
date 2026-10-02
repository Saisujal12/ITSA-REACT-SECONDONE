import { Link } from 'react-router'
import { FOOTER_COLUMNS } from '../../data/navigation'
import { LOGO, SITE } from '../../data/site'
import s from './Footer.module.css'

const INSTAGRAM_URL = [
  'https://www.instagram.com',
  'it_kitsw',
].join('/')

function InstagramIcon({
  size = 20,
  strokeWidth = 2,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />

      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />

      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
      />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.grid}>
          <div className={s.brand}>
            <div className={s.brandTitle}>
              <img
                src={LOGO.src}
                srcSet={LOGO.srcSet}
                sizes="44px"
                width="44"
                height="44"
                alt=""
              />

              <span>
                {SITE.nameUpper}
              </span>
            </div>

            <p>
              {SITE.branch.toUpperCase()}
              <br />
              {SITE.department},{' '}
              {SITE.college}
              <br />
              <br />
              {SITE.motto}
            </p>

            <a
              className={s.instagram}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${SITE.name} on Instagram`}
              title="Follow ITSA on Instagram"
            >
              <InstagramIcon
                size={20}
                strokeWidth={2}
              />

              <span>
                Follow us on Instagram
              </span>
            </a>
          </div>

          {FOOTER_COLUMNS.map(
            (column) => (
              <nav
                key={column.title}
                className={s.column}
                aria-label={column.title}
              >
                <h2>{column.title}</h2>

                {column.links.map(
                  (link) => (
                    <Link
                      key={
                        link.to +
                        link.label
                      }
                      to={link.to}
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </nav>
            ),
          )}
        </div>

        <div className={s.bottom}>
          <p>
            © {SITE.year} {SITE.name}.
            All rights reserved.
          </p>

          <p>{SITE.motto}</p>
        </div>
      </div>
    </footer>
  )
}