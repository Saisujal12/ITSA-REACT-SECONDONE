import "dotenv/config";
import { google } from "googleapis";

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
  "Branch",
  "Email",
  "Phone",
  "Event",
  "Amount",
  "UTR / Transaction ID",
  "Status",
  "Created At",
  "Updated At",
];

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
    ],
  });
}

const auth =
  createAuth();

const sheets =
  google.sheets({
    version: "v4",
    auth,
  });

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
    const response =
      await sheets.spreadsheets.values.get(
        {
          spreadsheetId,

          range:
            `${SHEET_NAME}!A1:N1`,
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
      );

    if (!headersMatch) {
      await sheets.spreadsheets.values.update(
        {
          spreadsheetId,

          range:
            `${SHEET_NAME}!A1:N1`,

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

  const createdAt =
    new Date().toISOString();

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

      registration.branch ||
        "",

      registration.email ||
        "",

      registration.phone ||
        "",

      registration.event ||
        "",

      registration.amount ??
        "",

      registration.transactionId ||
        "",

      registration.status ||
        "PENDING",

      createdAt,

      "",
    ],
  ];

  try {
    await sheets.spreadsheets.values.append(
      {
        spreadsheetId,

        range:
          `${SHEET_NAME}!A:N`,

        valueInputOption:
          "USER_ENTERED",

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
          `${SHEET_NAME}!A2:N`,
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

        branch:
          row[5] || "",

        email:
          row[6] || "",

        phone:
          row[7] || "",

        event:
          row[8] || "",

        amount:
          row[9] || "",

        transactionId:
          row[10] || "",

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
          `${SHEET_NAME}!A${rowNumber}:N${rowNumber}`,
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

  const updatedAt =
    new Date().toISOString();

  await sheets.spreadsheets.values.update(
    {
      spreadsheetId,

      range:
        `${SHEET_NAME}!L${rowNumber}:N${rowNumber}`,

      valueInputOption:
        "USER_ENTERED",

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

    branch:
      row[5] || "",

    email:
      row[6] || "",

    phone:
      row[7] || "",

    event:
      row[8] || "",

    amount:
      row[9] || "",

    transactionId:
      row[10] || "",

    status,

    createdAt:
      row[12] || "",

    updatedAt,
  };
}