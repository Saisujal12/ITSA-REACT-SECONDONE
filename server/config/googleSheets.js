import "dotenv/config";
import { google } from "googleapis";
import { getAdminEvent } from "./adminEvents.js";
import { Readable } from "node:stream";
import { storePptFiles } from "../services/pptFiles.js";
import { PPT_EVENT_ID } from "../../shared/pptRegistration.js";
import { ensurePptSheet, pptSheetValues, pptDetailsFromRow } from "../services/pptSheet.js";

/*
|--------------------------------------------------------------------------
| EVENT → GOOGLE SHEET CONFIGURATION
|--------------------------------------------------------------------------
|
| Each event can use its own Google Spreadsheet.
|
| Workshop      → EVENT_SHEET_ID_LLM
| Event 1       → EVENT_SHEET_ID_CODE_BUILD
| Event 2       → EVENT_SHEET_ID_INNOVATION
| Event 3       → EVENT_SHEET_ID_CYBER_QUEST
| Event 4       → EVENT_SHEET_ID_DESIGN_DEPLOY
| Event 5       → EVENT_SHEET_ID_TECH_CONNECT
| Event 6       → EVENT_SHEET_ID_EVENT6
| Event 7       → EVENT_SHEET_ID_EVENT7
| Event 8       → EVENT_SHEET_ID_EVENT8
| Event 9       → EVENT_SHEET_ID_EVENT9
| Event 10      → EVENT_SHEET_ID_EVENT10
|
| IMPORTANT:
|
| These environment variables must contain the REAL
| Google Spreadsheet IDs.
|
|--------------------------------------------------------------------------
*/

const EVENT_CONFIG = {
  llm: {
    sheetId:
      process.env.EVENT_SHEET_ID_LLM ||
      process.env.GOOGLE_SHEET_ID ||
      "",
  },

  "code-build": {
    sheetId:
      process.env.EVENT_SHEET_ID_CODE_BUILD ||
      "",
  },

  innovation: {
    sheetId:
      process.env.EVENT_SHEET_ID_INNOVATION ||
      "",
  },

  "cyber-quest": {
    sheetId:
      process.env.EVENT_SHEET_ID_CYBER_QUEST ||
      "",
  },

  "design-deploy": {
    sheetId:
      process.env.EVENT_SHEET_ID_DESIGN_DEPLOY ||
      "",
  },

  "tech-connect": {
    sheetId:
      process.env.EVENT_SHEET_ID_TECH_CONNECT ||
      "",
  },

  event6: {
    sheetId:
      process.env.EVENT_SHEET_ID_EVENT6 ||
      "",
  },

  event7: {
    sheetId: process.env.EVENT_SHEET_ID_EVENT7 || "",
  },

  event8: {
    sheetId: process.env.EVENT_SHEET_ID_EVENT8 || "",
  },

  event9: {
    sheetId: process.env.EVENT_SHEET_ID_EVENT9 || "",
  },

  event10: {
    sheetId: process.env.EVENT_SHEET_ID_EVENT10 || "",
  },
};

const SHEET_NAME =
  (
    process.env.GOOGLE_SHEET_TAB_NAME ||
    "Registrations"
  ).trim();

const HEADERS = [
  "Registration ID",
  "Name",
  "College Type",
  "College Name",
  "Roll No",
  "Year",
  "Branch",
  "Email",
  "Phone no",
  "Veg/Non-veg",
  "UTR/Transaction ID",
  "Status",
  "Created AT",
  "Updated AT",
  "Payment Screenshot",
];

const LEGACY_HEADERS = HEADERS.slice(0, 14);

function formatSheetTimestamp(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h12",
    })
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );

  return `${parts.day}-${parts.month}-${parts.year} ${parts.hour}:${parts.minute} ${parts.dayPeriod.toUpperCase()}`;
}

/*
|--------------------------------------------------------------------------
| Placeholder detection
|--------------------------------------------------------------------------
|
| Prevents values such as:
|
| PASTE_INNOVATION_SHEET_ID_HERE
|
| from being sent to Google.
|--------------------------------------------------------------------------
*/

