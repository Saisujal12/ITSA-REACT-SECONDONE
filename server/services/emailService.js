import "dotenv/config";
import nodemailer from "nodemailer";

/*
|--------------------------------------------------------------------------
| IT ASSOCIATION KITSW
| CENTRAL EMAIL SERVICE
|--------------------------------------------------------------------------
|
| ONE GMAIL ACCOUNT IS USED FOR ALL WORKSHOPS / EVENTS.
|
| Required environment variables:
|
| SMTP_HOST=smtp.gmail.com
| SMTP_PORT=465
| SMTP_SECURE=true
| SMTP_USER=yourgmail@gmail.com
| SMTP_PASS=your-google-app-password
| SMTP_FROM_NAME=IT Association | KITSW
|
| IMPORTANT:
|
| SMTP_USER = the actual Gmail address.
|
| SMTP_PASS = Google App Password.
|
| DO NOT use the normal Gmail password.
|
| DO NOT use Google service-account credentials here.
|
|--------------------------------------------------------------------------
*/

/* -----------------------------------------------------------------------
   ENVIRONMENT HELPERS
------------------------------------------------------------------------ */

function cleanEnv(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

const SMTP_HOST =
  cleanEnv(process.env.SMTP_HOST) || "smtp.gmail.com";

const SMTP_PORT =
  Number.parseInt(
    cleanEnv(process.env.SMTP_PORT) || "465",
    10
  );

const SMTP_SECURE =
  String(process.env.SMTP_SECURE ?? "true").toLowerCase() === "true";

const SMTP_USER =
  cleanEnv(process.env.SMTP_USER);

const SMTP_PASS =
  cleanEnv(process.env.SMTP_PASS).replace(/\s/g, "");

const SMTP_FROM_NAME =
  cleanEnv(process.env.SMTP_FROM_NAME) ||
  "IT Association | KITSW";

/* -----------------------------------------------------------------------
   VALIDATE SMTP CONFIGURATION
------------------------------------------------------------------------ */

function getEmailConfig() {
  if (!SMTP_USER) {
    const error = new Error(
      "SMTP_USER is not configured. Set it to the Gmail address used for IT Association emails."
    );

    error.code = "EMAIL_USER_NOT_CONFIGURED";

    throw error;
  }

  if (!SMTP_PASS) {
    const error = new Error(
      "SMTP_PASS is not configured. Set it to a Google App Password."
    );

    error.code = "EMAIL_PASSWORD_NOT_CONFIGURED";

    throw error;
  }

  if (
    !Number.isInteger(SMTP_PORT) ||
    SMTP_PORT <= 0 ||
    SMTP_PORT > 65535
  ) {
    const error = new Error(
      "SMTP_PORT is invalid. Use 465 for Gmail SSL or 587 for STARTTLS."
    );

    error.code = "EMAIL_SMTP_PORT_INVALID";

    throw error;
  }

  return {
    user: SMTP_USER,
    password: SMTP_PASS,
  };
}

/* -----------------------------------------------------------------------
   REUSABLE SMTP TRANSPORTER
------------------------------------------------------------------------ */

let transporter = null;
let transporterUser = null;

function createTransporter() {
  const config = getEmailConfig();

  /*
   * Reuse the same transporter during warm Vercel executions.
   *
   * We intentionally do NOT call transporter.verify()
   * before every email.
   *
   * The actual sendMail() operation will authenticate with Gmail.
   */

  if (
    transporter &&
    transporterUser === config.user
  ) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,

    port: SMTP_PORT,

    secure: SMTP_SECURE,

    auth: {
      user: config.user,
      pass: config.password,
    },

    connectionTimeout: 15000,

    greetingTimeout: 15000,

    socketTimeout: 20000,

    /*
     * Reuse SMTP connections when possible.
     */

    pool: true,

    maxConnections: 2,

    maxMessages: 50,
  });

  transporterUser = config.user;

  return transporter;
}

/* -----------------------------------------------------------------------
   GMAIL AUTH ERROR DETECTION
------------------------------------------------------------------------ */

function isGmailAuthError(error) {
  const message =
    String(error?.message || "");

  return (
    error?.responseCode === 535 ||
    message.includes("535-5.7.8") ||
    message.includes("Username and Password not accepted") ||
    message.includes("BadCredentials")
  );
}

/* -----------------------------------------------------------------------
   CREATE CLEAN GMAIL AUTH ERROR
------------------------------------------------------------------------ */

function createGmailAuthError(
  eventId,
  originalError
) {
  const error = new Error(
    `Gmail authentication failed for event "${eventId}". ` +
    `Check SMTP_USER and SMTP_PASS. ` +
    `SMTP_PASS must be a Google App Password generated for SMTP_USER.`
  );

  error.code =
    "EMAIL_GMAIL_AUTH_FAILED";

  error.originalError =
    originalError;

  return error;
}

