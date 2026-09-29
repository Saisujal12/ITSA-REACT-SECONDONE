import "dotenv/config";
import nodemailer from "nodemailer";

const emailUser =
  process.env.EMAIL_USER?.trim();

const emailPassword =
  process.env.EMAIL_APP_PASSWORD?.trim();

if (!emailUser || !emailPassword) {
  console.warn(
    "⚠️ EMAIL_USER or EMAIL_APP_PASSWORD is missing. Email service will not work.",
  );
}

const transporter =
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

/*
|--------------------------------------------------------------------------
| Common Email Styles
|--------------------------------------------------------------------------
*/

const emailStyles = `
<style>
  body {
    margin: 0;
    padding: 0;
    background: #f5f5f5;
    font-family: Arial, Helvetica, sans-serif;
    color: #222;
  }

  .container {
    max-width: 650px;
    margin: 30px auto;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
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
    margin-top: 20px;
    border-collapse: collapse;
    width: 100%;
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

/*
|--------------------------------------------------------------------------
| Pending Registration Email
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

  if (!emailUser || !emailPassword) {
    throw new Error(
      "Email service is not configured.",
    );
  }

  const subject =
    "Registration Received - Verification Pending";

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
        Dear <strong>${registration.name}</strong>,
      </p>

      <p>
        Thank you for registering for the event.
        We have successfully received your registration.
      </p>

      <div class="status">
        <strong>Status: Verification Pending</strong>
        <br>
        Your registration is currently waiting for verification
        by the IT Association team.
      </div>

      <table class="details">

        <tr>
          <td>Registration ID</td>
          <td>${registration.registrationId}</td>
        </tr>

        <tr>
          <td>Name</td>
          <td>${registration.name}</td>
        </tr>

        <tr>
          <td>Roll Number</td>
          <td>${registration.rollNo}</td>
        </tr>

        <tr>
          <td>Event / Workshop</td>
          <td>${registration.workshop}</td>
        </tr>

        <tr>
          <td>Amount</td>
          <td>₹${registration.amount}</td>
        </tr>

        <tr>
          <td>Status</td>
          <td>PENDING</td>
        </tr>

      </table>

      <p>
        Please keep your
        <strong>Registration ID</strong>
        for future reference.
      </p>

      <p>
        You will receive another email once your
        registration has been verified.
      </p>

      <p>
        Thank you,<br>
        <strong>IT Association, KITSW</strong>
      </p>

    </div>

    <div class="footer">
      This is an automated email.
      Please do not reply to this email.
    </div>

  </div>
</body>
</html>
`;

  const text = `
IT Association | KITSW

Registration Received - Verification Pending

Dear ${registration.name},

Your registration has been successfully received.

Registration ID: ${registration.registrationId}
Name: ${registration.name}
Roll Number: ${registration.rollNo}
Event / Workshop: ${registration.workshop}
Amount: ₹${registration.amount}

Status: PENDING

Your registration is currently waiting for verification
by the IT Association team.

You will receive another email once your registration
has been verified.

Thank you,
IT Association, KITSW
`;

  await transporter.sendMail({
    from: `"IT Association | KITSW" <${emailUser}>`,
    to: registration.email,
    subject,
    text,
    html,
  });
}

