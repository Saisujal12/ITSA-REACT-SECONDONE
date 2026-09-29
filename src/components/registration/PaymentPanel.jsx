import { Check, QrCode, ScanLine } from 'lucide-react'
import { formatFee, hasVerifiedFee } from '../../data/events'
import ImageWithFallback from '../ui/ImageWithFallback'
import s from '../../pages/Register.module.css'

export default function PaymentPanel({ event, day }) {
  const feeKnown = hasVerifiedFee(event)

  return (
    <div className={s.paymentBox}>
      <div className={s.paymentTop}>
        <div>
          <span className={s.paymentStep}>STEP 02 · PAYMENT</span>
          <h3>Pay using the QR for your selected day.</h3>
        </div>
        <div className={s.paymentIcon} aria-hidden="true">
          <ScanLine />
        </div>
      </div>

      <div className={s.paymentTicket}>
        <div className={s.qrFrame}>
          <span className={`${s.qrCorner} ${s.cornerTl}`} aria-hidden="true" />
          <span className={`${s.qrCorner} ${s.cornerTr}`} aria-hidden="true" />
          <span className={`${s.qrCorner} ${s.cornerBl}`} aria-hidden="true" />
          <span className={`${s.qrCorner} ${s.cornerBr}`} aria-hidden="true" />
          <ImageWithFallback
            key={day.key}
            imageKey={day.qr}
            alt={day.qrAlt}
            className={s.eventQrImage}
            loading="eager"
            fallback={
              <div className={s.qrFallback} role="img" aria-label={day.fallbackText}>
                <QrCode aria-hidden="true" />
                <small>{day.fallbackText}</small>
              </div>
            }
          />
        </div>

        <div className={s.paymentInfo}>
          <div className={s.paymentLabel}>PAYMENT FOR</div>
          <strong>{day.paymentTitle}</strong>
          <p>{day.paymentDescription}</p>
          <div className={s.paymentFee}>
            <span>REGISTRATION FEE</span>
            {feeKnown ? formatFee(event.fee) : <em>To be announced</em>}
          </div>
          <div className={s.paymentDivider} />
          <div className={s.paymentStatus}>
            <span className={s.statusSymbol} aria-hidden="true">
              <Check />
            </span>
            <span>Payment verification required</span>
          </div>
        </div>
      </div>
    </div>
  )
}
