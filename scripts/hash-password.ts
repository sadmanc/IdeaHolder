import bcrypt from "bcryptjs";
import readline from "node:readline";

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const password = await prompt("Enter a password for IdeaHolder: ");
  if (!password || password.length < 6) {
    console.error("\nPassword must be at least 6 characters.");
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  // Escape each `$` so Next.js's dotenv-expand doesn't mangle the hash
  // when reading .env.local (bcrypt hashes contain three `$` separators).
  const escapedForEnvLocal = hash.replace(/\$/g, "\\$");
  console.log("");
  console.log("Add this line to .env.local (exactly as printed, with backslashes):");
  console.log("");
  console.log(`APP_PASSWORD_HASH=${escapedForEnvLocal}`);
  console.log("");
  console.log(
    "For Vercel / production env vars (no dotenv parsing there), paste the raw hash instead:",
  );
  console.log("");
  console.log(`APP_PASSWORD_HASH=${hash}`);
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
