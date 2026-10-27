import { config } from "dotenv";
import { spawn } from "node:child_process";

config();

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) {
  console.error("TEST_DATABASE_URL is not set");
  process.exit(1);
}

const child = spawn("npx prisma migrate deploy", {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, DATABASE_URL: databaseUrl },
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
