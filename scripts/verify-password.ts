import bcrypt from "bcryptjs";
import readline from "node:readline";

async function main() {
  const hash = process.env.APP_PASSWORD_HASH;
  if (!hash) {
    console.error("APP_PASSWORD_HASH is not set in the environment.");
    console.error(
      "Run this with:  node --import tsx --env-file=.env.local scripts/verify-password.ts",
    );
    process.exit(1);
  }

  console.log("");
  console.log("Hash length:", hash.length, "(should be 60)");
  console.log("Hash prefix:", JSON.stringify(hash.slice(0, 7)));
  console.log(
    "Starts with $2:",
    hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$"),
  );
  console.log("");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const password = await new Promise<string>((resolve) => {
    rl.question("Enter the password you're trying to log in with: ", (a) => {
      rl.close();
      resolve(a);
    });
  });

  const match = await bcrypt.compare(password, hash);
  console.log("");
  console.log(match ? "✓ MATCH — password is correct" : "✗ NO MATCH");
  if (!match) {
    console.log(
      "\nEither the password you typed differs from the one you hashed,",
    );
    console.log(
      "or the hash in .env.local got corrupted during paste (check length/prefix above).",
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
