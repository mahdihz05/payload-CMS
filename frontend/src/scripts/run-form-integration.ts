import { spawn } from "node:child_process";
import { createServer } from "node:net";

const port = process.env.FORM_E2E_PORT ?? "3000";
const baseUrl = `http://127.0.0.1:${port}`;
await new Promise<void>((resolve, reject) => {
  const probe = createServer();
  probe.once("error", () => reject(new Error(`Form integration port ${port} is already in use`)));
  probe.listen(Number(port), "127.0.0.1", () => probe.close(() => resolve()));
});

const server = spawn(process.execPath, [".next/standalone/frontend/server.js"], {
  cwd: process.cwd(), env: { ...process.env, NODE_ENV: "production", PORT: port }, stdio: "inherit",
});

async function waitForServer() {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Production server exited with code ${server.exitCode}`);
    try { if ((await fetch(`${baseUrl}/readyz`)).ok) return; } catch { /* Continue until ready. */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Timed out waiting for the form integration server");
}

function runTests() {
  return new Promise<number>((resolve, reject) => {
    const file = "src/app/api/forms/[formKey]/submissions/route.integration.test.ts";
    const executable = process.platform === "win32" ? process.env.ComSpec ?? "cmd.exe" : "npm";
    const args = process.platform === "win32" ? ["/d", "/s", "/c", `npm test -- ${file}`] : ["test", "--", file];
    const tests = spawn(executable, args, { cwd: process.cwd(), env: { ...process.env, NODE_ENV: "production", RUN_PAYLOAD_INTEGRATION: "1", FORM_E2E_BASE_URL: baseUrl }, stdio: "inherit" });
    tests.on("error", reject);
    tests.on("exit", (code) => resolve(code ?? 1));
  });
}

try {
  await waitForServer();
  process.exitCode = await runTests();
} finally {
  server.kill();
}
