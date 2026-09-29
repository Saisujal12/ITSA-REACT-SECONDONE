import { useEffect, useRef, useState } from 'react'
import { CircleCheck, CircleX, LoaderCircle, Receipt, X } from 'lucide-react'
import { cx } from '../../utils/cx'
import s from '../../pages/admin/Admin.module.css'

const FIELDS = [
  ['registrationId', 'Registration ID'],
  ['name', 'Student Name'],
  ['rollNo', 'Roll Number'],
  ['year', 'Year'],
  ['branch', 'Branch'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['workshop', 'Workshop'],
  ['amount', 'Amount'],
  ['transactionId', 'Transaction ID'],
  ['status', 'Current Status'],
]

/**
 * Registration details with verify/reject. Uses a native <dialog> so focus
 * is trapped and Escape closes it. The legacy confirm()/alert() prompts are
 * replaced by an in-dialog confirmation step.
 */
export default function RegistrationDialog({ registration, onClose, onUpdateStatus }) {
  const dialogRef = useRef(null)
  const confirmRef = useRef(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // No cleanup close(): the element is removed on unmount, and closing here
    // would fire onClose during StrictMode's development remount.
    const dialog = dialogRef.current
    if (!dialog.open) dialog.showModal()
  }, [])

  useEffect(() => {
    if (pendingAction) confirmRef.current?.focus()
  }, [pendingAction])

  const isPending = registration.status === 'PENDING'

  async function confirmAction() {
    setSaving(true)
    setError('')
    try {
      await onUpdateStatus(registration, pendingAction)
    } catch (updateError) {
      setError(updateError.message || 'Unable to update registration.')
      setSaving(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={s.dialog}
      aria-labelledby="registration-dialog-title"
      onClose={onClose}
      onCancel={(event) => {
        if (saving) event.preventDefault()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !saving) dialogRef.current.close()
      }}
    >
      <button type="button" className={s.modalClose} aria-label="Close" onClick={() => dialogRef.current.close()} disabled={saving}>
        <X size={18} aria-hidden="true" />
      </button>
      <div className={s.modalIcon} aria-hidden="true">
        <Receipt />
      </div>
      <h2 id="registration-dialog-title">Registration Details</h2>
      <p className={s.modalSubtitle}>Review the student&apos;s payment information before verifying.</p>

      <dl className={s.details}>
        {FIELDS.map(([key, label]) => (
          <div
            key={key}
            className={cx(s.detailItem, key === 'transactionId' && cx(s.fullWidth, s.transaction))}
          >
            <dt>{label}</dt>
            <dd>{key === 'amount' && registration[key] ? `₹${registration[key]}` : registration[key] || '—'}</dd>
          </div>
        ))}
      </dl>

      {error && (
        <p className={s.dialogError} role="alert">
          {error}
        </p>
      )}

      {isPending && (
        <div className={s.actions}>
          {pendingAction ? (
            <>
              <p className={s.confirmText}>
                Are you sure you want to {pendingAction === 'VERIFIED' ? 'verify' : 'reject'} this payment? The student
                will be emailed.
              </p>
              <button
                type="button"
                className={cx(s.button, pendingAction === 'VERIFIED' ? s.verifyButton : s.rejectButton)}
                onClick={confirmAction}
                disabled={saving}
                ref={confirmRef}
              >
                {saving ? <LoaderCircle className={s.spin} aria-hidden="true" /> : null}
                {saving ? 'Updating…' : `Yes, ${pendingAction === 'VERIFIED' ? 'verify' : 'reject'} payment`}
              </button>
              <button type="button" className={s.button} onClick={() => setPendingAction(null)} disabled={saving}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" className={cx(s.button, s.verifyButton)} onClick={() => setPendingAction('VERIFIED')}>
                <CircleCheck aria-hidden="true" />
                Verify Payment
              </button>
              <button type="button" className={cx(s.button, s.rejectButton)} onClick={() => setPendingAction('REJECTED')}>
                <CircleX aria-hidden="true" />
                Reject Payment
              </button>
            </>
          )}
        </div>
      )}
    </dialog>
  )
}
