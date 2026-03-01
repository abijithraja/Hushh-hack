import express from "express";
import { supabase } from "../lib/supabase.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /gigs
 * Create a new gig
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, image_url, required_skills } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const { data, error } = await supabase
      .from("gigs")
      .insert([
        {
          title,
          description,
          image_url,
          created_by: req.user.id,
          status: "open",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Create gig error:", error);
      return res.status(400).json({ error: error.message });
    }

    // Insert required skills if provided
    if (Array.isArray(required_skills) && required_skills.length > 0) {
      const skillRows = required_skills.map((s) => ({ gig_id: data.id, skill_name: s }));
      const { error: skillError } = await supabase.from("gig_skills").insert(skillRows);
      if (skillError) console.warn("Gig skills insert failed:", skillError.message);
    }

    res.json(data);
  } catch (error) {
    console.error("Create gig error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /gigs
 * Get all open gigs
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("gigs")
      .select(`
        *,
        creator:users!created_by (
          full_name,
          department
        )
      `)
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Get gigs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /gigs/my
 * Get current user's gigs
 */
router.get("/my", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("gigs")
      .select(`
        *,
        gig_skills (skill_name),
        applications (
          id,
          status,
          applicant:users!applicant_id (
            id,
            full_name,
            department,
            skills
          )
        ),
        solutions (
          id,
          answer,
          submitted_at,
          solver:users!user_id (
            id,
            full_name,
            department
          )
        )
      `)
      .eq("created_by", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Get my gigs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /gigs/:id
 * Get a single gig by ID
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("gigs")
      .select(`
        *,
        creator:users!created_by (
          full_name,
          department
        ),
        applications (
          id,
          status,
          applicant:users!applicant_id (
            id,
            full_name,
            department
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Gig not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Get gig error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /gigs/:id/applications
 * Get all applications for a gig
 */
router.get("/:id/applications", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user owns the gig
    const { data: gig } = await supabase
      .from("gigs")
      .select("created_by")
      .eq("id", id)
      .single();

    if (!gig || gig.created_by !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        applicant:users!applicant_id (
          id,
          full_name,
          department,
          skill_score
        )
      `)
      .eq("gig_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
