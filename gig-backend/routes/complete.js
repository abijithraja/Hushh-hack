import express from "express";
import { supabase } from "../lib/supabase.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

const SKILL_POINTS_PER_GIG = 10;

/**
 * POST /complete/:gigId/:userId
 * Mark a gig as complete and update skill score
 */
router.post("/:gigId/:userId", verifyToken, async (req, res) => {
  try {
    const { gigId, userId } = req.params;

    // Verify the gig exists and user owns it
    const { data: gig } = await supabase
      .from("gigs")
      .select("id, created_by, status, title")
      .eq("id", gigId)
      .single();

    if (!gig) {
      return res.status(404).json({ error: "Gig not found" });
    }

    if (gig.created_by !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to complete this gig" });
    }

    if (gig.status === "completed") {
      return res.status(400).json({ error: "Gig already completed" });
    }

    // Verify the user had an accepted application
    const { data: application } = await supabase
      .from("applications")
      .select("id")
      .eq("gig_id", gigId)
      .eq("applicant_id", userId)
      .eq("status", "accepted")
      .single();

    if (!application) {
      return res.status(400).json({ error: "User did not have an accepted application" });
    }

    // Create completed gig record
    const { error: completedError } = await supabase
      .from("completed_gigs")
      .insert([
        {
          gig_id: gigId,
          completed_by: userId,
          skill_points: SKILL_POINTS_PER_GIG,
        },
      ]);

    if (completedError) {
      return res.status(400).json({ error: completedError.message });
    }

    // Update gig status
    const { error: gigError } = await supabase
      .from("gigs")
      .update({ status: "completed" })
      .eq("id", gigId);

    if (gigError) {
      return res.status(400).json({ error: gigError.message });
    }

    // Get current user skill score
    const { data: user } = await supabase
      .from("users")
      .select("skill_score")
      .eq("id", userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user skill score
    const { error: userError } = await supabase
      .from("users")
      .update({ skill_score: (user.skill_score || 0) + SKILL_POINTS_PER_GIG })
      .eq("id", userId);

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    // Notify the solver that the gig is complete and points were awarded
    const gigTitle = gig.title || "a gig";
    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: userId,
      message: `Your work on "${gigTitle}" was marked complete! You earned ${SKILL_POINTS_PER_GIG} SkillPoints.`,
      link: `/profile`,
    });
    if (notifError) console.warn("Complete notification failed:", notifError.message);

    res.json({ 
      success: true, 
      skill_points_awarded: SKILL_POINTS_PER_GIG,
      new_skill_score: (user.skill_score || 0) + SKILL_POINTS_PER_GIG
    });
  } catch (error) {
    console.error("Complete gig error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
