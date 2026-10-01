import "dotenv/config";
import nodemailer from "nodemailer";

/*
|--------------------------------------------------------------------------
| IT ASSOCIATION KITSW
| EMAIL SERVICE
|--------------------------------------------------------------------------
|
| Gmail SMTP configuration
|
| IMPORTANT:
| For Gmail, SMTP_PASS must be a GOOGLE APP PASSWORD.
| Do NOT use the normal Gmail account password.
|
|--------------------------------------------------------------------------
| GLOBAL SMTP VARIABLES
|--------------------------------------------------------------------------
|
| Recommended Vercel configuration:
|
| SMTP_HOST=smtp.gmail.com
| SMTP_PORT=465
| SMTP_SECURE=true
| SMTP_USER=yourgmail@gmail.com
| SMTP_PASS=your16characterapppassword
|
|--------------------------------------------------------------------------
| EVENT-SPECIFIC VARIABLES
|--------------------------------------------------------------------------
|
| If you want different Gmail accounts for different events:
|
| EVENT_EMAIL_USER_LLM
| EVENT_EMAIL_PASSWORD_LLM
|
| EVENT_EMAIL_USER_CODE_BUILD
| EVENT_EMAIL_PASSWORD_CODE_BUILD
|
| EVENT_EMAIL_USER_INNOVATION
| EVENT_EMAIL_PASSWORD_INNOVATION
|
| EVENT_EMAIL_USER_CYBER_QUEST
| EVENT_EMAIL_PASSWORD_CYBER_QUEST
|
| EVENT_EMAIL_USER_DESIGN_DEPLOY
| EVENT_EMAIL_PASSWORD_DESIGN_DEPLOY
|
| EVENT_EMAIL_USER_TECH_CONNECT
| EVENT_EMAIL_PASSWORD_TECH_CONNECT
|
| EVENT_EMAIL_USER_EVENT6
| EVENT_EMAIL_PASSWORD_EVENT6
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

function cleanEnv(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

/*
|--------------------------------------------------------------------------
| Global SMTP configuration
|--------------------------------------------------------------------------
*/

const GLOBAL_EMAIL_USER =
  cleanEnv(
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    "",
  );

const GLOBAL_EMAIL_PASSWORD =
  cleanEnv(
    process.env.SMTP_PASS ||
    process.env.EMAIL_APP_PASSWORD ||
    "",
  );

const SMTP_HOST =
  cleanEnv(
    process.env.SMTP_HOST ||
    "smtp.gmail.com",
  );

const SMTP_PORT =
  Number(
    process.env.SMTP_PORT ||
    465,
  );

const SMTP_SECURE =
  String(
    process.env.SMTP_SECURE ??
      "true",
  ).toLowerCase() ===
  "true";

/*
|--------------------------------------------------------------------------
| Event-specific email configuration
|--------------------------------------------------------------------------
*/

