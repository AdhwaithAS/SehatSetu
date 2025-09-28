import express from "express";
const router = express.Router();
import { supabase } from "../supabaseClient.js";

router.get("/api/doctors/specificDoctorDisplay", async (req, res) => {
  const { id } = req.query;

  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("aadhar_number", id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return res.sendStatus(404);
  }

  res.json({
    doctor_id: data.doctor_id,
    dp: data.dp,
    created_at: data.created_at,
    qualification: data.qualification,
    about: data.about,
    address: data.address,
    aadhar_number: data.aadhar_number,
    email: data.email,
    hospital: data.hospital,
    phone_number: data.phone_number,
    registered_by: data.registered_by,
    dob: data.dob,
    name: data.name,
    gender: data.gender,
  });
});

export default router;
