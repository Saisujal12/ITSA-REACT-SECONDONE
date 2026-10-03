import {
  appendRegistration,
} from "../config/googleSheets.js";

import {
  sendRegistrationPendingEmail,
} from "../services/emailService.js";

import {
  commitTransactionId,
  normalizeTransactionId,
  releaseTransactionId,
  reserveTransactionId,
} from "../services/transactionRegistry.js";

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_REGEX =
  /^\d{10}$/;

const TRANSACTION_ID_REGEX =
  /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;

/*
|--------------------------------------------------------------------------
| Supported registration events
|--------------------------------------------------------------------------
*/

const EVENT_IDS = new Set([
  "llm",
  "code-build",
  "innovation",
  "cyber-quest",
]);

/*
|--------------------------------------------------------------------------
| Create registration
|--------------------------------------------------------------------------
*/

export async function createRegistration(
  req,
  res,
) {
  try {
    const {
      eventId,
      event,
      name,
      collegeType,
      collegeName,
      rollNo,
      branch,
      email,
      phone,
      amount,
      transactionId,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validate event
    |--------------------------------------------------------------------------
    */

    if (
      !eventId ||
      !EVENT_IDS.has(eventId)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid event selected.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate name
    |--------------------------------------------------------------------------
    */

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,

        message:
          "Please enter your name.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate college type
    |--------------------------------------------------------------------------
    */

    if (
      !["KITSW", "OTHER"].includes(
        collegeType,
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Please select your college.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate college name
    |--------------------------------------------------------------------------
    */

    if (
      collegeType ===
        "OTHER" &&
      !collegeName?.trim()
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Please enter your college name.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate KITSW roll number
    |--------------------------------------------------------------------------
    */

    if (
      collegeType ===
        "KITSW" &&
      !rollNo?.trim()
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Please enter your roll number.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate branch
    |--------------------------------------------------------------------------
    */

    if (!branch?.trim()) {
      return res.status(400).json({
        success: false,

        message:
          "Please enter your branch.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate email
    |--------------------------------------------------------------------------
    */

    const normalizedEmail =
      String(email ?? "")
        .trim()
        .toLowerCase();

    if (
      !normalizedEmail ||
      normalizedEmail.length > 120 ||
      !EMAIL_REGEX.test(
        normalizedEmail,
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Please enter a valid email address.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate phone
    |--------------------------------------------------------------------------
    */

    const normalizedPhone =
      String(phone ?? "").trim();

    if (
      !PHONE_REGEX.test(
        normalizedPhone,
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Phone number must contain exactly 10 digits.",
      });
    }

    const normalizedTransactionId =
      normalizeTransactionId(
        transactionId,
      );

    /*
    |--------------------------------------------------------------------------
    | Validate transaction ID
    |--------------------------------------------------------------------------
    */

    if (
      !normalizedTransactionId ||
      normalizedTransactionId.length < 4 ||
      normalizedTransactionId.length > 50 ||
      !TRANSACTION_ID_REGEX.test(
        normalizedTransactionId,
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Please enter your UTR / transaction ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate amount
    |--------------------------------------------------------------------------
    */

    if (
      amount === undefined ||
      amount === null ||
      amount === ""
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Registration amount is missing.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Generate registration ID
    |--------------------------------------------------------------------------
    */

    const registrationId =
      `IT-${Date.now()}-${Math.floor(
        1000 +
          Math.random() *
            9000,
      )}`;

    /*
    |--------------------------------------------------------------------------
    | Normalize data
    |--------------------------------------------------------------------------
    */

    const normalizedCollegeType =
      collegeType === "KITSW"
        ? "KITSW"
        : "OTHER";

    const registration = {
      registrationId,

      eventId,

      event:
        String(
          event ||
            "Event",
        ).trim(),

      name:
        String(name)
          .trim()
          .replace(
            /\s+/g,
            " ",
          ),

      collegeType:
        normalizedCollegeType,

      collegeName:
        normalizedCollegeType ===
        "KITSW"
          ? "KITSW"
          : String(
              collegeName ||
                "",
            )
              .trim()
              .replace(
                /\s+/g,
                " ",
              ),

      rollNo:
        normalizedCollegeType ===
        "KITSW"
          ? String(
              rollNo ||
                "",
            )
              .trim()
              .toUpperCase()
          : "",

      branch:
        String(branch)
          .trim()
          .replace(
            /\s+/g,
            " ",
          ),

      email:
        normalizedEmail,

      phone:
        normalizedPhone,

      amount,

      transactionId:
        normalizedTransactionId,

      status:
        "PENDING",
    };

    /*
    |--------------------------------------------------------------------------
    | Atomically reserve the transaction ID in persistent storage.
    | The registry uses a database-like persistent sheet protected by
    | Google Apps Script LockService, so concurrent requests cannot both
    | reserve the same transaction ID.
    |--------------------------------------------------------------------------
    */

    await reserveTransactionId(
      registration.transactionId,
      registration.registrationId,
    );

    let savedRegistration;

    try {
      savedRegistration =
        await appendRegistration(
          registration,
        );
    } catch (appendError) {
      try {
        await releaseTransactionId(
          registration.transactionId,
          registration.registrationId,
        );
      } catch (releaseError) {
        console.error(
          "Transaction registry release failed after registration save failure:",
          releaseError.message,
        );
      }
      throw appendError;
    }

    try {
      await commitTransactionId(
        registration.transactionId,
        registration.registrationId,
      );
    } catch (commitError) {
      // The transaction remains RESERVED in persistent storage. Keeping the
      // reservation is safer than releasing it after the registration row was
      // already written, because it still prevents a duplicate submission.
      console.error(
        "Transaction registry commit failed after registration was saved:",
        commitError.message,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Send pending email
    |--------------------------------------------------------------------------
    */

    let emailSent =
      false;

    try {
      await sendRegistrationPendingEmail(
        savedRegistration,
      );

      emailSent =
        true;

      console.log(
        `Pending email sent to ${registration.email}`,
      );
    } catch (
      emailError
    ) {
      /*
       * Email failure must NOT remove
       * the Google Sheets registration.
       */

      console.error(
        "Pending email failed:",
        emailError.message,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    return res
      .status(201)
      .json({
        success: true,

        message: emailSent
          ? "Registration submitted successfully. Verification is pending."
          : "Registration submitted successfully. Email could not be sent, but your registration was saved.",

        registrationId,

        status:
          "PENDING",

        eventId,

        email: {
          sent:
            emailSent,
        },
      });
  } catch (error) {
    console.error(
      "Registration error:",
      error,
    );

    /*
    |--------------------------------------------------------------------------
    | Event sheet not configured
    |--------------------------------------------------------------------------
    */

    if (
      error.code ===
      "EVENT_SHEET_NOT_CONFIGURED"
    ) {
      return res
        .status(503)
        .json({
          success: false,

          message:
            "This event is not configured yet. Please contact the administrator.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Spreadsheet not found
    |--------------------------------------------------------------------------
    */

    if (
      error.code ===
      "GOOGLE_SHEET_NOT_FOUND"
    ) {
      return res
        .status(503)
        .json({
          success: false,

          message:
            "The Google Sheet for this event could not be found. Please contact the administrator.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Spreadsheet access denied
    |--------------------------------------------------------------------------
    */

    if (
      error.code ===
      "GOOGLE_SHEET_ACCESS_DENIED"
    ) {
      return res
        .status(503)
        .json({
          success: false,

          message:
            "The Google Sheet for this event is not accessible. Please contact the administrator.",
        });
    }

    if (
      error.code ===
      "TRANSACTION_ID_ALREADY_USED"
    ) {
      return res
        .status(409)
        .json({
          success: false,
          message:
            "This transaction ID has already been used. Please check your payment details or contact support.",
        });
    }

    if (
      error.code ===
      "TRANSACTION_REGISTRY_NOT_CONFIGURED"
    ) {
      return res
        .status(503)
        .json({
          success: false,
          message:
            "Registration is temporarily unavailable because duplicate-payment protection is not configured.",
        });
    }

    if (
      error.code ===
      "TRANSACTION_REGISTRY_UNAVAILABLE" ||
      error.code ===
      "TRANSACTION_REGISTRY_ERROR"
    ) {
      return res
        .status(503)
        .json({
          success: false,
          message:
            "Registration is temporarily unavailable. Please try again shortly.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Generic error
    |--------------------------------------------------------------------------
    */

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Unable to submit registration right now. Please try again later.",
      });
  }
}