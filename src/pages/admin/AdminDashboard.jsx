import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import RegistrationDialog from "../../components/admin/RegistrationDialog";

import {
  checkAdmin,
  fetchRegistrations,
  logoutAdmin,
  updateRegistrationStatus,
} from "../../services/admin";

import {
  useDocumentTitle,
} from "../../hooks/useDocumentTitle";

import {
  cx,
} from "../../utils/cx";

import s from "./Admin.module.css";

/*
|--------------------------------------------------------------------------
| Normalize registration
|--------------------------------------------------------------------------
*/

function normalizeRegistration(
  item,
) {
  return {
    ...item,

    rowNumber:
      item?.rowNumber ??
      "",

    eventId:
      item?.eventId ??
      "",

    registrationId:
      item?.registrationId ??
      "",

    name:
      item?.name ??
      "",

    collegeType:
      item?.collegeType ??
      "",

    collegeName:
      item?.collegeName ??
      "",

    rollNo:
      item?.rollNo ??
      "",

    branch:
      item?.branch ??
      "",

    email:
      item?.email ??
      "",

    phone:
      item?.phone ??
      "",

    event:
      item?.event ??
      "",

    amount:
      item?.amount ??
      "",

    transactionId:
      item?.transactionId ??
      "",

    status:
      String(
        item?.status ||
          "PENDING",
      ).toUpperCase(),

    createdAt:
      item?.createdAt ??
      "",

    updatedAt:
      item?.updatedAt ??
      "",
  };
}

/*
|--------------------------------------------------------------------------
| Date
|--------------------------------------------------------------------------
*/

function formatDate(
  value,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return String(value);
  }

  return date.toLocaleString(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    },
  );
}

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

export default function AdminDashboard() {
  useDocumentTitle(
    "Admin Dashboard | IT Department",
    {
      raw: true,
    },
  );

  const navigate =
    useNavigate();

  const [
    registrations,
    setRegistrations,
  ] =
    useState([]);

  const [
    selected,
    setSelected,
  ] =
    useState(null);

  const [
    admin,
    setAdmin,
  ] =
    useState(null);

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("all");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    notice,
    setNotice,
  ] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Load ONLY selected event
  |--------------------------------------------------------------------------
  */

  const loadRegistrations =
    useCallback(
      async () => {
        setRefreshing(
          true,
        );

        setError("");

        try {
          const session =
            await checkAdmin();

          if (
            !session?.authenticated ||
            !session?.admin?.eventId
          ) {
            navigate(
              "/admin/login?expired=1",
              {
                replace:
                  true,
              },
            );

            return;
          }

          setAdmin(
            session.admin,
          );

          const result =
            await fetchRegistrations();

          setRegistrations(
            (
              result?.registrations ||
              []
            ).map(
              normalizeRegistration,
            ),
          );

          if (
            result?.event
          ) {
            setAdmin(
              (
                current,
              ) => ({
                ...(current ||
                  {}),

                ...result.event,
              }),
            );
          }
        } catch (
          loadError
        ) {
          if (
            loadError?.status ===
            401
          ) {
            navigate(
              "/admin/login?expired=1",
              {
                replace:
                  true,
              },
            );

            return;
          }

          setError(
            loadError?.message ||
              "Unable to load registrations. Please check the backend.",
          );
        } finally {
          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        }
      },
      [
        navigate,
      ],
    );

