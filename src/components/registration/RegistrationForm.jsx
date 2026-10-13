import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  BookUser,
  Building2,
  ChevronDown,
  GraduationCap,
  Hash,
  ImageUp,
  LoaderCircle,
  Mail,
  Phone,
  ReceiptText,
  ShieldCheck,
  User,
} from 'lucide-react'

import { hasVerifiedFee } from '../../data/events'
import { PAYMENT_SUPPORT_PHONE } from '../../data/payment'
import { LOGO, SITE } from '../../data/site'
import { submitRegistration } from '../../services/registrations'
import { cx } from '../../utils/cx'
import {
  COLLEGE_OPTIONS,
  EMPTY_REGISTRATION,
  STUDY_YEAR_OPTIONS,
  normalizeRegistration,
  validateRegistration,
} from '../../utils/validation'
import StatusMessage from '../ui/StatusMessage'
import PaymentPanel from './PaymentPanel'
import s from '../../pages/Register.module.css'

const FIELD_ORDER = [
  'name',
  'collegeType',
  'collegeName',
  'rollNo',
  'branch',
  'email',
  'phone',
  'year',
  'mealPreference',
  'paymentScreenshot',
  'transactionId',
]

const MAX_SCREENSHOT_BYTES = 8 * 1024 * 1024

async function preparePaymentScreenshot(file) {
  const image = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  let scale = Math.min(1, 1280 / Math.max(image.width, image.height))
  let dataUrl = ''

  for (const quality of [0.78, 0.7, 0.62, 0.54]) {
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
    dataUrl = canvas.toDataURL('image/jpeg', quality)

    if ((dataUrl.length * 3) / 4 <= 1_450_000) break
    scale *= 0.85
  }

  image.close()

  if ((dataUrl.length * 3) / 4 > 1_450_000) {
    throw new Error('Screenshot is too large after compression.')
  }

  return {
    fileName: `${file.name.replace(/\.[^.]+$/, '') || 'payment-screenshot'}.jpg`,
    dataUrl,
  }
}

