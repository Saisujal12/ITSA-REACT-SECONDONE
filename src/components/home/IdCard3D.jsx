import { useMemo, useRef } from 'react'
import { LOGO } from '../../data/site'
import { EVENTS } from '../../data/events'
import idCardLogo from '../../assets/images/sumshodhini/id-card-logo.png'
import { useTilt3d } from '../../hooks/useTilt3d'
import s from './IdCard3D.module.css'

const WORKSHOP_TITLE =
  EVENTS.find((event) => event.id === 'llm')?.title.replace(
    'Prompt, ',
    'Prompt,\n',
  ) ?? 'Industry-Driven AI Workshop'

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
  const normalized = String(value || 'ITDEPT-2026-001')
    .toUpperCase()
    .replace(/[^0-9A-Z .$/+%-]/g, '-')

  const encoded = `*${normalized}*`
  const modules = []

  for (const character of encoded) {
    const pattern = CODE39[character] || CODE39['-']

    pattern.split('').forEach((width, index) => {
      modules.push({
        isBar: index % 2 === 0,
        width: width === 'w' ? 3 : 1,
      })
    })

    modules.push({
      isBar: false,
      width: 1,
    })
  }

  const totalWidth = modules.reduce(
    (sum, module) => sum + module.width,
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
        const currentX = x
        x += module.width

        if (!module.isBar) {
          return null
        }

        return (
          <rect
            key={`${index}-${currentX}`}
            x={currentX}
            y="0"
            width={module.width}
            height="42"
          />
        )
      })}
    </svg>
  )
}

export default function IdCard3D({
  registrationId = 'ITDEPT-2026-001',
  workshop = WORKSHOP_TITLE,
  date = 'October 30, 2026',
  validity = '30 OCT 2026',
}) {
  const sceneRef = useRef(null)
  const cardRef = useRef(null)

  useTilt3d(sceneRef, cardRef, s.isHovering)

  const resolvedRegistrationId = useMemo(
    () => String(registrationId || 'ITDEPT-2026-001').toUpperCase(),
    [registrationId],
  )

  return (
    <div className={s.area}>
      <div
        ref={sceneRef}
        className={s.scene}
        role="img"
        aria-label="IT Department Sumshodhini 2026 ID card"
      >
        <div
          ref={cardRef}
          className={s.card}
          aria-hidden="true"
        >
          {/* Clear event logo and title */}
          <div className={s.header}>
            <img
              className={s.headerLogo}
              src={idCardLogo}
              alt=""
            />

            <div className={s.headerTitle}>
              <strong>SUMSHODHINI ’26</strong>
              <span>
                30<sup>th</sup> – 31<sup>st</sup> October 2026
              </span>
            </div>
          </div>

          {/* Department identity */}
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
              <strong>Information Technology</strong>
              <span>
                Kakatiya Institute of Technology and Science
              </span>
            </div>
          </div>

          {/* Workshop and registration details */}
          <div className={s.details}>
            <div className={`${s.detail} ${s.detailWorkshop}`}>
              <span>Workshop</span>
              <strong>{workshop}</strong>
            </div>

            <div className={s.detailPair}>
              <div className={`${s.detail} ${s.detailDate}`}>
                <span>Workshop Date</span>
                <strong>{date}</strong>
              </div>

              <div className={`${s.detail} ${s.detailNumber}`}>
                <span>ID Card Number</span>
                <strong>{resolvedRegistrationId}</strong>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={s.bottom}>
            <div className={s.bottomBrand}>
              <small>VALIDITY</small>
              <strong>{validity}</strong>
            </div>

            <div className={s.barcodeWrap}>
              <Barcode value={resolvedRegistrationId} />
              <span>{resolvedRegistrationId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}