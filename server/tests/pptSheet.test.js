import assert from 'node:assert/strict'
import { beforeEach, mock, test } from 'node:test'
import { ensurePptSheet, PPT_EXTRA_HEADERS, pptDetailsFromRow, pptSheetValues } from '../services/pptSheet.js'

const BASE = ['Registration ID', 'Name', 'College Type', 'College Name', 'Roll No', 'Year', 'Branch',
  'Email', 'Phone no', 'Veg/Non-veg', 'UTR/Transaction ID', 'Status', 'Created AT', 'Updated AT', 'Payment Screenshot']
let headers, rows, updates, appends
function reset() { headers = [...BASE]; rows = []; updates = []; appends = [] }
reset()
const sheets = { spreadsheets: {
  get: async () => ({ data: { sheets: [{ properties: { title: 'Registrations', sheetId: 0, gridProperties: { columnCount: 26 } } }] } }),
  batchUpdate: async () => ({ data: {} }),
  values: {
  get: async ({ range }) => ({ data: { values: range.includes('A1:') || range.endsWith('!1:1') ? [headers] : rows } }),
  update: async (input) => { updates.push(input); return { data: {} } },
  append: async (input) => { appends.push(input); return { data: {} } },
  clear: async () => { throw new Error('Migration must never clear existing cells') },
} } }
const ensure = () => ensurePptSheet({ sheets, spreadsheetId: 'ppt-sheet', sheetName: 'Registrations', baseHeaders: BASE })
mock.module('googleapis', { namedExports: { google: {
  auth: { GoogleAuth: class {}, OAuth2: class { setCredentials() {} } },
  sheets: () => sheets, drive: () => ({}),
} } })
process.env.GOOGLE_SERVICE_ACCOUNT_JSON = '{}'
process.env.EVENT_SHEET_ID_CODE_BUILD = 'ppt-sheet'
process.env.EVENT_SHEET_ID_LLM = 'workshop-sheet'
const { appendRegistration, getRegistrationRows, updateRegistrationStatus } = await import('../config/googleSheets.js')
beforeEach(reset)

const details = { participantCount: '2', teamMemberName: 'Second Student', topicTitle: '=Topic',
  topicAbstract: 'First paragraph.\n\nSecond paragraph.', paymentMethod: 'online' }

test('PPT migration adds missing fields while preserving all old registration data', async () => {
  rows = [['IT-old', 'Existing Student', ...Array(12).fill('unchanged'), 'https://drive.google.com/drive/folders/old']]
  const before = structuredClone(rows)
  assert.deepEqual(await ensure(), [...BASE, ...PPT_EXTRA_HEADERS.slice(0, 5)])
  assert.deepEqual(rows, before)
  assert.deepEqual(updates.map((input) => input.range), ['Registrations!P1', 'Registrations!Q1', 'Registrations!R1', 'Registrations!S1', 'Registrations!T1'])
})

test('fully migrated sheets need no further header writes', async () => {
  headers = [...BASE, ...PPT_EXTRA_HEADERS]
  await ensure()
  assert.equal(updates.length, 0)
})

test('legacy 14-column sheets gain screenshot and PPT headers without clearing data', async () => {
  headers = BASE.slice(0, 14)
  rows = [['IT-old', 'Student']]
  await ensure()
  assert.equal(updates[0].range, 'Registrations!O1')
  assert.equal(updates.length, 6)
})

test('migration preserves custom columns and refuses to overwrite unlabeled data', async () => {
  headers = [...BASE, 'Staff notes']
  const migrated = await ensure()
  assert.equal(migrated[15], 'Staff notes')
  assert.equal(updates[0].range, 'Registrations!Q1')
  updates.length = 0
  headers = [...BASE]
  rows = [[...Array(15).fill(''), 'Important existing value']]
  await assert.rejects(ensure(), { code: 'GOOGLE_SHEET_SCHEMA_MISMATCH' })
  assert.equal(updates.length, 0)
})

test('empty PPT tabs receive a complete header, headerless tabs with data are rejected', async () => {
  headers = []
  await ensure()
  assert.deepEqual(updates[0].requestBody.values, [[...BASE, ...PPT_EXTRA_HEADERS]])
  updates.length = 0
  rows = [['Do not overwrite']]
  await assert.rejects(ensure(), { code: 'GOOGLE_SHEET_SCHEMA_MISMATCH' })
  assert.equal(updates.length, 0)
})

