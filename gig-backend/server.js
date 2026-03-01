import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import routes
import usersRouter from "./routes/users.js";
import gigsRouter from "./routes/gigs.js";
import applicationsRouter from "./routes/applications.js";
import completeRouter from "./routes/complete.js";
import leaderboardRouter from "./routes/leaderboard.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",            // local dev
      "https://hushh-hack.vercel.app",    // production frontend
    ],
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/users", usersRouter);
app.use("/gigs", gigsRouter);
app.use("/apply", applicationsRouter);
app.use("/applications", applicationsRouter);
app.use("/complete", completeRouter);
app.use("/leaderboard", leaderboardRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Start server – bind to all interfaces so phone on LAN can reach the backend
app.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔═══════════════════════════════════════════╗
║     SkillGig Backend Server Running       ║
╠═══════════════════════════════════════════╣
║  Port: ${PORT}                              ║
║  Environment: ${process.env.NODE_ENV || "development"}              ║
╚═══════════════════════════════════════════╝
  `);
});
