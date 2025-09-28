"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [resetEmail, setResetEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(""); // Clear error when user types
  };

  const handleResetEmailChange = (e) => {
    setResetEmail(e.target.value);
  };

  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          remember: formData.remember,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data);
        localStorage.setItem("id", data.user.id);
        localStorage.setItem("email", data.user.email);
        router.push("/");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password submission
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsResetLoading(true);
    setResetMessage("");

    try {
      const response = await fetch(
        "http://localhost:3001/api/admin/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: resetEmail }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResetMessage("Password reset link sent to your email!");
        setResetEmail("");
        // Close modal after 3 seconds
        setTimeout(() => {
          const modal = document.getElementById("forgotModal");
          if (modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
          }
        }, 3000);
      } else {
        setResetMessage(
          data.message || "Failed to send reset link. Please try again."
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setResetMessage("Network error. Please try again.");
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <>
      <main
        className={`${styles.page} d-flex align-items-center justify-content-center`}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-5">
              <div className={`${styles.card} card border-0 shadow-sm`}>
                <div className="card-body p-4 p-md-5">
                  <h1 className={`${styles.title} h3 mb-4 text-center`}>
                    Welcome back
                  </h1>

                  <form
                    className="needs-validation"
                    noValidate
                    onSubmit={handleLoginSubmit}
                  >
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="mb-2">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="remember"
                          checked={formData.remember}
                          onChange={handleInputChange}
                          id="remember"
                        />
                        <label className="form-check-label" htmlFor="remember">
                          Remember me for 24 hours
                        </label>
                      </div>

                      <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none"
                        data-bs-toggle="modal"
                        data-bs-target="#forgotModal"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      className={`${styles.submit} btn btn-primary w-100`}
                    >
                      Sign in
                    </button>
                  </form>

                  <p className="text-center mt-3 mb-0 small text-muted">
                    Use your work email to continue
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      <div
        className="modal fade"
        id="forgotModal"
        tabIndex="-1"
        aria-labelledby="forgotModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="forgotModalLabel">
                Reset password
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleForgotPassword}>
                {resetMessage && (
                  <div
                    className={`alert ${
                      resetMessage.includes("sent")
                        ? "alert-success"
                        : "alert-danger"
                    } mb-3`}
                    role="alert"
                  >
                    {resetMessage}
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="resetEmail" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="resetEmail"
                    value={resetEmail}
                    onChange={handleResetEmailChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    disabled={isResetLoading}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                data-bs-dismiss="modal"
                disabled={isResetLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleForgotPassword}
                disabled={isResetLoading || !resetEmail.trim()}
              >
                {isResetLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
