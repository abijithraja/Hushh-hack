import express from "express";
import { supabase } from "../lib/supabase.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /users/register
 * Register a new user (or update existing) with profile data
 */
router.post("/register", verifyToken, async (req, res) => {
  try {
    const { full_name, department, year } = req.body;
    const userId = req.user.id;
    const email = req.user.email;

    // If a stale row exists with the same email but a different auth id
    // (e.g. user deleted from auth and re-signed-up), remove the orphan first
    // so the upsert below doesn't violate the users_email_key constraint.
    await supabase
      .from("users")
      .delete()
      .eq("email", email)
      .neq("id", userId);

    // Use UPSERT so this works whether the user row already exists
    // (created by frontend upsertProfile) or not
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          id: userId,
          email: email,
          full_name: full_name || null,
          department: department || null,
          year: year || null,
          skill_score: 0,
        },
        { onConflict: "id", ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) {
      console.error("Registration error:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /users/check
 * Check if current user exists in database
 */
router.get("/check", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", req.user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return res.status(400).json({ error: error.message });
    }

    res.json({ exists: !!data });
  } catch (error) {
    console.error("Check user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /users/me
 * Get current user profile
 */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /users/me
 * Update current user profile
 */
router.put("/me", verifyToken, async (req, res) => {
  try {
    const { full_name, department, year } = req.body;

    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (department !== undefined) updateData.department = department;
    if (year !== undefined) updateData.year = year;

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
