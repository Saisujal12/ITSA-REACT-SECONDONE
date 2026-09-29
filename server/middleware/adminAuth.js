import { getAdminSession } from "../services/adminAuth.js";

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
| Require Admin
|--------------------------------------------------------------------------
*/

export function requireAdmin(
  req,
  res,
  next,
) {
  try {
    const token = getCookie(
      req,
      "it_admin_session",
    );

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Admin authentication required.",
      });
    }

    const session =
      getAdminSession(token);

    if (!session) {
      return res.status(401).json({
        success: false,
        message:
          "Admin session expired or invalid.",
      });
    }

    req.admin = {
      username: session.username,
    };

    next();
  } catch (error) {
    console.error(
      "❌ Admin authentication error:",
      error,
    );

    return res.status(401).json({
      success: false,
      message:
        "Admin authentication failed.",
    });
  }
}