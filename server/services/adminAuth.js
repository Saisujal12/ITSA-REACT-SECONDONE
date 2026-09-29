import crypto from "crypto";
import { promisify } from "util";

const scrypt = promisify(crypto.scrypt);

const sessions = new Map();

const SESSION_DURATION = 8 * 60 * 60 * 1000;

/*
|--------------------------------------------------------------------------
| Hash Password
|--------------------------------------------------------------------------
*/

export async function hashPassword(password) {
  if (!password) {
    throw new Error("Password cannot be empty.");
  }

  const salt = crypto.randomBytes(16).toString("hex");

  const derivedKey = await scrypt(
    password,
    salt,
    64,
  );

  return `${salt}:${derivedKey.toString("hex")}`;
}

/*
|--------------------------------------------------------------------------
| Verify Password
|--------------------------------------------------------------------------
*/

export async function verifyPassword(
  password,
  storedHash,
) {
  if (!password || !storedHash) {
    return false;
  }

  const parts = storedHash.split(":");

  if (parts.length !== 2) {
    return false;
  }

  const [salt, key] = parts;

  try {
    const derivedKey = await scrypt(
      password,
      salt,
      64,
    );

    const storedKeyBuffer = Buffer.from(
      key,
      "hex",
    );

    if (
      derivedKey.length !==
      storedKeyBuffer.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      derivedKey,
      storedKeyBuffer,
    );
  } catch (error) {
    console.error(
      "❌ Password verification error:",
      error,
    );

    return false;
  }
}

/*
|--------------------------------------------------------------------------
| Create Admin Session
|--------------------------------------------------------------------------
*/

export function createAdminSession(username) {
  const token = crypto
    .randomBytes(32)
    .toString("hex");

  sessions.set(token, {
    username,
    createdAt: Date.now(),
    expiresAt:
      Date.now() + SESSION_DURATION,
  });

  return token;
}

/*
|--------------------------------------------------------------------------
| Get Admin Session
|--------------------------------------------------------------------------
*/

export function getAdminSession(token) {
  if (!token) {
    return null;
  }

  const session = sessions.get(token);

  if (!session) {
    return null;
  }

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);

    return null;
  }

  return session;
}

/*
|--------------------------------------------------------------------------
| Destroy Admin Session
|--------------------------------------------------------------------------
*/

export function destroyAdminSession(token) {
  if (!token) {
    return;
  }

  sessions.delete(token);
}