function isPlaceholderSheetId(
  value,
) {
  if (!value) {
    return true;
  }

  const normalized =
    String(value)
      .trim()
      .toUpperCase();

  return (
    normalized.startsWith(
      "PASTE_",
    ) ||
    normalized.includes(
      "SHEET_ID_HERE",
    ) ||
    normalized ===
      "YOUR_SHEET_ID" ||
    normalized ===
      "YOUR_GOOGLE_SHEET_ID"
  );
}

/*
|--------------------------------------------------------------------------
| Check whether an event has a valid spreadsheet configured
|--------------------------------------------------------------------------
*/

export function isEventSheetConfigured(
  eventId,
) {
  const sheetId =
    EVENT_CONFIG[eventId]?.sheetId;

  return (
    Boolean(sheetId) &&
    !isPlaceholderSheetId(
      sheetId,
    )
  );
}

/*
|--------------------------------------------------------------------------
| Get spreadsheet ID
|--------------------------------------------------------------------------
*/

function getSpreadsheetId(
  eventId,
) {
  const sheetId =
    EVENT_CONFIG[eventId]?.sheetId;

  if (
    !sheetId ||
    isPlaceholderSheetId(
      sheetId,
    )
  ) {
    const error =
      new Error(
        `Google Sheet is not configured correctly for event "${eventId}". Set the correct spreadsheet ID in the Vercel environment variable.`,
      );

    error.code =
      "EVENT_SHEET_NOT_CONFIGURED";

    throw error;
  }

  return String(
    sheetId,
  ).trim();
}

/*
|--------------------------------------------------------------------------
| Google authentication
|--------------------------------------------------------------------------
*/

function createAuth() {
  /*
   * Vercel / production
   *
   * Recommended:
   *
   * GOOGLE_SERVICE_ACCOUNT_JSON
   */
  if (
    process.env
      .GOOGLE_SERVICE_ACCOUNT_JSON
  ) {
    let credentials;

    try {
      credentials =
        JSON.parse(
          process.env
            .GOOGLE_SERVICE_ACCOUNT_JSON,
        );
    } catch {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON.",
      );
    }

    return new google.auth.GoogleAuth({
      credentials,

      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
      ],
    });
  }

  /*
   * Local development
   */
  const clientEmail =
    process.env
      .GOOGLE_SERVICE_ACCOUNT_EMAIL
      ?.trim();

  const privateKey =
    process.env
      .GOOGLE_PRIVATE_KEY
      ?.replace(
        /\\n/g,
        "\n",
      );

  if (
    !clientEmail ||
    !privateKey
  ) {
    throw new Error(
      "Google service-account credentials are not configured.",
    );
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email:
        clientEmail,

      private_key:
        privateKey,
    },

    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}

const auth =
  createAuth();

function createDriveAuth() {
  const clientId = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN?.trim();
  const configured = [clientId, clientSecret, refreshToken].filter(Boolean).length;

  if (configured === 0) {
    // Backwards compatibility: existing service-account Drive configuration.
    return auth;
  }

  if (configured !== 3) {
    throw new Error(
      "Personal Google Drive OAuth is incomplete. Set GOOGLE_DRIVE_OAUTH_CLIENT_ID, GOOGLE_DRIVE_OAUTH_CLIENT_SECRET, and GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN.",
    );
  }

  const oauthClient = new google.auth.OAuth2(clientId, clientSecret);
  oauthClient.setCredentials({ refresh_token: refreshToken });
  return oauthClient;
}

const sheets =
  google.sheets({
    version: "v4",
    auth,
  });

// Drive can use a personal Gmail OAuth token while Sheets continues using the
// service account. OAuth is selected when all three GOOGLE_DRIVE_OAUTH_* vars
// are present in server/.env.
const drive = google.drive({ version: "v3", auth: createDriveAuth() });

/*
|--------------------------------------------------------------------------
| Ensure registration sheet headers exist
|--------------------------------------------------------------------------
*/

