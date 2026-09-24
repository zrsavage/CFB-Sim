import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import careerRoutes from "./routes/career.js";
import leagueRoutes from "./routes/league.js";
import simRoutes from "./routes/sim.js";
import recruitingRoutes from "./routes/recruiting.js";
import facilitiesRoutes from "./routes/facilities.js";
import coachingRoutes from "./routes/coaching.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

app.use("/api", careerRoutes);
app.use("/api", leagueRoutes);
app.use("/api", simRoutes);
app.use("/api", recruitingRoutes);
app.use("/api", facilitiesRoutes);
app.use("/api", coachingRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// When the client has been built (npm run build), serve it from this same
// process/port so the whole app runs as a single `npm start` — no separate
// Vite dev server needed. Resolved relative to process.cwd() (this script
// is always run with cwd = packages/server, in both dev and prod) rather
// than __dirname, since the compiled output nests differently than the
// source tree.
const clientDist = path.join(process.cwd(), "..", "client", "dist");
const clientIndex = path.join(clientDist, "index.html");
if (fs.existsSync(clientIndex)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(clientIndex);
  });
  console.log(`Serving built client from ${clientDist}`);
}

app.listen(PORT, () => {
  console.log(`CFB Sim server listening on http://localhost:${PORT}`);
});
