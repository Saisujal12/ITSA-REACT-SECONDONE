/*
  Sumshodhini 2026 — single source of truth for workshops and events.

  TEMPORARY TEST MODE:
  The Introduction to LLMs workshop has a fee of ₹1 only for testing
  the complete registration flow.

  Frontend → Backend → Google Sheets → Registration ID → PENDING

  Change the fee back to null when testing is finished and the real
  registration fee has not yet been confirmed.
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
} from 'lucide-react'

export const REGISTRATION_DAYS = {
  day1: {
    key: 'day1',
    number: '01',
    label: 'DAY 01 · WORKSHOPS',
    shortLabel: 'DAY 01',
    title: 'Workshops',
    selectorDescription:
      'Register for the workshops scheduled on Day 1.',
    selectorAction:
      'Continue to workshops',
    icon: Wrench,
    heading:
      'Register for Day 1 Workshops',
    description:
      'Enter your details carefully. They will be used for workshop registration and payment verification.',
    paymentTitle:
      'Day 1 Workshops',
    paymentDescription:
      'Scan the workshop payment QR, complete the payment, and keep your transaction reference ready.',
    qr: 'qr/workshop-qr',
    qrAlt:
      'Workshop registration payment QR code',
    fallbackText:
      'Workshop QR code is currently unavailable.',
  },

  day2: {
    key: 'day2',
    number: '02',
    label: 'DAY 02 · EVENTS',
    shortLabel: 'DAY 02',
    title: 'Events',
    selectorDescription:
      'Choose one of the events available on Day 2.',
    selectorAction:
      'View event options',
    icon: CalendarDays,
    heading:
      'Choose a Day 2 Event',
    description:
      'Select the event you want to register for.',
    paymentTitle:
      'Day 2 Events',
    paymentDescription:
      'The Day 2 events use the events payment QR.',
    qr: 'qr/events-qr',
    qrAlt:
      'Events registration payment QR code',
    fallbackText:
      'Events QR code is currently unavailable.',
  },
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

    meta: {
      icon: MapPin,
      label: 'IT Department',
    },

    /*
      TEMPORARY TEST MODE

      Keep ₹1 while testing the complete registration flow.
    */
    fee: 1,

    status: 'open',

    statusLabel:
      'REGISTRATION OPEN',

    formHeading:
      'Register for Introduction to LLMs',

    formDescription:
      'Complete the registration form for the Introduction to LLMs workshop.',

    poster:
      'posters/llm-poster',

    posterAlt:
      'Introduction to LLMs workshop poster',

    /*
      IMPORTANT:
      This object is required by src/pages/Workshops.jsx.
    */
    workshop: {
      titleLead:
        'Introduction to',

      titleStrong:
        'LLMs',

      description:
        'A beginner-friendly technical workshop introducing Large Language Models, prompting, model behaviour and practical AI workflows.',

      facts: [
        {
          label: 'DATE',
          value: 'Coming Soon',
        },

        {
          label: 'MODE',
          value: 'On Campus',
        },

        {
          label: 'LEVEL',
          value: 'Beginner Friendly',
        },
      ],

      due: {
        label: 'DUE',

        value: '2026',

        note:
          'Registration window open',
      },
    },
  },

  {
    id: 'code-build',
    day: 'day2',
    type: 'event',
    number: '02',
    category: 'TECHNICAL EVENT',

    title: 'Code & Build',

    description:
      'A practical coding experience focused on problem solving and building useful solutions.',

    selectorDescription:
      'A practical coding experience focused on problem solving and building useful solutions.',

    icon: CodeXml,

    date: '2026 · TBD',

    meta: {
      icon: Users,
      label: 'Students',
    },

    fee: 1,

    status: 'open',

    statusLabel:
      'REGISTRATION OPEN',

    formHeading:
      'Register for Code & Build',

    formDescription:
      'Complete the registration form for the Code & Build event.',

    poster:
      'posters/code-build-poster',

    posterAlt:
      'Code & Build event poster',
  },

  {
    id: 'innovation',
    day: 'day2',
    type: 'event',
    number: '03',
    category: 'INNOVATION',

    title:
      'IT Innovation Challenge',

    description:
      'Form a team, choose a real-world problem and present a technology-driven idea.',

    selectorDescription:
      'Present an innovative technology-driven solution to a real-world problem.',

    icon: Lightbulb,

    date: '2026 · TBD',

    meta: {
      icon: Trophy,
      label: 'Challenge',
    },

    fee: 1,

    status: 'open',

    statusLabel:
      'REGISTRATION OPEN',

    formHeading:
      'Register for IT Innovation Challenge',

    formDescription:
      'Complete the registration form for the IT Innovation Challenge.',

    poster:
      'posters/innovation-poster',

    posterAlt:
      'IT Innovation Challenge poster',
  },

  {
    id: 'cyber-quest',
    day: 'day2',
    type: 'event',
    number: '04',
    category: 'CYBERSECURITY',

    title:
      'Cyber Quest',

    description:
      'Explore security concepts through puzzles, challenges and practical scenarios.',

    selectorDescription:
      'Explore cybersecurity through challenges, puzzles and practical scenarios.',

    icon: ShieldCheck,

    date: '2026 · TBD',

    meta: {
      icon: Lock,
      label: 'Security',
    },

    fee: 1,

    status: 'open',

    statusLabel:
      'REGISTRATION OPEN',

    formHeading:
      'Register for Cyber Quest',

    formDescription:
      'Complete the registration form for Cyber Quest.',

    poster:
      'posters/cyber-quest-poster',

    posterAlt:
      'Cyber Quest poster',
  },
]

export const DAY1_DEFAULT_EVENT_ID =
  'llm'

export const getEvent = (id) =>
  EVENTS.find(
    (event) => event.id === id,
  ) ?? null

export const eventsByDay = (day) =>
  EVENTS.filter(
    (event) => event.day === day,
  )

export const getDay = (key) =>
  REGISTRATION_DAYS[key] ?? null

export const hasVerifiedFee = (event) =>
  typeof event?.fee === 'number' &&
  Number.isFinite(event.fee) &&
  event.fee > 0

export const formatFee = (fee) =>
  `₹${fee.toLocaleString('en-IN')}`