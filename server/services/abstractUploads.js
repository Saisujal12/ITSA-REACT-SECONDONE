import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'node:crypto'

export const ABSTRACT_MAX_BYTES = 10 * 1024 * 1024
export const ABSTRACT_CHUNK_BYTES = 512 * 1024
const TYPES = { pdf: 'application/pdf', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
const invalid = (message) => Object.assign(new Error(message), { status: 400 })

// Tokens contain an encrypted Drive session, never OAuth credentials.
export function createAbstractUploads({ drive, auth, getParentId, getSecret }) {
  const key = () => {
    const secret = getSecret()
    if (!secret) throw new Error('Upload signing is not configured.')
    return createHash('sha256').update(`ppt-document-upload:${secret}`).digest()
  }
  const seal = (value) => {
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', key(), iv)
    const bytes = Buffer.concat([cipher.update(JSON.stringify({ ...value, expires: Date.now() + 3600000 })), cipher.final()])
    return Buffer.concat([iv, cipher.getAuthTag(), bytes]).toString('base64url')
  }
  const open = (token, kind) => {
    try {
      if (typeof token !== 'string' || token.length > 8192) throw new Error()
      const bytes = Buffer.from(token, 'base64url')
      const cipher = createDecipheriv('aes-256-gcm', key(), bytes.subarray(0, 12))
      cipher.setAuthTag(bytes.subarray(12, 28))
      const value = JSON.parse(Buffer.concat([cipher.update(bytes.subarray(28)), cipher.final()]).toString())
      if (value.kind !== kind || value.expires < Date.now()) throw new Error()
      return value
    } catch { throw invalid('The document upload expired or is invalid. Please choose the file again.') }
  }
  async function start({ fileName, size }) {
    const extension = String(fileName || '').split('.').pop().toLowerCase()
    if (!TYPES[extension] || !Number.isInteger(size) || size < 1 || size > ABSTRACT_MAX_BYTES) {
      throw invalid('Choose a PDF or DOCX document up to 10 MB.')
    }
    const parentId = getParentId()
    if (!parentId) throw new Error('Document storage is not configured.')
    const ids = await drive.files.generateIds({ count: 1, space: 'drive' })
    const fileId = ids.data.ids[0]
    const uploadId = randomUUID()
    const safeName = String(fileName).replace(/[^\p{L}\p{N} ._-]/gu, '_').slice(-120)
    const mimeType = TYPES[extension]
    const result = await auth.request({
      url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id',
      method: 'POST',
      headers: { 'X-Upload-Content-Type': mimeType, 'X-Upload-Content-Length': String(size), 'Content-Type': 'application/json' },
      data: { id: fileId, name: safeName, mimeType, parents: [parentId], appProperties: { purpose: 'ppt-abstract', uploadId } },
    })
    const sessionUrl = result.headers.get('location')
    const url = new URL(sessionUrl)
    if (url.protocol !== 'https:' || url.hostname !== 'www.googleapis.com' || !url.pathname.startsWith('/upload/drive/')) throw new Error('Invalid upload session.')
    return { token: seal({ kind: 'upload', fileId, uploadId, sessionUrl, size, mimeType, fileName: safeName }), chunkBytes: ABSTRACT_CHUNK_BYTES }
  }
  async function chunk({ token, offset, base64 }) {
    const upload = open(token, 'upload')
    if (typeof base64 !== 'string' || base64.length > 700000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) throw invalid('Invalid document chunk.')
    const bytes = Buffer.from(base64, 'base64')
    const end = offset + bytes.length
    if (!Number.isInteger(offset) || offset < 0 || offset % (256 * 1024) || !bytes.length ||
      bytes.length > ABSTRACT_CHUNK_BYTES || end > upload.size || (end < upload.size && bytes.length % (256 * 1024))) throw invalid('Invalid document chunk range.')
    if (offset === 0) {
      const signature = upload.mimeType === TYPES.pdf ? bytes.subarray(0, 5).toString() === '%PDF-' : bytes.subarray(0, 4).equals(Buffer.from([80, 75, 3, 4]))
      if (!signature) throw invalid('The file content does not match a PDF or DOCX document.')
    }
    const result = await auth.request({ url: upload.sessionUrl, method: 'PUT', data: bytes,
      headers: { 'Content-Type': upload.mimeType, 'Content-Length': String(bytes.length), 'Content-Range': `bytes ${offset}-${end - 1}/${upload.size}` },
      maxRedirects: 0, redirect: 'manual', retry: false, validateStatus: (status) => [200, 201, 308].includes(status),
    })
    if (result.status === 308) {
      const range = /bytes=0-(\d+)/.exec(result.headers.get('range') || '')
      const nextOffset = range ? Number(range[1]) + 1 : 0
      if (nextOffset <= offset || nextOffset > end) throw invalid('The document upload was interrupted. Choose the file again.')
      return { done: false, offset: nextOffset }
    }
    if (end !== upload.size || result.data.id !== upload.fileId) throw invalid('Document upload is incomplete.')
    const { sessionUrl: unusedSession, ...proof } = upload
    void unusedSession
    return { done: true, document: { receipt: seal({ ...proof, kind: 'document' }), fileName: upload.fileName } }
  }
  async function verify(document) {
    const proof = open(document?.receipt, 'document')
    const result = await drive.files.get({ fileId: proof.fileId, supportsAllDrives: true, fields: 'id,name,size,mimeType,parents,appProperties,trashed' })
    const file = result.data
    if (file.trashed || file.appProperties?.purpose !== 'ppt-abstract' || file.appProperties?.uploadId !== proof.uploadId ||
      file.mimeType !== proof.mimeType || Number(file.size) !== proof.size || !file.parents?.includes(getParentId())) throw invalid('The abstract document is unavailable. Please upload it again.')
    return { fileId: proof.fileId, fileName: file.name, url: `https://drive.google.com/file/d/${proof.fileId}/view` }
  }
  return { start, chunk, verify }
}
