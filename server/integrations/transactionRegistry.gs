/**
 * SUMSHODHINI transaction-ID registry.
 *
 * Deploy this file as a Google Apps Script Web App. The registry spreadsheet
 * is persistent storage and LockService makes reservation atomic across
 * simultaneous requests.
 *
 * Script Properties required:
 *   REGISTRY_SECRET
 *   REGISTRY_SPREADSHEET_ID
 */

const REGISTRY_SHEET_NAME = 'TransactionRegistry'
const REGISTRY_HEADERS = [
  'Transaction ID',
  'Status',
  'Registration ID',
  'Reserved At',
  'Updated At',
]

function doPost(e) {
  try {
    const expectedSecret = PropertiesService.getScriptProperties().getProperty('REGISTRY_SECRET')
    const bodyForAuth = JSON.parse(e?.postData?.contents || '{}')
    const suppliedSecret = String(bodyForAuth.secret || '')

    if (!expectedSecret || suppliedSecret !== expectedSecret) {
      return json({ success: false, code: 'UNAUTHORIZED', message: 'Unauthorized.' }, 401)
    }

    const body = bodyForAuth
    const action = String(body.action || '').trim().toLowerCase()
    const transactionId = String(body.transactionId || '').trim()
    const registrationId = String(body.registrationId || '').trim()

    if (!transactionId) {
      return json({ success: false, code: 'INVALID_TRANSACTION_ID', message: 'Transaction ID is required.' }, 400)
    }

    if (!['reserve', 'commit', 'release'].includes(action)) {
      return json({ success: false, code: 'INVALID_ACTION', message: 'Invalid registry action.' }, 400)
    }

    const lock = LockService.getScriptLock()
    lock.waitLock(10000)

    try {
      const sheet = getRegistrySheet()
      const row = findTransactionRow(sheet, transactionId)

      if (action === 'reserve') {
        if (row) {
          return json({
            success: false,
            code: 'TRANSACTION_ID_ALREADY_USED',
            message: 'Transaction ID already exists.',
          }, 409)
        }

        const now = new Date().toISOString()
        sheet.appendRow([transactionId, 'RESERVED', registrationId, now, now])
        return json({ success: true, status: 'RESERVED' })
      }

      if (!row) {
        return json({ success: false, code: 'TRANSACTION_NOT_RESERVED', message: 'Transaction ID is not reserved.' }, 404)
      }

      if (action === 'commit') {
        const status = String(sheet.getRange(row, 2).getValue() || '').toUpperCase()
        if (status === 'COMMITTED') {
          return json({ success: true, status: 'COMMITTED' })
        }
        sheet.getRange(row, 2, 1, 3).setValues([['COMMITTED', registrationId, new Date().toISOString()]])
        return json({ success: true, status: 'COMMITTED' })
      }

      const existingRegistrationId = String(sheet.getRange(row, 3).getValue() || '')
      const status = String(sheet.getRange(row, 2).getValue() || '').toUpperCase()
      if (status === 'COMMITTED') {
        return json({ success: false, code: 'ALREADY_COMMITTED', message: 'Committed transaction cannot be released.' }, 409)
      }
      if (registrationId && existingRegistrationId && registrationId !== existingRegistrationId) {
        return json({ success: false, code: 'REGISTRATION_MISMATCH', message: 'Reservation does not belong to this registration.' }, 409)
      }

      sheet.deleteRow(row)
      return json({ success: true, status: 'RELEASED' })
    } finally {
      lock.releaseLock()
    }
  } catch (error) {
    console.error(error)
    return json({ success: false, code: 'REGISTRY_ERROR', message: 'Transaction registry error.' }, 500)
  }
}

function getRegistrySheet() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('REGISTRY_SPREADSHEET_ID')
  if (!spreadsheetId) throw new Error('REGISTRY_SPREADSHEET_ID is not configured.')

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId)
  let sheet = spreadsheet.getSheetByName(REGISTRY_SHEET_NAME)

  if (!sheet) sheet = spreadsheet.insertSheet(REGISTRY_SHEET_NAME)

  const headerRange = sheet.getRange(1, 1, 1, REGISTRY_HEADERS.length)
  const current = headerRange.getValues()[0]
  if (REGISTRY_HEADERS.some((header, index) => current[index] !== header)) {
    headerRange.setValues([REGISTRY_HEADERS])
  }

  return sheet
}

function findTransactionRow(sheet, transactionId) {
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return null

  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues()
  for (let index = 0; index < values.length; index += 1) {
    if (String(values[index][0] || '').trim() === transactionId) return index + 2
  }
  return null
}

function json(payload, status) {
  // Apps Script ContentService does not provide a normal response-status API.
  // httpStatus is included so the Node backend can handle conflicts explicitly.
  return ContentService
    .createTextOutput(JSON.stringify({ ...payload, httpStatus: status || 200 }))
    .setMimeType(ContentService.MimeType.JSON)
}