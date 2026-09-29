import logo128 from '../assets/images/brand/it-association-logo-128.webp'
import logo256 from '../assets/images/brand/it-association-logo-256.webp'
import logo512 from '../assets/images/brand/it-association-logo-512.webp'
import profilePlaceholder from '../assets/images/brand/profile-placeholder-320.webp'

export const SITE = {
  name: 'IT Association',
  nameUpper: 'IT ASSOCIATION',
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
  width: 977,
  height: 1014,
  alt: 'IT Association logo',
}

export const PROFILE_PLACEHOLDER = profilePlaceholder

/** Builds a document title in the legacy "Page | IT Association KITSW" format. */
export function pageTitle(page) {
  return page ? `${page} | IT Association KITSW` : 'IT Association | KITSW'
}
