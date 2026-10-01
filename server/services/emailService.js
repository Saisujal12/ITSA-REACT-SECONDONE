import "dotenv/config";
import nodemailer from "nodemailer";

/*
|--------------------------------------------------------------------------
| Event email configuration
|--------------------------------------------------------------------------
|
| TEST MODE:
| Each event can have a different Gmail account.
|
| Later add:
| EVENT_EMAIL_USER_DESIGN_DEPLOY
| EVENT_EMAIL_PASSWORD_DESIGN_DEPLOY
|
|--------------------------------------------------------------------------
*/

const EMAIL_CONFIG = {
  llm: {
    user:
      process.env.EVENT_EMAIL_USER_LLM ||
      process.env.EMAIL_USER ||
      "",

    password:
      process.env.EVENT_EMAIL_PASSWORD_LLM ||
      process.env.EMAIL_APP_PASSWORD ||
      "",
  },

  "code-build": {
    user:
      process.env.EVENT_EMAIL_USER_CODE_BUILD ||
      "",

    password:
      process.env.EVENT_EMAIL_PASSWORD_CODE_BUILD ||
      "",
  },

  innovation: {
    user:
      process.env.EVENT_EMAIL_USER_INNOVATION ||
      "",

    password:
      process.env.EVENT_EMAIL_PASSWORD_INNOVATION ||
      "",
  },

  "cyber-quest": {
    user:
      process.env.EVENT_EMAIL_USER_CYBER_QUEST ||
      "",

    password:
      process.env.EVENT_EMAIL_PASSWORD_CYBER_QUEST ||
      "",
  },

  "design-deploy": {
    user:
      process.env.EVENT_EMAIL_USER_DESIGN_DEPLOY ||
      "",

    password:
      process.env.EVENT_EMAIL_PASSWORD_DESIGN_DEPLOY ||
      "",
  },

  "tech-connect": {
    user:
      process.env.EVENT_EMAIL_USER_TECH_CONNECT ||
      "",

    password:
      process.env.EVENT_EMAIL_PASSWORD_TECH_CONNECT ||
      "",
  },
};

function getEmailConfig(eventId) {
  const config =
    EMAIL_CONFIG[eventId];

  if (
    !config?.user ||
    !config?.password
  ) {
    throw new Error(
      `Email account is not configured for event "${eventId}".`,
    );
  }

  return config;
}

function createTransporter(eventId) {
  const config =
    getEmailConfig(eventId);

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.user,
      pass: config.password,
    },
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
    color: white;
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
</style>
`;

function buildDetailsTable(
  registration,
) {
  return `
    <table class="details">
      <tr>
        <td>Registration ID</td>
        <td>${escapeHtml(
          registration.registrationId,
        )}</td>
      </tr>

      <tr>
        <td>Name</td>
        <td>${escapeHtml(
          registration.name,
        )}</td>
      </tr>

      <tr>
        <td>College</td>
        <td>${escapeHtml(
          registration.collegeName,
        )}</td>
      </tr>

      ${
        registration.rollNo
          ? `
      <tr>
        <td>Roll Number</td>
        <td>${escapeHtml(
          registration.rollNo,
        )}</td>
      </tr>
      `
          : ""
      }

      <tr>
        <td>Branch</td>
        <td>${escapeHtml(
          registration.branch,
        )}</td>
      </tr>

      <tr>
        <td>Event</td>
        <td>${escapeHtml(
          registration.event,
        )}</td>
      </tr>

      <tr>
        <td>Amount</td>
        <td>₹${escapeHtml(
          registration.amount,
        )}</td>
      </tr>

      <tr>
        <td>UTR / Transaction ID</td>
        <td>${escapeHtml(
          registration.transactionId,
        )}</td>
      </tr>
    </table>
  `;
}

/*
|--------------------------------------------------------------------------
| Pending email
|--------------------------------------------------------------------------
*/

export async function sendRegistrationPendingEmail(
  registration,
) {
  if (!registration?.email) {
    throw new Error(
      "Student email is missing.",
    );
  }

  const config =
    getEmailConfig(
      registration.eventId,
    );

  const transporter =
    createTransporter(
      registration.eventId,
    );

  const name =
    escapeHtml(
      registration.name,
    );

  const event =
    escapeHtml(
      registration.event,
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
    <h1>IT Association | KITSW</h1>
  </div>

  <div class="content">

    <h2>Registration Received</h2>

    <p>
      Dear <strong>${name}</strong>,
    </p>

    <p>
      Your registration for
      <strong>${event}</strong>
      has been received successfully.
    </p>

    <div class="status">
      <strong>Status: VERIFICATION PENDING</strong>
      <br>
      Your payment and registration details will be
      verified by the IT Association team.
    </div>

    ${buildDetailsTable(
      registration,
    )}

    <p>
      Please keep your Registration ID for future reference.
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

Your registration for ${registration.event} has been received successfully.

Registration ID: ${registration.registrationId}
Name: ${registration.name}
College: ${registration.collegeName}
Roll Number: ${registration.rollNo}
Branch: ${registration.branch}
Event: ${registration.event}
Amount: ₹${registration.amount}
UTR / Transaction ID: ${registration.transactionId}

Status: VERIFICATION PENDING

Your payment and registration details will be verified by the IT Association team.

IT Association, KITSW
`;

  await transporter.sendMail({
    from: `"IT Association | KITSW" <${config.user}>`,
    to: registration.email,
    subject,
    text,
    html,
  });
}

