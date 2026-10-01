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

const EVENT_IDS = new Set([
  "llm",
  "code-build",
  "innovation",
  "cyber-quest",
  "design-deploy",
  "tech-connect",
]);

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
    | Basic validation
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

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter your name.",
      });
    }

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

    if (
      collegeType === "OTHER" &&
      !collegeName?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter your college name.",
      });
    }

    if (
      collegeType === "KITSW" &&
      !rollNo?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter your roll number.",
      });
    }

    if (!branch?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter your branch.",
      });
    }

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

    if (!transactionId?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter your UTR / transaction ID.",
      });
    }

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
        1000 + Math.random() * 9000,
      )}`;

    const normalizedCollegeType =
      collegeType === "KITSW"
        ? "KITSW"
        : "OTHER";

    const registration = {
      registrationId,

      eventId,

      event:
        String(event || "Event").trim(),

      name:
        String(name)
          .trim()
          .replace(/\s+/g, " "),

      collegeType:
        normalizedCollegeType,

      collegeName:
        normalizedCollegeType ===
        "KITSW"
          ? "KITSW"
          : String(
              collegeName || "",
            )
              .trim()
              .replace(/\s+/g, " "),

      rollNo:
        normalizedCollegeType ===
        "KITSW"
          ? String(
              rollNo || "",
            )
              .trim()
              .toUpperCase()
          : "",

      branch:
        String(branch)
          .trim()
          .replace(/\s+/g, " "),

      email:
        String(email)
          .trim()
          .toLowerCase(),

      phone:
        String(phone).trim(),

      amount,

      transactionId:
        String(transactionId)
          .trim(),

      status: "PENDING",
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
    | Send event-specific pending email
    |--------------------------------------------------------------------------
    */

    let emailSent = false;

    try {
      await sendRegistrationPendingEmail(
        savedRegistration,
      );

      emailSent = true;

      console.log(
        `Pending email sent to ${registration.email}`,
      );
    } catch (emailError) {
      /*
       * IMPORTANT:
       * Email failure must NOT delete the registration.
       * The Google Sheet entry remains saved.
       */

      console.error(
        "Pending email failed:",
        emailError.message,
      );
    }

    return res.status(201).json({
      success: true,

      message: emailSent
        ? "Registration submitted successfully. Verification is pending."
        : "Registration submitted successfully. Email could not be sent, but your registration was saved.",

      registrationId,

      status: "PENDING",

      email: {
        sent: emailSent,
      },
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error,
    );

    if (
      error.code ===
      "EVENT_SHEET_NOT_CONFIGURED"
    ) {
      return res.status(503).json({
        success: false,
        message:
          "This event is not configured for registration yet.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit registration right now. Please try again later.",
    });
  }
}