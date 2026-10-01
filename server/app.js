import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import registrationRoutes from "./routes/registrationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.set("trust proxy", 1);

/*
|--------------------------------------------------------------------------
| SECURITY HEADERS
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const configuredOrigins = (
  process.env.FRONTEND_ORIGIN || ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  /*
   * Requests without an Origin header include:
   * - direct browser navigation
   * - server-to-server requests
   * - health checks
   */
  if (!origin) {
    return true;
  }

  /*
   * Explicitly configured origins.
   */
  if (configuredOrigins.includes(origin)) {
    return true;
  }

  /*
   * Local development.
   */
  const localOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  if (localOrigins.includes(origin)) {
    return true;
  }

  /*
   * Vercel deployments.
   *
   * This allows:
   *
   * https://your-project.vercel.app
   * https://your-project-git-main.vercel.app
   * https://your-project-preview.vercel.app
   */
  try {
    const url = new URL(origin);

    if (
      url.protocol === "https:" &&
      url.hostname.endsWith(".vercel.app")
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.error(
        `CORS blocked origin: ${origin}`,
      );

      return callback(
        new Error(
          `CORS origin not allowed: ${origin}`,
        ),
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  }),
);

/*
|--------------------------------------------------------------------------
| BODY PARSERS
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/*
|--------------------------------------------------------------------------
| REGISTRATION API
|--------------------------------------------------------------------------
|
| Supports both:
|
| /api/registrations
| /registrations
|
| The first is used by the React frontend.
| The second makes the Express app tolerant of
| Vercel function path handling.
|--------------------------------------------------------------------------
*/

app.use(
  [
    "/api/registrations",
    "/registrations",
  ],
  registrationRoutes,
);

/*
|--------------------------------------------------------------------------
| ADMIN API
|--------------------------------------------------------------------------
|
| Supports both:
|
| /api/admin/...
| /admin/...
|--------------------------------------------------------------------------
*/

app.use(
  [
    "/api/admin",
    "/admin",
  ],
  adminRoutes,
);

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get(
  [
    "/api/health",
    "/health",
  ],
  (req, res) => {
    return res.status(200).json({
      success: true,

      message:
        "IT Association backend is running.",

      timestamp:
        new Date().toISOString(),
    });
  },
);

/*
|--------------------------------------------------------------------------
| ROOT BACKEND CHECK
|--------------------------------------------------------------------------
*/

app.get(
  "/",
  (req, res) => {
    return res.status(200).json({
      success: true,

      message:
        "IT Association backend is running.",
    });
  },
);

/*
|--------------------------------------------------------------------------
| CORS ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use(
  (
    error,
    req,
    res,
    next,
  ) => {
    if (
      error?.message?.startsWith(
        "CORS origin not allowed",
      )
    ) {
      return res.status(403).json({
        success: false,

        message:
          "This frontend origin is not allowed to access the API.",

        origin:
          req.headers.origin || null,
      });
    }

    return next(error);
  },
);

/*
|--------------------------------------------------------------------------
| API 404 HANDLER
|--------------------------------------------------------------------------
*/

app.use(
  (req, res, next) => {
    if (
      req.path.startsWith("/api/") ||
      req.path === "/api"
    ) {
      return res.status(404).json({
        success: false,

        message:
          "API endpoint not found.",

        path: req.path,
      });
    }

    return next();
  },
);

/*
|--------------------------------------------------------------------------
| FINAL ERROR HANDLER
|--------------------------------------------------------------------------
|
| This prevents Express from returning an
| unhelpful HTML error page to the React app.
|--------------------------------------------------------------------------
*/

app.use(
  (
    error,
    req,
    res,
    next,
  ) => {
    console.error(
      "Unhandled Express error:",
      error,
    );

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      success: false,

      message:
        "Internal server error.",
    });
  },
);

export default app;