export async function ensureRegistrationSheet(
  eventId,
) {
  const spreadsheetId =
    getSpreadsheetId(
      eventId,
    );

  try {
    if (eventId === PPT_EVENT_ID) {
      return await ensurePptSheet({ sheets, spreadsheetId, sheetName: SHEET_NAME, baseHeaders: HEADERS });
    }
    const response =
      await sheets.spreadsheets.values.get(
        {
          spreadsheetId,

          range:
            `${SHEET_NAME}!A1:P1`,
        },
      );

    const existingHeaders =
      response.data.values?.[0] ||
      [];

    const headersMatch =
      HEADERS.every(
        (
          header,
          index,
        ) =>
          existingHeaders[
            index
          ] === header,
      ) && !String(existingHeaders[15] || "").trim();

    if (!headersMatch) {
      const existingRows = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:P`,
      });

      const legacyHeadersMatch = LEGACY_HEADERS.every(
        (header, index) => existingHeaders[index] === header,
      );

      const currentHeadersWithAllocationColumn =
        legacyHeadersMatch && existingHeaders[14] === "Seat Allocation";

      if (currentHeadersWithAllocationColumn) {
        await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${SHEET_NAME}!O:O` });
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${SHEET_NAME}!A1:O1`,
          valueInputOption: "RAW",
          requestBody: { values: [HEADERS] },
        });
        return HEADERS;
      }

      if (legacyHeadersMatch && !String(existingHeaders[14] || "").trim()) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${SHEET_NAME}!O1`,
          valueInputOption: "RAW",
          requestBody: { values: [[HEADERS[14]]] },
        });
        return HEADERS;
      }

      if (existingRows.data.values?.length) {
        const schemaError = new Error(
          `The registration tab for "${eventId}" still contains rows using the old column layout. Back up the tab, then migrate or clear its old rows before using the new registration columns.`,
        );
        schemaError.code = "GOOGLE_SHEET_SCHEMA_MISMATCH";
        throw schemaError;
      }

      await sheets.spreadsheets.values.update(
        {
          spreadsheetId,

          range:
            `${SHEET_NAME}!A1:O1`,

          valueInputOption:
            "RAW",

          requestBody: {
            values: [
              HEADERS,
            ],
          },
        },
      );
    }

    return HEADERS;
  } catch (error) {
    /*
     * Give a much clearer error for an invalid
     * spreadsheet ID or inaccessible spreadsheet.
     */

    if (
      error?.code === 404 ||
      error?.response?.status ===
        404
    ) {
      const configError =
        new Error(
          `Google Spreadsheet was not found for event "${eventId}". Check the spreadsheet ID and make sure the spreadsheet is shared with the service-account email.`,
        );

      configError.code =
        "GOOGLE_SHEET_NOT_FOUND";

      throw configError;
    }

    if (
      error?.code === 403 ||
      error?.response?.status ===
        403
    ) {
      const configError =
        new Error(
          `Google Spreadsheet access denied for event "${eventId}". Share the spreadsheet with the Google service-account email as Editor.`,
        );

      configError.code =
        "GOOGLE_SHEET_ACCESS_DENIED";

      throw configError;
    }

    throw error;
  }
}

