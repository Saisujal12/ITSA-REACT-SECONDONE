import "dotenv/config";

import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const credentialsPath = path.join(
  __dirname,
  "google-service-account.json",
);

const auth = new google.auth.GoogleAuth({
  keyFile: credentialsPath,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
  ],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

const SHEET_NAME = "Registrations";

function getSpreadsheetId() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) {
    throw new Error(
      "GOOGLE_SHEET_ID is missing from the .env file.",
    );
  }

  return spreadsheetId;
}

/*
|--------------------------------------------------------------------------
| Get Headers
|--------------------------------------------------------------------------
*/

export async function getRegistrationHeaders() {
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!A1:M1`,
  });

  return response.data.values || [];
}

/*
|--------------------------------------------------------------------------
| Append Registration
|--------------------------------------------------------------------------
*/

export async function appendRegistration(registration) {
  const spreadsheetId = getSpreadsheetId();

  const createdAt = new Date().toISOString();

  /*
  IMPORTANT:
  Google Sheets API expects values as an array of arrays.
  */

  const values = [
    [
      registration.registrationId || "",
      registration.name || "",
      registration.rollNo || "",
      registration.year || "",
      registration.branch || "",
      registration.email || "",
      registration.phone || "",
      registration.workshop || "",
      registration.amount ?? "",
      registration.transactionId || "",
      registration.status || "PENDING",
      createdAt,
      "",
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:M`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values,
    },
  });

  return {
    ...registration,
    createdAt,
  };
}

/*
|--------------------------------------------------------------------------
| Get All Registrations
|--------------------------------------------------------------------------
*/

export async function getRegistrationRows() {
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!A2:M`,
  });

  const rows = response.data.values || [];

  return rows
    .map((row, index) => {
      const rowNumber = index + 2;

      return {
        rowNumber,
        registrationId: row[0] || "",
        name: row[1] || "",
        rollNo: row[2] || "",
        year: row[3] || "",
        branch: row[4] || "",
        email: row[5] || "",
        phone: row[6] || "",
        workshop: row[7] || "",
        amount: row[8] || "",
        transactionId: row[9] || "",
        status: row[10] || "PENDING",
        createdAt: row[11] || "",
        updatedAt: row[12] || "",
      };
    })
    .filter(
      (registration) =>
        registration.registrationId ||
        registration.name ||
        registration.email,
    )
    .reverse();
}

/*
|--------------------------------------------------------------------------
| Update Registration Status
|--------------------------------------------------------------------------
*/

export async function updateRegistrationStatus(
  rowNumber,
  status,
) {
  const spreadsheetId = getSpreadsheetId();

  if (!Number.isInteger(rowNumber) || rowNumber < 2) {
    const error = new Error(
      "Invalid registration row number.",
    );

    error.code = "INVALID_ROW_NUMBER";

    throw error;
  }

  const response =
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A${rowNumber}:M${rowNumber}`,
    });

  const rows = response.data.values || [];

  if (!rows.length || !rows[0]) {
    const error = new Error(
      "Registration row was not found.",
    );

    error.code = "REGISTRATION_NOT_FOUND";

    throw error;
  }

  const row = rows[0];

  const currentStatus = row[10] || "PENDING";

  if (currentStatus !== "PENDING") {
    const error = new Error(
      "Registration has already been processed.",
    );

    error.code = "REGISTRATION_ALREADY_PROCESSED";

    throw error;
  }

  const updatedAt = new Date().toISOString();

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!K${rowNumber}:M${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          status,
          row[11] || "",
          updatedAt,
        ],
      ],
    },
  });

  return {
    rowNumber,
    registrationId: row[0] || "",
    name: row[1] || "",
    rollNo: row[2] || "",
    year: row[3] || "",
    branch: row[4] || "",
    email: row[5] || "",
    phone: row[6] || "",
    workshop: row[7] || "",
    amount: row[8] || "",
    transactionId: row[9] || "",
    status,
    createdAt: row[11] || "",
    updatedAt,
  };
}

/*
|--------------------------------------------------------------------------
| Delete Sheet Row
|--------------------------------------------------------------------------
*/

export async function deleteSheetRow(rowNumber) {
  const spreadsheetId = getSpreadsheetId();

  const sheetId = await getSheetId();

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  });
}

/*
|--------------------------------------------------------------------------
| Get Numeric Sheet ID
|--------------------------------------------------------------------------
*/

async function getSheetId() {
  const spreadsheetId = getSpreadsheetId();

  const response =
    await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets.properties",
    });

  const registrationSheet =
    response.data.sheets?.find(
      (sheet) =>
        sheet.properties.title === SHEET_NAME,
    );

  if (!registrationSheet) {
    throw new Error(
      `Sheet tab "${SHEET_NAME}" was not found.`,
    );
  }

  return registrationSheet.properties.sheetId;
}