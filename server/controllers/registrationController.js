import {
  appendRegistration,
} from "../config/googleSheets.js";

import {
  sendRegistrationPendingEmail,
} from "../services/emailService.js";

export async function createRegistration(
  req,
  res,
) {
  try {
    const {
      name,
      rollNo,
      year,
      branch,
      email,
      phone,
      workshop,
      amount,
      transactionId,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validate Required Fields
    |--------------------------------------------------------------------------
    */

    if (
      !name ||
      !rollNo ||
      !year ||
      !branch ||
      !email ||
      !phone ||
      !workshop ||
      amount === undefined ||
      amount === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required registration details.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Registration ID
    |--------------------------------------------------------------------------
    */

    const registrationId =
      `IT-${Date.now()}`;

    /*
    |--------------------------------------------------------------------------
    | Initial Status
    |--------------------------------------------------------------------------
    */

    const status = "PENDING";

    /*
    |--------------------------------------------------------------------------
    | Registration Object
    |--------------------------------------------------------------------------
    */

    const registration = {
      registrationId,
      name: String(name).trim(),
      rollNo: String(rollNo).trim(),
      year: String(year).trim(),
      branch: String(branch).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      workshop: String(workshop).trim(),
      amount,
      transactionId:
        transactionId
          ? String(transactionId).trim()
          : "",
      status,
    };

    /*
    |--------------------------------------------------------------------------
    | Save to Google Sheets
    |--------------------------------------------------------------------------
    */

    const savedRegistration =
      await appendRegistration(
        registration,
      );

    /*
    |--------------------------------------------------------------------------
    | Send Pending Email
    |--------------------------------------------------------------------------
    */

    let emailSent = false;

    try {
      await sendRegistrationPendingEmail(
        savedRegistration,
      );

      emailSent = true;

      console.log(
        `📧 Pending email sent to ${registration.email}`,
      );
    } catch (emailError) {
      console.error(
        "⚠️ Pending email failed:",
        emailError,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,
      message: emailSent
        ? "Registration submitted successfully. Verification is pending."
        : "Registration submitted successfully, but the pending email could not be sent.",
      registrationId,
      status,
      email: {
        sent: emailSent,
      },
    });
  } catch (error) {
    console.error(
      "❌ Registration error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit registration right now. Please try again in a few minutes.",
    });
  }
}