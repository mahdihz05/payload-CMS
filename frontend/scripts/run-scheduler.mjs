import { spawn } from "node:child_process";

const interval = Number(process.env.SCHEDULER_INTERVAL_MS ?? 60_000);
if (!Number.isFinite(interval) || interval < 1_000) throw new Error("SCHEDULER_INTERVAL_MS must be at least 1000.");

let stopping = false;
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => { stopping = true; });

function runScript(name) {
  return new Promise((resolve, reject) => {
    const executable = process.platform === "win32" ? process.env.ComSpec ?? "cmd.exe" : "npm";
    const args = process.platform === "win32" ? ["/d", "/s", "/c", `npm run ${name}`] : ["run", name];
    const child = spawn(executable, args, { cwd: process.cwd(), env: { ...process.env, NODE_ENV: "production" }, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${name} exited with code ${code ?? 1}`)));
  });
}

async function cycle() {
  const startedAt = new Date().toISOString();
  console.log(`[scheduler] cycle started ${startedAt}`);
  await runScript("jobs:schedules");
  await runScript("jobs:run");
  console.log(`[scheduler] cycle completed ${new Date().toISOString()}`);
}

do {
  try {
    await cycle();
  } catch (error) {
    console.error("[scheduler] cycle failed", error);
    if (process.env.SCHEDULER_ONCE === "1") process.exitCode = 1;
  }
  if (process.env.SCHEDULER_ONCE === "1" || stopping) break;
  await new Promise((resolve) => setTimeout(resolve, interval));
} while (!stopping);
