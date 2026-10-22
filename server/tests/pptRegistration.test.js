import assert from 'node:assert/strict'
import { beforeEach, mock, test } from 'node:test'
import { validatePptDetails, normalizePptDetails } from '../../shared/pptRegistration.js'
import { storePptFiles } from '../services/pptFiles.js'

const details = {
  participantCount: '2', teamMemberName: 'Second Student',
  topicTitle: 'AI in education', topicAbstract: '', abstractDocument: {receipt: 'valid-test-document', fileName: 'abstract.pdf'}, paymentMethod: 'online',
}
const calls = { reserve: [], commit: [], release: [], append: [], upload: [], delete: [] }
let failAppend = false
mock.module(new URL('../config/googleSheets.js', import.meta.url).href, {
  namedExports: {
    getRegistrationRows: async () => [],
    abstractUploads: { verify: async (document) => { if (document?.receipt !== 'valid-test-document') throw new Error('Invalid upload'); return {fileId: 'uploaded-abstract', fileName: 'abstract.pdf', url: 'https://drive.google.com/file/d/uploaded-abstract/view'} } },
    uploadPaymentScreenshot: async (value) => { calls.upload.push(value); return { id: 'receipt', url: 'https://drive.google.com/file/d/receipt/view' } },
    uploadPptRegistrationFiles: async (value) => { calls.upload.push(value); return { id: 'team-folder', url: 'https://drive.google.com/drive/folders/team-folder', abstractUrl: 'https://drive.google.com/file/d/copied-abstract/view' } },
    deletePaymentScreenshot: async (id) => { calls.delete.push(id) },
    appendRegistration: async (value) => { calls.append.push(value); if (failAppend) throw new Error('Sheet unavailable'); return value },
  },
})
mock.module(new URL('../services/emailService.js', import.meta.url).href, {
  namedExports: { sendRegistrationPendingEmail: async () => {} },
})
mock.module(new URL('../services/transactionRegistry.js', import.meta.url).href, {
  namedExports: {
    normalizeTransactionId: (value) => String(value || '').trim(),
    reserveTransactionId: async (...args) => { calls.reserve.push(args) },
    commitTransactionId: async (...args) => { calls.commit.push(args) },
    releaseTransactionId: async (...args) => { calls.release.push(args) },
  },
})
const { createRegistration } = await import('../controllers/registrationController.js')
beforeEach(() => { for (const values of Object.values(calls)) values.length = 0; failAppend = false })

function body(overrides = {}) {
  return {
    eventId: 'code-build', event: 'PPT Presentation', name: 'First Student', collegeType: 'KITSW',
    rollNo: 'B24IT123', year: '2nd', branch: 'IT A', email: 'student@example.com', phone: '9876543210',
    amount: 200, transactionId: 'UTR12345', pptDetails: { ...details },
    paymentScreenshot: { fileName: 'receipt.png', dataUrl: `data:image/png;base64,${Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).toString('base64')}` },
    ...overrides,
  }
}
async function submit(value) {
  const response = { statusCode: 200, status(code) { this.statusCode = code; return this }, json(data) { this.data = data; return this } }
  await createRegistration({ body: value }, response)
  return response
}

test('solo normalization discards a hidden teammate and enforces the same team fee', () => {
  assert.equal(normalizePptDetails({ ...details, participantCount: '1' }).teamMemberName, '')
  assert.deepEqual(validatePptDetails(details, { year: '2nd', amount: 200 }), {})
  assert.ok(validatePptDetails(details, { year: '2nd', amount: 400 }).amount)
  assert.ok(validatePptDetails({ ...details, participantCount: '3' }, { year: '2nd' }).participantCount)
})

test('missing abstract documents and missing teammate/year are rejected before storage', async () => {
  for (const change of [{ teamMemberName: '' }, { topicTitle: '' }, { abstractDocument: null }, { abstractDocument: {receipt: ''} }, { paymentMethod: 'other' }]) {
    assert.equal((await submit(body({ pptDetails: { ...details, ...change } }))).statusCode, 400)
  }
  assert.equal((await submit(body({ year: '' }))).statusCode, 400)
  assert.equal((await submit(body({ amount: 1 }))).statusCode, 400)
  assert.equal(calls.upload.length, 0)
  assert.equal(calls.append.length, 0)
})

