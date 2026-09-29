import { request } from './api'

export const loginAdmin = (username, password) =>
  request('/api/admin/login', { method: 'POST', body: { username, password } })

export const checkAdmin = ({ signal } = {}) => request('/api/admin/check', { signal })

export const logoutAdmin = () => request('/api/admin/logout', { method: 'POST' })

export const fetchRegistrations = ({ signal } = {}) =>
  request('/api/admin/registrations', { signal }).then((data) => data.registrations ?? [])

/** status: "VERIFIED" | "REJECTED" */
export const updateRegistrationStatus = (rowNumber, status) =>
  request(`/api/admin/registrations/${encodeURIComponent(rowNumber)}/status`, {
    method: 'PUT',
    body: { status },
  })
