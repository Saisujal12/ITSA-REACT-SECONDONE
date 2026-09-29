import {
  getRegistrationRows,
  updateRegistrationStatus,
} from "../config/googleSheets.js";

import {
  verifyPassword,
  createAdminSession,
  getAdminSession,
  destroyAdminSession,
} from "../services/adminAuth.js";

import {
  sendRegistrationSuccessEmail,
  sendRegistrationRejectedEmail,
} from "../services/emailService.js";

/*
|--------------------------------------------------------------------------
| Read Cookie
|--------------------------------------------------------------------------
*/

function getCookie(req, cookieName) {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [name, ...valueParts] =
      cookie.trim().split("=");

    if (name === cookieName) {
      return decodeURIComponent(
        valueParts.join("="),
      );
    }
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Admin Login
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
    } = req.body;

    const adminUsername =
      process.env.ADMIN_USERNAME?.trim();

    const adminPasswordHash =
      process.env.ADMIN_PASSWORD_HASH?.trim();

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Username and password are required.",
      });
    }

    if (
      String(username).trim() !==
      adminUsername
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid username or password.",
      });
    }

    if (!adminPasswordHash) {
      console.error(
        "❌ ADMIN_PASSWORD_HASH is missing.",
      );

      return res.status(500).json({
        success: false,
        message:
          "Admin authentication is not configured.",
      });
    }

    const passwordCorrect =
      await verifyPassword(
        password,
        adminPasswordHash,
      );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid username or password.",
      });
    }

    const token =
      createAdminSession(
        adminUsername,
      );

    res.cookie(
      "it_admin_session",
      token,
      {
        httpOnly: true,
        sameSite: "lax",
        secure:
          process.env.NODE_ENV ===
          "production",
        maxAge:
          8 * 60 * 60 * 1000,
        path: "/",
      },
    );

    return res.json({
      success: true,
      message:
        "Admin login successful.",
    });
  } catch (error) {
    console.error(
      "❌ Admin login error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Admin login failed.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Check Admin Session
|--------------------------------------------------------------------------
*/

export function checkAdmin(
  req,
  res,
) {
  const token = getCookie(
    req,
    "it_admin_session",
  );

  if (!token) {
    return res.json({
      success: true,
      authenticated: false,
    });
  }

  const session =
    getAdminSession(token);

  return res.json({
    success: true,
    authenticated:
      Boolean(session),
  });
}

/*
|--------------------------------------------------------------------------
| Admin Logout
|--------------------------------------------------------------------------
*/

export function logoutAdmin(
  req,
  res,
) {
  const token = getCookie(
    req,
    "it_admin_session",
  );

  if (token) {
    destroyAdminSession(token);
  }

  res.clearCookie(
    "it_admin_session",
    {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
      path: "/",
    },
  );

  return res.json({
    success: true,
    message:
      "Logged out successfully.",
  });
}

/*
|--------------------------------------------------------------------------
| Get Registrations
|--------------------------------------------------------------------------
*/

export async function listRegistrations(
  req,
  res,
) {
  try {
    const registrations =
      await getRegistrationRows();

    return res.json({
      success: true,
      registrations,
    });
  } catch (error) {
    console.error(
      "❌ Failed to load registrations:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load registrations.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Verify / Reject Registration
|--------------------------------------------------------------------------
*/

export async function changeRegistrationStatus(
  req,
  res,
) {
  try {
    const rowNumber = Number(
      req.params.rowNumber,
    );

    const { status } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validate Row
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isInteger(rowNumber) ||
      rowNumber < 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid registration row.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Status
    |--------------------------------------------------------------------------
    */

    if (
      !["VERIFIED", "REJECTED"].includes(
        status,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid registration status.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Update Google Sheets First
    |--------------------------------------------------------------------------
    */

    const registration =
      await updateRegistrationStatus(
        rowNumber,
        status,
      );

    /*
    |--------------------------------------------------------------------------
    | Send Result Email
    |--------------------------------------------------------------------------
    */

    let emailSent = false;

    try {
      if (status === "VERIFIED") {
        await sendRegistrationSuccessEmail(
          registration,
        );
      } else {
        await sendRegistrationRejectedEmail(
          registration,
        );
      }

      emailSent = true;

      console.log(
        `📧 ${status} email sent to ${registration.email}`,
      );
    } catch (emailError) {
      console.error(
        `⚠️ ${status} email failed:`,
        emailError,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    if (status === "VERIFIED") {
      return res.json({
        success: true,
        message: emailSent
          ? "Registration verified successfully and email sent."
          : "Registration verified successfully, but the success email could not be sent.",
        registration,
        email: {
          sent: emailSent,
        },
      });
    }

    return res.json({
      success: true,
      message: emailSent
        ? "Registration rejected and email sent."
        : "Registration rejected, but the rejection email could not be sent.",
      registration,
      email: {
        sent: emailSent,
      },
    });
  } catch (error) {
    console.error(
      "❌ Registration status update error:",
      error,
    );

    if (
      error.code ===
      "REGISTRATION_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Registration was not found.",
      });
    }

    if (
      error.code ===
      "REGISTRATION_ALREADY_PROCESSED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This registration has already been processed.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update registration status.",
    });
  }
}