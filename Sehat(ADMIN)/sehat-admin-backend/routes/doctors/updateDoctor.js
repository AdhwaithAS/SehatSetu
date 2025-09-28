import express from "express";
const router = express.Router();
import { supabase } from "../supabaseClient.js";
import validateFormData from "../validate.js";
router.put("/api/doctors/updateDoctor", async (req, res) => {
  const { id } = req.query;
  const updates = req.body;

  try {
    const { data, error } = await supabase
      .from("doctors")
      .update(updates)
      .eq("doctor_id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res
        .status(404)
        .json({ message: "Doctor not found or not accessible" });
    }
    res.json({ message: "Doctor updated successfully", doctor: data });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