/*
|--------------------------------------------------------------------------
| Verified email
|--------------------------------------------------------------------------
*/

export async function sendRegistrationSuccessEmail(
  registration,
) {
  if (!registration?.email) {
    throw new Error(
      "Student email is missing.",
    );
  }

  const config =
    getEmailConfig(
      registration.eventId,
    );

  const transporter =
    createTransporter(
      registration.eventId,
    );

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
    <h1>IT Association | KITSW</h1>
  </div>

  <div class="content">

    <h2>Registration Verified</h2>

    <p>
      Dear <strong>${escapeHtml(
        registration.name,
      )}</strong>,
    </p>

    <div class="status">
      <strong>Status: VERIFIED</strong>
      <br>
      Your registration has been successfully verified.
    </div>

    ${buildDetailsTable(
      registration,
    )}

    <p>
      Your registration is now confirmed.
    </p>

    <p>
      Please keep this email and your Registration ID.
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

Registration ID: ${registration.registrationId}
Event: ${registration.event}
Status: VERIFIED

Your registration is now confirmed.

IT Association, KITSW
`;

  await transporter.sendMail({
    from: `"IT Association | KITSW" <${config.user}>`,
    to: registration.email,
    subject,
    text,
    html,
  });
}

/*
|--------------------------------------------------------------------------
| Rejected email
|--------------------------------------------------------------------------
*/

export async function sendRegistrationRejectedEmail(
  registration,
) {
  if (!registration?.email) {
    throw new Error(
      "Student email is missing.",
    );
  }

  const config =
    getEmailConfig(
      registration.eventId,
    );

  const transporter =
    createTransporter(
      registration.eventId,
    );

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
    <h1>IT Association | KITSW</h1>
  </div>

  <div class="content">

    <h2>Registration Update</h2>

    <p>
      Dear <strong>${escapeHtml(
        registration.name,
      )}</strong>,
    </p>

    <div class="status">
      <strong>Status: NOT VERIFIED</strong>
      <br>
      Your registration could not be verified at this time.
    </div>

    ${buildDetailsTable(
      registration,
    )}

    <p>
      If you believe this was a mistake, please contact
      the IT Association team.
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

Registration ID: ${registration.registrationId}
Event: ${registration.event}

Status: NOT VERIFIED

Please contact the IT Association team if you believe this was a mistake.

IT Association, KITSW
`;

  await transporter.sendMail({
    from: `"IT Association | KITSW" <${config.user}>`,
    to: registration.email,
    subject,
    text,
    html,
  });
}