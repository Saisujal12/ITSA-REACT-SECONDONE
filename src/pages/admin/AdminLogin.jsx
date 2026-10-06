import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  ShieldHalf,
  User,
} from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { checkAdmin, loginAdmin } from "../../services/admin";
import { cx } from "../../utils/cx";
import s from "./Admin.module.css";

const EVENTS = [
  { id: "llm", label: "Workshop" },
  { id: "code-build", label: "Event 1" },
  { id: "innovation", label: "Event 2" },
  { id: "cyber-quest", label: "Event 3" },
  { id: "design-deploy", label: "Event 4" },
  { id: "tech-connect", label: "Event 5" },
  { id: "event6", label: "Event 6" },
  { id: "event7", label: "Event 7" },
  { id: "event8", label: "Event 8" },
  { id: "event9", label: "Event 9" },
  { id: "event10", label: "Event 10" },
];

export default function AdminLogin() {
  useDocumentTitle("Admin Login | IT Department");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [eventId, setEventId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [status, setStatus] = useState(() =>
    searchParams.get("expired")
      ? { tone: "error", message: "Your session expired. Please sign in again." }
      : null,
  );

  useEffect(() => {
    let active = true;

    checkAdmin()
      .then((session) => {
        if (active && session?.authenticated && session?.eventId) {
          navigate("/admin/dashboard", { replace: true });
        }
      })
      .catch(() => {
        // A missing session is expected on the login page.
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!username.trim() || !password || !eventId) {
      setStatus({
        tone: "error",
        message: "Enter the username and password, and select a workshop or event.",
      });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      await loginAdmin(username.trim(), password, eventId);
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      setStatus({
        tone: "error",
        message: error?.message || "Unable to sign in. Check your details and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingSession) {
    return (
      <main className={s.loginPage}>
        <section className={s.loginCard} aria-label="Checking admin session">
          <div className={s.loginIcon}>
            <ShieldHalf aria-hidden="true" />
          </div>
          <p className={s.loginTitle}>IT Department</p>
          <h1>Admin sign in</h1>
          <p className={s.loginDescription}>Checking your session…</p>
          <LoaderCircle className={s.loginSpinner} aria-label="Loading" />
        </section>
      </main>
    );
  }

  return (
    <main className={s.loginPage}>
      <section className={s.loginCard}>
        <div className={s.loginIcon}>
          <ShieldHalf aria-hidden="true" />
        </div>
        <p className={s.loginTitle}>IT Department</p>
        <h1>Admin sign in</h1>
        <p className={s.loginDescription}>
          Use the admin username and the unique password for the selected workshop or event.
        </p>

        <form className={s.loginForm} onSubmit={handleSubmit}>
          <label className={s.field}>
            <span className={s.fieldLabel}>Username</span>
            <span className={s.fieldInput}>
              <User aria-hidden="true" />
              <input
                autoComplete="username"
                name="username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                required
                value={username}
              />
            </span>
          </label>

          <label className={s.field}>
            <span className={s.fieldLabel}>Workshop or event</span>
            <span className={s.fieldInput}>
              <CalendarDays aria-hidden="true" />
              <select
                className={s.eventSelect}
                name="eventId"
                onChange={(event) => setEventId(event.target.value)}
                required
                value={eventId}
              >
                <option disabled value="">
                  Select workshop or event
                </option>
                {EVENTS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className={s.selectChevron}
              />
            </span>
          </label>

          <label className={s.field}>
            <span className={s.fieldLabel}>Password</span>
            <span className={cx(s.fieldInput, s.passwordInput)}>
              <Lock aria-hidden="true" />
              <input
                autoComplete="current-password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className={s.passwordToggle}
                onClick={() => setShowPassword((visible) => !visible)}
                title={showPassword ? "Hide password" : "Show password"}
                type="button"
              >
                {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </button>
            </span>
          </label>

          {status && (
            <p
              className={cx(
                s.loginStatus,
                status.tone === "success" && s.loginStatusSuccess,
              )}
              role={status.tone === "error" ? "alert" : "status"}
            >
              {status.message}
            </p>
          )}

          <button className={cx(s.button, s.loginButton)} disabled={submitting} type="submit">
            {submitting ? (
              <>
                <LoaderCircle className={s.loginSpinner} aria-hidden="true" />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <Link className={s.backHome} to="/">
          <ArrowLeft aria-hidden="true" />
          Back to website
        </Link>
      </section>
    </main>
  );
}