/* -----------------------------------------------------------------------
   SEND EMAIL
------------------------------------------------------------------------ */

async function sendEmail({
  eventId,
  to,
  subject,
  text,
  html,
}) {
  const config =
    getEmailConfig();

  const mailTransporter =
    createTransporter();

  try {
    const result =
      await mailTransporter.sendMail({
        from:
          `"${SMTP_FROM_NAME}" <${config.user}>`,

        to,

        subject,

        text,

        html,
      });

    console.log(
      `Email sent successfully for event "${eventId}" to ${to}. Message ID: ${result.messageId}`
    );

    return result;

  } catch (error) {

    console.error(
      `Email sending failed for event "${eventId}":`,
      error.message
    );

    /*
     * Gmail 535 means authentication failed.
     *
     * Clear the cached transporter so that after the
     * Vercel environment is corrected, a fresh transporter
     * will be created.
     */

    if (
      isGmailAuthError(error)
    ) {
      transporter = null;

      transporterUser = null;

      throw createGmailAuthError(
        eventId,
        error
      );
    }

    throw error;
  }
}

/* -----------------------------------------------------------------------
   ESCAPE HTML
------------------------------------------------------------------------ */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* -----------------------------------------------------------------------
   EMAIL STYLES
------------------------------------------------------------------------ */

const emailStyles = `
<style>

  body {
    margin: 0;
    padding: 0;
    background: #f4f4f4;
    font-family: Arial, Helvetica, sans-serif;
    color: #222;
  }

  .container {
    max-width: 650px;
    margin: 30px auto;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
  }

  .header {
    background: #92172f;
    color: #ffffff;
    padding: 28px;
    text-align: center;
  }

  .header h1 {
    margin: 0;
    font-size: 24px;
  }

  .content {
    padding: 30px;
    line-height: 1.6;
  }

  .content h2 {
    margin-top: 0;
  }

  .status {
    margin: 20px 0;
    padding: 15px;
    border-radius: 8px;
    background: #f8f8f8;
    border-left: 5px solid #92172f;
  }

  .details {
    width: 100%;
    border-collapse: collapse;
  }

  .details td {
    padding: 10px;
    border-bottom: 1px solid #eeeeee;
  }

  .details td:first-child {
    font-weight: bold;
    width: 40%;
  }

  .footer {
    padding: 20px 30px;
    background: #fafafa;
    color: #666;
    font-size: 13px;
    text-align: center;
  }

  @media screen and (max-width: 600px) {

    .container {
      margin: 10px;
    }

    .content {
      padding: 20px;
    }

  }

</style>
`;

/* -----------------------------------------------------------------------
   REGISTRATION DETAILS TABLE
------------------------------------------------------------------------ */

function buildDetailsTable(
  registration
) {
  return `
    <table class="details">

      <tr>
        <td>Registration ID</td>
        <td>
          ${escapeHtml(
            registration.registrationId
          )}
        </td>
      </tr>

      <tr>
        <td>Name</td>
        <td>
          ${escapeHtml(
            registration.name
          )}
        </td>
      </tr>

      <tr>
        <td>College</td>
        <td>
          ${escapeHtml(
            registration.collegeName
          )}
        </td>
      </tr>

      ${
        registration.rollNo
          ? `
      <tr>
        <td>Roll Number</td>
        <td>
          ${escapeHtml(
            registration.rollNo
          )}
        </td>
      </tr>
      `
          : ""
      }

      <tr>
        <td>Branch</td>
        <td>
          ${escapeHtml(
            registration.branch
          )}
        </td>
      </tr>

      <tr>
        <td>Event</td>
        <td>
          ${escapeHtml(
            registration.event
          )}
        </td>
      </tr>

      <tr>
        <td>Amount</td>
        <td>
          ₹${escapeHtml(
            registration.amount
          )}
        </td>
      </tr>

      <tr>
        <td>UTR / Transaction ID</td>
        <td>
          ${escapeHtml(
            registration.transactionId
          )}
        </td>
      </tr>

    </table>
  `;
}

/* -----------------------------------------------------------------------
   PENDING EMAIL
------------------------------------------------------------------------ */

