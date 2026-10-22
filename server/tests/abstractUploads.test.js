import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createAbstractUploads, ABSTRACT_MAX_BYTES, ABSTRACT_CHUNK_BYTES } from '../services/abstractUploads.js'

function fixture() {
  const calls = []
  let metadata
  const state = { mismatch: false, partialAck: false }
  const drive = { files: {
    generateIds: async () => ({ data: { ids: ['generated-file'] } }),
    get: async () => ({ data: { ...metadata, size: state.mismatch ? 999999 : metadata.size, trashed: false } }),
  } }
  const auth = { request: async (input) => {
    calls.push(input)
    if (input.method === 'POST') {
      metadata = { ...input.data, size: Number(input.headers['X-Upload-Content-Length']) }
      return { headers: new Headers({ location: 'https://www.googleapis.com/upload/drive/v3/files?upload_id=private-session' }) }
    }
    const match = /bytes (\d+)-(\d+)\/(\d+)/.exec(input.headers['Content-Range'])
    const end = Number(match[2]), total = Number(match[3])
    if (end + 1 < total || state.partialAck) return { status: 308, headers: new Headers({ range: `bytes=0-${end}` }) }
    return { status: 200, data: { id: 'generated-file' } }
  } }
  const service = createAbstractUploads({ drive, auth, getParentId: () => 'private-parent', getSecret: () => 'test-upload-signing-secret' })
  return { service, calls, state }
}

test('PDF uploads return a verifiable receipt without revealing the Drive session or credentials', async () => {
  const { service, calls } = fixture()
  const pdf = Buffer.from('%PDF-1.7\nAbstract content')
  const start = await service.start({ fileName: 'my abstract.pdf', size: pdf.length })
  assert.equal(start.chunkBytes, ABSTRACT_CHUNK_BYTES)
  assert.ok(!start.token.includes('private-session'))
  const result = await service.chunk({ token: start.token, offset: 0, base64: pdf.toString('base64') })
  assert.equal(result.done, true)
  assert.equal(result.document.fileName, 'my abstract.pdf')
  const verified = await service.verify(result.document)
  assert.equal(verified.fileId, 'generated-file')
  assert.equal(verified.url, 'https://drive.google.com/file/d/generated-file/view')
  assert.equal(calls[1].redirect, 'manual')
})

test('DOCX upload supports 10 MB with small server requests and respects Google acknowledgements', async () => {
  const { service, calls } = fixture()
  const start = await service.start({ fileName: 'abstract.docx', size: ABSTRACT_MAX_BYTES })
  let result
  for (let offset = 0; offset < ABSTRACT_MAX_BYTES; offset += ABSTRACT_CHUNK_BYTES) {
    const bytes = Buffer.alloc(ABSTRACT_CHUNK_BYTES)
    if (!offset) Buffer.from([80, 75, 3, 4]).copy(bytes)
    result = await service.chunk({ token: start.token, offset, base64: bytes.toString('base64') })
    if (!result.done) assert.equal(result.offset, offset + ABSTRACT_CHUNK_BYTES)
  }
  assert.equal(result.done, true)
  assert.equal(calls.length, 21)
  assert.ok(calls.slice(1).every((call) => call.data.length <= ABSTRACT_CHUNK_BYTES))
})

test('invalid file types and oversized/empty documents are rejected before creating a session', async () => {
  const { service, calls } = fixture()
  for (const value of [{ fileName: 'bad.exe', size: 10 }, { fileName: 'large.pdf', size: ABSTRACT_MAX_BYTES + 1 }, { fileName: 'empty.pdf', size: 0 }]) {
    await assert.rejects(service.start(value), { status: 400 })
  }
  assert.equal(calls.length, 0)
})

test('forged upload receipts, invalid ranges and fake PDFs are rejected', async () => {
  const { service } = fixture()
  const { token } = await service.start({ fileName: 'abstract.pdf', size: 7 })
  await assert.rejects(service.chunk({ token: 'forged-token', offset: 0, base64: 'aGVsbG8=' }), { status: 400 })
  await assert.rejects(service.chunk({ token, offset: 1, base64: 'aGVsbG8=' }), { status: 400 })
  await assert.rejects(service.chunk({ token, offset: 0, base64: 'aGVsbG8=' }), { status: 400 })
  await assert.rejects(service.verify({ receipt: token }), { status: 400 })
})

test('registration rejects a document whose Drive metadata does not match its signed receipt', async () => {
  const { service, state } = fixture()
  const bytes = Buffer.from('%PDF-test')
  const start = await service.start({ fileName: 'abstract.pdf', size: bytes.length })
  const result = await service.chunk({ token: start.token, offset: 0, base64: bytes.toString('base64') })
  state.mismatch = true
  await assert.rejects(service.verify(result.document), { status: 400 })
})
