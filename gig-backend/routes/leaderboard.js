import express from "express";
import { supabase } from "../lib/supabase.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /leaderboard
 * Get top users by skill score
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, department, year, skill_score")
      .order("skill_score", { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Add rank to each user
    const rankedData = data.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    res.json(rankedData);
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
