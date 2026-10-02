import {
  getRegistrationRows,
  updateRegistrationStatus,
} from "../config/googleSheets.js";

import {
  ADMIN_EVENTS,
  getAdminEvent,
} from "../config/adminEvents.js";

import {
  verifyPassword,
  createAdminSession,
} from "../services/adminAuth.js";

import {
  getAdminFromRequest,
} from "../middleware/adminAuth.js";

import {
  sendRegistrationSuccessEmail,
  sendRegistrationRejectedEmail,
} from "../services/emailService.js";



function cookieOptions() {
  return {
    httpOnly: true,

    sameSite:
      "lax",

    secure:
      process.env.NODE_ENV ===
      "production",

    maxAge:
      8 * 60 * 60 * 1000,

    path: "/",
  };
}

/*
|--------------------------------------------------------------------------
| ADMIN LOGIN
|--------------------------------------------------------------------------
*/

export async function loginAdmin(
  req,
  res,
) {
  try {
    const {
      username,
      password,
      eventId,
    } =
      req.body || {};

    const adminUsername =
      process.env
        .ADMIN_USERNAME
        ?.trim();

    const adminPasswordHash =
      process.env
        .ADMIN_PASSWORD_HASH
        ?.trim();

    /*
     * All three fields are mandatory.
     */
    if (
      !username ||
      !password ||
      !eventId
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Username, password, and event are required.",
        });
    }

    if (
      !adminUsername ||
      !adminPasswordHash
    ) {
      return res
        .status(500)
        .json({
          success: false,
          message:
            "Admin authentication is not configured.",
        });
    }

    /*
     * Validate selected event.
     */
    const selectedEvent =
      getAdminEvent(
        String(
          eventId,
        ).trim(),
      );

    if (!selectedEvent) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Please select a valid event.",
        });
    }

    /*
     * Validate username.
     */
    if (
      String(
        username,
      ).trim() !==
      adminUsername
    ) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Invalid username or password.",
        });
    }

    /*
     * Validate password.
     */
    const valid =
      await verifyPassword(
        password,
        adminPasswordHash,
      );

    if (!valid) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Invalid username or password.",
        });
    }

    /*
     * IMPORTANT:
     * Store selected event inside signed session.
     */
    const token =
      createAdminSession(
        adminUsername,
        selectedEvent.id,
      );

    res.cookie(
      "it_admin_session",
      token,
      cookieOptions(),
    );

    return res.json({
      success: true,

      message:
        "Admin login successful.",

      event:
        selectedEvent,
    });
  } catch (error) {
    console.error(
      "Admin login error:",
      error,
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Admin login failed.",
      });
  }
}

/*
|--------------------------------------------------------------------------
| CHECK SESSION
|--------------------------------------------------------------------------
*/

export function checkAdmin(
  req,
  res,
) {
  const admin =
    getAdminFromRequest(
      req,
    );

  return res.json({
    success: true,

    authenticated:
      Boolean(admin),

    admin: admin
      ? {
          username:
            admin.username,

          eventId:
            admin.eventId,

          eventLabel:
            admin.eventLabel,

          eventName:
            admin.eventName,
        }
      : null,
  });
}

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

export function logoutAdmin(
  req,
  res,
) {
  res.clearCookie(
    "it_admin_session",
    cookieOptions(),
  );

  return res.json({
    success: true,

    message:
      "Logged out successfully.",
  });
}

/*
|--------------------------------------------------------------------------
| LIST REGISTRATIONS
|--------------------------------------------------------------------------
|
| IMPORTANT:
| We DO NOT accept an eventId from the frontend.
|
| The event comes from req.admin.eventId,
| which came from the signed session.
|
*/

export async function listRegistrations(
  req,
  res,
) {
  try {
    const eventId =
      req.admin?.eventId;

    if (!eventId) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Admin event session is missing.",
        });
    }

    /*
     * Only ONE spreadsheet is read.
     */
    const registrations =
      await getRegistrationRows(
        eventId,
      );

    const event =
      getAdminEvent(
        eventId,
      );

    return res.json({
      success: true,

      registrations,

      event: event
        ? {
            id:
              event.id,

            label:
              event.label,

            name:
              event.name,
          }
        : null,
    });
  } catch (error) {
    console.error(
      "Failed to load registrations:",
      error,
    );

    if (
      error.code ===
      "EVENT_SHEET_NOT_CONFIGURED"
    ) {
      return res
        .status(503)
        .json({
          success: false,
          message:
            "This event's Google Sheet is not configured.",
        });
    }

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Failed to load registrations for the selected event.",
      });
  }
}

/*
|--------------------------------------------------------------------------
| VERIFY / REJECT
|--------------------------------------------------------------------------
|
| IMPORTANT:
| The frontend does NOT provide the eventId.
|
| The backend uses:
|
|     req.admin.eventId
|
| Therefore an admin logged into Event 1 cannot update
| a row from Event 2.
|
*/

export async function changeRegistrationStatus(
  req,
  res,
) {
  try {
    const rowNumber =
      Number(
        req.params
          .rowNumber,
      );

    const {
      status,
    } =
      req.body || {};

    const eventId =
      req.admin?.eventId;

    if (!eventId) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Admin event session is missing.",
        });
    }

    if (
      !Number.isInteger(
        rowNumber,
      ) ||
      rowNumber < 2
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid registration row.",
        });
    }

    if (
      ![
        "VERIFIED",
        "REJECTED",
      ].includes(
        status,
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid registration status.",
        });
    }

    /*
     * Uses ONLY the selected event from the session.
     */
    const registration =
      await updateRegistrationStatus(
        eventId,
        rowNumber,
        status,
      );

    let emailSent =
      false;

    try {
      if (
        status ===
        "VERIFIED"
      ) {
        await sendRegistrationSuccessEmail(
          registration,
        );
      } else {
        await sendRegistrationRejectedEmail(
          registration,
        );
      }

      emailSent =
        true;
    } catch (emailError) {
      console.error(
        `${status} email failed:`,
        emailError.message,
      );
    }

    return res.json({
      success: true,

      message:
        emailSent
          ? `Registration ${status.toLowerCase()} successfully and email sent.`
          : `Registration ${status.toLowerCase()} successfully, but email could not be sent.`,

      registration,

      email: {
        sent:
          emailSent,
      },
    });
  } catch (error) {
    console.error(
      "Registration status update error:",
      error,
    );

    if (
      error.code ===
      "REGISTRATION_NOT_FOUND"
    ) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Registration not found.",
        });
    }

    if (
      error.code ===
      "REGISTRATION_ALREADY_PROCESSED"
    ) {
      return res
        .status(409)
        .json({
          success: false,
          message:
            "This registration has already been processed.",
        });
    }

    if (
      error.code ===
      "EVENT_SHEET_NOT_CONFIGURED"
    ) {
      return res
        .status(503)
        .json({
          success: false,
          message:
            "This event's Google Sheet is not configured.",
        });
    }

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Unable to update registration status.",
      });
  }
}

/*
|--------------------------------------------------------------------------
| PUBLIC ADMIN EVENT LIST
|--------------------------------------------------------------------------
*/

export function getAvailableAdminEvents(
  req,
  res,
) {
  return res.json({
    success: true,

    events:
      ADMIN_EVENTS.map(
        (event) => ({
          id:
            event.id,

          label:
            event.label,

          name:
            event.name,
        }),
      ),
  });
}