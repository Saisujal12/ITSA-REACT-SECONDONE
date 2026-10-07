/*
  Gallery content.

  Missing image keys intentionally render as labelled placeholders. Upload the
  correct photos to the paths listed in the delivery asset table before
  publishing them as real workshop imagery.
*/

export const GALLERY_HERO_SLIDES = [
  { image: 'gallery/gallery-1', alt: 'IT Department gallery photo 1' },
  { image: 'gallery/gallery-2', alt: 'IT Department gallery photo 2' },
  { image: 'gallery/gallery-3', alt: 'IT Department gallery photo 3' },
  { image: 'gallery/gallery-4', alt: 'IT Department gallery photo 4' },
  { image: 'gallery/gallery-5', alt: 'IT Department gallery photo 5' },
]

export const GALLERY_SECTIONS = [
  {
    id: 'recent-events',
    eyebrow: 'RECENT EVENT PHOTOS',
    titleLead: 'Moments worth',
    titleStrong: 'remembering.',
    intro:
      'Explore highlights from our latest association events, celebrations and academic activities.',
    driveLabel: 'VIEW ALL PHOTOS',
    driveUrl: null,
    albums: [
      {
        id: 'guest-lecture-ai',
        date: '16 SEP 2026',
        category: 'GUEST LECTURE',
        title: 'Exploring AI Applications Across Industries',
        description:
          'A guest lecture exploring the applications, possibilities and impact of Artificial Intelligence across different industries.',
        photos: [
          { image: 'gallery/guest-lecture-1', alt: 'Guest Lecture on Exploring AI Applications Across Industries' },
          { image: 'gallery/guest-lecture-2', alt: 'Guest Lecture event' },
        ],
        driveLabel: 'VIEW EVENT PHOTOS',
        driveUrl: 'https://drive.google.com/drive/folders/1IJE2QEpHVwBZu4KTnvgULifjZfcugAiu',
      },
      {
        id: 'teachers-day',
        date: '05 SEP 2026',
        category: 'CELEBRATION',
        title: "Teachers' Day",
        description:
          'A special celebration dedicated to appreciating the teachers who guide, inspire and shape the students of the IT Department.',
        photos: [
          { image: 'gallery/gallery-1', alt: 'Teachers Day celebration' },
          { image: 'gallery/gallery-5', alt: 'Teachers Day celebration' },
        ],
        driveLabel: 'VIEW EVENT PHOTOS',
        driveUrl: 'https://drive.google.com/drive/folders/1Je3sIOy5sFPfgZSJpbSGY1JzFbU9jYI_',
      },
      {
        id: 'inaugural-2026',
        date: '29 JUL 2026',
        category: 'INAUGURAL',
        title: 'Inaugural of IT Department 2026',
        description:
          'The beginning of another exciting year of learning, collaboration, innovation and student activities with the IT Department.',
        photos: [
          { image: 'gallery/inaugural-1', alt: 'Inaugural of IT Department 2026 placeholder' },
          { image: 'gallery/inaugural-2', alt: 'Inaugural of IT Department 2026 placeholder' },
        ],
        driveLabel: 'VIEW EVENT PHOTOS',
        driveUrl: 'https://drive.google.com/drive/folders/1stRTE2ZWWDyjF1H0Rcqv02FghfjXyHas',
      },
    ],
  },
  {
    id: 'sumshodhini-workshops',
    eyebrow: 'SUMSHODHINI WORKSHOPS',
    titleLead: 'Recent workshop',
    titleStrong: 'groups.',
    intro:
      'Recent SUMSHODHINI workshop groups are listed by year. Upload the correct photos to the configured asset paths to replace the placeholders.',
    driveLabel: 'VIEW WORKSHOP PHOTOS',
    driveUrl: null,
    albums: [
      {
        id: 'sumshodhini-agentic-ai-2025',
        date: '2025',
        category: 'WORKSHOP',
        title: 'Agentic AI Workshop',
        description: 'SUMSHODHINI workshop group — 2025.',
        photos: [
          { image: 'gallery/sumshodhini/agentic-ai-2025-1', alt: 'Agentic AI Workshop 2025 placeholder' },
          { image: 'gallery/sumshodhini/agentic-ai-2025-2', alt: 'Agentic AI Workshop 2025 placeholder' },
        ],
        driveLabel: 'VIEW WORKSHOP PHOTOS',
        driveUrl: null,
      },
      {
        id: 'sumshodhini-mobile-app-2024',
        date: '2024',
        category: 'WORKSHOP',
        title: 'Mobile Application Development Workshop',
        description: 'SUMSHODHINI workshop group — 2024.',
        photos: [
          { image: 'gallery/sumshodhini/mobile-app-development-2024-1', alt: 'Mobile Application Development Workshop 2024 placeholder' },
          { image: 'gallery/sumshodhini/mobile-app-development-2024-2', alt: 'Mobile Application Development Workshop 2024 placeholder' },
        ],
        driveLabel: 'VIEW WORKSHOP PHOTOS',
        driveUrl: null,
      },
      {
        id: 'sumshodhini-ethical-hacking-2023',
        date: '2023',
        category: 'WORKSHOP',
        title: 'Ethical Hacking Workshop',
        description: 'SUMSHODHINI workshop group — 2023.',
        photos: [
          { image: 'gallery/sumshodhini/ethical-hacking-2023-1', alt: 'Ethical Hacking Workshop 2023 placeholder' },
          { image: 'gallery/sumshodhini/ethical-hacking-2023-2', alt: 'Ethical Hacking Workshop 2023 placeholder' },
        ],
        driveLabel: 'VIEW WORKSHOP PHOTOS',
        driveUrl: null,
      },
    ],
  },
]
