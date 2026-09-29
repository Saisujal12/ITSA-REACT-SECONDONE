import { useRef } from 'react'
import { PROFILE_PLACEHOLDER, SITE } from '../../data/site'
import { useTilt3d } from '../../hooks/useTilt3d'
import s from './IdCard3D.module.css'

const DETAILS = [
  { label: 'Identity', value: `IT · ${SITE.year}` },
  { label: 'Focus', value: 'Learn · Build' },
  { label: 'Experience', value: 'Workshops · Events' },
]

export default function IdCard3D() {
  const sceneRef = useRef(null)
  const cardRef = useRef(null)
  useTilt3d(sceneRef, cardRef, s.isHovering)

  return (
    <div className={s.area}>
      <div ref={sceneRef} className={s.scene} role="img" aria-label="IT Association card">
        <div ref={cardRef} className={s.card} aria-hidden="true">
          <div className={s.header}>
            <div className={s.brand}>
              <strong>{SITE.nameUpper}</strong>
              <span>{SITE.branch.toUpperCase()}</span>
            </div>
            <div className={s.year}>{SITE.year}</div>
          </div>

          <div className={s.photoArea}>
            <div className={s.photo}>
              <img src={PROFILE_PLACEHOLDER} width="120" height="145" alt="" />
            </div>
          </div>

          <div className={s.info}>
            <h3>{SITE.name}</h3>
            <p>{SITE.branch}</p>
            <div className={s.divider} />
          </div>

          <div className={s.details}>
            {DETAILS.map((detail) => (
              <div key={detail.label} className={s.detail}>
                <span>{detail.label}</span>
                <span>{detail.value}</span>
              </div>
            ))}
          </div>

          <div className={s.footer}>
            <span>LEARN · BUILD · GROW</span>
            <strong>IT</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