useEffect(
  () => {
    // The registration loader intentionally updates component state
    // when the selected admin event/session changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRegistrations();
  },
  [
    loadRegistrations,
  ],
);

  /*
  |--------------------------------------------------------------------------
  | Status + search filter
  |--------------------------------------------------------------------------
  */

  const filtered =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return registrations.filter(
          (
            registration,
          ) => {
            const matchesStatus =
              statusFilter ===
                "all" ||
              registration.status ===
                statusFilter;

            if (
              !matchesStatus
            ) {
              return false;
            }

            if (!query) {
              return true;
            }

            const searchable =
              [
                registration.registrationId,
                registration.name,
                registration.email,
                registration.phone,
                registration.rollNo,
                registration.branch,
                registration.collegeName,
                registration.event,
                registration.transactionId,
              ]
                .join(" ")
                .toLowerCase();

            return searchable.includes(
              query,
            );
          },
        );
      },
      [
        registrations,
        statusFilter,
        search,
      ],
    );

  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

  const stats =
    useMemo(
      () => ({
        total:
          registrations.length,

        pending:
          registrations.filter(
            (
              item,
            ) =>
              item.status ===
              "PENDING",
          ).length,

        verified:
          registrations.filter(
            (
              item,
            ) =>
              item.status ===
              "VERIFIED",
          ).length,

        rejected:
          registrations.filter(
            (
              item,
            ) =>
              item.status ===
              "REJECTED",
          ).length,
      }),
      [
        registrations,
      ],
    );

  /*
  |--------------------------------------------------------------------------
  | Verify / Reject
  |--------------------------------------------------------------------------
  */

  async function handleStatusUpdate(
    registration,
    status,
  ) {
    if (
      !registration.rowNumber
    ) {
      throw new Error(
        "This registration is missing its Google Sheet row number.",
      );
    }

    /*
     * No eventId is sent.
     * Backend gets it from the signed session.
     */
    const result =
      await updateRegistrationStatus(
        registration.rowNumber,
        status,
      );

    const updated =
      normalizeRegistration(
        result.registration ||
          {
            ...registration,
            status,
          },
      );

    setRegistrations(
      (
        current,
      ) =>
        current.map(
          (
            item,
          ) =>
            item.rowNumber ===
            registration.rowNumber
              ? updated
              : item,
        ),
    );

    setSelected(
      null,
    );

    setNotice(
      result.email?.sent
        ? `Registration ${status.toLowerCase()} successfully. Email sent.`
        : `Registration ${status.toLowerCase()} successfully. Email could not be sent.`,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  async function handleLogout() {
    try {
      await logoutAdmin();
    } finally {
      navigate(
        "/admin/login",
        {
          replace:
            true,
        },
      );
    }
  }

  const eventLabel =
    admin?.eventLabel ||
    "Selected Event";

  const eventName =
    admin?.eventName ||
    admin?.name ||
    "";

  return (
    <div
      className={
        s.admin
      }
    >
      {/* NAVBAR */}

      <header
        className={
          s.navbar
        }
      >
        <div
          className={
            s.brand
          }
        >
          <ShieldCheck />

          <span>
            IT DEPARTMENT
          </span>
        </div>

        <div
          className={
            s.navRight
          }
        >
          <span
            className={
              s.adminLabel
            }
          >
            <UserRound
              size={14}
            />

            ADMIN
          </span>

          <button
            type="button"
            className={
              s.button
            }
            onClick={
              handleLogout
            }
          >
            <LogOut />

            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}

      <main
        className={
          s.dashboard
        }
      >
        <div
          className={
            s.heading
          }
        >
          <div>
            <p
              className={
                s.smallTitle
              }
            >
              SECURE ADMIN PANEL
            </p>

            <h1>
              Registration{" "}
              <span>
                Dashboard
              </span>
            </h1>

            <p>
              Only registrations
              for your selected
              event are displayed
              here.
            </p>
          </div>

          <button
            type="button"
            className={
              s.button
            }
            onClick={
              loadRegistrations
            }
            disabled={
              refreshing
            }
          >
            <RefreshCw
              className={
                refreshing
                  ? s.spin
                  : undefined
              }
            />

            {refreshing
              ? "Refreshing…"
              : "Refresh"}
          </button>
        </div>

        {/* SELECTED EVENT */}

        <div
          className={
            s.selectedEventBanner
          }
        >
          <div>
            <span
              className={
                s.selectedEventLabel
              }
            >
              CURRENT EVENT
            </span>

            <strong>
              {
                eventLabel
              }
            </strong>

            {eventName && (
              <span>
                {
                  eventName
                }
              </span>
            )}
          </div>

          <span
            className={
              s.selectedEventLock
            }
          >
            Locked to this event
          </span>
        </div>

        {/* NOTICE */}

        {notice && (
          <div
            className={
              s.notice
            }
            role="status"
          >
            {
              notice
            }
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div
            className={cx(
              s.notice,
              s.noticeError,
            )}
            role="alert"
          >
            {
              error
            }
          </div>
        )}

        {/* STATISTICS */}

        <dl
          className={
            s.statsGrid
          }
        >
          <div
            className={
              s.statCard
            }
          >
            <div
              className={
                s.statIcon
              }
            >
              <Users />
            </div>

            <div>
              <dt>
                Total registrations
              </dt>

              <dd>
                {
                  stats.total
                }
              </dd>
            </div>
          </div>

          <div
            className={cx(
              s.statCard,
              s.statPending,
            )}
          >
            <div
              className={
                s.statIcon
              }
            >
              <Clock3 />
            </div>

            <div>
              <dt>
                Pending
              </dt>

              <dd>
                {
                  stats.pending
                }
              </dd>
            </div>
          </div>

          <div
            className={cx(
              s.statCard,
              s.statVerified,
            )}
          >
            <div
              className={
                s.statIcon
              }
            >
              <CheckCircle2 />
            </div>

            <div>
              <dt>
                Verified
              </dt>

              <dd>
                {
                  stats.verified
                }
              </dd>
            </div>
          </div>

          <div
            className={cx(
              s.statCard,
              s.statRejected,
            )}
          >
            <div
              className={
                s.statIcon
              }
            >
              <XCircle />
            </div>

            <div>
              <dt>
                Rejected
              </dt>

              <dd>
                {
                  stats.rejected
                }
              </dd>
            </div>
          </div>
        </dl>

        {/* REGISTRATIONS */}

        <section
          className={
            s.section
          }
        >
          <div
            className={
              s.sectionHeading
            }
          >
            <div>
              <h2>
                {
                  eventLabel
                }{" "}
                Registrations
              </h2>

              <p>
                Showing{" "}
                {
                  filtered.length
                }{" "}
                of{" "}
                {
                  registrations.length
                }{" "}
                registrations for
                this event.
              </p>
            </div>

            <span
              className={
                s.inlineStatus
              }
            >
              <ClipboardList
                size={15}
              />

              Google Sheets
            </span>
          </div>

          {/* FILTERS */}

          <div
            className={
              s.filters
            }
          >
            <label
              className={
                s.filterField
              }
            >
              <span>
                Status
              </span>

              <select
                value={
                  statusFilter
                }
                onChange={(
                  event,
                ) =>
                  setStatusFilter(
                    event
                      .target
                      .value,
                  )
                }
              >
                <option value="all">
                  All statuses
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="VERIFIED">
                  Verified
                </option>

                <option value="REJECTED">
                  Rejected
                </option>
              </select>
            </label>

            <label
              className={cx(
                s.filterField,
                s.searchField,
              )}
            >
              <span>
                Search
              </span>

              <div
                className={
                  s.searchInput
                }
              >
                <Search
                  size={16}
                />

                <input
                  type="search"
                  placeholder="Name, email, roll no, UTR…"
                  value={
                    search
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearch(
                      event
                        .target
                        .value,
                    )
                  }
                />
              </div>
            </label>
          </div>

          {/* TABLE */}

          <div
            className={
              s.tableContainer
            }
          >
            {loading ? (
              <div
                className={
                  s.empty
                }
              >
                <RefreshCw
                  className={
                    s.spin
                  }
                />

                <p>
                  Loading
                  registrations…
                </p>
              </div>
            ) : filtered.length ===
              0 ? (
              <div
                className={
                  s.empty
                }
              >
                <ClipboardList />

                <p>
                  No registrations
                  match the current
                  filters.
                </p>
              </div>
            ) : (
              <table
                className={
                  s.table
                }
              >
                <thead>
                  <tr>
                    <th>
                      Registration
                    </th>

                    <th>
                      Student
                    </th>

                    <th>
                      Contact
                    </th>

                    <th>
                      UTR
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Created
                    </th>

                    <th>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(
                    (
                      registration,
                    ) => (
                      <tr
                        key={
                          registration.rowNumber
                        }
                      >
                        <td
                          className={
                            s.mono
                          }
                        >
                          {
                            registration.registrationId ||
                            `ROW ${registration.rowNumber}`
                          }
                        </td>

                        <td>
                          <strong>
                            {
                              registration.name ||
                              "—"
                            }
                          </strong>

                          <br />

                          <span>
                            {
                              registration.collegeName ||
                              registration.collegeType ||
                              "—"
                            }
                          </span>
                        </td>

                        <td>
                          {
                            registration.email ||
                            "—"
                          }

                          <br />

                          <span>
                            {
                              registration.phone ||
                              "—"
                            }
                          </span>
                        </td>

                        <td
                          className={
                            s.mono
                          }
                        >
                          {
                            registration.transactionId ||
                            "—"
                          }
                        </td>

                        <td>
                          <span
                            className={cx(
                              s.badge,

                              registration.status ===
                                "VERIFIED"
                                ? s.badgeVerified
                                : registration.status ===
                                    "REJECTED"
                                  ? s.badgeRejected
                                  : s.badgePending,
                            )}
                          >
                            {
                              registration.status
                            }
                          </span>
                        </td>

                        <td>
                          {
                            formatDate(
                              registration.createdAt,
                            )
                          }
                        </td>

                        <td>
                          <button
                            type="button"
                            className={cx(
                              s.button,
                              s.viewButton,
                            )}
                            onClick={() =>
                              setSelected(
                                registration,
                              )
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {/* DETAILS */}

      {selected && (
        <RegistrationDialog
          registration={{
            ...selected,

            year:
              selected.year ||
              "—",

            workshop:
              eventName ||
              selected.event ||
              eventLabel,
          }}
          onClose={() =>
            setSelected(
              null,
            )
          }
          onUpdateStatus={
            handleStatusUpdate
          }
        />
      )}
    </div>
  );
}
