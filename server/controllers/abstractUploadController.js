import { abstractUploads } from '../config/googleSheets.js'

const handler = (action) => async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store').json(await abstractUploads[action](req.body || {}))
  } catch (error) {
    console.error('PPT abstract upload failed:', error.status || error.code || 'storage error')
    res.status(error.status === 400 ? 400 : 503).json({ success: false,
      message: error.status === 400 ? error.message : 'Document upload is unavailable. Please try again.' })
  }
}
export const startAbstractUpload = handler('start')
export const uploadAbstractChunk = handler('chunk')