const EMAIL_CONFIG = {
  /*
  |--------------------------------------------------------------------------
  | Workshop
  |--------------------------------------------------------------------------
  */

  llm: {
    user:
      cleanEnv(
        process.env.EVENT_EMAIL_USER_LLM,
      ) ||
      GLOBAL_EMAIL_USER,

    password:
      cleanEnv(
        process.env.EVENT_EMAIL_PASSWORD_LLM,
      ) ||
      GLOBAL_EMAIL_PASSWORD,
  },

  /*
  |--------------------------------------------------------------------------
  | Event 1
  |--------------------------------------------------------------------------
  */

  "code-build": {
    user:
      cleanEnv(
        process.env.EVENT_EMAIL_USER_CODE_BUILD,
      ) ||
      GLOBAL_EMAIL_USER,

    password:
      cleanEnv(
        process.env.EVENT_EMAIL_PASSWORD_CODE_BUILD,
      ) ||
      GLOBAL_EMAIL_PASSWORD,
  },

  /*
  |--------------------------------------------------------------------------
  | Event 2
  |--------------------------------------------------------------------------
  */

  innovation: {
    user:
      cleanEnv(
        process.env.EVENT_EMAIL_USER_INNOVATION,
      ) ||
      GLOBAL_EMAIL_USER,

    password:
      cleanEnv(
        process.env.EVENT_EMAIL_PASSWORD_INNOVATION,
      ) ||
      GLOBAL_EMAIL_PASSWORD,
  },

  /*
  |--------------------------------------------------------------------------
  | Event 3
  |--------------------------------------------------------------------------
  */

  "cyber-quest": {
    user:
      cleanEnv(
        process.env.EVENT_EMAIL_USER_CYBER_QUEST,
      ) ||
      GLOBAL_EMAIL_USER,

    password:
      cleanEnv(
        process.env.EVENT_EMAIL_PASSWORD_CYBER_QUEST,
      ) ||
      GLOBAL_EMAIL_PASSWORD,
  },

  /*
  |--------------------------------------------------------------------------
  | Event 4
  |--------------------------------------------------------------------------
  */

  "design-deploy": {
    user:
      cleanEnv(
        process.env.EVENT_EMAIL_USER_DESIGN_DEPLOY,
      ) ||
      GLOBAL_EMAIL_USER,

    password:
      cleanEnv(
        process.env.EVENT_EMAIL_PASSWORD_DESIGN_DEPLOY,
      ) ||
      GLOBAL_EMAIL_PASSWORD,
  },

  /*
  |--------------------------------------------------------------------------
  | Event 5
  |--------------------------------------------------------------------------
  */

  "tech-connect": {
    user:
      cleanEnv(
        process.env.EVENT_EMAIL_USER_TECH_CONNECT,
      ) ||
      GLOBAL_EMAIL_USER,

    password:
      cleanEnv(
        process.env.EVENT_EMAIL_PASSWORD_TECH_CONNECT,
      ) ||
      GLOBAL_EMAIL_PASSWORD,
  },

  /*
  |--------------------------------------------------------------------------
  | Event 6
  |--------------------------------------------------------------------------
  */

  event6: {
    user:
      cleanEnv(
        process.env.EVENT_EMAIL_USER_EVENT6,
      ) ||
      GLOBAL_EMAIL_USER,

    password:
      cleanEnv(
        process.env.EVENT_EMAIL_PASSWORD_EVENT6,
      ) ||
      GLOBAL_EMAIL_PASSWORD,
  },
};

/*
|--------------------------------------------------------------------------
| Get email configuration
|--------------------------------------------------------------------------
*/

