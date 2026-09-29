/*
  Central fetch wrapper for the Express backend.

  Base URL: VITE_API_URL, or same-origin when empty (the Vite dev/preview
  server proxies /api to the backend — see vite.config.js). Credentials are
  always included so the admin session cookie is sent.
*/

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, { status = 0, data = null, network = false } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.network = network
  }
}

export async function request(path, { method = 'GET', body, signal } = {}) {
  let response

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      credentials: 'include',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('Could not reach the server. Please check your connection and try again.', {
      network: true,
    })
  }

  let data = null
  const text = await response.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    throw new ApiError(data?.message || `Request failed (${response.status}).`, {
      status: response.status,
      data,
    })
  }

  if (data === null) {
    throw new ApiError('The server returned an invalid response.', { status: response.status })
  }

  return data
}
