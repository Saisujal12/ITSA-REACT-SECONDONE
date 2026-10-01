import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  BookUser,
  Building2,
  ChevronDown,
  Hash,
  LoaderCircle,
  Mail,
  Phone,
  ReceiptText,
  ShieldCheck,
  User,
} from "lucide-react";

import {
  hasVerifiedFee,
} from "../../data/events";

import {
  LOGO,
  SITE,
} from "../../data/site";

import {
  submitRegistration,
} from "../../services/registrations";

import {
  cx,
} from "../../utils/cx";

import {
  COLLEGE_OPTIONS,
  EMPTY_REGISTRATION,
  normalizeRegistration,
  validateRegistration,
} from "../../utils/validation";

import StatusMessage from "../ui/StatusMessage";

import PaymentPanel from "./PaymentPanel";

import s from "../../pages/Register.module.css";

const FIELD_ORDER = [
  "name",
  "collegeType",
  "collegeName",
  "rollNo",
  "branch",
  "email",
  "phone",
  "transactionId",
];

function Field({
  id,
  number,
  label,
  icon: Icon,
  error,
  hint,
  children,
}) {
  const describedBy =
    [
      error &&
        `${id}-error`,
      hint &&
        `${id}-hint`,
    ]
      .filter(Boolean)
      .join(" ") ||
    undefined;

  return (
    <div
      className={cx(
        s.formGroup,
        error &&
          s.invalid,
      )}
    >
      <label htmlFor={id}>
        <span>{number}</span>
        {label}
      </label>

      <div
        className={
          s.inputWrapper
        }
      >
        <Icon
          aria-hidden="true"
        />

        {children({
          "aria-invalid":
            Boolean(error),
          "aria-describedby":
            describedBy,
        })}
      </div>

      {hint && !error && (
        <small
          id={`${id}-hint`}
          className={
            s.fieldHint
          }
        >
          {hint}
        </small>
      )}

      {error && (
        <small
          id={`${id}-error`}
          className={
            s.fieldError
          }
        >
          {error}
        </small>
      )}
    </div>
  );
}

