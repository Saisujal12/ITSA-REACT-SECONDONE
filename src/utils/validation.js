/*
  Registration form validation.
  Keeps the legacy rules (all fields required, email pattern, 10–15 character
  phone number) and adds the fields the backend requires (roll no, year,
  branch). Text patterns also reject values starting with spreadsheet
  formula characters, since submissions are written to Google Sheets.
*/

export const YEAR_OPTIONS = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
]

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE = /^[0-9+()-]{10,15}$/
const NAME = /^\p{L}[\p{L}\p{M} .'-]*$/u
const ROLL_NO = /^[A-Za-z0-9][A-Za-z0-9/-]*$/
const BRANCH = /^\p{L}[\p{L}\p{M}0-9 .&()/-]*$/u
const TRANSACTION_ID = /^[A-Za-z0-9][A-Za-z0-9-]*$/

export const EMPTY_REGISTRATION = {
  name: '',
  rollNo: '',
  year: '',
  branch: '',
  email: '',
  phone: '',
  transactionId: '',
}

export function normalizeRegistration(values) {
  return {
    name: values.name.trim().replace(/\s+/g, ' '),
    rollNo: values.rollNo.trim().toUpperCase(),
    year: values.year,
    branch: values.branch.trim().replace(/\s+/g, ' '),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.replace(/\s+/g, ''),
    transactionId: values.transactionId.trim(),
  }
}

/** Returns an object of field → message for every invalid field. */
export function validateRegistration(values) {
  const v = normalizeRegistration(values)
  const errors = {}

  if (!v.name) errors.name = 'Please enter your full name.'
  else if (v.name.length > 80 || !NAME.test(v.name)) errors.name = 'Please enter a valid name using letters only.'

  if (!v.rollNo) errors.rollNo = 'Please enter your roll number.'
  else if (v.rollNo.length > 20 || !ROLL_NO.test(v.rollNo)) errors.rollNo = 'Please enter a valid roll number.'

  if (!YEAR_OPTIONS.some((option) => option.value === v.year)) errors.year = 'Please select your year of study.'

  if (!v.branch) errors.branch = 'Please enter your branch.'
  else if (v.branch.length > 60 || !BRANCH.test(v.branch)) errors.branch = 'Please enter a valid branch name.'

  if (!v.email) errors.email = 'Please enter your email address.'
  else if (v.email.length > 120 || !EMAIL.test(v.email)) errors.email = 'Please enter a valid email address.'

  if (!v.phone) errors.phone = 'Please enter your phone number.'
  else if (!PHONE.test(v.phone)) errors.phone = 'Please enter a valid phone number.'

  if (!v.transactionId) errors.transactionId = 'Please enter your payment UTR / transaction ID.'
  else if (v.transactionId.length < 6 || v.transactionId.length > 40 || !TRANSACTION_ID.test(v.transactionId))
    errors.transactionId = 'Please enter the transaction ID exactly as shown in your payment app.'

  return errors
}
