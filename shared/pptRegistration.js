export const PPT_EVENT_ID = 'code-build'
export const PPT_TEAM_FEE = 200
export const PPT_ABSTRACT_MAX_LENGTH = 10000

const text = (value) => typeof value === 'string' ? value.trim() : ''
const NAME = /^\p{L}[\p{L}\p{M} .'-]*$/u

export function normalizePptDetails(values = {}) {
  return {
    participantCount: String(values?.participantCount ?? ''),
    teamMemberName: values?.participantCount === '2' || values?.participantCount === 2
      ? text(values.teamMemberName).replace(/\s+/g, ' ') : '',
    topicTitle: text(values?.topicTitle),
    topicAbstract: text(values?.topicAbstract),
    paymentMethod: text(values?.paymentMethod),
  }
}

export function validatePptDetails(values, { year, amount = PPT_TEAM_FEE } = {}) {
  const details = normalizePptDetails(values)
  const errors = {}
  if (!['1', '2'].includes(details.participantCount)) {
    errors.participantCount = 'Choose one or two participants.'
  }
  if (details.participantCount === '2' && (
    !details.teamMemberName || details.teamMemberName.length > 80 || !NAME.test(details.teamMemberName)
  )) {
    errors.teamMemberName = 'Enter your second team member’s full name.'
  }
  if (!details.topicTitle || details.topicTitle.length > 200) {
    errors.topicTitle = 'Enter your presentation topic (up to 200 characters).'
  }
  if (!details.topicAbstract || details.topicAbstract.length > PPT_ABSTRACT_MAX_LENGTH) {
    errors.topicAbstract = 'Enter your topic abstract (up to 10,000 characters).'
  }
  if (!['cash', 'online'].includes(details.paymentMethod)) {
    errors.paymentMethod = 'Choose cash or online payment.'
  }
  if (!['1st', '2nd', '3rd', '4th'].includes(year)) {
    errors.year = 'Please select your year of study.'
  }
  if (Number(amount) !== PPT_TEAM_FEE) errors.amount = 'The PPT team registration fee is ₹200.'
  return errors
}
