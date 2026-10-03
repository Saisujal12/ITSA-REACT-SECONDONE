/*
  Sumshodhini 2026 — single source of truth for workshops and events.

  Existing registration fees are preserved from the project. The three new
  Day-2 entries are explicitly placeholders: they have no fee, no confirmed
  date/venue, and registration is disabled until their configuration is
  replaced with verified details.
*/

import {
  Brain,
  CalendarDays,
  CodeXml,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Trophy,
  Lock,
  Users,
  Wrench,
  Palette,
  Radio,
  Sparkles,
} from 'lucide-react'
import { getPaymentQr } from './payment'

export const REGISTRATION_DAYS = {
  day1: {
    key: 'day1',
    number: '01',
    label: 'DAY 01 · WORKSHOPS',
    shortLabel: 'DAY 01',
    title: 'Workshops',
    selectorDescription: 'Register for the workshops scheduled on Day 1.',
    selectorAction: 'Continue to workshops',
    icon: Wrench,
    heading: 'Register for Day 1 Workshops',
    description:
      'Enter your details carefully. They will be used for workshop registration and payment verification.',
    paymentTitle: 'Day 1 Workshops',
    paymentDescription:
      'Scan the workshop payment QR, complete the payment, and keep your transaction reference ready.',
    ...getPaymentQr('llm', 'day1'),
  },
  day2: {
    key: 'day2',
    number: '02',
    label: 'DAY 02 · EVENTS',
    shortLabel: 'DAY 02',
    title: 'Events',
    selectorDescription: 'Choose one of the events available on Day 2.',
    selectorAction: 'View event options',
    icon: CalendarDays,
    heading: 'Choose a Day 2 Event',
    description: 'Select the event you want to register for.',
    paymentTitle: 'Day 2 Events',
    paymentDescription: 'Each Day-2 event can use its own configured payment QR.',
    ...getPaymentQr('code-build', 'day2'),
  },
}

const openEventDefaults = {
  status: 'open',
  statusLabel: 'REGISTRATION OPEN',
  registrationEnabled: true,
}

const placeholderEventDefaults = {
  status: 'placeholder',
  statusLabel: 'DETAILS COMING SOON',
  registrationEnabled: false,
  fee: null,
}