/*
|--------------------------------------------------------------------------
| Successful Registration Email
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

  if (!emailUser || !emailPassword) {
    throw new Error(
      "Email service is not configured.",
    );
  }

  const subject =
    "Registration Successful - IT Association KITSW";

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

      <h2>Registration Successful 🎉</h2>

      <p>
        Dear <strong>${registration.name}</strong>,
      </p>

      <p>
        Your registration has been successfully verified
        by the IT Association team.
      </p>

      <div class="status">
        <strong>Status: VERIFIED</strong>
        <br>
        Your registration is confirmed successfully.
      </div>

      <table class="details">

        <tr>
          <td>Registration ID</td>
          <td>${registration.registrationId}</td>
        </tr>

        <tr>
          <td>Name</td>
          <td>${registration.name}</td>
        </tr>

        <tr>
          <td>Roll Number</td>
          <td>${registration.rollNo}</td>
        </tr>

        <tr>
          <td>Event / Workshop</td>
          <td>${registration.workshop}</td>
        </tr>

        <tr>
          <td>Amount</td>
          <td>₹${registration.amount}</td>
        </tr>

        <tr>
          <td>Status</td>
          <td>VERIFIED</td>
        </tr>

      </table>

      <p>
        Your registration is now confirmed.
        Please keep this email and your Registration ID
        for future reference.
      </p>

      <p>
        Thank you for registering with the
        <strong>IT Association, KITSW</strong>.
      </p>

      <p>
        We look forward to seeing you at the event!
      </p>

    </div>

    <div class="footer">
      This is an automated email.
      Please do not reply to this email.
    </div>

  </div>
</body>
</html>
`;

  const text = `
IT Association | KITSW

Registration Successful

Dear ${registration.name},

Your registration has been successfully verified
by the IT Association team.

Registration ID: ${registration.registrationId}
Name: ${registration.name}
Roll Number: ${registration.rollNo}
Event / Workshop: ${registration.workshop}
Amount: ₹${registration.amount}

Status: VERIFIED

Your registration is now confirmed.

Thank you for registering with the IT Association, KITSW.

We look forward to seeing you at the event.

IT Association, KITSW
`;

  await transporter.sendMail({
    from: `"IT Association | KITSW" <${emailUser}>`,
    to: registration.email,
    subject,
    text,
    html,
  });
}

/*
|--------------------------------------------------------------------------
| Rejected Registration Email
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

  if (!emailUser || !emailPassword) {
    throw new Error(
      "Email service is not configured.",
    );
  }

  const subject =
    "Registration Update - IT Association KITSW";

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
        Dear <strong>${registration.name}</strong>,
      </p>

      <p>
        We have reviewed your registration for the event.
      </p>

      <div class="status">
        <strong>Status: REGISTRATION NOT VERIFIED</strong>
        <br>
        Unfortunately, your registration could not be
        verified at this time.
      </div>

      <table class="details">

        <tr>
          <td>Registration ID</td>
          <td>${registration.registrationId}</td>
        </tr>

        <tr>
          <td>Name</td>
          <td>${registration.name}</td>
        </tr>

        <tr>
          <td>Roll Number</td>
          <td>${registration.rollNo}</td>
        </tr>

        <tr>
          <td>Event / Workshop</td>
          <td>${registration.workshop}</td>
        </tr>

        <tr>
          <td>Status</td>
          <td>REJECTED</td>
        </tr>

      </table>

      <p>
        If you believe this was a mistake or if you need
        further information, please contact the
        IT Association team.
      </p>

      <p>
        Please mention your
        <strong>Registration ID</strong>
        when contacting the team.
      </p>

      <p>
        Thank you,<br>
        <strong>IT Association, KITSW</strong>
      </p>

    </div>

    <div class="footer">
      This is an automated email.
      Please do not reply to this email.
    </div>

  </div>
</body>
</html>
`;

  const text = `
IT Association | KITSW

Registration Update

Dear ${registration.name},

We have reviewed your registration for the event.

Unfortunately, your registration could not be verified
at this time.

Registration ID: ${registration.registrationId}
Name: ${registration.name}
Roll Number: ${registration.rollNo}
Event / Workshop: ${registration.workshop}

Status: REJECTED

If you believe this was a mistake or need further
information, please contact the IT Association team.

Please mention your Registration ID when contacting
the team.

Thank you,
IT Association, KITSW
`;

  await transporter.sendMail({
    from: `"IT Association | KITSW" <${emailUser}>`,
    to: registration.email,
    subject,
    text,
    html,
  });
}