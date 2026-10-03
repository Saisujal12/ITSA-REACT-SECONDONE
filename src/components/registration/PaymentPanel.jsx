import {
  Check,
  QrCode,
  ScanLine,
} from "lucide-react";

import {
  formatFee,
  hasVerifiedFee,
} from "../../data/events";

import ImageWithFallback from "../ui/ImageWithFallback";
import { resolveImage } from "../../utils/assets";

import s from "../../pages/Register.module.css";

export default function PaymentPanel({
  event,
  day,
}) {
  const feeKnown =
    hasVerifiedFee(event);

  /*
   * Event can have its own QR.
   * Otherwise use the day QR.
   */
  const qrKey = event.qr || day.qr;
  const qrAlt = event.qrAlt || day.qrAlt;
  const fallbackText = event.qrFallbackText || day.qrFallbackText || 'Payment QR image is not uploaded yet.';
  const qrAvailable = Boolean(resolveImage(qrKey));

  return (
    <div
      className={
        s.paymentBox
      }
    >
      <div
        className={
          s.paymentTop
        }
      >
        <div>
          <span
            className={
              s.paymentStep
            }
          >
            STEP 02 · PAYMENT
          </span>

          <h3>
            {qrAvailable
              ? 'Scan the QR code and complete the payment.'
              : 'Payment QR image is not uploaded yet.'}
          </h3>
        </div>

        <div
          className={
            s.paymentIcon
          }
          aria-hidden="true"
        >
          <ScanLine />
        </div>
      </div>

      <div
        className={
          s.paymentTicket
        }
      >
        <div
          className={
            s.qrFrame
          }
        >
          <span
            className={`${s.qrCorner} ${s.cornerTl}`}
            aria-hidden="true"
          />

          <span
            className={`${s.qrCorner} ${s.cornerTr}`}
            aria-hidden="true"
          />

          <span
            className={`${s.qrCorner} ${s.cornerBl}`}
            aria-hidden="true"
          />

          <span
            className={`${s.qrCorner} ${s.cornerBr}`}
            aria-hidden="true"
          />

          <ImageWithFallback
            key={qrKey}
            imageKey={qrKey}
            alt={qrAlt}
            className={
              s.eventQrImage
            }
            loading="eager"
            fallback={
              <div
                className={
                  s.qrFallback
                }
                role="img"
                aria-label={
                  fallbackText
                }
              >
                <QrCode
                  aria-hidden="true"
                />

                <small>
                  {fallbackText}
                </small>
              </div>
            }
          />
        </div>

        <div
          className={
            s.paymentInfo
          }
        >
          <div
            className={
              s.paymentLabel
            }
          >
            PAYMENT FOR
          </div>

          <strong>
            {event.title}
          </strong>

          <p>
            Scan the QR code,
            complete your payment,
            and enter the UTR /
            transaction ID below.
          </p>

          <div
            className={
              s.paymentFee
            }
          >
            <span>
              REGISTRATION FEE
            </span>

            {feeKnown ? (
              formatFee(
                event.fee,
              )
            ) : (
              <em>
                To be announced
              </em>
            )}
          </div>

          <div
            className={
              s.paymentDivider
            }
          />

          <div
            className={
              s.paymentStatus
            }
          >
            <span
              className={
                s.statusSymbol
              }
              aria-hidden="true"
            >
              <Check />
            </span>

            <span>
              Payment verification required
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}