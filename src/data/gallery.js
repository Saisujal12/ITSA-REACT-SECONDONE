/*
  Gallery content (legacy pages/gallery.html).

  Photos are image keys under src/assets/images (see utils/assets.js).
  Keys whose files do not exist yet render a designed placeholder frame:
    gallery/inaugural-1, gallery/inaugural-2,
    gallery/sumshodini-workshop-1 … gallery/sumshodini-workshop-6
  Drive links set to `null` were "YOUR_GOOGLE_DRIVE_LINK_HERE" placeholders in
  the legacy page; their buttons are hidden until a real link is added.
*/

export const GALLERY_HERO_SLIDES = [
  { image: 'gallery/gallery-1', alt: 'IT Association gallery photo 1' },
  { image: 'gallery/gallery-2', alt: 'IT Association gallery photo 2' },
  { image: 'gallery/gallery-3', alt: 'IT Association gallery photo 3' },
  { image: 'gallery/gallery-4', alt: 'IT Association gallery photo 4' },
  { image: 'gallery/gallery-5', alt: 'IT Association gallery photo 5' },
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
          'A special celebration dedicated to appreciating the teachers who guide, inspire and shape the students of the IT Association.',
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
        title: 'Inaugural of IT Association 2026',
        description:
          'The beginning of another exciting year of learning, collaboration, innovation and student activities with the IT Association.',
        photos: [
          { image: 'gallery/inaugural-1', alt: 'Inaugural of IT Association 2026' },
          { image: 'gallery/inaugural-2', alt: 'Inaugural of IT Association 2026' },
        ],
        driveLabel: 'VIEW EVENT PHOTOS',
        driveUrl: null,
      },
    ],
  },
  {
    id: 'sumshodhini-workshops',
    eyebrow: "SUMSHODHINI '26",
    titleLead: 'Recent Sumshodhini',
    titleStrong: 'workshop photos.',
    intro:
      "Explore highlights from the workshops, learning sessions and hands-on experiences of Sumshodhini '26.",
    driveLabel: 'VIEW WORKSHOP PHOTOS',
    driveUrl: null,
    albums: [
      {
        id: 'sumshodhini-llm',
        date: "SUMSHODHINI '26",
        category: 'WORKSHOP',
        title: 'Introduction to LLMs',
        description:
          'Highlights from the Sumshodhini workshop focused on learning, exploring and understanding Large Language Models.',
        photos: [
          { image: 'gallery/sumshodini-workshop-1', alt: 'Sumshodhini workshop photo 1' },
          { image: 'gallery/sumshodini-workshop-2', alt: 'Sumshodhini workshop photo 2' },
        ],
        driveLabel: 'VIEW WORKSHOP PHOTOS',
        driveUrl: null,
      },
      {
        id: 'sumshodhini-hands-on',
        date: "SUMSHODHINI '26",
        category: 'WORKSHOP',
        title: 'Hands-on Learning Workshop',
        description:
          'Moments from an interactive Sumshodhini workshop where students explored concepts through practical and engaging activities.',
        photos: [
          { image: 'gallery/sumshodini-workshop-3', alt: 'Sumshodhini workshop photo 3' },
          { image: 'gallery/sumshodini-workshop-4', alt: 'Sumshodhini workshop photo 4' },
        ],
        driveLabel: 'VIEW WORKSHOP PHOTOS',
        driveUrl: null,
      },
      {
        id: 'sumshodhini-recent',
        date: "SUMSHODHINI '26",
        category: 'WORKSHOP',
        title: 'Recent Sumshodhini Workshop',
        description:
          "A visual collection of memorable moments from the learning, collaboration and participation at Sumshodhini '26.",
        photos: [
          { image: 'gallery/sumshodini-workshop-5', alt: 'Sumshodhini workshop photo 5' },
          { image: 'gallery/sumshodini-workshop-6', alt: 'Sumshodhini workshop photo 6' },
        ],
        driveLabel: 'VIEW WORKSHOP PHOTOS',
        driveUrl: null,
      },
    ],
  },
]
