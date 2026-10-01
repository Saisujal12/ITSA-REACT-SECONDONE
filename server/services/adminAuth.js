import crypto from "crypto";
import { promisify } from "util";

const scrypt = promisify(
  crypto.scrypt,
);

/*
|--------------------------------------------------------------------------
| ADMIN SESSION SETTINGS
|--------------------------------------------------------------------------
*/

const SESSION_DURATION =
  8 * 60 * 60 * 1000; // 8 hours

/*
|--------------------------------------------------------------------------
| SESSION SECRET
|--------------------------------------------------------------------------
*/

function getSessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD_HASH;

  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not configured.",
    );
  }

  return secret;
}

/*
|--------------------------------------------------------------------------
| PASSWORD HASHING
|--------------------------------------------------------------------------
*/

export async function hashPassword(
  password,
) {
  if (!password) {
    throw new Error(
      "Password cannot be empty.",
    );
  }

  const salt =
    crypto
      .randomBytes(16)
      .toString("hex");

  const derivedKey =
    await scrypt(
      password,
      salt,
      64,
    );

  return `${salt}:${derivedKey.toString(
    "hex",
  )}`;
}

/*
|--------------------------------------------------------------------------
| PASSWORD VERIFICATION
|--------------------------------------------------------------------------
*/

export async function verifyPassword(
  password,
  storedHash,
) {
  if (
    !password ||
    !storedHash
  ) {
    return false;
  }

  const parts =
    storedHash.split(":");

  if (
    parts.length !== 2
  ) {
    return false;
  }

  const [
    salt,
    key,
  ] = parts;

  try {
    const derivedKey =
      await scrypt(
        password,
        salt,
        64,
      );

    const storedKey =
      Buffer.from(
        key,
        "hex",
      );

    if (
      derivedKey.length !==
      storedKey.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      derivedKey,
      storedKey,
    );
  } catch {
    return false;
  }
}

/*
|--------------------------------------------------------------------------
| CREATE SESSION SIGNATURE
|--------------------------------------------------------------------------
*/

function sign(value) {
  return crypto
    .createHmac(
      "sha256",
      getSessionSecret(),
    )
    .update(value)
    .digest("base64url");
}

/*
|--------------------------------------------------------------------------
| SAFE STRING COMPARISON
|--------------------------------------------------------------------------
*/

function safeEqual(
  a,
  b,
) {
  const aBuffer =
    Buffer.from(a);

  const bBuffer =
    Buffer.from(b);

  if (
    aBuffer.length !==
    bBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    aBuffer,
    bBuffer,
  );
}

/*
|--------------------------------------------------------------------------
| CREATE ADMIN SESSION
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| The selected eventId MUST be stored in the session.
|
| Example:
|
| username = admin
| eventId  = llm
|
| The backend will then know:
|
| admin -> Workshop
|
| and will only load that event's registrations.
|--------------------------------------------------------------------------
*/

export function createAdminSession(
  username,
  eventId,
) {
  if (!username) {
    throw new Error(
      "Username is required.",
    );
  }

  if (!eventId) {
    throw new Error(
      "Event ID is required.",
    );
  }

  const expiresAt =
    Date.now() +
    SESSION_DURATION;

  /*
   * Store BOTH username and eventId.
   */
  const payload =
    Buffer.from(
      JSON.stringify({
        username,
        eventId,
        expiresAt,
      }),
    ).toString("base64url");

  const signature =
    sign(payload);

  return `${payload}.${signature}`;
}

/*
|--------------------------------------------------------------------------
| READ / VERIFY ADMIN SESSION
|--------------------------------------------------------------------------
*/

export function getAdminSession(
  token,
) {
  if (!token) {
    return null;
  }

  const parts =
    token.split(".");

  if (
    parts.length !== 2
  ) {
    return null;
  }

  const [
    payload,
    signature,
  ] = parts;

  /*
   * Generate the expected signature.
   */
  let expected;

  try {
    expected =
      sign(payload);
  } catch {
    return null;
  }

  /*
   * Verify signature.
   */
  if (
    !safeEqual(
      signature,
      expected,
    )
  ) {
    return null;
  }

  /*
   * Decode session payload.
   */
  try {
    const decoded =
      JSON.parse(
        Buffer.from(
          payload,
          "base64url",
        ).toString("utf8"),
      );

    /*
     * Username is required.
     */
    if (
      !decoded.username
    ) {
      return null;
    }

    /*
     * Event ID is REQUIRED.
     *
     * This is the important fix.
     */
    if (
      !decoded.eventId
    ) {
      return null;
    }

    /*
     * Expiration time is required.
     */
    if (
      !decoded.expiresAt
    ) {
      return null;
    }

    /*
     * Check expiration.
     */
    if (
      Date.now() >
      Number(
        decoded.expiresAt,
      )
    ) {
      return null;
    }

    /*
     * Return authenticated session.
     */
    return {
      username:
        decoded.username,

      eventId:
        decoded.eventId,

      expiresAt:
        Number(
          decoded.expiresAt,
        ),
    };
  } catch {
    return null;
  }
}

/*
|--------------------------------------------------------------------------
| DESTROY SESSION
|--------------------------------------------------------------------------
|
| Sessions are stateless.
|
| Logout clears the browser cookie.
|--------------------------------------------------------------------------
*/

export function destroyAdminSession() {
  /*
   * Nothing is required here.
   *
   * The browser cookie is cleared
   * by the logout controller.
   */
}