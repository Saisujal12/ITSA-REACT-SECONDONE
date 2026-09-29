import { request } from './api'

/**
 * POST /api/registrations — backend contract (unchanged):
 * { name, rollNo, year, branch, email, phone, workshop, amount, transactionId }
 * → 201 { success, message, registrationId, status }
 */
export function submitRegistration(payload, { signal } = {}) {
  return request('/api/registrations', { method: 'POST', body: payload, signal })
}
