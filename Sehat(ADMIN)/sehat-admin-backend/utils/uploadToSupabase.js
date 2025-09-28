import { supabase } from "../routes/supabaseClient.js";

/**
 * Uploads a base64-encoded file to Supabase Storage.
 *
 * @param {string} base64String - Base64 encoded image (can include `data:image/...;base64,`).
 * @param {string} fileName - File name (should be unique).
 * @param {string} bucket - Supabase storage bucket (default: "images").
 * @returns {Promise<string>} Public URL of uploaded file
 */
export async function uploadToSupabase(
  base64String,
  fileName,
  bucket = "doctors_dp"
) {
  try {
    const base64Data = base64String.replace(/^data:\w+\/\w+;base64,/, "");
    const fileBuffer = Buffer.from(base64Data, "base64");
    const mimeType =
      base64String.match(/^data:(.*?);base64/)?.[1] || "image/png";
    const { error } = await supabase.storage
      .from("doctors_dp")
      .upload(fileName, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  } catch (err) {
    throw new Error("Supabase upload failed: " + err.message);
  }
}
