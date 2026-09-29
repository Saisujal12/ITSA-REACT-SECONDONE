import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  BookUser,
  ChevronDown,
  GraduationCap,
  Hash,
  LoaderCircle,
  Mail,
  Phone,
  ReceiptText,
  ShieldCheck,
  User,
} from 'lucide-react'
import { hasVerifiedFee } from '../../data/events'
import { LOGO, SITE } from '../../data/site'
import { submitRegistration } from '../../services/registrations'
import { cx } from '../../utils/cx'
import {
  EMPTY_REGISTRATION,
  normalizeRegistration,
  validateRegistration,
  YEAR_OPTIONS,
} from '../../utils/validation'
import StatusMessage from '../ui/StatusMessage'
import PaymentPanel from './PaymentPanel'
import s from '../../pages/Register.module.css'

const FIELD_ORDER = ['name', 'rollNo', 'year', 'branch', 'email', 'phone', 'transactionId']

function Field({ id, number, label, icon: Icon, error, hint, children }) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined

  return (
    <div className={cx(s.formGroup, error && s.invalid)}>
      <label htmlFor={id}>
        <span>{number}</span>
        {label}
      </label>
      <div className={s.inputWrapper}>
        <Icon aria-hidden="true" />
        {children({ 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      </div>
      {hint && !error && (
        <small id={`${id}-hint`} className={s.fieldHint}>
          {hint}
        </small>
      )}
      {error && (
        <small id={`${id}-error`} className={s.fieldError}>
          {error}
        </small>
      )}
    </div>
  )
}

/**
 * Registration details + payment reference. Submits to the existing
 * backend contract. When the event has no verified fee, the backend's
 * required `amount` is unknown, so submission is disabled and explained
 * instead of sending an invented value.
 */
export default function RegistrationForm({ event, day }) {
  const [values, setValues] = useState(EMPTY_REGISTRATION)
  const [errors, setErrors] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [result, setResult] = useState(null)
  const [serverError, setServerError] = useState('')

  const fieldRefs = useRef({})
  const feedbackRef = useRef(null)
  const abortRef = useRef(null)

  const feeKnown = hasVerifiedFee(event)
  const submitting = status === 'submitting'

  useEffect(() => () => abortRef.current?.abort(), [])

  useEffect(() => {
    if (status === 'success' || status === 'error') feedbackRef.current?.focus()
  }, [status])

  const register = (name) => ({
    id: `reg-${name}`,
    name,
    value: values[name],
    ref: (element) => {
      fieldRefs.current[name] = element
    },
    onChange: (changeEvent) => {
      const next = { ...values, [name]: changeEvent.target.value }
      setValues(next)
      if (attempted) setErrors(validateRegistration(next))
      if (status === 'success' || status === 'error') setStatus('idle')
    },
  })

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault()
    if (submitting || !feeKnown) return

    setAttempted(true)
    const nextErrors = validateRegistration(values)
    setErrors(nextErrors)

    const firstInvalid = FIELD_ORDER.find((name) => nextErrors[name])
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus()
      return
    }

    const clean = normalizeRegistration(values)
    const controller = new AbortController()
    abortRef.current = controller
    setStatus('submitting')
    setServerError('')

    try {
      const response = await submitRegistration(
        {
          name: clean.name,
          rollNo: clean.rollNo,
          year: clean.year,
          branch: clean.branch,
          email: clean.email,
          phone: clean.phone,
          workshop: event.title,
          amount: event.fee,
          transactionId: clean.transactionId,
        },
        { signal: controller.signal },
      )
      setResult({ registrationId: response.registrationId, status: response.status, title: event.title })
      setValues(EMPTY_REGISTRATION)
      setErrors({})
      setAttempted(false)
      setStatus('success')
    } catch (error) {
      if (error.name === 'AbortError') return
      setServerError(
        error.status >= 500
          ? 'Unable to submit registration right now. Please try again in a few minutes.'
          : error.message,
      )
      setStatus('error')
    }
  }

  return (
    <div className={s.registrationFormCard}>
      <div className={s.registrationFormCardHeader}>
        <div className={s.cardBrand}>
          <div className={s.miniSymbol}>
            <img src={LOGO.src} width="42" height="42" alt="" />
          </div>
          <div>
            <strong>{SITE.nameUpper}</strong>
            <span>{SITE.college} · REGISTRATION</span>
          </div>
        </div>
        <div className={s.registrationStepLabel}>
          STEP <strong>01</strong> · YOUR DETAILS
        </div>
      </div>

      <div className={s.registrationHeading}>
        <div className={s.headingIndex}>
          <span>{day.shortLabel}</span>
          <strong>REGISTRATION</strong>
        </div>
        <h2>{event.formHeading}</h2>
        <p>{event.formDescription}</p>
      </div>

      <form noValidate onSubmit={handleSubmit} aria-describedby={feeKnown ? undefined : 'reg-fee-notice'}>
        <div className={s.formGrid}>
          <Field id="reg-name" number="01" label="STUDENT NAME" icon={User} error={errors.name}>
            {(aria) => (
              <input {...register('name')} {...aria} type="text" placeholder="Your full name" autoComplete="name" maxLength={80} required />
            )}
          </Field>

          <div className={s.formGridPair}>
            <Field id="reg-rollNo" number="02" label="ROLL NUMBER" icon={Hash} error={errors.rollNo}>
              {(aria) => (
                <input {...register('rollNo')} {...aria} type="text" placeholder="Your roll number" autoComplete="off" autoCapitalize="characters" maxLength={20} required />
              )}
            </Field>

            <Field id="reg-year" number="03" label="YEAR OF STUDY" icon={GraduationCap} error={errors.year}>
              {(aria) => (
                <>
                  <select {...register('year')} {...aria} required>
                    <option value="" disabled>
                      Select year
                    </option>
                    {YEAR_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={s.selectCaret} aria-hidden="true" />
                </>
              )}
            </Field>
          </div>

          <Field id="reg-branch" number="04" label="BRANCH" icon={BookUser} error={errors.branch}>
            {(aria) => (
              <input {...register('branch')} {...aria} type="text" placeholder="Your branch" autoComplete="off" maxLength={60} required />
            )}
          </Field>

          <div className={s.formGridPair}>
            <Field id="reg-email" number="05" label="EMAIL ADDRESS" icon={Mail} error={errors.email}>
              {(aria) => (
                <input {...register('email')} {...aria} type="email" placeholder="you@example.com" autoComplete="email" inputMode="email" maxLength={120} required />
              )}
            </Field>

            <Field id="reg-phone" number="06" label="PHONE NUMBER" icon={Phone} error={errors.phone}>
              {(aria) => (
                <input {...register('phone')} {...aria} type="tel" placeholder="Your mobile number" autoComplete="tel" inputMode="tel" maxLength={20} required />
              )}
            </Field>
          </div>
        </div>

        <PaymentPanel event={event} day={day} />

        <div className={s.utrGroup}>
          <Field
            id="reg-transactionId"
            number="07"
            label="PAYMENT UTR / TRANSACTION ID"
            icon={ReceiptText}
            error={errors.transactionId}
            hint="Enter the reference exactly as shown in your payment app."
          >
            {(aria) => (
              <input {...register('transactionId')} {...aria} type="text" placeholder="Enter your payment transaction ID" autoComplete="off" maxLength={40} required />
            )}
          </Field>
        </div>

        {!feeKnown && (
          <StatusMessage id="reg-fee-notice" tone="info" title="Registration fee not yet announced" className={s.formFeedback}>
            Online registration for {event.title} opens once the registration fee is confirmed by
            the IT Association. Please check back soon — no payment should be made until then.
          </StatusMessage>
        )}

        <button
          type="submit"
          className={cx(s.submitBtn, submitting && s.loading)}
          disabled={!feeKnown || submitting}
          aria-busy={submitting}
        >
          <span>
            {!feeKnown ? 'Registration Opens Soon' : submitting ? 'Submitting…' : 'Submit Registration'}
          </span>
          <span className={s.submitArrow} aria-hidden="true">
            {submitting ? <LoaderCircle className={s.spin} /> : <ArrowRight />}
          </span>
        </button>

        <div ref={feedbackRef} tabIndex={-1} className={s.formFeedback} style={{ outline: 'none' }}>
          {status === 'success' && result && (
            <StatusMessage tone="success" title="Registration submitted">
              Registration submitted for {result.title}. Payment verification is currently{' '}
              {result.status || 'PENDING'}.
              {result.registrationId && (
                <>
                  <br />
                  Your registration ID: <span className={s.successId}>{result.registrationId}</span>
                  <br />
                  Please keep this ID for future reference. You should also receive a confirmation
                  email at the address you entered.
                </>
              )}
            </StatusMessage>
          )}
          {status === 'error' && (
            <StatusMessage tone="error" title="Registration not submitted">
              {serverError} Your details are still filled in, so you can try again.
            </StatusMessage>
          )}
        </div>

        <div className={s.secureNote}>
          <div className={s.secureIcon} aria-hidden="true">
            <ShieldCheck />
          </div>
          <p>Your registration details are used only for event registration and verification.</p>
        </div>
      </form>

      <div className={s.registrationCardFooter}>
        <span>{day.label}</span>
        <span>
          {SITE.nameUpper} · {SITE.college}
        </span>
      </div>
    </div>
  )
}
