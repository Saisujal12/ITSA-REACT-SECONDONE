/*
  Registration URL contract (unchanged from the legacy register.html):

    /register                          → day selection
    /register?day=day2                 → redirect to the Events page
    /register?day=day1                 → Day 1 workshop form (Introduction to LLMs)
    /register?event=<id>&from=<source> → that event's form

  `from` records where the visitor came from so "Back" returns there:
    day2      → /events
    events    → /events
    workshops → /workshops
    day1 / —  → day selection

  Every step is a real history entry, so browser Back/Forward always match
  what is on screen (the legacy page pushed URLs but never listened for
  popstate, and read `from` only once at load).
*/

import { DAY1_DEFAULT_EVENT_ID, getEvent } from '../data/events'

const SOURCES = new Set(['day1', 'day2', 'events', 'workshops'])

export function registrationPath(eventId, from) {
  const params = new URLSearchParams({ event: eventId })
  if (from) params.set('from', from)
  return `/register?${params}`
}

/** Works out which registration view the current URL asks for. */
export function resolveRegistrationView(searchParams) {
  const eventId = searchParams.get('event')
  const day = searchParams.get('day')
  const rawFrom = searchParams.get('from')
  const from = SOURCES.has(rawFrom) ? rawFrom : null

  if (eventId) {
    const event = getEvent(eventId)
    if (event) return { view: 'form', event, from: from ?? (event.day === 'day2' ? 'day2' : 'day1') }
    return { view: 'days', unknownEvent: eventId }
  }

  if (day === 'day2') return { view: 'redirect-events' }
  if (day === 'day1') return { view: 'form', event: getEvent(DAY1_DEFAULT_EVENT_ID), from: 'day1' }

  return { view: 'days' }
}

/** Where the form's Back button goes, and what it says. */
export function backTarget(from) {
  switch (from) {
    case 'day2':
      return { to: '/events', label: 'Back to Events' }
    case 'events':
      return { to: '/events', label: 'Back to All Events' }
    case 'workshops':
      return { to: '/workshops', label: 'Back to Workshops' }
    default:
      return { to: '/register', label: 'Back to Day Selection' }
  }
}
