// `npm run db`: Postgres (PGlite) on port 5544, files under data/pg.
//
// Two servers on one data directory can corrupt it, so if the port is taken
// this says so and exits cleanly instead of starting a second one. Binding the
// port answers at once; connecting to it can hang on WSL.
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import net from "node:net";
import path from "node:path";

const port = 5544;

const free = await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once("error", (error) => (error.code === "EADDRINUSE" ? resolve(false) : reject(error)));
  probe.listen(port, "127.0.0.1", () => probe.close(() => resolve(true)));
});

if (!free) {
  console.log(`Postgres is already running on port ${port} (another npm run dev or npm run db). Using that one.`);
  process.exit(0);
}

mkdirSync("data", { recursive: true });
const server = spawn(
  process.execPath,
  [
    path.join("node_modules", "@electric-sql", "pglite-socket", "dist", "scripts", "server.js"),
    "--db",
    "./data/pg",
    "--port",
    String(port),
    "--max-connections",
    "8",
  ],
  { stdio: "inherit" },
);
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.kill(signal));
server.on("exit", (code, signal) => process.exit(code ?? (signal ? 0 : 1)));