export async function sendRegistrationPendingEmail(
  registration
) {
  if (!registration?.email) {
    throw new Error(
      "Student email is missing."
    );
  }

  const name =
    escapeHtml(
      registration.name
    );

  const event =
    escapeHtml(
      registration.event
    );

  const subject =
    `Registration Received - ${registration.event}`;

  const html = `
<!DOCTYPE html>

<html>

<head>

  <meta charset="UTF-8">

  ${emailStyles}

</head>

<body>

  <div class="container">

    <div class="header">

      <h1>
        IT Association | KITSW
      </h1>

    </div>

    <div class="content">

      <h2>
        Registration Received
      </h2>

      <p>
        Dear
        <strong>${name}</strong>,
      </p>

      <p>
        Your registration for
        <strong>${event}</strong>
        has been received successfully.
      </p>

      <div class="status">

        <strong>
          Status: VERIFICATION PENDING
        </strong>

        <br>

        Your payment and registration
        details will be verified by the
        IT Association team.

      </div>

      ${buildDetailsTable(
        registration
      )}

      <p>
        Please keep your Registration ID
        for future reference.
      </p>

    </div>

    <div class="footer">

      IT Association · KITSW

      <br>

      This is an automated email.

    </div>

  </div>

</body>

</html>
`;

  const text = `
IT Association | KITSW

Registration Received

Dear ${registration.name},

Your registration for ${registration.event}
has been received successfully.

Registration ID:
${registration.registrationId}

Name:
${registration.name}

College:
${registration.collegeName}

Roll Number:
${registration.rollNo || ""}

Branch:
${registration.branch}

Event:
${registration.event}

Amount:
₹${registration.amount}

UTR / Transaction ID:
${registration.transactionId}

Status:
VERIFICATION PENDING

Your payment and registration details will be verified by the IT Association team.

IT Association, KITSW
`;

  await sendEmail({
    eventId:
      registration.eventId,

    to:
      registration.email,

    subject,

    text,

    html,
  });
}

/* -----------------------------------------------------------------------
   VERIFIED EMAIL
------------------------------------------------------------------------ */

export async function sendRegistrationSuccessEmail(
  registration
) {
  if (!registration?.email) {
    throw new Error(
      "Student email is missing."
    );
  }

  const subject =
    `Registration Verified - ${registration.event}`;

  const html = `
<!DOCTYPE html>

<html>

<head>

  <meta charset="UTF-8">

  ${emailStyles}

</head>

<body>

  <div class="container">

    <div class="header">

      <h1>
        IT Association | KITSW
      </h1>

    </div>

    <div class="content">

      <h2>
        Registration Verified
      </h2>

      <p>

        Dear
        <strong>
          ${escapeHtml(
            registration.name
          )}
        </strong>,

      </p>

      <div class="status">

        <strong>
          Status: VERIFIED
        </strong>

        <br>

        Your registration has been
        successfully verified.

      </div>

      ${buildDetailsTable(
        registration
      )}

      <p>
        Your registration is now confirmed.
      </p>

      <p>
        Please keep this email and your
        Registration ID.
      </p>

    </div>

    <div class="footer">

      IT Association · KITSW

      <br>

      This is an automated email.

    </div>

  </div>

</body>

</html>
`;

  const text = `
IT Association | KITSW

Registration Verified

Dear ${registration.name},

Your registration has been successfully verified.

Registration ID:
${registration.registrationId}

Event:
${registration.event}

Status:
VERIFIED

Your registration is now confirmed.

IT Association, KITSW
`;

  await sendEmail({
    eventId:
      registration.eventId,

    to:
      registration.email,

    subject,

    text,

    html,
  });
}

/* -----------------------------------------------------------------------
   REJECTED EMAIL
------------------------------------------------------------------------ */

export async function sendRegistrationRejectedEmail(
  registration
) {
  if (!registration?.email) {
    throw new Error(
      "Student email is missing."
    );
  }

  const subject =
    `Registration Update - ${registration.event}`;

  const html = `
<!DOCTYPE html>

<html>

<head>

  <meta charset="UTF-8">

  ${emailStyles}

</head>

<body>

  <div class="container">

    <div class="header">

      <h1>
        IT Association | KITSW
      </h1>

    </div>

    <div class="content">

      <h2>
        Registration Update
      </h2>

      <p>

        Dear
        <strong>
          ${escapeHtml(
            registration.name
          )}
        </strong>,

      </p>

      <div class="status">

        <strong>
          Status: NOT VERIFIED
        </strong>

        <br>

        Your registration could not
        be verified at this time.

      </div>

      ${buildDetailsTable(
        registration
      )}

      <p>
        If you believe this was a mistake,
        please contact the IT Association team.
      </p>

    </div>

    <div class="footer">

      IT Association · KITSW

      <br>

      This is an automated email.

    </div>

  </div>

</body>

</html>
`;

  const text = `
IT Association | KITSW

Registration Update

Dear ${registration.name},

Your registration could not be verified at this time.

Registration ID:
${registration.registrationId}

Event:
${registration.event}

Status:
NOT VERIFIED

Please contact the IT Association team if you believe this was a mistake.

IT Association, KITSW
`;

  await sendEmail({
    eventId:
      registration.eventId,

    to:
      registration.email,

    subject,

    text,

    html,
  });
}