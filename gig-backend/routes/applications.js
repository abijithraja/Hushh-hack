import express from "express";
import { supabase } from "../lib/supabase.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /apply/:gigId
 * Apply to a gig
 */
router.post("/:gigId", verifyToken, async (req, res) => {
  try {
    const { gigId } = req.params;

    // Check if gig exists and is open
    const { data: gig } = await supabase
      .from("gigs")
      .select("id, created_by, status, title")
      .eq("id", gigId)
      .single();

    if (!gig) {
      return res.status(404).json({ error: "Gig not found" });
    }

    if (gig.status !== "open") {
      return res.status(400).json({ error: "Gig is not open for applications" });
    }

    if (gig.created_by === req.user.id) {
      return res.status(400).json({ error: "Cannot apply to your own gig" });
    }

    // Check if already applied
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("gig_id", gigId)
      .eq("applicant_id", req.user.id)
      .single();

    if (existing) {
      return res.status(400).json({ error: "Already applied to this gig" });
    }

    // Create application
    const { data, error } = await supabase
      .from("applications")
      .insert([
        {
          gig_id: gigId,
          applicant_id: req.user.id,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Notify the gig owner — look up the applicant's full name first
    let applicantName = req.user.email?.split("@")[0] || "Someone";
    const { data: applicantProfile } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", req.user.id)
      .single();
    if (applicantProfile?.full_name) applicantName = applicantProfile.full_name;

    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: gig.created_by,
      message: `${applicantName} applied to your gig: "${gig.title || "your gig"}"`
    });
    if (notifError) console.warn("Notification insert failed:", notifError.message);

    res.json(data);
  } catch (error) {
    console.error("Apply error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /applications/:id/accept
 * Accept an application
 */
router.post("/:id/accept", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get application with gig info
    const { data: application } = await supabase
      .from("applications")
      .select(`
        *,
        gig:gigs!gig_id (
          id,
          created_by
        )
      `)
      .eq("id", id)
      .single();

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Verify user owns the gig
    if (application.gig.created_by !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Update application status
    const { error: updateAppError } = await supabase
      .from("applications")
      .update({ status: "accepted" })
      .eq("id", id);

    if (updateAppError) {
      return res.status(400).json({ error: updateAppError.message });
    }

    // Update gig status to in_progress
    const { error: updateGigError } = await supabase
      .from("gigs")
      .update({ status: "in_progress" })
      .eq("id", application.gig_id);

    if (updateGigError) {
      return res.status(400).json({ error: updateGigError.message });
    }

    // Reject all other applications
    await supabase
      .from("applications")
      .update({ status: "rejected" })
      .eq("gig_id", application.gig_id)
      .neq("id", id);

    // Notify the applicant that they were accepted (include gig title + solve link)
    const { data: gigInfo } = await supabase
      .from("gigs")
      .select("title")
      .eq("id", application.gig_id)
      .single();
    const gigTitle = gigInfo?.title || "the gig";
    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: application.applicant_id,
      message: `Your application was accepted for "${gigTitle}"! Tap to start solving.`,
      link: `/solve/${application.gig_id}`,
    });
    if (notifError) console.warn("Accept notification failed:", notifError.message);

    res.json({ success: true });
  } catch (error) {
    console.error("Accept application error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