function Field({ id, number, label, icon: Icon, error, hint, children }) {
  const describedBy =
    [
      error && `${id}-error`,
      hint && `${id}-hint`,
    ]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <div className={cx(s.formGroup, error && s.invalid)}>
      <label htmlFor={id}>
        <span>{number}</span>
        {label}
      </label>

      <div className={s.inputWrapper}>
        <Icon aria-hidden="true" />
        {children({
          'aria-invalid': Boolean(error),
          'aria-describedby': describedBy,
        })}
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

export default function RegistrationForm({ event, day }) {
  const [values, setValues] = useState(EMPTY_REGISTRATION)
  const [errors, setErrors] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [serverError, setServerError] = useState('')
  const [paymentScreenshot, setPaymentScreenshot] = useState(null)
  const [screenshotError, setScreenshotError] = useState('')
  const [isScreenshotDragging, setIsScreenshotDragging] = useState(false)

  const fieldRefs = useRef({})
  const feedbackRef = useRef(null)
  const abortRef = useRef(null)
  const screenshotInputRef = useRef(null)

  const feeKnown = hasVerifiedFee(event)
  const submitting = status === 'submitting'

  useEffect(() => () => abortRef.current?.abort(), [])

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      feedbackRef.current?.focus()
    }
  }, [status])

  async function handlePaymentScreenshotFile(file) {
    setScreenshotError('')
    if (status === 'success' || status === 'error') setStatus('idle')

    if (!file) {
      setPaymentScreenshot(null)
      return
    }

    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setPaymentScreenshot(null)
      setScreenshotError('Choose a JPG, PNG, or WebP image.')
      return
    }

    if (file.size > MAX_SCREENSHOT_BYTES) {
      setPaymentScreenshot(null)
      setScreenshotError('The image must be 8 MB or smaller.')
      return
    }

    try {
      const prepared = await preparePaymentScreenshot(file)
      setPaymentScreenshot(prepared)

      if (attempted) {
        setErrors((current) => ({
          ...current,
          paymentScreenshot: undefined,
        }))
      }
    } catch {
      setPaymentScreenshot(null)
      setScreenshotError(
        'This image could not be opened. Please choose another file.',
      )
    }
  }

  const register = (name) => ({
    id: `reg-${name}`,
    name,
    value: values[name],
    ref: (element) => {
      fieldRefs.current[name] = element
    },
    onChange: (changeEvent) => {
      const next = {
        ...values,
        [name]:
          name === 'phone'
            ? changeEvent.target.value.replace(/\D/g, '').slice(0, 10)
            : changeEvent.target.value,
      }

      if (name === 'collegeType') {
        if (changeEvent.target.value === 'KITSW') {
          next.collegeName = ''
        }

        if (changeEvent.target.value === 'OTHER') {
          next.rollNo = ''
        }
      }

      setValues(next)

      if (attempted) {
        setErrors(validateRegistration(next, event))
      }

      if (status === 'success' || status === 'error') {
        setStatus('idle')
      }
    },
  })

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault()

    if (submitting || !feeKnown) return

    setAttempted(true)

    const nextErrors = validateRegistration(values, event)

    if (!paymentScreenshot) {
      nextErrors.paymentScreenshot =
        'Please upload your payment screenshot.'
    }

    setScreenshotError(nextErrors.paymentScreenshot || '')
    setErrors(nextErrors)

    const fieldOrder = FIELD_ORDER.filter(
      (name) => name !== 'mealPreference' || event.type === 'workshop',
    )

    const firstInvalid = fieldOrder.find((name) => nextErrors[name])

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
          eventId: event.id,
          event: event.title,
          name: clean.name,
          collegeType: clean.collegeType,
          collegeName: clean.collegeName,
          rollNo: clean.rollNo,
          branch: clean.branch,
          email: clean.email,
          phone: clean.phone,
          year: clean.year,
          mealPreference: clean.mealPreference,
          amount: event.fee,
          transactionId: clean.transactionId,
          paymentScreenshot,
        },
        { signal: controller.signal },
      )

      setResult({
        registrationId: response.registrationId,
        status: response.status,
        title: event.title,
        emailSent: response.email?.sent ?? false,
      })

      setValues(EMPTY_REGISTRATION)
      setPaymentScreenshot(null)
      setScreenshotError('')
      if (screenshotInputRef.current) {
        screenshotInputRef.current.value = ''
      }

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

      <form
        noValidate
        onSubmit={handleSubmit}
        aria-describedby={feeKnown ? undefined : 'reg-fee-notice'}
      >
        <div className={s.formGrid}>
          <Field
            id="reg-name"
            number="01"
            label="STUDENT NAME"
            icon={User}
            error={errors.name}
          >
            {(aria) => (
              <input
                {...register('name')}
                {...aria}
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                maxLength={80}
                required
              />
            )}
          </Field>

          <Field
            id="reg-collegeType"
            number="02"
            label="COLLEGE"
            icon={Building2}
            error={errors.collegeType}
          >
            {(aria) => (
              <>
                <select {...register('collegeType')} {...aria} required>
                  <option value="" disabled>
                    Select college
                  </option>

                  {COLLEGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  className={s.selectCaret}
                  aria-hidden="true"
                />
              </>
            )}
          </Field>

          {values.collegeType === 'KITSW' && (
            <div className={s.formGridPair}>
              <Field
                id="reg-rollNo"
                number="03"
                label="ROLL NUMBER"
                icon={Hash}
                error={errors.rollNo}
              >
                {(aria) => (
                  <input
                    {...register('rollNo')}
                    {...aria}
                    type="text"
                    placeholder="Your roll number"
                    autoComplete="off"
                    autoCapitalize="characters"
                    maxLength={20}
                    required
                  />
                )}
              </Field>

              <Field
                id="reg-branch"
                number="04"
                label="BRANCH"
                icon={BookUser}
                error={errors.branch}
              >
                {(aria) => (
                  <input
                    {...register('branch')}
                    {...aria}
                    type="text"
                    placeholder="Your branch"
                    autoComplete="off"
                    maxLength={60}
                    required
                  />
                )}
              </Field>
            </div>
          )}

          {values.collegeType === 'OTHER' && (
            <>
              <Field
                id="reg-collegeName"
                number="03"
                label="COLLEGE NAME"
                icon={Building2}
                error={errors.collegeName}
              >
                {(aria) => (
                  <input
                    {...register('collegeName')}
                    {...aria}
                    type="text"
                    placeholder="Enter your college name"
                    autoComplete="organization"
                    maxLength={120}
                    required
                  />
                )}
              </Field>

              <Field
                id="reg-branch"
                number="04"
                label="BRANCH"
                icon={BookUser}
                error={errors.branch}
              >
                {(aria) => (
                  <input
                    {...register('branch')}
                    {...aria}
                    type="text"
                    placeholder="Your branch"
                    autoComplete="off"
                    maxLength={60}
                    required
                  />
                )}
              </Field>
            </>
          )}

          <div className={s.formGridPair}>
            <Field
              id="reg-email"
              number="05"
              label="EMAIL ADDRESS"
              icon={Mail}
              error={errors.email}
              hint="Format validation does not verify email ownership."
            >
              {(aria) => (
                <input
                  {...register('email')}
                  {...aria}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={120}
                  required
                />
              )}
            </Field>

            <Field
              id="reg-phone"
              number="06"
              label="PHONE NUMBER"
              icon={Phone}
              error={errors.phone}
              hint="Enter exactly 10 digits."
            >
              {(aria) => (
                <input
                  {...register('phone')}
                  {...aria}
                  type="tel"
                  placeholder="XXXXXXXXXX"
                  autoComplete="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  minLength={10}
                  onPaste={(pasteEvent) => {
                    pasteEvent.preventDefault()
                    const digits = pasteEvent.clipboardData
                      .getData('text')
                      .replace(/\D/g, '')
                      .slice(0, 10)

                    register('phone').onChange({
                      target: { value: digits },
                    })
                  }}
                  required
                />
              )}
            </Field>
          </div>

          <Field
            id="reg-year"
            number="07"
            label="YEAR OF STUDY"
            icon={GraduationCap}
            error={errors.year}
          >
            {(aria) => (
              <>
                <select {...register('year')} {...aria} required>
                  <option value="" disabled>
                    Select your year
                  </option>

                  {STUDY_YEAR_OPTIONS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  className={s.selectCaret}
                  aria-hidden="true"
                />
              </>
            )}
          </Field>

          {event.type === 'workshop' && (
            <fieldset
              className={s.mealPreferenceFieldset}
              aria-describedby={
                errors.mealPreference
                  ? 'reg-mealPreference-error'
                  : undefined
              }
              aria-invalid={Boolean(errors.mealPreference)}
            >
              <legend>
                <span>08</span>
                LUNCH PREFERENCE
              </legend>

              <div className={s.mealPreferenceOptions}>
                <label
                  className={s.mealPreferenceOption}
                  htmlFor="reg-meal-veg"
                >
                  <input
                    {...register('mealPreference')}
                    id="reg-meal-veg"
                    type="radio"
                    value="VEG"
                    checked={values.mealPreference === 'VEG'}
                    aria-invalid={Boolean(errors.mealPreference)}
                  />
                  <span>Veg</span>
                </label>

                <label
                  className={s.mealPreferenceOption}
                  htmlFor="reg-meal-non-veg"
                >
                  <input
                    {...register('mealPreference')}
                    id="reg-meal-non-veg"
                    type="radio"
                    value="NON_VEG"
                    checked={values.mealPreference === 'NON_VEG'}
                    aria-invalid={Boolean(errors.mealPreference)}
                  />
                  <span>Non-Veg</span>
                </label>
              </div>

              {errors.mealPreference && (
                <small
                  id="reg-mealPreference-error"
                  className={s.mealPreferenceError}
                >
                  {errors.mealPreference}
                </small>
              )}
            </fieldset>
          )}
        </div>

        <PaymentPanel event={event} day={day} />

        <div
          className={cx(
            s.formGroup,
            screenshotError && s.invalid,
            s.screenshotGroup,
          )}
        >
          <label htmlFor="reg-paymentScreenshot">
            <span>{event.type === 'workshop' ? '09' : '08'}</span>
            UPLOAD PAYMENT SCREENSHOT
          </label>

          <div
            className={cx(
              s.screenshotDropzone,
              isScreenshotDragging && s.screenshotDropzoneActive,
              screenshotError && s.screenshotDropzoneInvalid,
              paymentScreenshot && s.screenshotDropzoneComplete,
            )}
            onDragEnter={(dragEvent) => {
              dragEvent.preventDefault()
              setIsScreenshotDragging(true)
            }}
            onDragOver={(dragEvent) => dragEvent.preventDefault()}
            onDragLeave={(dragEvent) => {
              if (!dragEvent.currentTarget.contains(dragEvent.relatedTarget)) {
                setIsScreenshotDragging(false)
              }
            }}
            onDrop={(dropEvent) => {
              dropEvent.preventDefault()
              setIsScreenshotDragging(false)
              handlePaymentScreenshotFile(dropEvent.dataTransfer.files?.[0])
            }}
          >
            <input
              className={s.screenshotFileInput}
              id="reg-paymentScreenshot"
              ref={(element) => {
                screenshotInputRef.current = element
                fieldRefs.current.paymentScreenshot = element
              }}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-label="Choose payment screenshot"
              aria-invalid={Boolean(screenshotError)}
              aria-describedby={
                screenshotError
                  ? 'reg-paymentScreenshot-error'
                  : 'reg-paymentScreenshot-hint'
              }
              onChange={(changeEvent) =>
                handlePaymentScreenshotFile(
                  changeEvent.target.files?.[0],
                )
              }
              required
            />

            <div className={s.screenshotDropContent} aria-hidden="true">
              <span className={s.screenshotDropIcon}>
                <ImageUp />
              </span>

              <span className={s.screenshotDropCopy}>
                <strong>
                  {isScreenshotDragging
                    ? 'Release to upload screenshot'
                    : paymentScreenshot?.fileName ||
                      'Drop payment screenshot here'}
                </strong>

                <small>
                  {paymentScreenshot
                    ? 'Click to replace or drop a new file'
                    : 'or click to browse files'}
                </small>
              </span>

              <span className={s.screenshotFormatTag}>
                JPG · PNG · WEBP <b>MAX 8 MB</b>
              </span>
            </div>
          </div>

          <small
            id="reg-paymentScreenshot-hint"
            className={s.fieldHint}
          >
            Upload a clear image of the successful payment screen. Your image
            is optimized automatically.
          </small>

          {paymentScreenshot && (
            <div className={s.screenshotPreview}>
              <img
                src={paymentScreenshot.dataUrl}
                alt="Preview of uploaded payment screenshot"
              />
              <span>Payment screenshot ready to upload</span>

              <button
                type="button"
                onClick={() => {
                  setPaymentScreenshot(null)
                  if (screenshotInputRef.current) {
                    screenshotInputRef.current.value = ''
                  }
                }}
              >
                Remove
              </button>
            </div>
          )}

          {screenshotError && (
            <small
              id="reg-paymentScreenshot-error"
              className={s.fieldError}
              role="alert"
            >
              {screenshotError}
            </small>
          )}
        </div>

        <div className={s.utrGroup}>
          <Field
            id="reg-transactionId"
            number={event.type === 'workshop' ? '10' : '09'}
            label="PAYMENT UTR / TRANSACTION ID"
            icon={ReceiptText}
            error={errors.transactionId}
            hint="Enter the reference exactly as shown in your payment app."
          >
            {(aria) => (
              <input
                {...register('transactionId')}
                {...aria}
                type="text"
                placeholder="Enter UTR / transaction ID"
                autoComplete="off"
                maxLength={50}
                required
              />
            )}
          </Field>
        </div>

        {!feeKnown && (
          <StatusMessage
            id="reg-fee-notice"
            tone="info"
            title="Registration fee not yet announced"
            className={s.formFeedback}
          >
            Online registration for {event.title} is not open yet.
          </StatusMessage>
        )}

        <button
          type="submit"
          className={cx(s.submitBtn, submitting && s.loading)}
          disabled={!feeKnown || submitting}
          aria-busy={submitting}
        >
          <span>
            {!feeKnown
              ? 'Registration Opens Soon'
              : submitting
                ? 'Submitting…'
                : 'Submit Registration'}
          </span>

          <span className={s.submitArrow} aria-hidden="true">
            {submitting ? (
              <LoaderCircle className={s.spin} />
            ) : (
              <ArrowRight />
            )}
          </span>
        </button>

        <p className={s.paymentSupportText}>
          If you face any payment issues or delays, please contact:{' '}
          {PAYMENT_SUPPORT_PHONE}
        </p>

        <div
          ref={feedbackRef}
          tabIndex={-1}
          className={s.formFeedback}
          style={{ outline: 'none' }}
        >
          {status === 'success' && result && (
            <StatusMessage tone="success" title="Registration submitted">
              Registration submitted for {result.title}.
              <br />
              Payment verification is currently {result.status || 'PENDING'}.
              <br />
              Your registration ID:
              <span className={s.successId}>
                {result.registrationId}
              </span>
              <br />
              {result.emailSent
                ? 'A confirmation email has been sent to your email address.'
                : 'Your registration was saved successfully. Email confirmation is currently unavailable.'}
            </StatusMessage>
          )}

          {status === 'error' && (
            <StatusMessage
              tone="error"
              title="Registration not submitted"
            >
              {serverError} Your details are still filled in, so you can try
              again.
            </StatusMessage>
          )}
        </div>

        <div className={s.secureNote}>
          <div className={s.secureIcon} aria-hidden="true">
            <ShieldCheck />
          </div>

          <p>
            Your registration details are used only for event registration and
            payment verification.
          </p>
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