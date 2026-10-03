import dotenv from "dotenv";

dotenv.config({
  path: "./server/.env",
});

const { default: app } = await import("./app.js");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `IT Association backend running on http://localhost:${PORT}`
  );
});