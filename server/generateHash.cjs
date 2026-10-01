const bcrypt = require("bcryptjs");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter admin password: ", async (password) => {

    if (!password || password.length < 8) {
        console.log("\nPassword must be at least 8 characters.");
        rl.close();
        return;
    }

    try {

        const hash = await bcrypt.hash(password, 12);

        console.log("\n========================================");
        console.log("       ADMIN PASSWORD HASH");
        console.log("========================================\n");

        console.log(hash);

        console.log("\nAdd these lines to server/.env:\n");

        console.log("ADMIN_USERNAME=admin");
        console.log(`ADMIN_PASSWORD_HASH=${hash}`);

        console.log("\n========================================\n");

    } catch (error) {

        console.error(
            "\nFailed to generate password hash:",
            error.message
        );

    } finally {

        rl.close();

    }
});