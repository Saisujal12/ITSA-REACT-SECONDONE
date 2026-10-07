const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE = /^\d{10}$/
const NAME = /^\p{L}[\p{L}\p{M} .'-]*$/u
const ROLL_NO = /^[A-Za-z0-9][A-Za-z0-9/-]*$/
const BRANCH = /^\p{L}[\p{L}\p{M}0-9 .&()/-]*$/u
const COLLEGE_NAME = /^[\p{L}\p{M}0-9 .&'()/-]+$/u
const TRANSACTION_ID = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/

export const COLLEGE_OPTIONS = [
  { value: 'KITSW', label: 'KITSW' },
  { value: 'OTHER', label: 'Other College' },
]

export const STUDY_YEAR_OPTIONS = ['1st', '2nd', '3rd', '4th']

export const EMPTY_REGISTRATION = {
  name: '',
  collegeType: '',
  collegeName: '',
  rollNo: '',
  year: '',
  branch: '',
  email: '',
  phone: '',
  mealPreference: '',
  transactionId: '',
}

export function normalizeRegistration(values) {
  return {
    name: values.name.trim().replace(/\s+/g, ' '),
    collegeType: values.collegeType,
    collegeName: values.collegeName.trim().replace(/\s+/g, ' '),
    rollNo: values.rollNo.trim().toUpperCase(),
    year: values.year || '',
    branch: values.branch.trim().replace(/\s+/g, ' '),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.replace(/\D/g, '').slice(0, 10),
    mealPreference: values.mealPreference || '',
    transactionId: values.transactionId.trim(),
  }
}

export function validateRegistration(values, event) {
  const v = normalizeRegistration(values)
  const errors = {}

  if (!v.name) {
    errors.name = 'Please enter your full name.'
  } else if (v.name.length > 80 || !NAME.test(v.name)) {
    errors.name = 'Please enter a valid name.'
  }

  if (!v.collegeType) {
    errors.collegeType = 'Please select your college.'
  }

  if (v.collegeType === 'KITSW') {
    if (!v.rollNo) {
      errors.rollNo = 'Please enter your roll number.'
    } else if (v.rollNo.length > 20 || !ROLL_NO.test(v.rollNo)) {
      errors.rollNo = 'Please enter a valid roll number.'
    }
  }

  if (v.collegeType === 'OTHER') {
    if (!v.collegeName) {
      errors.collegeName = 'Please enter your college name.'
    } else if (v.collegeName.length > 120 || !COLLEGE_NAME.test(v.collegeName)) {
      errors.collegeName = 'Please enter a valid college name.'
    }
  }

  if (!v.branch) {
    errors.branch = 'Please enter your branch.'
  } else if (v.branch.length > 60 || !BRANCH.test(v.branch)) {
    errors.branch = 'Please enter a valid branch.'
  }

  if (!v.email) {
    errors.email = 'Please enter your email address.'
  } else if (v.email.length > 120 || !EMAIL.test(v.email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!v.phone) {
    errors.phone = 'Please enter your 10-digit phone number.'
  } else if (!PHONE.test(v.phone)) {
    errors.phone = 'Phone number must contain exactly 10 digits.'
  }

  if (event?.type === 'workshop' && !['VEG', 'NON_VEG'].includes(v.mealPreference)) {
    errors.mealPreference = 'Please choose Veg or Non-Veg for lunch.'
  }

  if (event?.type === 'workshop' && !STUDY_YEAR_OPTIONS.includes(v.year)) {
    errors.year = 'Please select your year of study.'
  }

  if (!v.transactionId) {
    errors.transactionId = 'Please enter your UTR / transaction ID.'
  } else if (
    v.transactionId.length < 4 ||
    v.transactionId.length > 50 ||
    !TRANSACTION_ID.test(v.transactionId)
  ) {
    errors.transactionId = 'Please enter a valid transaction ID.'
  }

  return errors
}
