import express from "express";
import cookieParser from "cookie-parser";
import { supabase } from "../routes/supabaseClient.js";

const router = express.Router();

router.post("/api/admin/reset-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Password reset email sent!" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
