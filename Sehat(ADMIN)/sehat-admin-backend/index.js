import express from "express";
const app = express();
const port = 3001;
import registerDoc from "./routes/doctors/register.js";
import specificDoctorDisplay from "./routes/doctors/specificDoctorDisplay.js";
import updateDoctor from "./routes/doctors/updateDoctor.js";
import adminLogin from "./routes/adminLogin.js";
import resetAdminPassword from "./routes/resetAdminPassword.js";
import displayAllDoctors from "./routes/doctors/displayAllDoctors.js";

import cors from "cors";
const allowedOrigins = [
  "http://localhost:3000", // dev
  "https://sehat-admin-rose.vercel.app", // production
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.use("/", registerDoc);
app.use("/", specificDoctorDisplay);
app.use("/", updateDoctor);
app.use("/", resetAdminPassword);
app.use("/", displayAllDoctors);
app.use("/", adminLogin);

app.listen(port);
