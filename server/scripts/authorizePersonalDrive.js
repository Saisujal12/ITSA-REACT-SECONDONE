import "dotenv/config";
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { google } from "googleapis";

const clientId = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID?.trim();
const clientSecret = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET?.trim();

if (!clientId || !clientSecret) {
  console.error(
    "Set GOOGLE_DRIVE_OAUTH_CLIENT_ID and GOOGLE_DRIVE_OAUTH_CLIENT_SECRET in server/.env first.",
  );
  process.exit(1);
}

const port = 53682;
const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;
const state = randomBytes(24).toString("hex");
const oauthClient = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri,
);

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url, redirectUri);

  if (requestUrl.pathname !== "/oauth2callback") {
    response.writeHead(404).end("Not found");
    return;
  }

  if (requestUrl.searchParams.get("state") !== state) {
    response.writeHead(400).end("OAuth state did not match. Close this page and retry.");
    server.close();
    process.exitCode = 1;
    return;
  }

  const oauthError = requestUrl.searchParams.get("error");
  if (oauthError) {
    response.writeHead(400).end("Google authorization was declined. You can close this page.");
    console.error(`Google authorization failed: ${oauthError}`);
    server.close();
    process.exitCode = 1;
    return;
  }

  try {
    const code = requestUrl.searchParams.get("code");
    if (!code) throw new Error("Google did not return an authorization code.");

    const { tokens } = await oauthClient.getToken(code);
    if (!tokens.refresh_token) {
      throw new Error(
        "Google did not return a refresh token. Revoke this app's access in your Google Account, then rerun this command and approve access again.",
      );
    }

    oauthClient.setCredentials(tokens);
    const drive = google.drive({ version: "v3", auth: oauthClient });
    const folder = await drive.files.create({
      requestBody: {
        name: "IT Association Payment Screenshots",
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id,name",
    });

    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(
      "<h2>Google Drive authorization complete.</h2><p>Return to the terminal to copy the refresh token into server/.env. You can close this tab.</p>",
    );
    console.log("\nAdd these lines to server/.env (keep the refresh token private):");
    console.log(`PAYMENT_SCREENSHOT_FOLDER_ID=${folder.data.id}`);
    console.log(`GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log("\nAfter saving .env, stop and restart the backend.");
  } catch (error) {
    response.writeHead(500).end("Could not complete authorization. Check the server terminal.");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

server.listen(port, "127.0.0.1", () => {
  const authorizationUrl = oauthClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    // The OAuth app creates its own folder, so this narrower scope is enough.
    scope: ["https://www.googleapis.com/auth/drive.file"],
    state,
  });

  console.log("Open this URL in your browser and sign in to the personal Gmail account that owns the screenshot folder:\n");
  console.log(authorizationUrl);
  console.log("\nWaiting for Google authorization on this computer...");
});
