import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

/**
 * GET /users?page=1&limit=10
 * Fetch paginated users with selected fields
 */
router.get("/api/doctors", async (req, res) => {
  try {
    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Fetch data from Supabase
    const { data, error, count } = await supabase
      .from("doctors") // 👈 replace with your table name
      .select("name, dob, qualification, dp, hospital", { count: "exact" })
      .range(from, to);

    if (error) throw error;

    res.json({
      page,
      limit,
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
