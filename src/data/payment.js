/**
 * Payment presentation configuration.
 *
 * QR images are intentionally referenced by asset keys only. Until the real
 * QR images are uploaded, the registration UI shows an explicit placeholder
 * and never presents a fake payment code as usable.
 */
export const PAYMENT_SUPPORT_PHONE = '+91 XXXXXXXXXX'

export const PAYMENT_QR_CONFIG = {
  llm: {
    qr: 'qr/workshop-2026',
    qrAlt: 'Workshop payment QR code placeholder',
    qrFallbackText: 'WORKSHOP QR — UPLOAD REAL QR IMAGE',
  },
  'code-build': {
    qr: 'qr/code-build-2026',
    qrAlt: 'Code & Build payment QR code placeholder',
    qrFallbackText: 'CODE & BUILD QR — UPLOAD REAL QR IMAGE',
  },
  innovation: {
    qr: 'qr/innovation-2026',
    qrAlt: 'IT Innovation Challenge payment QR code placeholder',
    qrFallbackText: 'INNOVATION QR — UPLOAD REAL QR IMAGE',
  },
  'cyber-quest': {
    qr: 'qr/cyber-quest-2026',
    qrAlt: 'Cyber Quest payment QR code placeholder',
    qrFallbackText: 'CYBER QUEST QR — UPLOAD REAL QR IMAGE',
  },
  'design-deploy': {
    qr: 'qr/design-deploy-2026',
    qrAlt: 'Design to Deploy payment QR code placeholder',
    qrFallbackText: 'DESIGN TO DEPLOY QR — UPLOAD REAL QR IMAGE',
  },
  'tech-connect': {
    qr: 'qr/tech-connect-2026',
    qrAlt: 'Tech Connect payment QR code placeholder',
    qrFallbackText: 'TECH CONNECT QR — UPLOAD REAL QR IMAGE',
  },
  event6: {
    qr: 'qr/event6-2026',
    qrAlt: 'Event 6 payment QR code placeholder',
    qrFallbackText: 'EVENT 6 QR — UPLOAD REAL QR IMAGE',
  },
}

export const PAYMENT_QR_BY_DAY = {
  day1: PAYMENT_QR_CONFIG.llm,
  day2: PAYMENT_QR_CONFIG['code-build'],
}

export function getPaymentQr(eventId, dayKey) {
  return PAYMENT_QR_CONFIG[eventId] ?? PAYMENT_QR_BY_DAY[dayKey] ?? null
}