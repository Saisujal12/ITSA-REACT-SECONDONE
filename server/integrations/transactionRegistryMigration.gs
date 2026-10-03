/**
 * One-time migration/audit helpers for the transaction registry.
 *
 * Configure these Script Properties before running:
 *   REGISTRATION_SPREADSHEET_IDS = comma-separated existing event spreadsheet IDs
 *   REGISTRATION_SHEET_TAB_NAME = Registrations (or the actual tab name)
 *
 * Run `auditExistingTransactionIds()` first. It creates an audit sheet and
 * reports duplicate transaction IDs without deleting or modifying registration
 * rows.
 *
 * After reviewing the audit, run `backfillExistingTransactionIds()` to add
 * unique existing IDs to the registry as COMMITTED. Existing duplicate rows
 * are not deleted; their audit entries remain available for manual review.
 */

const AUDIT_SHEET_NAME = 'DuplicateTransactionAudit'

function getConfiguredRegistrationSpreadsheetIds() {
  return String(
    PropertiesService.getScriptProperties().getProperty('REGISTRATION_SPREADSHEET_IDS') || '',
  )
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

function getRegistrationTabName() {
  return String(
    PropertiesService.getScriptProperties().getProperty('REGISTRATION_SHEET_TAB_NAME') || 'Registrations',
  ).trim()
}

function collectExistingTransactionIds() {
  const ids = []
  const seen = new Map()
  const spreadsheetIds = getConfiguredRegistrationSpreadsheetIds()
  const tabName = getRegistrationTabName()

  if (!spreadsheetIds.length) {
    throw new Error('REGISTRATION_SPREADSHEET_IDS is not configured.')
  }

  spreadsheetIds.forEach((spreadsheetId) => {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId)
    const sheet = spreadsheet.getSheetByName(tabName)
    if (!sheet) return

    const lastRow = sheet.getLastRow()
    if (lastRow < 2) return

    // Existing registration sheets use column K for UTR / Transaction ID.
    const values = sheet.getRange(2, 11, lastRow - 1, 1).getValues()
    values.forEach((row, index) => {
      const transactionId = String(row[0] || '').trim()
      if (!transactionId) return

      const source = {
        spreadsheetId,
        rowNumber: index + 2,
        transactionId,
      }

      ids.push(source)
      const existing = seen.get(transactionId) || []
      existing.push(source)
      seen.set(transactionId, existing)
    })
  })

  return { ids, seen }
}

function getAuditSheet() {
  const registrySpreadsheetId = PropertiesService.getScriptProperties().getProperty('REGISTRY_SPREADSHEET_ID')
  if (!registrySpreadsheetId) throw new Error('REGISTRY_SPREADSHEET_ID is not configured.')

  const spreadsheet = SpreadsheetApp.openById(registrySpreadsheetId)
  let sheet = spreadsheet.getSheetByName(AUDIT_SHEET_NAME)
  if (!sheet) sheet = spreadsheet.insertSheet(AUDIT_SHEET_NAME)

  const headers = [
    'Transaction ID',
    'Duplicate Count',
    'Source Spreadsheet ID',
    'Source Row',
    'Detected At',
  ]
  const headerRange = sheet.getRange(1, 1, 1, headers.length)
  const current = headerRange.getValues()[0]
  if (headers.some((header, index) => current[index] !== header)) {
    headerRange.setValues([headers])
  }

  return sheet
}

function auditExistingTransactionIds() {
  const { seen } = collectExistingTransactionIds()
  const auditSheet = getAuditSheet()
  const rows = []
  const now = new Date().toISOString()

  seen.forEach((sources, transactionId) => {
    if (sources.length < 2) return
    sources.forEach((source) => {
      rows.push([
        transactionId,
        sources.length,
        source.spreadsheetId,
        source.rowNumber,
        now,
      ])
    })
  })

  if (rows.length) {
    auditSheet.getRange(auditSheet.getLastRow() + 1, 1, rows.length, 5).setValues(rows)
  }

  console.log(`Found ${rows.length} duplicate-source rows.`)
  return rows
}

function backfillExistingTransactionIds() {
  const { seen } = collectExistingTransactionIds()
  const registrySheet = getRegistrySheet()
  const now = new Date().toISOString()
  const existingRows = registrySheet.getLastRow() < 2
    ? []
    : registrySheet.getRange(2, 1, registrySheet.getLastRow() - 1, 1).getValues().flat().map((value) => String(value || '').trim())
  const existingSet = new Set(existingRows.filter(Boolean))
  const rows = []

  seen.forEach((sources, transactionId) => {
    if (existingSet.has(transactionId)) return
    const source = sources[0]
    rows.push([
      transactionId,
      'COMMITTED',
      `MIGRATED-${source.spreadsheetId.slice(0, 8)}-${source.rowNumber}`,
      now,
      now,
    ])
  })

  if (rows.length) {
    registrySheet.getRange(registrySheet.getLastRow() + 1, 1, rows.length, 5).setValues(rows)
  }

  console.log(`Backfilled ${rows.length} unique existing transaction IDs.`)
  return rows
}