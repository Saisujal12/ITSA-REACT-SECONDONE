import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  LoaderCircle,
  Lock,
  ShieldHalf,
  User,
} from "lucide-react";

import {
  useDocumentTitle,
} from "../../hooks/useDocumentTitle";

import {
  checkAdmin,
  loginAdmin,
} from "../../services/admin";

import {
  cx,
} from "../../utils/cx";

import s from "./Admin.module.css";

/*
|--------------------------------------------------------------------------
| ADMIN EVENTS
|--------------------------------------------------------------------------
*/

const EVENTS = [
  {
    id: "llm",
    label: "Workshop",
  },

  {
    id: "code-build",
    label: "Event 1",
  },

  {
    id: "innovation",
    label: "Event 2",
  },

  {
    id: "cyber-quest",
    label: "Event 3",
  },

  {
    id: "design-deploy",
    label: "Event 4",
  },

  {
    id: "tech-connect",
    label: "Event 5",
  },

  {
    id: "event6",
    label: "Event 6",
  },
];

export default function AdminLogin() {
  useDocumentTitle(
    "Admin Login | IT Association",
    {
      raw: true,
    },
  );

  const navigate =
    useNavigate();

  const [
    searchParams,
  ] =
    useSearchParams();

  const [
    username,
    setUsername,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    eventId,
    setEventId,
  ] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    checkingSession,
    setCheckingSession,
  ] =
    useState(true);

  const [
    status,
    setStatus,
  ] =
    useState(
      searchParams.get(
        "expired",
      )
        ? {
            tone:
              "error",

            text:
              "Your admin session has expired. Please login again.",
          }
        : null,
    );

  /*
  |--------------------------------------------------------------------------
  | Check existing session
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let active =
      true;

    async function checkExistingSession() {
      try {
        const result =
          await checkAdmin();

        if (
          active &&
          result?.authenticated &&
          result?.admin?.eventId
        ) {
          navigate(
            "/admin/dashboard",
            {
              replace:
                true,
            },
          );

          return;
        }
      } catch {
        /*
         * Keep login form available.
         */
      } finally {
        if (active) {
          setCheckingSession(
            false,
          );
        }
      }
    }

    checkExistingSession();

    return () => {
      active =
        false;
    };
  }, [
    navigate,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    event,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (
      !username.trim() ||
      !password ||
      !eventId
    ) {
      setStatus({
        tone:
          "error",

        text:
          "Please enter username, password, and choose your event.",
      });

      return;
    }

    setSubmitting(
      true,
    );

    setStatus(
      null,
    );

    try {
      await loginAdmin(
        username.trim(),
        password,
        eventId,
      );

      navigate(
        "/admin/dashboard",
        {
          replace:
            true,
        },
      );
    } catch (error) {
      setStatus({
        tone:
          "error",

        text:
          error.message ||
          "Unable to login. Please check your details and try again.",
      });

      setSubmitting(
        false,
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (checkingSession) {
    return (
      <div
        className={
          s.loginPage
        }
        aria-busy="true"
      >
        <div
          className={
            s.loginCard
          }
        >
          <div
            className={
              s.loginIcon
            }
          >
            <LoaderCircle
              className={
                s.spin
              }
            />
          </div>

          <h1>
            IT{" "}
            <span>
              ASSOCIATION
            </span>
          </h1>

          <p
            className={
              s.loginTitle
            }
          >
            ADMIN PANEL
          </p>

          <p
            className={
              s.loginDescription
            }
          >
            Checking your admin
            session…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        s.loginPage
      }
    >
      <div
        className={
          s.loginCard
        }
      >
        <div
          className={
            s.loginIcon
          }
        >
          <ShieldHalf />
        </div>

        <h1>
          IT{" "}
          <span>
            ASSOCIATION
          </span>
        </h1>

        <p
          className={
            s.loginTitle
          }
        >
          ADMIN PANEL
        </p>

        <p
          className={
            s.loginDescription
          }
        >
          Login with your admin
          credentials and select
          the event you want to
          manage.
        </p>

        <form
          onSubmit={
            handleSubmit
          }
          noValidate
        >
          {/* USERNAME */}

          <div
            className={
              s.field
            }
          >
            <label htmlFor="admin-username">
              Username
            </label>

            <div
              className={
                s.fieldInput
              }
            >
              <User />

              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                placeholder="Enter admin username"
                value={
                  username
                }
                onChange={(
                  event,
                ) =>
                  setUsername(
                    event.target
                      .value,
                  )
                }
                required
              />
            </div>
          </div>

          {/* PASSWORD */}

          <div
            className={
              s.field
            }
          >
            <label htmlFor="admin-password">
              Password
            </label>

            <div
              className={
                s.fieldInput
              }
            >
              <Lock />

              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter admin password"
                value={
                  password
                }
                onChange={(
                  event,
                ) =>
                  setPassword(
                    event.target
                      .value,
                  )
                }
                required
              />
            </div>
          </div>

          {/* EVENT */}

          <div
            className={
              s.field
            }
          >
            <label htmlFor="admin-event">
              Choose your event
            </label>

            <div
              className={
                s.fieldInput
              }
            >
              <CalendarDays />

              <select
                id="admin-event"
                className={
                  s.eventSelect
                }
                value={
                  eventId
                }
                onChange={(
                  event,
                ) =>
                  setEventId(
                    event.target
                      .value,
                  )
                }
                required
              >
                <option value="">
                  Select an event
                </option>

                {EVENTS.map(
                  (
                    event,
                  ) => (
                    <option
                      key={
                        event.id
                      }
                      value={
                        event.id
                      }
                    >
                      {
                        event.label
                      }
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div aria-live="polite">
            {status && (
              <p
                className={cx(
                  s.loginStatus,
                  status.tone ===
                    "success" &&
                    s.loginStatusSuccess,
                )}
                role={
                  status.tone ===
                  "error"
                    ? "alert"
                    : "status"
                }
              >
                {
                  status.text
                }
              </p>
            )}
          </div>

          <button
            type="submit"
            className={cx(
              s.button,
              s.loginButton,
            )}
            disabled={
              submitting
            }
          >
            {submitting
              ? "Logging in…"
              : "Login"}

            {submitting ? (
              <LoaderCircle
                className={
                  s.spin
                }
              />
            ) : (
              <ArrowRight />
            )}
          </button>
        </form>

        <Link
          to="/"
          className={
            s.backHome
          }
        >
          <ArrowLeft
            size={14}
          />

          Back to Website
        </Link>
      </div>
    </div>
  );
}