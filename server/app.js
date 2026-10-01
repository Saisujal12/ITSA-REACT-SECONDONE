import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import registrationRoutes from "./routes/registrationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.set(
  "trust proxy",
  1,
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

const allowedOrigins =
  (
    process.env.FRONTEND_ORIGIN ||
    ""
  )
    .split(",")
    .map((origin) =>
      origin.trim(),
    )
    .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      /*
       * Allow server-to-server requests
       * and local development.
       */
      if (!origin) {
        return callback(
          null,
          true,
        );
      }

      if (
        allowedOrigins.length ===
        0
      ) {
        return callback(
          null,
          true,
        );
      }

      if (
        allowedOrigins.includes(
          origin,
        )
      ) {
        return callback(
          null,
          true,
        );
      }

      return callback(
        new Error(
          "CORS origin not allowed.",
        ),
      );
    },

    credentials: true,
  }),
);

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

app.use(
  "/api/registrations",
  registrationRoutes,
);

app.use(
  "/api/admin",
  adminRoutes,
);

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

export default app;