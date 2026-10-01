import {
  appendRegistration,
} from "../config/googleSheets.js";

import {
  sendRegistrationPendingEmail,
} from "../services/emailService.js";

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_REGEX =
  /^\+?[0-9\s()-]{10,20}$/;

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
  "design-deploy",
  "tech-connect",
  "event6",
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

    if (
      !email?.trim() ||
      !EMAIL_REGEX.test(
        email.trim(),
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

    if (
      !phone?.trim() ||
      !PHONE_REGEX.test(
        phone.trim(),
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Please enter a valid phone number.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate transaction ID
    |--------------------------------------------------------------------------
    */

    if (!transactionId?.trim()) {
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
        String(email)
          .trim()
          .toLowerCase(),

      phone:
        String(phone).trim(),

      amount,

      transactionId:
        String(
          transactionId,
        ).trim(),

      status:
        "PENDING",
    };

    /*
    |--------------------------------------------------------------------------
    | Save to event-specific Google Sheet
    |--------------------------------------------------------------------------
    */

    const savedRegistration =
      await appendRegistration(
        registration,
      );

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