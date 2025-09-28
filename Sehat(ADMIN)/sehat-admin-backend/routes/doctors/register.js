import express from "express";
const router = express.Router();
import { supabase } from "../supabaseClient.js";
import validateFormData from "../validate.js";
import bcrypt from "bcrypt";
import { uploadToSupabase } from "../../utils/uploadToSupabase.js";

router.post("/api/doctors/register", async (req, res) => {
  try {
    const formData = req.body;
    const publicUrl = "";
    console.log(formData.dp);

    const errors = validateFormData(formData);
    if (Object.keys(errors).length > 0) {
      console.log(errors);

      return res
        .status(400)
        .json({ success: false, message: "Error While Registering the user." });
    }

    if (formData.dp != null) {
      const fileName = formData.aadhar;
      publicUrl = await uploadToSupabase(formData.dp, fileName);
    }

    const hashedPassword = await bcrypt.hash(formData.password, 10);

    const { error } = await supabase.from("doctors").insert([
      {
        email: formData.email,
        password: hashedPassword,
        phone_number: formData.phone,
        qualification: formData.qualification,
        hospital: formData.hospital,
        about: formData.about,
        gender: formData.gender,
        dob: formData.dob,
        dp: publicUrl,
        address: formData.address,
        name: formData.name,
        aadhar_number: formData.aadhar,
        registered_by: 1,
      },
    ]);
    if (error) throw error;

    return res
      .status(200)
      .json({ success: true, message: "Registration successful!" });
  } catch (err) {
    console.log(err);
    if (
      err.message ==
      'duplicate key value violates unique constraint "doctors_email_key"'
    ) {
      return res
        .status(301)
        .send("Doctor With this email has already been registered!");
    }
    if (
      err.message ==
      'duplicate key value violates unique constraint "doctors_aadhar_number_key"'
    ) {
      return res
        .status(301)
        .send("Doctor With this aadhar number has already been registered!");
    } else {
      return res.status(400);
    }
  }
});

export default router;