function getEmailConfig(eventId) {
  const config =
    EMAIL_CONFIG[eventId];

  if (!config) {
    const error =
      new Error(
        `No email configuration exists for event "${eventId}".`,
      );

    error.code =
      "EMAIL_EVENT_NOT_CONFIGURED";

    throw error;
  }

  const user =
    cleanEnv(config.user);

  const password =
    cleanEnv(config.password);

  if (!user) {
    const error =
      new Error(
        `Email sender address is not configured for event "${eventId}".`,
      );

    error.code =
      "EMAIL_USER_NOT_CONFIGURED";

    throw error;
  }

  if (!password) {
    const error =
      new Error(
        `Email App Password is not configured for event "${eventId}".`,
      );

    error.code =
      "EMAIL_PASSWORD_NOT_CONFIGURED";

    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Detect common mistakes
  |--------------------------------------------------------------------------
  */

  if (
    password.includes(" ") &&
    password.replace(/\s/g, "").length ===
      16
  ) {
    /*
     * Google displays App Passwords with spaces.
     * Remove them automatically.
     */
    config.password =
      password.replace(/\s/g, "");
  }

  /*
  |--------------------------------------------------------------------------
  | Detect obvious normal-password usage
  |--------------------------------------------------------------------------
  |
  | We cannot know whether a password is genuinely an App Password,
  | but this warning helps during Vercel debugging.
  |
  */

  if (
    password.length < 12
  ) {
    console.warn(
      `Warning: SMTP password for event "${eventId}" is unusually short. Gmail App Passwords are normally 16 characters.`,
    );
  }

  return {
    user,
    password:
      cleanEnv(config.password).replace(
        /\s/g,
        "",
      ),
  };
}

/*
|--------------------------------------------------------------------------
| Create Gmail transporter
|--------------------------------------------------------------------------
*/

function createTransporter(eventId) {
  const config =
    getEmailConfig(eventId);

  /*
  |--------------------------------------------------------------------------
  | Gmail SMTP
  |--------------------------------------------------------------------------
  |
  | Port 465 + secure true
  |
  | This is the recommended simple configuration
  | for Gmail SMTP with Nodemailer.
  |
  */

  const transporter =
    nodemailer.createTransport({
      host:
        SMTP_HOST,

      port:
        SMTP_PORT,

      secure:
        SMTP_SECURE,

      auth: {
        user:
          config.user,

        pass:
          config.password,
      },

      connectionTimeout:
        15000,

      greetingTimeout:
        15000,

      socketTimeout:
        20000,
    });

  return transporter;
}

/*
|--------------------------------------------------------------------------
| Verify SMTP connection
|--------------------------------------------------------------------------
|
| This is called before sending.
| It makes Gmail authentication failures easier to diagnose.
|--------------------------------------------------------------------------
*/

async function verifyTransporter(
  transporter,
  eventId,
) {
  try {
    await transporter.verify();

    console.log(
      `SMTP connection verified for event "${eventId}".`,
    );
  } catch (error) {
    console.error(
      `SMTP verification failed for event "${eventId}":`,
      error.message,
    );

    /*
     |--------------------------------------------------------------------------
     | Convert Gmail 535 into a useful application error
     |--------------------------------------------------------------------------
     */

    if (
      error?.responseCode ===
        535 ||
      String(
        error?.message || "",
      ).includes(
        "535-5.7.8",
      ) ||
      String(
        error?.message || "",
      ).includes(
        "Username and Password not accepted",
      )
    ) {
      const authError =
        new Error(
          `Gmail authentication failed for event "${eventId}". Check SMTP_USER and SMTP_PASS. SMTP_PASS must be a Google App Password, not the normal Gmail password.`,
        );

      authError.code =
        "EMAIL_GMAIL_AUTH_FAILED";

      authError.originalError =
        error;

      throw authError;
    }

    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| Escape HTML
|--------------------------------------------------------------------------
*/

function escapeHtml(value) {
  return String(
    value ?? "",
  )
    .replace(
      /&/g,
      "&amp;",
    )
    .replace(
      /</g,
      "&lt;",
    )
    .replace(
      />/g,
      "&gt;",
    )
    .replace(
      /"/g,
      "&quot;",
    )
    .replace(
      /'/g,
      "&#039;",
    );
}

/*
|--------------------------------------------------------------------------
| Common email styles
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Build registration details table
|--------------------------------------------------------------------------
*/

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
| Send email helper
|--------------------------------------------------------------------------
*/

async function sendEmail({
  eventId,
  from,
  to,
  subject,
  text,
  html,
}) {
  const transporter =
    createTransporter(
      eventId,
    );

  await verifyTransporter(
    transporter,
    eventId,
  );

  try {
    const result =
      await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });

    console.log(
      `Email sent successfully for event "${eventId}" to ${to}. Message ID: ${result.messageId}`,
    );

    return result;
  } catch (error) {
    console.error(
      `Email sending failed for event "${eventId}":`,
      error.message,
    );

    if (
      error?.responseCode ===
        535 ||
      String(
        error?.message || "",
      ).includes(
        "535-5.7.8",
      ) ||
      String(
        error?.message || "",
      ).includes(
        "Username and Password not accepted",
      )
    ) {
      const authError =
        new Error(
          `Gmail authentication failed for event "${eventId}". Check SMTP_USER and SMTP_PASS. SMTP_PASS must be a Google App Password, not the normal Gmail password.`,
        );

      authError.code =
        "EMAIL_GMAIL_AUTH_FAILED";

      authError.originalError =
        error;

      throw authError;
    }

    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| Pending registration email
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

  await sendEmail({
    eventId:
      registration.eventId,

    from:
      `"IT Association | KITSW" <${config.user}>`,

    to:
      registration.email,

    subject,

    text,

    html,
  });
}

/*
|--------------------------------------------------------------------------
| Verified registration email
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
        Dear
        <strong>
          ${escapeHtml(
            registration.name,
          )}
        </strong>,
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

  await sendEmail({
    eventId:
      registration.eventId,

    from:
      `"IT Association | KITSW" <${config.user}>`,

    to:
      registration.email,

    subject,

    text,

    html,
  });
}

/*
|--------------------------------------------------------------------------
| Rejected registration email
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
        Dear
        <strong>
          ${escapeHtml(
            registration.name,
          )}
        </strong>,
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

Registration ID: ${registration.registrationId}
Event: ${registration.event}

Status: NOT VERIFIED

Please contact the IT Association team if you believe this was a mistake.

IT Association, KITSW
`;

  await sendEmail({
    eventId:
      registration.eventId,

    from:
      `"IT Association | KITSW" <${config.user}>`,

    to:
      registration.email,

    subject,

    text,

    html,
  });
}