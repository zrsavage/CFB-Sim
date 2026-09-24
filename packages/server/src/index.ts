import express from "express";
import cors from "cors";
import careerRoutes from "./routes/career.js";
import leagueRoutes from "./routes/league.js";
import simRoutes from "./routes/sim.js";
import recruitingRoutes from "./routes/recruiting.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

app.use("/api", careerRoutes);
app.use("/api", leagueRoutes);
app.use("/api", simRoutes);
app.use("/api", recruitingRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`CFB Sim server listening on http://localhost:${PORT}`);
});