test('online team stores the Drive folder link and preserves payment deduplication', async () => {
  const response = await submit(body())
  assert.equal(response.statusCode, 201)
  assert.equal(calls.append[0].amount, 200)
  assert.equal(calls.append[0].year, '2nd')
  assert.equal(calls.append[0].pptDetails.topicAbstract, 'https://drive.google.com/file/d/copied-abstract/view')
  assert.equal(calls.append[0].paymentScreenshotUrl, 'https://drive.google.com/drive/folders/team-folder')
  assert.equal(calls.upload[0].details.teamMemberName, 'Second Student')
  assert.ok(calls.upload[0].screenshot)
  assert.equal(calls.reserve.length, 1)
  assert.equal(calls.commit.length, 1)
})

test('cash solo registration needs no screenshot/UTR and stays pending for verification', async () => {
  const response = await submit(body({ transactionId: '', paymentScreenshot: null,
    pptDetails: { ...details, participantCount: '1', paymentMethod: 'cash' } }))
  assert.equal(response.statusCode, 201)
  assert.equal(calls.append[0].status, 'PENDING')
  assert.match(calls.append[0].transactionId, /^CASH-/)
  assert.equal(calls.upload[0].screenshot, null)
  assert.equal(calls.upload[0].details.teamMemberName, '')
  assert.equal(calls.reserve.length + calls.commit.length, 0)
})

test('online registrations still require valid payment proof and a UTR', async () => {
  assert.equal((await submit(body({ paymentScreenshot: null }))).statusCode, 400)
  assert.equal((await submit(body({ transactionId: '' }))).statusCode, 400)
  assert.equal(calls.append.length, 0)
})

test('failed sheet append removes the folder and releases the online payment reference', async () => {
  failAppend = true
  const response = await submit(body())
  assert.equal(response.statusCode, 500)
  assert.deepEqual(calls.delete, ['team-folder'])
  assert.equal(calls.release.length, 1)
  assert.equal(calls.commit.length, 0)
})

test('workshop registration continues to use its existing screenshot path', async () => {
  const response = await submit(body({ eventId: 'llm', event: 'Workshop', pptDetails: undefined, amount: 500, mealPreference: 'VEG' }))
  assert.equal(response.statusCode, 201)
  assert.equal(calls.upload[0].registrationId, calls.append[0].registrationId)
  assert.equal(calls.upload[0].details, undefined)
  assert.equal(calls.append[0].amount, 500)
})

test('Drive folder contains readable team details, abstract and receipt without public permissions', async () => {
  const files = []
  const drive = { files: {
    copy: async () => ({data: {id: 'copied-abstract'}}),
    create: async (input) => {
      if (input.media) {
        const chunks = []; for await (const chunk of input.media.body) chunks.push(Buffer.from(chunk))
        files.push({ metadata: input.requestBody, contents: Buffer.concat(chunks).toString() })
      }
      return { data: { id: input.media ? 'file-id' : 'folder-id' } }
    },
    delete: async () => { throw new Error('Unexpected cleanup') },
  } }
  const result = await storePptFiles({ registration: { ...body(), registrationId: 'IT-test' }, details, screenshot: { mimeType: 'image/png', base64: 'aGVsbG8=' } }, { drive, parentId: 'private-parent' })
  assert.equal(result.url, 'https://drive.google.com/drive/folders/folder-id')
  assert.equal(files.length, 2)
  assert.match(files[0].contents, /Participant 2: Second Student/)
  assert.match(files[0].contents, /AI in education/)
  assert.match(files[0].contents, /https:\/\/drive.google.com\/file\/d\/copied-abstract\/view/)
  assert.equal(files[1].metadata.mimeType, 'image/png')
  assert.deepEqual(files[0].metadata.parents, ['folder-id'])
})

test('Drive upload failure removes the incomplete folder and propagates the failure', async () => {
  const removed = []
  const drive = { files: {
    copy: async () => ({data: {id: 'copied-abstract'}}),
    create: async (input) => { if (input.media) throw new Error('Upload failed'); return { data: { id: 'incomplete' } } },
    delete: async ({ fileId }) => { removed.push(fileId) },
  } }
  await assert.rejects(storePptFiles({ registration: { ...body(), registrationId: 'IT-test' }, details }, { drive, parentId: 'parent' }), /Upload failed/)
  assert.deepEqual(removed, ['incomplete'])
})
