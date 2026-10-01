import {
  getAdminSession,
} from "../services/adminAuth.js";

import {
  getAdminEvent,
} from "../config/adminEvents.js";

function getCookie(
  req,
  cookieName,
) {
  const cookieHeader =
    req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies =
    cookieHeader.split(
      ";",
    );

  for (
    const cookie of cookies
  ) {
    const [
      name,
      ...valueParts
    ] =
      cookie
        .trim()
        .split("=");

    if (
      name ===
      cookieName
    ) {
      return decodeURIComponent(
        valueParts.join("="),
      );
    }
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Get authenticated admin
|--------------------------------------------------------------------------
*/

export function getAdminFromRequest(
  req,
) {
  const token =
    getCookie(
      req,
      "it_admin_session",
    );

  const session =
    getAdminSession(
      token,
    );

  if (!session) {
    return null;
  }

  const event =
    getAdminEvent(
      session.eventId,
    );

  if (!event) {
    return null;
  }

  return {
    username:
      session.username,

    eventId:
      event.id,

    eventLabel:
      event.label,

    eventName:
      event.name,
  };
}

/*
|--------------------------------------------------------------------------
| Require admin
|--------------------------------------------------------------------------
*/

export function requireAdmin(
  req,
  res,
  next,
) {
  try {
    const admin =
      getAdminFromRequest(
        req,
      );

    if (!admin) {
      return res.status(
        401,
      ).json({
        success: false,
        message:
          "Admin authentication required.",
      });
    }

    req.admin =
      admin;

    next();
  } catch (error) {
    console.error(
      "Admin authentication error:",
      error,
    );

    return res.status(
      401,
    ).json({
      success: false,
      message:
        "Admin authentication failed.",
    });
  }
}