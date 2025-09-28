"use client";
import React, { useMemo, useState } from "react";
import Sidebar from "../../components/sidebar";
import styles from "./add-doc.module.css";
import layoutStyles from "../../dashboard.module.css";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dob: "",
    gender: "",
    qualification: "",
    hospital: "",
    about: "",
    address: "",
    aadhar: "",
    dp: null,
  });

  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    type: "success", // 'success' or 'error'
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dpPreview, setDpPreview] = useState(null);

  // Image compression utility
  const compressImage = (
    file,
    maxWidth = 400,
    maxHeight = 400,
    quality = 0.8
  ) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, "image/jpeg", quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleDpUpload = async (files) => {
    if (files.length > 0) {
      const file = files[0];
      try {
        // Compress the image
        const compressedBlob = await compressImage(file);
        const compressedFile = new File([compressedBlob], file.name, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        // Create preview URL
        const previewUrl = URL.createObjectURL(compressedBlob);
        setDpPreview(previewUrl);

        // Convert to base64 for form data
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData((prev) => ({ ...prev, dp: e.target.result }));
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Error processing image:", error);
        showPopup("error", "Failed to process image. Please try again.");
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDpUpload,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const passwordChecks = useMemo(() => {
    const value = formData.password || "";
    return {
      hasMinLen: value.length >= 8,
      hasUpper: /[A-Z]/.test(value),
      hasLower: /[a-z]/.test(value),
      hasNumber: /\d/.test(value),
      hasSymbol: /[^A-Za-z0-9]/.test(value),
    };
  }, [formData.password]);

  const errors = useMemo(() => {
    const list = {};
    if (!formData.name || formData.name.trim().length < 2) {
      list.name = "Name is required";
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      list.email = "Enter a valid email";
    }
    if (!formData.password) {
      list.password = "Password is required";
    } else if (
      !(
        passwordChecks.hasMinLen &&
        passwordChecks.hasUpper &&
        passwordChecks.hasLower &&
        passwordChecks.hasNumber &&
        passwordChecks.hasSymbol
      )
    ) {
      list.password = "Must be 8+ chars with upper, lower, number, symbol";
    }
    if (!formData.confirmPassword) {
      list.confirmPassword = "Confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      list.confirmPassword = "Passwords do not match";
    }
    if (!formData.phone || !/^\d{10}$/.test(formData.phone.trim())) {
      list.phone = "Enter 10-digit phone";
    }
    if (!formData.dob || formData.dob.trim() === "") {
      list.dob = "Date of birth is required";
    } else {
      const today = new Date();
      const birthDate = new Date(formData.dob);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        // Adjust age if birthday hasn't occurred this year
        const adjustedAge = age - 1;
        if (adjustedAge < 18) {
          list.dob = "Doctor must be at least 18 years old";
        }
      } else if (age < 18) {
        list.dob = "Doctor must be at least 18 years old";
      } else if (age > 100) {
        list.dob = "Please enter a valid date of birth";
      }
    }
    if (!formData.gender || formData.gender.trim() === "") {
      list.gender = "Please select a gender";
    }
    if (!formData.qualification || formData.qualification.trim() === "") {
      list.qualification = "Required";
    }
    if (!formData.hospital || formData.hospital.trim() === "") {
      list.hospital = "Required";
    }
    if (!formData.about || formData.about.trim() === "") {
      list.about = "Required";
    }
    if (!formData.address || formData.address.trim() === "") {
      list.address = "Required";
    }
    if (!formData.aadhar || !/^\d{12}$/.test(formData.aadhar.trim())) {
      list.aadhar = "Enter 12-digit Aadhar";
    }
    return list;
  }, [formData, passwordChecks]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function isInvalid(name) {
    return Boolean((touched[name] || submitted) && errors[name]);
  }

  function showPopup(type, message) {
    setPopup({ show: true, type, message });
  }

  function hidePopup() {
    setPopup({ show: false, type: "success", message: "" });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      try {
        // Replace with your actual API endpoint
        const response = await axios.post(
          "http://localhost:3001/api/doctors/register",
          formData
        );
        console.log(formData);

        if (response.status === 200 || response.status === 201) {
          showPopup("success", "Doctor has been successfully registered!");
          router.push("/dashboard/view-docs/" + formData.aadhar);
          setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            dob: "",
            gender: "",
            qualification: "",
            hospital: "",
            about: "",
            address: "",
            aadhar: "",
            dp: "",
          });
          setTouched({});
          setSubmitted(false);
        }
      } catch (error) {
        console.error("Registration error:", error);
        const errorMessage =
          error.response?.data ||
          error.message ||
          "Failed to register doctor. Please try again.";
        showPopup("error", errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <div className={layoutStyles.mainArea}>
      <Sidebar />
      <div className="container py-3">
        <section className={`${styles.header} appCard p-4 mb-3`}>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className={styles.title}>Register Doctor</h1>
              <p className={styles.subtitle}>Create a new doctor profile</p>
            </div>
          </div>
        </section>

        <section className={`${styles.formCard} appCard p-4`}>
          <form onSubmit={onSubmit} noValidate>
            <div className="row g-3">
              {/* Profile Picture Upload */}
              <div className="col-12">
                <label className="form-label">Profile Picture</label>
                <div className={styles.dpUploadContainer}>
                  {dpPreview ? (
                    <div className={styles.dpPreview}>
                      <img
                        src={dpPreview}
                        alt="Profile Preview"
                        className={styles.dpImage}
                      />
                      <button
                        type="button"
                        className={styles.removeDp}
                        onClick={() => {
                          setDpPreview(null);
                          setFormData((prev) => ({ ...prev, dp: "" }));
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      {...getRootProps()}
                      className={`${styles.uploadArea} ${
                        isDragActive ? styles.dragActive : ""
                      }`}
                    >
                      <input {...getInputProps()} />
                      <svg
                        className={styles.uploadIcon}
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 16L12 8M12 8L8 12M12 8L16 12M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className={styles.uploadText}>
                        {isDragActive
                          ? "Drop the image here"
                          : "Click to upload profile picture"}
                      </p>
                      <small className={styles.uploadHint}>
                        JPG, PNG up to 5MB
                      </small>
                    </div>
                  )}
                </div>
              </div>

              {/* Name Field */}
              <div className="col-12 col-md-6">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className={`form-control ${
                    isInvalid("name") ? "is-invalid" : ""
                  }`}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Dr. John Doe"
                />
                {isInvalid("name") && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${
                    isInvalid("email") ? "is-invalid" : ""
                  }`}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="doctor@example.com"
                />
                {isInvalid("email") && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="\\d{10}"
                  className={`form-control ${
                    isInvalid("phone") ? "is-invalid" : ""
                  }`}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="10-digit phone"
                />
                {isInvalid("phone") && (
                  <div className="invalid-feedback">{errors.phone}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className={`form-control ${
                    isInvalid("dob") ? "is-invalid" : ""
                  }`}
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  max={new Date().toISOString().split("T")[0]}
                />
                {isInvalid("dob") && (
                  <div className="invalid-feedback">{errors.dob}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Gender</label>
                <select
                  className={`form-select ${
                    isInvalid("gender") ? "is-invalid" : ""
                  }`}
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                </select>
                {isInvalid("gender") && (
                  <div className="invalid-feedback">{errors.gender}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className={`form-control ${
                    isInvalid("password") ? "is-invalid" : ""
                  }`}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                />
                <div className={styles.passwordHints}>
                  <span
                    className={
                      passwordChecks.hasMinLen ? styles.ok : styles.bad
                    }
                  >
                    8+
                  </span>
                  <span
                    className={passwordChecks.hasUpper ? styles.ok : styles.bad}
                  >
                    A
                  </span>
                  <span
                    className={passwordChecks.hasLower ? styles.ok : styles.bad}
                  >
                    a
                  </span>
                  <span
                    className={
                      passwordChecks.hasNumber ? styles.ok : styles.bad
                    }
                  >
                    1
                  </span>
                  <span
                    className={
                      passwordChecks.hasSymbol ? styles.ok : styles.bad
                    }
                  >
                    #
                  </span>
                </div>
                {isInvalid("password") && (
                  <div className="invalid-feedback d-block">
                    {errors.password}
                  </div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className={`form-control ${
                    isInvalid("confirmPassword") ? "is-invalid" : ""
                  }`}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Repeat password"
                />
                {isInvalid("confirmPassword") && (
                  <div className="invalid-feedback">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Qualification</label>
                <input
                  type="text"
                  className={`form-control ${
                    isInvalid("qualification") ? "is-invalid" : ""
                  }`}
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., MBBS, MD, MS"
                />
                {isInvalid("qualification") && (
                  <div className="invalid-feedback">{errors.qualification}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Hospital</label>
                <input
                  type="text"
                  className={`form-control ${
                    isInvalid("hospital") ? "is-invalid" : ""
                  }`}
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Current hospital"
                />
                {isInvalid("hospital") && (
                  <div className="invalid-feedback">{errors.hospital}</div>
                )}
              </div>

              <div className="col-12">
                <label className="form-label">About</label>
                <textarea
                  rows={3}
                  className={`form-control ${
                    isInvalid("about") ? "is-invalid" : ""
                  }`}
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Short bio, specialties, experience"
                />
                {isInvalid("about") && (
                  <div className="invalid-feedback">{errors.about}</div>
                )}
              </div>

              <div className="col-12">
                <label className="form-label">Address</label>
                <textarea
                  rows={2}
                  className={`form-control ${
                    isInvalid("address") ? "is-invalid" : ""
                  }`}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Street, City, State, PIN"
                />
                {isInvalid("address") && (
                  <div className="invalid-feedback">{errors.address}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Aadhar Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\\d{12}"
                  className={`form-control ${
                    isInvalid("aadhar") ? "is-invalid" : ""
                  }`}
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="12-digit Aadhar"
                />
                {isInvalid("aadhar") && (
                  <div className="invalid-feedback">{errors.aadhar}</div>
                )}
              </div>

              <div className="col-12">
                <button
                  type="submit"
                  className={`btn ${styles.submitBtn}`}
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register Doctor"}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>

      {/* Popup Modal */}
      {popup.show && (
        <div className={styles.popupOverlay} onClick={hidePopup}>
          <div
            className={`${styles.popup} ${styles[popup.type]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.popupIcon}>
              {popup.type === "success" ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <h3 className={styles.popupTitle}>
              {popup.type === "success" ? "Success!" : "Error!"}
            </h3>
            <p className={styles.popupMessage}>{popup.message}</p>
            <button className={`btn ${styles.popupButton}`} onClick={hidePopup}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
