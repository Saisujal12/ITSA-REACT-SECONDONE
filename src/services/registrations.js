import {
  request,
} from "./api";

/*
|--------------------------------------------------------------------------
| Submit registration
|--------------------------------------------------------------------------
*/

export function submitRegistration(
  payload,
  { signal } = {},
) {
  return request(
    "/api/registrations",
    {
      method: "POST",
      body: payload,
      signal,
    },
  );
}

export function fetchPublicRegistrationCount(eventId, { signal } = {}) {
  return request(`/api/registrations/counts/${encodeURIComponent(eventId)}`, { signal });
}

export async function uploadAbstractDocument(file, { signal, onProgress } = {}) {
  const session = await request('/api/registrations/abstract-uploads', {
    method: 'POST', body: { fileName: file.name, size: file.size }, signal,
  })
  let offset = 0
  while (offset < file.size) {
    const bytes = new Uint8Array(await file.slice(offset, offset + session.chunkBytes).arrayBuffer())
    let binary = ''
    for (let index = 0; index < bytes.length; index += 8192) binary += String.fromCharCode(...bytes.subarray(index, index + 8192))
    const result = await request('/api/registrations/abstract-uploads/chunk', {
      method: 'POST', body: { token: session.token, offset, base64: btoa(binary) }, signal,
    })
    if (result.done) { onProgress?.(100); return result.document }
    if (!Number.isInteger(result.offset) || result.offset <= offset || result.offset > file.size) throw new Error('Document upload was interrupted. Choose the file again.')
    offset = result.offset
    onProgress?.(Math.floor(offset / file.size * 100))
  }
  throw new Error('Document upload did not complete.')
}
