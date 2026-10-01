const bcrypt = require("bcrypt");

const password = "Admin@12345";

bcrypt.hash(password, 12).then((hash) => {
    console.log("\nPassword hash:\n");
    console.log(hash);
});