test('PPT append fills both team-size and abstract columns in A:V as RAW values', async () => {
  headers = [...BASE, ...PPT_EXTRA_HEADERS]
  await appendRegistration({ eventId: 'code-build', registrationId: 'IT-test', name: 'First Student',
    pptDetails: details, year: '2nd', paymentScreenshotUrl: 'https://drive.google.com/drive/folders/folder' })
  assert.equal(appends[0].range, 'Registrations!A:V')
  assert.equal(appends[0].valueInputOption, 'RAW')
  const row = appends[0].requestBody.values[0]
  assert.equal(row.length, 22)
  assert.equal(row[20], details.participantCount)
  assert.equal(row[21], details.topicAbstract)
  assert.equal(row[1], 'First Student')
  assert.equal(row[14], 'https://drive.google.com/drive/folders/folder')
  assert.deepEqual(pptDetailsFromRow(row), details)
})

test('admin reads both new PPT details and old rows without hiding old registrations', async () => {
  headers = [...BASE, ...PPT_EXTRA_HEADERS]
  rows = [['IT-old', 'Old Student'], ['IT-new', 'New Student', ...Array(13).fill(''), '2', 'Second Student', '=Topic', 'First paragraph.\n\nSecond paragraph.', 'online']]
  const registrations = await getRegistrationRows('code-build')
  assert.equal(registrations.length, 2)
  assert.deepEqual(registrations[0].pptDetails, details)
  assert.equal(registrations[1].pptDetails.participantCount, '')
})

test('verification updates only status/timestamps and retains PPT fields in the response', async () => {
  headers = [...BASE, ...PPT_EXTRA_HEADERS]
  const row = ['IT-new', 'New Student', ...Array(9).fill(''), 'PENDING', 'created', '', 'folder',
    '2', 'Second Student', '=Topic', 'First paragraph.\n\nSecond paragraph.', 'online']
  rows = [row]
  const result = await updateRegistrationStatus('code-build', 2, 'VERIFIED')
  assert.deepEqual(result.pptDetails, details)
  assert.equal(updates.length, 1)
  assert.equal(updates[0].range, 'Registrations!L2:N2')
  assert.equal(row[16], 'Second Student')
})

test('other event sheets keep the original 15-column append', async () => {
  await appendRegistration({ eventId: 'llm', registrationId: 'IT-workshop', name: 'Workshop Student' })
  assert.equal(appends[0].range, 'Registrations!A:O')
  assert.equal(appends[0].requestBody.values[0].length, 15)
  assert.equal(updates.length, 0)
})

test('registration accepts reordered extra fields and header spacing/capitalization', async () => {
  headers = [...BASE.map((header) => ` ${header.toUpperCase()} `), 'TEAM SIZE', ' Topic abstract ', 'Payment method', 'Presentation Topic', 'Second participant name']
  const before = [...headers]
  await appendRegistration({ eventId: 'code-build', registrationId: 'IT-test', pptDetails: details })
  assert.equal(updates.length, 0)
  assert.deepEqual(headers, before)
  const row = appends[0].requestBody.values[0]
  assert.equal(appends[0].range, 'Registrations!A:T')
  assert.equal(row[15], '2')
  assert.equal(row[16], details.topicAbstract)
  assert.equal(row[19], 'Second Student')
  assert.deepEqual(pptDetailsFromRow(row, headers), details)
})

test('both existing abstract columns and both team-size columns receive matching values', async () => {
  headers = [...BASE, ' Team Size ', 'Second Participant Name', 'Presentation Topic', 'TOPIC ABSTRACT', 'Payment Method', 'number of participants', 'topic abstract ']
  assert.deepEqual(await ensure(), headers)
  const extra = pptSheetValues(details, headers)
  assert.equal(extra[0], extra[5])
  assert.equal(extra[3], extra[6])
  assert.equal(updates.length, 0)
})

test('base header mismatch reports the exact column without clearing any registration data', async () => {
  headers[4] = 'Staff notes'
  await assert.rejects(ensure(), /column E must be "Roll No"/)
  assert.equal(updates.length, 0)
})
