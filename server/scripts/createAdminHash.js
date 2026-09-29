import readline from "readline";
import { hashPassword } from "../services/adminAuth.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  try {
    const password = await ask(
      "Enter the admin password: ",
    );

    if (!password) {
      console.error(
        "Password cannot be empty.",
      );

      process.exitCode = 1;
      return;
    }

    const hash =
      await hashPassword(password);

    console.log(
      "\nGenerated password hash:\n",
    );

    console.log(hash);

    console.log(
      "\nCopy this value into ADMIN_PASSWORD_HASH in .env",
    );
  } catch (error) {
    console.error(
      "❌ Failed to generate password hash:",
      error,
    );

    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

main();