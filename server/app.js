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
| Security headers
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
|
| Local development:
|   http://localhost:5173
|
| Production:
|   Set FRONTEND_ORIGIN in Vercel.
|
| Example:
|
| FRONTEND_ORIGIN=https://your-site.vercel.app
|
| Multiple origins can be separated by commas.
|--------------------------------------------------------------------------
*/

const configuredOrigins = (
  process.env.FRONTEND_ORIGIN || ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

/*
|--------------------------------------------------------------------------
| Known Vercel origins
|--------------------------------------------------------------------------
|
| Vercel can expose the application through:
|
| - your production domain
| - your-project.vercel.app
| - deployment preview URLs
|
| We allow Vercel origins only when they are actually Vercel URLs.
|--------------------------------------------------------------------------
*/

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  /*
   * Explicitly configured frontend origins.
   */
  if (
    configuredOrigins.includes(origin)
  ) {
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

  if (
    localOrigins.includes(origin)
  ) {
    return true;
  }

  /*
   * Vercel deployments.
   *
   * Examples:
   *
   * https://it-association.vercel.app
   * https://it-association-git-main-xxx.vercel.app
   * https://it-association-abc123.vercel.app
   */
  try {
    const url = new URL(origin);

    if (
      url.protocol ===
        "https:" &&
      url.hostname.endsWith(
        ".vercel.app",
      )
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
      if (
        isAllowedOrigin(origin)
      ) {
        return callback(
          null,
          true,
        );
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
| Body parsers
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
| API routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/registrations",
  registrationRoutes,
);

app.use(
  "/api/admin",
  adminRoutes,
);

/*
|--------------------------------------------------------------------------
| Health check
|--------------------------------------------------------------------------
*/

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
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
| Root
|--------------------------------------------------------------------------
*/

app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        "IT Association backend is running.",
    });
  },
);

/*
|--------------------------------------------------------------------------
| CORS error handler
|--------------------------------------------------------------------------
|
| Instead of returning an HTML/Vercel error page,
| return a proper JSON response.
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
      return res
        .status(403)
        .json({
          success: false,

          message:
            "This frontend origin is not allowed to access the API.",

          origin:
            req.headers.origin ||
            null,
        });
    }

    return next(error);
  },
);

export default app;