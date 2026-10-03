const DUPLICATE_MESSAGE =
  'This transaction ID has already been used. Please check your payment details or contact support.'

function getRegistryConfig() {
  const url = String(process.env.TRANSACTION_REGISTRY_URL || '').trim()
  const secret = String(process.env.TRANSACTION_REGISTRY_SECRET || '').trim()

  if (!url || !secret) {
    const error = new Error(
      'Transaction registry is not configured. Set TRANSACTION_REGISTRY_URL and TRANSACTION_REGISTRY_SECRET.',
    )
    error.code = 'TRANSACTION_REGISTRY_NOT_CONFIGURED'
    throw error
  }

  return { url, secret }
}

async function callRegistry(action, payload) {
  const { url, secret } = getRegistryConfig()

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, secret, ...payload }),
    })
  } catch (error) {
    const wrapped = new Error('The transaction registry could not be reached.')
    wrapped.code = 'TRANSACTION_REGISTRY_UNAVAILABLE'
    wrapped.cause = error
    throw wrapped
  }

  const data = await response.json().catch(() => null)

  if (response.status === 409 || data?.httpStatus === 409 || data?.code === 'TRANSACTION_ID_ALREADY_USED') {
    const error = new Error(DUPLICATE_MESSAGE)
    error.code = 'TRANSACTION_ID_ALREADY_USED'
    throw error
  }

  if (!response.ok || !data?.success) {
    const error = new Error(data?.message || 'Transaction registry rejected the request.')
    error.code = data?.code || 'TRANSACTION_REGISTRY_ERROR'
    throw error
  }

  return data
}

export function normalizeTransactionId(value) {
  // Only trim surrounding whitespace. Do not alter case or internal characters
  // because the payment provider's exact transaction format is not assumed.
  return String(value ?? '').trim()
}

export async function reserveTransactionId(transactionId, registrationId) {
  return callRegistry('reserve', {
    transactionId: normalizeTransactionId(transactionId),
    registrationId: String(registrationId || '').trim(),
  })
}

export async function commitTransactionId(transactionId, registrationId) {
  return callRegistry('commit', {
    transactionId: normalizeTransactionId(transactionId),
    registrationId: String(registrationId || '').trim(),
  })
}

export async function releaseTransactionId(transactionId, registrationId) {
  return callRegistry('release', {
    transactionId: normalizeTransactionId(transactionId),
    registrationId: String(registrationId || '').trim(),
  })
}

export { DUPLICATE_MESSAGE }
