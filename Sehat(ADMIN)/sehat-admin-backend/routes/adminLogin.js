import express from "express";
import cookieParser from "cookie-parser";
import { supabase } from "../routes/supabaseClient.js";

const router = express.Router();
router.use(cookieParser());

router.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password, remember } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.cookie("sb-access-token", data.session.access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: remember ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
    });
console.log(data.user);

    return res.json({ message: "Login successful", user: data.user });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
