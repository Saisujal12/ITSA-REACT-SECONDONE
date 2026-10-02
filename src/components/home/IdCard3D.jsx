import { useMemo, useRef } from 'react'
import { LOGO, SITE } from '../../data/site'
import { useTilt3d } from '../../hooks/useTilt3d'
import s from './IdCard3D.module.css'

const CODE39 = {
  '0': 'nnnwwnwnn',
  '1': 'wnnwnnnnw',
  '2': 'nnwwnnnnw',
  '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw',
  '5': 'wnnwwnnnn',
  '6': 'nnwwwnnnn',
  '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn',
  '9': 'nnwwnnwnn',
  A: 'wnnnnwnnw',
  B: 'nnwnnwnnw',
  C: 'wnwnnwnnn',
  D: 'nnnnwwnnw',
  E: 'wnnnwwnnn',
  F: 'nnwnwwnnn',
  G: 'nnnnnwwnw',
  H: 'wnnnnwwnn',
  I: 'nnwnnwwnn',
  J: 'nnnnwwwnn',
  K: 'wnnnnnnww',
  L: 'nnwnnnnww',
  M: 'wnwnnnnwn',
  N: 'nnnnwnnww',
  O: 'wnnnwnnwn',
  P: 'nnwnwnnwn',
  Q: 'nnnnnnwww',
  R: 'wnnnnnwwn',
  S: 'nnwnnnwwn',
  T: 'nnnnwnwwn',
  U: 'wwnnnnnnw',
  V: 'nwwnnnnnw',
  W: 'wwwnnnnnn',
  X: 'nwnnwnnnw',
  Y: 'wwnnwnnnn',
  Z: 'nwwnwnnnn',
  '-': 'nwnnnnwnw',
  ' ': 'wwnnnnwnn',
  '.': 'wwnnnwnnn',
  '$': 'nwnwnwnnn',
  '/': 'nwnwnnnwn',
  '+': 'nwnnnwnwn',
  '%': 'nnnwnwnwn',
  '*': 'nwnnwnwnn',
}

function Barcode({ value }) {
  const normalized = String(
    value || 'ITSA-2026-001',
  )
    .toUpperCase()
    .replace(/[^0-9A-Z .$/+%-]/g, '-')

  const encoded = `*${normalized}*`
  const modules = []

  for (const character of encoded) {
    const pattern =
      CODE39[character] || CODE39['-']

    pattern.split('').forEach(
      (width, index) => {
        modules.push({
          isBar: index % 2 === 0,
          width: width === 'w' ? 3 : 1,
        })
      },
    )

    modules.push({
      isBar: false,
      width: 1,
    })
  }

  const totalWidth = modules.reduce(
    (sum, item) => sum + item.width,
    0,
  )

  let x = 0

  return (
    <svg
      className={s.barcode}
      viewBox={`0 0 ${totalWidth} 42`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Barcode for ${normalized}`}
    >
      {modules.map((module, index) => {
        const rect = module.isBar ? (
          <rect
            key={`${module.width}-${index}`}
            x={x}
            y="0"
            width={module.width}
            height="42"
          />
        ) : null

        x += module.width

        return rect
      })}
    </svg>
  )
}

export default function IdCard3D({
  registrationId = 'ITSA-2026-001',
  workshop = 'To be announced',
  date = 'October 30, 2026',
  validity = '30 OCT 2026',
}) {
  const sceneRef = useRef(null)
  const cardRef = useRef(null)

  useTilt3d(
    sceneRef,
    cardRef,
    s.isHovering,
  )

  const resolvedRegistrationId = useMemo(
    () =>
      String(
        registrationId ||
          'ITSA-2026-001',
      ).toUpperCase(),
    [registrationId],
  )

  return (
    <div className={s.area}>
      <div
        ref={sceneRef}
        className={s.scene}
        role="img"
        aria-label="IT Association Sumshodhini 2026 ID card"
      >
        <div
          ref={cardRef}
          className={s.card}
          aria-hidden="true"
        >
          <div className={s.header}>
            <div className={s.eventTitle}>
              <strong>
                SUMSHODHINI {SITE.year}
              </strong>

              <span>KITSW</span>
            </div>

            <img
              className={s.headerLogo}
              src={LOGO.src}
              width="42"
              height="43"
              alt=""
            />
          </div>

          <div className={s.identity}>
            <div className={s.logoBox}>
              <img
                src={LOGO.large}
                width="150"
                height="156"
                alt=""
              />
            </div>

            <div className={s.associationName}>
              <strong>
                Information Technology
              </strong>

              <span>
                Students Association
              </span>
            </div>
          </div>

          <div className={s.details}>
            <div className={s.detail}>
              <span>Workshop</span>
              <strong>{workshop}</strong>
            </div>

            <div className={s.detail}>
              <span>Date</span>
              <strong>{date}</strong>
            </div>

            <div className={s.detail}>
              <span>ID Card Number</span>
              <strong>
                {resolvedRegistrationId}
              </strong>
            </div>

            <div className={s.detail}>
              <span>Validity</span>
              <strong>{validity}</strong>
            </div>
          </div>

          <div className={s.bottom}>
            <div className={s.bottomBrand}>
              <span>
                ITSA · {SITE.year}
              </span>

              <small>
                LEARN · BUILD · GROW
              </small>
            </div>

            <div className={s.barcodeWrap}>
              <Barcode
                value={resolvedRegistrationId}
              />

              <span>
                {resolvedRegistrationId}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}