export async function uploadPaymentScreenshot({
  registrationId,
  fileName,
  mimeType,
  base64,
}) {
  const folderId = process.env.PAYMENT_SCREENSHOT_FOLDER_ID?.trim();
  if (!folderId) {
    const error = new Error("PAYMENT_SCREENSHOT_FOLDER_ID is not configured.");
    error.code = "PAYMENT_SCREENSHOT_STORAGE_NOT_CONFIGURED";
    throw error;
  }

  const safeName = String(fileName || "payment-screenshot.jpg")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-100);
  const bytes = Buffer.from(base64, "base64");
  let response;
  try {
    response = await drive.files.create({
      supportsAllDrives: true,
      requestBody: {
        name: `${registrationId}-${safeName}`,
        mimeType,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: Readable.from(bytes),
      },
      fields: "id,name,webViewLink",
    });
  } catch (cause) {
    if ([403, 404].includes(cause?.code || cause?.response?.status)) {
      const driveApiError = cause?.response?.data?.error;
      const safeMessage = String(driveApiError?.message || cause?.message || "Unknown Drive API error")
        .replaceAll(folderId, "[configured folder]");
      console.error("Payment screenshot Drive upload was denied:", {
        status: cause?.response?.status || cause?.code,
        reason: driveApiError?.errors?.[0]?.reason || driveApiError?.status || "unknown",
        message: safeMessage,
      });
      const reason = driveApiError?.errors?.[0]?.reason || driveApiError?.status;
      if (reason === "storageQuotaExceeded") {
        const error = new Error(
          "The payment screenshot folder is in My Drive. Google service accounts cannot own files because they have no Drive storage quota. Configure PAYMENT_SCREENSHOT_FOLDER_ID with a folder inside a Google Workspace Shared Drive, and add the service account to that Shared Drive with Contributor or higher access.",
        );
        error.code = "PAYMENT_SCREENSHOT_SHARED_DRIVE_REQUIRED";
        throw error;
      }
      const error = new Error("The configured payment screenshot Drive folder is missing or inaccessible.");
      error.code = "PAYMENT_SCREENSHOT_STORAGE_ACCESS_DENIED";
      throw error;
    }
    throw cause;
  }

  return {
    id: response.data.id,
    url: response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`,
  };
}

export async function deletePaymentScreenshot(fileId) {
  if (fileId) {
    await drive.files.delete({ fileId, supportsAllDrives: true });
  }
}

export function uploadPptRegistrationFiles(input) {
  return storePptFiles(input, {
    drive,
    parentId: process.env.PAYMENT_SCREENSHOT_FOLDER_ID?.trim(),
  });
}

/*
|--------------------------------------------------------------------------
| Append registration
|--------------------------------------------------------------------------
*/

export async function appendRegistration(
  registration,
) {
  const eventId =
    registration.eventId;

  const spreadsheetId =
    getSpreadsheetId(
      eventId,
    );

  await ensureRegistrationSheet(
    eventId,
  );

  const createdAt = formatSheetTimestamp();
  const values = [
    [
      registration.registrationId ||
        "",

      registration.name ||
        "",

      registration.collegeType ||
        "",

      registration.collegeName ||
        "",

      registration.rollNo ||
        "",

      registration.year ||
        "",

      registration.branch ||
        "",

      registration.email ||
        "",

      registration.phone ||
        "",

      registration.mealPreference ||
        "",

      registration.transactionId ||
        "",

      registration.status ||
        "PENDING",

      createdAt,

      "",

      registration.paymentScreenshotUrl || "",
      ...(eventId === PPT_EVENT_ID ? pptSheetValues(registration.pptDetails) : []),
    ],
  ];

  try {
    await sheets.spreadsheets.values.append(
      {
        spreadsheetId,

        range:
          `${SHEET_NAME}!A:${eventId === PPT_EVENT_ID ? "T" : "O"}`,

        valueInputOption:
          "RAW",

        insertDataOption:
          "INSERT_ROWS",

        requestBody: {
          values,
        },
      },
    );
  } catch (error) {
    if (
      error?.code === 404 ||
      error?.response?.status ===
        404
    ) {
      const configError =
        new Error(
          `Google Spreadsheet was not found for event "${eventId}".`,
        );

      configError.code =
        "GOOGLE_SHEET_NOT_FOUND";

      throw configError;
    }

    if (
      error?.code === 403 ||
      error?.response?.status ===
        403
    ) {
      const configError =
        new Error(
          `Google Spreadsheet access denied for event "${eventId}".`,
        );

      configError.code =
        "GOOGLE_SHEET_ACCESS_DENIED";

      throw configError;
    }

    throw error;
  }

  return {
    ...registration,

    createdAt,
  };
}

/*
|--------------------------------------------------------------------------
| Get registrations for ONE event
|--------------------------------------------------------------------------
*/

export async function getRegistrationRows(
  eventId,
) {
  const spreadsheetId =
    getSpreadsheetId(
      eventId,
    );

  await ensureRegistrationSheet(
    eventId,
  );

  const response =
    await sheets.spreadsheets.values.get(
      {
        spreadsheetId,

        range:
          `${SHEET_NAME}!A2:${eventId === PPT_EVENT_ID ? "T" : "O"}`,
      },
    );

  const rows =
    response.data.values ||
    [];

  return rows
    .map(
      (
        row,
        index,
      ) => ({
        rowNumber:
          index + 2,

        eventId,

        ...(eventId === PPT_EVENT_ID ? { pptDetails: pptDetailsFromRow(row) } : {}),

        registrationId:
          row[0] || "",

        name:
          row[1] || "",

        collegeType:
          row[2] || "",

        collegeName:
          row[3] || "",

        rollNo:
          row[4] || "",

        year:
          row[5] || "",

        branch:
          row[6] || "",

        email:
          row[7] || "",

        phone:
          row[8] || "",

        mealPreference:
          row[9] || "",

        transactionId:
          row[10] || "",

        paymentScreenshotUrl:
          row[14] || "",

        status:
          row[11] ||
          "PENDING",

        createdAt:
          row[12] || "",

        updatedAt:
          row[13] || "",

      }),
    )
    .filter(
      (
        registration,
      ) =>
        registration.registrationId ||
        registration.name ||
        registration.email,
    )
    .reverse();
}

/*
|--------------------------------------------------------------------------
| Get all registrations
|--------------------------------------------------------------------------
*/

export async function getAllRegistrationRows() {
  const results = [];

  for (
    const eventId of
    Object.keys(
      EVENT_CONFIG,
    )
  ) {
    if (
      !isEventSheetConfigured(
        eventId,
      )
    ) {
      continue;
    }

    try {
      const rows =
        await getRegistrationRows(
          eventId,
        );

      results.push(
        ...rows,
      );
    } catch (error) {
      console.error(
        `Failed to read sheet for ${eventId}:`,
        error.message,
      );
    }
  }

  return results.sort(
    (
      a,
      b,
    ) =>
      new Date(
        b.createdAt || 0,
      ) -
      new Date(
        a.createdAt || 0,
      ),
  );
}

/*
|--------------------------------------------------------------------------
| Update registration status
|--------------------------------------------------------------------------
*/

export async function updateRegistrationStatus(
  eventId,
  rowNumber,
  status,
) {
  const spreadsheetId =
    getSpreadsheetId(
      eventId,
    );

  if (
    !Number.isInteger(
      rowNumber,
    ) ||
    rowNumber < 2
  ) {
    const error =
      new Error(
        "Invalid registration row number.",
      );

    error.code =
      "INVALID_ROW_NUMBER";

    throw error;
  }

  const response =
    await sheets.spreadsheets.values.get(
      {
        spreadsheetId,

        range:
          `${SHEET_NAME}!A${rowNumber}:${eventId === PPT_EVENT_ID ? "T" : "O"}${rowNumber}`,
      },
    );

  const rows =
    response.data.values ||
    [];

  if (!rows.length) {
    const error =
      new Error(
        "Registration row was not found.",
      );

    error.code =
      "REGISTRATION_NOT_FOUND";

    throw error;
  }

  const row =
    rows[0];

  // The sheet stores event registrations in separate spreadsheets, so the
  // signed admin event is the authoritative source for the event name/fee.
  const eventConfig = getAdminEvent(eventId);

  const currentStatus =
    String(
      row[11] ||
        "PENDING",
    ).toUpperCase();

  if (
    currentStatus !==
    "PENDING"
  ) {
    const error =
      new Error(
        "Registration has already been processed.",
      );

    error.code =
      "REGISTRATION_ALREADY_PROCESSED";

    throw error;
  }

  const updatedAt = formatSheetTimestamp();

  await sheets.spreadsheets.values.update(
    {
      spreadsheetId,

      range:
        `${SHEET_NAME}!L${rowNumber}:N${rowNumber}`,

      valueInputOption:
        "RAW",

      requestBody: {
        values: [
          [
            status,
            row[12] || "",
            updatedAt,
          ],
        ],
      },
    },
  );

  return {
    rowNumber,

    eventId,

    event: eventConfig?.name || eventId,

    ...(eventId === PPT_EVENT_ID ? { pptDetails: pptDetailsFromRow(row) } : {}),

    amount: eventConfig?.fee ?? null,

    registrationId:
      row[0] || "",

    name:
      row[1] || "",

    collegeType:
      row[2] || "",

    collegeName:
      row[3] || "",

    rollNo:
      row[4] || "",

    year:
      row[5] || "",

    branch:
      row[6] || "",

    email:
      row[7] || "",

    phone:
      row[8] || "",

    mealPreference:
      row[9] || "",

    transactionId:
      row[10] || "",

    paymentScreenshotUrl:
      row[14] || "",

    status,

    createdAt:
      row[12] || "",

    updatedAt,

  };
}
