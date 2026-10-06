import logo128 from '../assets/images/brand/it-department-logo-transparent-128.webp'
import logo256 from '../assets/images/brand/it-department-logo-transparent-256.webp'
import logo512 from '../assets/images/brand/it-department-logo-transparent-512.webp'
import profilePlaceholder from '../assets/images/brand/profile-placeholder-320.webp'

export const SITE = {
  name: 'IT Department',
  nameUpper: 'IT DEPARTMENT',
  shortName: 'IT DEPT',
  college: 'KITSW',
  collegeSpaced: 'K I T S W',
  department: 'Department of Information Technology',
  branch: 'Information Technology',
  year: 2026,
  // Official spelling. Legacy pages also used Samshodini / Sumshodini / Samshodhini.
  fest: 'Sumshodhini',
  festUpper: 'SUMSHODHINI',
  motto: 'Learn · Build · Grow',
  mottoConnect: 'Learn · Build · Connect',
}

export const LOGO = {
  src: logo256,
  srcSet: `${logo128} 128w, ${logo256} 256w, ${logo512} 512w`,
  large: logo512,
  width: 512,
  height: 514,
  alt: 'IT Department logo',
}

export const PROFILE_PLACEHOLDER = profilePlaceholder

/** Builds a document title in the "Page | IT Department KITSW" format. */
export function pageTitle(page) {
  return page ? `${page} | IT Department KITSW` : 'IT Department | KITSW'
}