export const EVENTS = [
  {
    id: 'llm',
    day: 'day1',
    type: 'workshop',
    number: '01',
    category: 'AI WORKSHOP',
    title: 'Introduction to LLMs',
    description:
      'Understand large language models, prompting and practical AI workflows.',
    icon: Brain,
    date: '2026 · Coming Soon',
    meta: { icon: MapPin, label: 'IT Department' },
    fee: 1,
    ...openEventDefaults,
    formHeading: 'Register for Introduction to LLMs',
    formDescription:
      'Complete the registration form for the Introduction to LLMs workshop.',
    poster: 'posters/llm-poster',
    posterAlt: 'Introduction to LLMs workshop poster',
    ...getPaymentQr('llm', 'day1'),
    workshop: {
      titleLead: 'Introduction to',
      titleStrong: 'LLMs',
      description:
        'A beginner-friendly technical workshop introducing Large Language Models, prompting, model behaviour and practical AI workflows.',
      facts: [
        { label: 'DATE', value: 'Coming Soon' },
        { label: 'MODE', value: 'On Campus' },
        { label: 'LEVEL', value: 'Beginner Friendly' },
      ],
      due: { label: 'DUE', value: '2026', note: 'Registration window open' },
    },
  },
  {
    id: 'code-build',
    day: 'day2',
    type: 'event',
    number: '01',
    category: 'TECHNICAL EVENT',
    title: 'Code & Build',
    description:
      'A practical coding experience focused on problem solving and building useful solutions.',
    selectorDescription:
      'A practical coding experience focused on problem solving and building useful solutions.',
    icon: CodeXml,
    date: '2026 · TBD',
    meta: { icon: Users, label: 'Students' },
    fee: 1,
    ...openEventDefaults,
    formHeading: 'Register for Code & Build',
    formDescription: 'Complete the registration form for the Code & Build event.',
    poster: 'posters/code-build-poster',
    posterAlt: 'Code & Build event poster',
    ...getPaymentQr('code-build', 'day2'),
  },
  {
    id: 'innovation',
    day: 'day2',
    type: 'event',
    number: '02',
    category: 'INNOVATION',
    title: 'IT Innovation Challenge',
    description:
      'Form a team, choose a real-world problem and present a technology-driven idea.',
    selectorDescription:
      'Present an innovative technology-driven solution to a real-world problem.',
    icon: Lightbulb,
    date: '2026 · TBD',
    meta: { icon: Trophy, label: 'Challenge' },
    fee: 1,
    ...openEventDefaults,
    formHeading: 'Register for IT Innovation Challenge',
    formDescription: 'Complete the registration form for the IT Innovation Challenge.',
    poster: 'posters/innovation-poster',
    posterAlt: 'IT Innovation Challenge poster',
    ...getPaymentQr('innovation', 'day2'),
  },
  {
    id: 'cyber-quest',
    day: 'day2',
    type: 'event',
    number: '03',
    category: 'CYBERSECURITY',
    title: 'Cyber Quest',
    description:
      'Explore security concepts through puzzles, challenges and practical scenarios.',
    selectorDescription:
      'Explore cybersecurity through challenges, puzzles and practical scenarios.',
    icon: ShieldCheck,
    date: '2026 · TBD',
    meta: { icon: Lock, label: 'Security' },
    fee: 1,
    ...openEventDefaults,
    formHeading: 'Register for Cyber Quest',
    formDescription: 'Complete the registration form for Cyber Quest.',
    poster: 'posters/cyber-quest-poster',
    posterAlt: 'Cyber Quest poster',
    ...getPaymentQr('cyber-quest', 'day2'),
  },
  {
    id: 'design-deploy',
    day: 'day2',
    type: 'event',
    number: '04',
    category: 'DESIGN · DEVELOPMENT',
    title: 'Design to Deploy',
    description:
      'Placeholder event. Final format, schedule, venue, fee and registration details are not configured yet.',
    selectorDescription:
      'Placeholder event — final details will be published after confirmation.',
    icon: Palette,
    date: '2026 · To be announced',
    meta: { icon: Users, label: 'Details pending' },
    ...placeholderEventDefaults,
    ...getPaymentQr('design-deploy', 'day2'),
  },
  {
    id: 'tech-connect',
    day: 'day2',
    type: 'event',
    number: '05',
    category: 'TECH COMMUNITY',
    title: 'Tech Connect',
    description:
      'Placeholder event. Final format, schedule, venue, fee and registration details are not configured yet.',
    selectorDescription:
      'Placeholder event — final details will be published after confirmation.',
    icon: Radio,
    date: '2026 · To be announced',
    meta: { icon: Users, label: 'Details pending' },
    ...placeholderEventDefaults,
    ...getPaymentQr('tech-connect', 'day2'),
  },
  {
    id: 'event6',
    day: 'day2',
    type: 'event',
    number: '06',
    category: 'SPECIAL EVENT',
    title: 'Event 6 — Details Pending',
    description:
      'Placeholder event. Final title, format, schedule, venue, fee and registration details are not configured yet.',
    selectorDescription:
      'Placeholder event — final details will be published after confirmation.',
    icon: Sparkles,
    date: '2026 · To be announced',
    meta: { icon: Users, label: 'Details pending' },
    ...placeholderEventDefaults,
    ...getPaymentQr('event6', 'day2'),
  },
]

export const DAY1_DEFAULT_EVENT_ID = 'llm'

export const getEvent = (id) => EVENTS.find((event) => event.id === id) ?? null

export const eventsByDay = (day) => EVENTS.filter((event) => event.day === day)

export const getDay = (key) => REGISTRATION_DAYS[key] ?? null

export const hasVerifiedFee = (event) =>
  typeof event?.fee === 'number' && Number.isFinite(event.fee) && event.fee > 0

export const formatFee = (fee) => `₹${fee.toLocaleString('en-IN')}`