export default function RegistrationForm({
  event,
  day,
}) {
  const [
    values,
    setValues,
  ] = useState(
    EMPTY_REGISTRATION,
  );

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    attempted,
    setAttempted,
  ] = useState(false);

  const [
    status,
    setStatus,
  ] = useState("idle");

  const [
    result,
    setResult,
  ] = useState(null);

  const [
    serverError,
    setServerError,
  ] = useState("");

  const fieldRefs =
    useRef({});

  const feedbackRef =
    useRef(null);

  const abortRef =
    useRef(null);

  const feeKnown =
    hasVerifiedFee(event);

  const submitting =
    status ===
    "submitting";

  useEffect(() => {
    return () =>
      abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (
      status ===
        "success" ||
      status ===
        "error"
    ) {
      feedbackRef.current?.focus();
    }
  }, [status]);

  const register =
    (name) => ({
      id: `reg-${name}`,
      name,
      value:
        values[name],
      ref: (element) => {
        fieldRefs.current[
          name
        ] = element;
      },

      onChange: (
        changeEvent,
      ) => {
        const next = {
          ...values,
          [name]:
            changeEvent
              .target
              .value,
        };

        /*
         * If college changes,
         * clear fields belonging
         * to the previous option.
         */
        if (
          name ===
          "collegeType"
        ) {
          if (
            changeEvent
              .target
              .value ===
            "KITSW"
          ) {
            next.collegeName =
              "";
          }

          if (
            changeEvent
              .target
              .value ===
            "OTHER"
          ) {
            next.rollNo =
              "";
          }
        }

        setValues(next);

        if (attempted) {
          setErrors(
            validateRegistration(
              next,
            ),
          );
        }

        if (
          status ===
            "success" ||
          status ===
            "error"
        ) {
          setStatus("idle");
        }
      },
    });

  async function handleSubmit(
    submitEvent,
  ) {
    submitEvent.preventDefault();

    if (
      submitting ||
      !feeKnown
    ) {
      return;
    }

    setAttempted(true);

    const nextErrors =
      validateRegistration(
        values,
      );

    setErrors(
      nextErrors,
    );

    const firstInvalid =
      FIELD_ORDER.find(
        (name) =>
          nextErrors[name],
      );

    if (firstInvalid) {
      fieldRefs.current[
        firstInvalid
      ]?.focus();

      return;
    }

    const clean =
      normalizeRegistration(
        values,
      );

    const controller =
      new AbortController();

    abortRef.current =
      controller;

    setStatus(
      "submitting",
    );

    setServerError("");

    try {
      const response =
        await submitRegistration(
          {
            eventId:
              event.id,

            event:
              event.title,

            name:
              clean.name,

            collegeType:
              clean.collegeType,

            collegeName:
              clean.collegeName,

            rollNo:
              clean.rollNo,

            branch:
              clean.branch,

            email:
              clean.email,

            phone:
              clean.phone,

            amount:
              event.fee,

            transactionId:
              clean.transactionId,
          },
          {
            signal:
              controller.signal,
          },
        );

      setResult({
        registrationId:
          response.registrationId,

        status:
          response.status,

        title:
          event.title,

        emailSent:
          response.email
            ?.sent ??
          false,
      });

      setValues(
        EMPTY_REGISTRATION,
      );

      setErrors({});

      setAttempted(
        false,
      );

      setStatus(
        "success",
      );
    } catch (error) {
      if (
        error.name ===
        "AbortError"
      ) {
        return;
      }

      setServerError(
        error.status >=
          500
          ? "Unable to submit registration right now. Please try again in a few minutes."
          : error.message,
      );

      setStatus(
        "error",
      );
    }
  }

  return (
    <div
      className={
        s.registrationFormCard
      }
    >
      <div
        className={
          s.registrationFormCardHeader
        }
      >
        <div
          className={s.cardBrand}
        >
          <div
            className={
              s.miniSymbol
            }
          >
            <img
              src={LOGO.src}
              width="42"
              height="42"
              alt=""
            />
          </div>

          <div>
            <strong>
              {SITE.nameUpper}
            </strong>

            <span>
              {SITE.college} ·
              REGISTRATION
            </span>
          </div>
        </div>

        <div
          className={
            s.registrationStepLabel
          }
        >
          STEP{" "}
          <strong>
            01
          </strong>{" "}
          · YOUR DETAILS
        </div>
      </div>

      <div
        className={
          s.registrationHeading
        }
      >
        <div
          className={
            s.headingIndex
          }
        >
          <span>
            {day.shortLabel}
          </span>

          <strong>
            REGISTRATION
          </strong>
        </div>

        <h2>
          {event.formHeading}
        </h2>

        <p>
          {event.formDescription}
        </p>
      </div>

      <form
        noValidate
        onSubmit={
          handleSubmit
        }
        aria-describedby={
          feeKnown
            ? undefined
            : "reg-fee-notice"
        }
      >
        <div
          className={
            s.formGrid
          }
        >
          {/* NAME */}

          <Field
            id="reg-name"
            number="01"
            label="STUDENT NAME"
            icon={User}
            error={
              errors.name
            }
          >
            {(aria) => (
              <input
                {...register(
                  "name",
                )}
                {...aria}
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                maxLength={80}
                required
              />
            )}
          </Field>

          {/* COLLEGE */}

          <Field
            id="reg-collegeType"
            number="02"
            label="COLLEGE"
            icon={Building2}
            error={
              errors.collegeType
            }
          >
            {(aria) => (
              <>
                <select
                  {...register(
                    "collegeType",
                  )}
                  {...aria}
                  required
                >
                  <option
                    value=""
                    disabled
                  >
                    Select college
                  </option>

                  {COLLEGE_OPTIONS.map(
                    (
                      option,
                    ) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown
                  className={
                    s.selectCaret
                  }
                  aria-hidden="true"
                />
              </>
            )}
          </Field>

          {/* CONDITIONAL COLLEGE FIELDS */}

          {values.collegeType ===
            "KITSW" && (
            <div
              className={
                s.formGridPair
              }
            >
              <Field
                id="reg-rollNo"
                number="03"
                label="ROLL NUMBER"
                icon={Hash}
                error={
                  errors.rollNo
                }
              >
                {(aria) => (
                  <input
                    {...register(
                      "rollNo",
                    )}
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
                error={
                  errors.branch
                }
              >
                {(aria) => (
                  <input
                    {...register(
                      "branch",
                    )}
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

          {values.collegeType ===
            "OTHER" && (
            <>
              <Field
                id="reg-collegeName"
                number="03"
                label="COLLEGE NAME"
                icon={Building2}
                error={
                  errors.collegeName
                }
              >
                {(aria) => (
                  <input
                    {...register(
                      "collegeName",
                    )}
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
                error={
                  errors.branch
                }
              >
                {(aria) => (
                  <input
                    {...register(
                      "branch",
                    )}
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

          {/* EMAIL + PHONE */}

          <div
            className={
              s.formGridPair
            }
          >
            <Field
              id="reg-email"
              number="05"
              label="EMAIL ADDRESS"
              icon={Mail}
              error={
                errors.email
              }
            >
              {(aria) => (
                <input
                  {...register(
                    "email",
                  )}
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
              error={
                errors.phone
              }
              hint="Demo: +91 90000 00000"
            >
              {(aria) => (
                <input
                  {...register(
                    "phone",
                  )}
                  {...aria}
                  type="tel"
                  placeholder="+91 XXXXXXXXXX"
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={20}
                  required
                />
              )}
            </Field>
          </div>
        </div>

        {/* QR */}

        <PaymentPanel
          event={event}
          day={day}
        />

        {/* UTR */}

        <div
          className={
            s.utrGroup
          }
        >
          <Field
            id="reg-transactionId"
            number="07"
            label="PAYMENT UTR / TRANSACTION ID"
            icon={
              ReceiptText
            }
            error={
              errors.transactionId
            }
            hint="Enter the reference exactly as shown in your payment app."
          >
            {(aria) => (
              <input
                {...register(
                  "transactionId",
                )}
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
            className={
              s.formFeedback
            }
          >
            Online registration for{" "}
            {event.title}{" "}
            is not open yet.
          </StatusMessage>
        )}

        <button
          type="submit"
          className={cx(
            s.submitBtn,
            submitting &&
              s.loading,
          )}
          disabled={
            !feeKnown ||
            submitting
          }
          aria-busy={
            submitting
          }
        >
          <span>
            {!feeKnown
              ? "Registration Opens Soon"
              : submitting
                ? "Submitting…"
                : "Submit Registration"}
          </span>

          <span
            className={
              s.submitArrow
            }
            aria-hidden="true"
          >
            {submitting ? (
              <LoaderCircle
                className={
                  s.spin
                }
              />
            ) : (
              <ArrowRight />
            )}
          </span>
        </button>

        <div
          ref={
            feedbackRef
          }
          tabIndex={-1}
          className={
            s.formFeedback
          }
          style={{
            outline:
              "none",
          }}
        >
          {status ===
            "success" &&
            result && (
              <StatusMessage
                tone="success"
                title="Registration submitted"
              >
                Registration submitted
                for{" "}
                {
                  result.title
                }
                .

                <br />

                Payment verification
                is currently{" "}
                {
                  result.status ||
                  "PENDING"
                }
                .

                <br />

                Your registration ID:
                <span
                  className={
                    s.successId
                  }
                >
                  {
                    result.registrationId
                  }
                </span>

                <br />

                {result.emailSent
                  ? "A confirmation email has been sent to your email address."
                  : "Your registration was saved successfully. Email confirmation is currently unavailable."}
              </StatusMessage>
            )}

          {status ===
            "error" && (
            <StatusMessage
              tone="error"
              title="Registration not submitted"
            >
              {serverError}
              {" "}
              Your details
              are still filled
              in, so you can
              try again.
            </StatusMessage>
          )}
        </div>

        <div
          className={
            s.secureNote
          }
        >
          <div
            className={
              s.secureIcon
            }
            aria-hidden="true"
          >
            <ShieldCheck />
          </div>

          <p>
            Your registration
            details are used only
            for event registration
            and payment verification.
          </p>
        </div>
      </form>

      <div
        className={
          s.registrationCardFooter
        }
      >
        <span>
          {day.label}
        </span>

        <span>
          {SITE.nameUpper} ·{" "}
          {SITE.college}
        </span>
      </div>
    </div>
  );
}