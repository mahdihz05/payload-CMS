import { spawn } from "node:child_process";

const file = "src/payload/core-subsystems.integration.test.ts";
const executable = process.platform === "win32" ? process.env.ComSpec ?? "cmd.exe" : "npm";
const args = process.platform === "win32" ? ["/d", "/s", "/c", `npm test -- ${file}`] : ["test", "--", file];
const tests = spawn(executable, args, {
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: "production", RUN_PAYLOAD_INTEGRATION: "1" },
  stdio: "inherit",
});
tests.on("error", (error) => { console.error(error); process.exitCode = 1; });
tests.on("exit", (code) => { process.exitCode = code ?? 1; });
