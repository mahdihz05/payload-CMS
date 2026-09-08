import { spawn } from "node:child_process";
import { createServer } from "node:net";

const port = process.env.SEO_E2E_PORT ?? "3100";
const baseUrl = `http://127.0.0.1:${port}`;
await new Promise<void>((resolve, reject) => {
  const probe = createServer();
  probe.once("error", () => reject(new Error(`SEO E2E port ${port} is already in use`)));
  probe.listen(Number(port), "127.0.0.1", () => probe.close(() => resolve()));
});

const server = spawn(process.execPath, [".next/standalone/frontend/server.js"], {
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: "production", PORT: port },
  stdio: "inherit",
});

async function waitForServer() {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Production server exited with code ${server.exitCode}`);
    try {
      const response = await fetch(`${baseUrl}/readyz`);
      if (response.ok) return;
    } catch {
      // Continue polling until the production server is ready.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Timed out waiting for the production SEO E2E server");
}

function runTests(): Promise<number> {
  return new Promise((resolve, reject) => {
    const executable = process.platform === "win32" ? process.env.ComSpec ?? "cmd.exe" : "npm";
    const args = process.platform === "win32"
      ? ["/d", "/s", "/c", "npm test -- src/seo/seo-http.e2e.test.ts"]
      : ["test", "--", "src/seo/seo-http.e2e.test.ts"];
    const tests = spawn(executable, args, {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: "production", RUN_SEO_E2E: "1", SEO_E2E_BASE_URL: baseUrl },
      stdio: "inherit",
    });
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
