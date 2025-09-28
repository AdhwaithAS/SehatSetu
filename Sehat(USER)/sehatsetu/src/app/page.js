"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState("phone"); // "phone" or "otp"
  const [email, setEmail] = useState(""); // Store email for OTP verification

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  if (!apiBase && typeof window !== "undefined") {
    // Helps devs notice missing config without breaking SSR
    console.warn("NEXT_PUBLIC_API_BASE_URL is not set. Using empty base URL.");
  }

  async function handlePhoneSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch(`${apiBase}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.message || "Failed to send OTP. Please try again.";
        throw new Error(message);
      }

      // Store email from response for OTP verification
      if (data.email) {
        setEmail(data.email);
      }

      setStep("otp");
      setSuccess("OTP sent successfully to your phone number.");
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOtpSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch(`${apiBase}/api/user/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.message || "Invalid OTP. Please try again.";
        throw new Error(message);
      }

      const token = data?.token || data?.access_token;
      if (token && typeof window !== "undefined") {
        localStorage.setItem("auth_token", token);
      }

      setSuccess("Logged in successfully.");
      // Redirect to dashboard or next page
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <main className={styles.card}>
        <h1 className={styles.title}>SehatSetu Telemedicine</h1>
        <p className={styles.subtitle}>
          {step === "phone" ? "Enter your phone number" : "Enter the OTP sent to your phone"}
        </p>
        
        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className={styles.form}>
            <label className={styles.label} htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              type="tel"
              className={styles.input}
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              autoComplete="tel"
            />

            {error ? <div className={styles.error}>{error}</div> : null}
            {success ? <div className={styles.success}>{success}</div> : null}

            <button className={styles.button} type="submit" disabled={isLoading}>
              {isLoading ? "Sending OTP…" : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className={styles.form}>
            <label className={styles.label} htmlFor="otp">OTP Code</label>
            <input
              id="otp"
              type="text"
              className={styles.input}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength="6"
              pattern="[0-9]{6}"
            />

            {error ? <div className={styles.error}>{error}</div> : null}
            {success ? <div className={styles.success}>{success}</div> : null}

            <button className={styles.button} type="submit" disabled={isLoading}>
              {isLoading ? "Verifying…" : "Verify OTP"}
            </button>
            
            <button 
              type="button" 
              className={styles.link}
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
                setSuccess("");
              }}
              style={{ 
                background: "none", 
                border: "none", 
                color: "var(--accent)", 
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "14px",
                marginTop: "8px"
              }}
            >
              Change phone number
            </button>
          </form>
        )}
        
        <p className={styles.helper}>
          By continuing, you agree to our <a className={styles.link} href="#">Terms</a> and <a className={styles.link} href="#">Privacy Policy</a>.
        </p>
      </main>
    </div>
  );
}
