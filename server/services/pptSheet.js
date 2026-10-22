export const PPT_EXTRA_HEADERS = [
  'Number of Participants',
  'Second Participant Name',
  'Presentation Topic',
  'Topic Abstract',
  'Payment Method',
  'Team size',
  'Topic abstract',
]

export function pptSheetValues(details) {
  return [details?.participantCount || '', details?.teamMemberName || '',
    details?.topicTitle || '', details?.topicAbstract || '', details?.paymentMethod || '',
    details?.participantCount || '', details?.topicAbstract || '']
}

export function pptDetailsFromRow(row) {
  return {
    participantCount: row[20] || row[15] || '', teamMemberName: row[16] || '',
    topicTitle: row[17] || '', topicAbstract: row[21] || row[18] || '', paymentMethod: row[19] || '',
  }
}

// Only add missing headers. Never clear, move, or overwrite registration rows.
export async function ensurePptSheet({ sheets, spreadsheetId, sheetName, baseHeaders }) {
  const headers = [...baseHeaders, ...PPT_EXTRA_HEADERS]
  const api = sheets.spreadsheets.values
  const { data } = await api.get({ spreadsheetId, range: `${sheetName}!A1:V1` })
  const existing = data.values?.[0] || []
  const fail = () => {
    const error = new Error('The PPT sheet has unexpected columns. Keep A:T in their existing order, with Team size in U and Topic abstract in V.')
    error.code = 'GOOGLE_SHEET_SCHEMA_MISMATCH'
    throw error
  }
  if (headers.every((header, index) => existing[index] === header)) return headers

  const populatedRows = await api.get({ spreadsheetId, range: `${sheetName}!A2:V` })
  const rows = populatedRows.data.values || []
  if (!existing.some((value) => String(value || '').trim())) {
    if (rows.some((row) => row.some((value) => String(value || '').trim()))) fail()
    await api.update({ spreadsheetId, range: `${sheetName}!A1:V1`,
      valueInputOption: 'RAW', requestBody: { values: [headers] } })
    return headers
  }

  // Support the original 14 columns plus an optional existing screenshot column.
  if (!baseHeaders.slice(0, 14).every((header, index) => existing[index] === header)) fail()
  for (let index = 14; index < headers.length; index += 1) {
    if (existing[index] && existing[index] !== headers[index]) fail()
    if (!existing[index] && rows.some((row) => String(row[index] || '').trim())) fail()
  }
  // Update only blank header cells; existing names and data are preserved.
  for (let index = 14; index < headers.length; index += 1) {
    if (existing[index] === headers[index]) continue
    const column = String.fromCharCode(65 + index)
    await api.update({ spreadsheetId, range: `${sheetName}!${column}1`,
      valueInputOption: 'RAW', requestBody: { values: [[headers[index]]] } })
  }
  return headers
}
