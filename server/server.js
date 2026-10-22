import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: fileURLToPath(new URL("./.env", import.meta.url)),
});

const { default: app } = await import("./app.js");

// macOS AirPlay Receiver commonly occupies port 5000. Redirect that default
// to 5050 so Vite does not proxy requests to AirPlay by mistake, even when an
// existing server/.env still contains PORT=5000.
const configuredPort = Number(process.env.PORT || 5050);
const PORT = configuredPort === 5000 ? 5050 : configuredPort;

app.listen(PORT, () => {
  console.log(
    `IT Association backend running on http://localhost:${PORT}`
  );
});
