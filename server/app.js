
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import registrationRoutes from "./routes/registrationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.set("trust proxy", 1);

// --------------------------------------------------
// Security headers
// --------------------------------------------------

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// --------------------------------------------------
// CORS configuration
// --------------------------------------------------

const configuredOrigins = (
  process.env.FRONTEND_ORIGIN || ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const localOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function isAllowedOrigin(origin) {
  // Allow requests without an Origin header,
  // such as server-to-server requests.
  if (!origin) {
    return true;
  }

  // Explicitly configured frontend origins.
  if (configuredOrigins.includes(origin)) {
    return true;
  }

  // Local development.
  if (localOrigins.includes(origin)) {
    return true;
  }

  // Allow HTTPS Vercel deployment URLs.
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

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.error(`CORS blocked origin: ${origin}`);

    return callback(
      new Error(`CORS origin not allowed: ${origin}`)
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

  optionsSuccessStatus: 204,
};

// CORS middleware also handles preflight OPTIONS
// requests before the application routes.
app.use(cors(corsOptions));

// --------------------------------------------------
// Body parsing
// --------------------------------------------------

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// --------------------------------------------------
// Registration routes
// --------------------------------------------------

// Both paths use exactly the same router and handler.
app.use("/api/registrations", registrationRoutes);
app.use("/registrations", registrationRoutes);

// --------------------------------------------------
// Admin routes
// --------------------------------------------------

app.use("/api/admin", adminRoutes);

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "IT Association backend is running.",
    timestamp: new Date().toISOString(),
  });
});

// --------------------------------------------------
// Root endpoint
// --------------------------------------------------

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "IT Association backend is running.",
  });
});

// --------------------------------------------------
// 404 handler
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
    path: req.originalUrl,
    method: req.method,
  });
});

// --------------------------------------------------
// Central error handler
// --------------------------------------------------

app.use((error, req, res, next) => {
  console.error("API error:", error);

  if (
    error?.message?.startsWith(
      "CORS origin not allowed"
    )
  ) {
    return res.status(403).json({
      success: false,
      message:
        "This frontend origin is not allowed to access the API.",
      origin: req.headers.origin || null,
    });
  }

  if (error?.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request body is too large.",
    });
  }

  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    "body" in error
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  return res.status(error.status || 500).json({
    success: false,
    message:
      error.status && error.status < 500
        ? error.message
        : "Internal server error.",
  });
});

export default app;

