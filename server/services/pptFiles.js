import { Readable } from 'node:stream'

export function buildPptDetailsText(registration, details) {
  return [
    'PPT PRESENTATION — 31 October 2026',
    `Registration ID: ${registration.registrationId}`,
    `Number of participants: ${details.participantCount}`,
    `Participant 1: ${registration.name}`,
    ...(details.participantCount === '2' ? [`Participant 2: ${details.teamMemberName}`] : []),
    `Year: ${registration.year}`,
    `Class / branch: ${registration.branch}`,
    `Contact email: ${registration.email}`,
    `Contact phone: ${registration.phone}`,
    `Team fee: INR ${registration.amount}`,
    `Payment method: ${details.paymentMethod}`,
    `Payment reference: ${registration.transactionId}`,
    'Status at submission: PENDING — check the registration sheet for the current status',
    '',
    `Topic: ${details.topicTitle}`,
    '',
    'ABSTRACT',
    details.topicAbstract,
    '',
  ].join('\n')
}

// A folder link fits the existing Payment Screenshot column. No new sheet columns.
export async function storePptFiles({ registration, details, screenshot }, { drive, parentId }) {
  if (!parentId) throw new Error('PAYMENT_SCREENSHOT_FOLDER_ID is not configured.')
  const folder = await drive.files.create({
    supportsAllDrives: true,
    requestBody: {
      name: `${registration.registrationId}-PPT-Presentation`,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id,webViewLink',
  })
  const folderId = folder.data.id
  try {
    const file = (name, mimeType, bytes) => drive.files.create({
      supportsAllDrives: true,
      requestBody: { name, mimeType, parents: [folderId] },
      media: { mimeType, body: Readable.from(bytes) },
      fields: 'id',
    })
    await file('Team details and abstract.txt', 'text/plain',
      Buffer.from(buildPptDetailsText(registration, details), 'utf8'))
    if (screenshot) {
      const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[screenshot.mimeType]
      await file(`Payment screenshot.${extension}`, screenshot.mimeType, Buffer.from(screenshot.base64, 'base64'))
    }
    return { id: folderId, url: folder.data.webViewLink || `https://drive.google.com/drive/folders/${folderId}` }
  } catch (error) {
    try { await drive.files.delete({ fileId: folderId, supportsAllDrives: true }) }
    catch { console.error('Could not remove incomplete PPT registration folder:', folderId) }
    throw error
  }
}
