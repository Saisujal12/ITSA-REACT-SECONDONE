import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: fileURLToPath(new URL("./.env", import.meta.url)),
});

const { default: app } = await import("./app.js");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `IT Association backend running on http://localhost:${PORT}`
  );
});
