export const PPT_EXTRA_HEADERS = [
  'Number of Participants', 'Second Participant Name', 'Presentation Topic',
  'Topic Abstract', 'Payment Method', 'Team size', 'Topic abstract',
]

const normalized = (header) => String(header ?? '').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]/g, '')
const fields = {
  numberofparticipants: 'participantCount', teamsize: 'participantCount',
  secondparticipantname: 'teamMemberName', secondparticipant: 'teamMemberName', teammembername: 'teamMemberName',
  presentationtopic: 'topicTitle', topic: 'topicTitle',
  topicabstract: 'topicAbstract', abstract: 'topicAbstract', abstractdocument: 'topicAbstract',
  paymentmethod: 'paymentMethod', paymentmode: 'paymentMethod',
}
const defaultHeaders = [...Array(15).fill(''), ...PPT_EXTRA_HEADERS]
const baseAlias = (header) => ({ phonenumber: 'phoneno', rollnumber: 'rollno', transactionid: 'utrtransactionid' }[normalized(header)] || normalized(header))

export function pptLastColumn(headers) {
  let number = headers.length
  let column = ''
  while (number > 0) {
    number -= 1
    column = String.fromCharCode(65 + number % 26) + column
    number = Math.floor(number / 26)
  }
  return column
}

export function pptSheetValues(details, headers = defaultHeaders) {
  return headers.slice(15).map((header) => details?.[fields[normalized(header)]] || '')
}

export function pptDetailsFromRow(row, headers = defaultHeaders) {
  const details = { participantCount: '', teamMemberName: '', topicTitle: '', topicAbstract: '', paymentMethod: '' }
  headers.forEach((header, index) => {
    const field = index >= 15 && fields[normalized(header)]
    if (field && row[index]) details[field] = row[index]
  })
  return details
}

// The original A:O fields retain their positions. Extra fields are mapped by name.
export async function ensurePptSheet({ sheets, spreadsheetId, sheetName, baseHeaders }) {
  const api = sheets.spreadsheets.values
  const { data } = await api.get({ spreadsheetId, range: `${sheetName}!1:1` })
  const existing = data.values?.[0] || []
  const fail = (message) => { throw Object.assign(new Error(message), { code: 'GOOGLE_SHEET_SCHEMA_MISMATCH' }) }
  const empty = !existing.some((value) => String(value || '').trim())
  if (!empty) {
    for (let index = 0; index < baseHeaders.length; index += 1) {
      if (index === 14 && !existing[index]) continue
      if (baseAlias(existing[index]) !== baseAlias(baseHeaders[index])) {
        fail(`PPT sheet column ${pptLastColumn(Array(index + 1))} must be "${baseHeaders[index]}"; found "${existing[index] || '(empty)'}". Existing rows were not changed.`)
      }
    }
  }
  const headers = empty ? [...baseHeaders, ...PPT_EXTRA_HEADERS] : [...existing]
  if (!empty && !headers[14]) headers[14] = baseHeaders[14]
  if (!empty) {
    const present = new Set(headers.slice(15).map((header) => fields[normalized(header)]).filter(Boolean))
    for (const header of PPT_EXTRA_HEADERS) {
      const field = fields[normalized(header)]
      if (!present.has(field)) { headers.push(header); present.add(field) }
    }
  }
  if (headers.length === existing.length && headers.every((header, index) => header === existing[index])) return headers

  const metadata = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets(properties(sheetId,title,gridProperties(columnCount)))' })
  const tab = metadata.data.sheets.find((sheet) => sheet.properties.title === sheetName)?.properties
  if (!tab) fail('The configured PPT registration tab was not found.')
  const width = Math.min(tab.gridProperties.columnCount, Math.max(22, headers.length))
  const rows = (await api.get({ spreadsheetId, range: `${sheetName}!A2:${pptLastColumn(Array(width))}` })).data.values || []
  if (empty && rows.some((row) => row.some((value) => String(value || '').trim()))) fail('The PPT sheet has data but no header row. Restore the headers before registering; no data was changed.')
  for (let index = 14; index < headers.length; index += 1) {
    if (!existing[index] && headers[index] && rows.some((row) => String(row[index] || '').trim())) {
      fail(`PPT column ${pptLastColumn(Array(index + 1))} contains data without a header. Add its header first; no data was changed.`)
    }
  }
  if (tab.gridProperties.columnCount < headers.length) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: [{ appendDimension: {
      sheetId: tab.sheetId, dimension: 'COLUMNS', length: headers.length - tab.gridProperties.columnCount,
    } }] } })
  }
  if (empty) {
    await api.update({ spreadsheetId, range: `${sheetName}!A1:${pptLastColumn(headers)}1`, valueInputOption: 'RAW', requestBody: { values: [headers] } })
  } else {
    for (let index = 14; index < headers.length; index += 1) {
      if (headers[index] === existing[index]) continue
      await api.update({ spreadsheetId, range: `${sheetName}!${pptLastColumn(Array(index + 1))}1`, valueInputOption: 'RAW', requestBody: { values: [[headers[index]]] } })
    }
  }
  return headers
}
