"use client";
import React, { useState, useEffect } from "react";
import SideBar from "../../../components/sidebar";
import Loader from "../../../components/Loader";
import Popup from "../../../components/Popup";
import styles from "./id.module.css";

export default function DoctorProfilePage({ params }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  function calculateAge(dob) {
    const birthDate = new Date(dob); // dob format: "YYYY-MM-DD" or Date object
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Adjust age if today's date is before the birthday in the current year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }

  // Example usage:
  console.log(calculateAge("2005-09-20")); // Output: depends on today's date

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        console.log(params.id);

        // Replace with your actual API endpoint
        const response = await fetch(
          `http://localhost:3001/api/doctors/specificDoctorDisplay?id=${params.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch doctor details");
        }
        const data = await response.json();
        console.log(data);

        setDoctor(data);
      } catch (err) {
        setError(err.message);
        // For demo purposes, use the provided data structure
        setDoctor({
          email: "123@123.com",
          password: "12345678@aA",
          confirmPassword: "12345678@aA",
          phone_number: "1231212333",
          qualification: "MBBS, MD - Internal Medicine",
          hospital: "Apollo Hospital",
          about:
            "Experienced physician with 10+ years in internal medicine. Specializes in diabetes management and preventive care.",
          address: "123 Medical Center, Health Street, Mumbai - 400001",
          aadhar_number: "121111111113",
          registered_by: "12",
          name: "Dr. Rajesh Kumar",
          age: calculateAge("1979-03-15"),
          dob: "1979-03-15",
          gender: "Male",
          dp: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [params.id]);

  const handleEdit = () => {
    setEditData({ ...doctor });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/doctors/updateDoctor?id=${params.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update doctor details");
      }

      setDoctor(editData);
      setIsEditing(false);
      setPopup({
        show: true,
        type: "success",
        message: "Doctor details updated successfully!",
      });
    } catch (err) {
      setPopup({
        show: true,
        type: "error",
        message: "Failed to update doctor details. Please try again.",
      });
    }
  };

  const closePopup = () => {
    setPopup({ show: false, type: "", message: "" });
  };

  const handleResetPassword = () => {
    setShowResetDialog(true);
  };

  const confirmResetPassword = async () => {
    try {
      setResetLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/doctors/resetPassword?id=${params.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      setShowResetDialog(false);
      setPopup({
        show: true,
        type: "success",
        message:
          "Password has been reset successfully! A new password has been sent to the doctor's email.",
      });
    } catch (err) {
      setShowResetDialog(false);
      setPopup({
        show: true,
        type: "error",
        message: "Failed to reset password. Please try again.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const cancelResetPassword = () => {
    setShowResetDialog(false);
  };

  if (loading) {
    return (
      <div className={styles.dashboardRoot}>
        <main className={styles.mainArea}>
          <SideBar />
          <section className={styles.content}>
            <div className="container">
              <Loader />
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardRoot}>
        <main className={styles.mainArea}>
          <SideBar />
          <section className={styles.content}>
            <div className="container">
              <div className="alert alert-danger" role="alert">
                Error: {error}
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className={styles.dashboardRoot}>
        <main className={styles.mainArea}>
          <SideBar />
          <section className={styles.content}>
            <div className="container">
              <div className="alert alert-warning" role="alert">
                Doctor not found
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.dashboardRoot}>
      <main className={styles.mainArea}>
        <SideBar />
        <section className={styles.content}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10 col-md-12">
                <div className={`appCard ${styles.doctorCard}`}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className={styles.pageTitle}>Doctor Profile</h3>
                    {!isEditing && (
                      <div className={styles.actionButtonsHeader}>
                        <button
                          className={`btn ${styles.resetPasswordButton}`}
                          onClick={handleResetPassword}
                        >
                          Reset Password
                        </button>
                        <button
                          className={`btn ${styles.editButton}`}
                          onClick={handleEdit}
                        >
                          Edit Profile
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="row">
                    <div className="col-md-4 text-center">
                      <div className={styles.profileImageContainer}>
                        <img
                          src={
                            doctor.dp ||
                            "https://th.bing.com/th/id/OIP.-GDCqlIp43WC_CIn1brrFAHaHa?w=213&h=213&c=7&r=0&o=5&dpr=1.3&pid=1.7"
                          }
                          alt="Doctor Profile"
                          className={styles.profileImage}
                        />
                      </div>
                      <div className={styles.nameBox}>
                        <h4 className={styles.doctorName}>{doctor.name}</h4>
                        <p className={styles.qualification}>
                          {doctor.qualification}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-8">
                      <div className={styles.doctorDetails}>
                        <h5 className={styles.sectionTitle}>
                          Personal Information
                        </h5>
                        <div className="row">
                          <div className="col-sm-4">
                            <div className={styles.detailItem}>
                              <span className={styles.label}>Age:</span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={calculateAge(
                                    editData.dob || doctor.dob
                                  )}
                                  className={styles.editInput}
                                  disabled
                                />
                              ) : (
                                <span className={styles.value}>
                                  {calculateAge(doctor.dob)} years
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-sm-4">
                            <div className={styles.detailItem}>
                              <span className={styles.label}>
                                Date of Birth:
                              </span>
                              {isEditing ? (
                                <input
                                  type="date"
                                  value={editData.dob || doctor.dob}
                                  onChange={(e) =>
                                    handleInputChange("dob", e.target.value)
                                  }
                                  className={styles.editInput}
                                />
                              ) : (
                                <span className={styles.value}>
                                  {new Date(doctor.dob).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-sm-4">
                            <div className={styles.detailItem}>
                              <span className={styles.label}>Gender:</span>
                              {isEditing ? (
                                <select
                                  value={editData.gender || doctor.gender}
                                  onChange={(e) =>
                                    handleInputChange("gender", e.target.value)
                                  }
                                  className={styles.editInput}
                                >
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                                </select>
                              ) : (
                                <span className={styles.value}>
                                  {doctor.gender}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <h5 className={styles.sectionTitle}>
                          Contact Information
                        </h5>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Email:</span>
                          {isEditing ? (
                            <input
                              type="email"
                              value={editData.email || doctor.email}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                              className={styles.editInput}
                            />
                          ) : (
                            <span className={styles.value}>{doctor.email}</span>
                          )}
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Phone:</span>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={
                                editData.phone_number || doctor.phone_number
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "phone_number",
                                  e.target.value
                                )
                              }
                              className={styles.editInput}
                            />
                          ) : (
                            <span className={styles.value}>
                              {doctor.phone_number}
                            </span>
                          )}
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Address:</span>
                          {isEditing ? (
                            <textarea
                              value={editData.address || doctor.address}
                              onChange={(e) =>
                                handleInputChange("address", e.target.value)
                              }
                              className={styles.editTextarea}
                              rows="3"
                            />
                          ) : (
                            <span className={styles.value}>
                              {doctor.address}
                            </span>
                          )}
                        </div>

                        <h5 className={styles.sectionTitle}>
                          Professional Information
                        </h5>
                        <div className="row">
                          <div className="col-sm-6">
                            <div className={styles.detailItem}>
                              <span className={styles.label}>Hospital:</span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editData.hospital || doctor.hospital}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "hospital",
                                      e.target.value
                                    )
                                  }
                                  className={styles.editInput}
                                />
                              ) : (
                                <span className={styles.value}>
                                  {doctor.hospital}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-sm-6">
                            <div className={styles.detailItem}>
                              <span className={styles.label}>
                                Qualification:
                              </span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={
                                    editData.qualification ||
                                    doctor.qualification
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      "qualification",
                                      e.target.value
                                    )
                                  }
                                  className={styles.editInput}
                                />
                              ) : (
                                <span className={styles.value}>
                                  {doctor.qualification}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-sm-6">
                            <div className={styles.detailItem}>
                              <span className={styles.label}>
                                Aadhar Number:
                              </span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={
                                    editData.aadhar_number ||
                                    doctor.aadhar_number
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      "aadhar_number",
                                      e.target.value
                                    )
                                  }
                                  className={styles.editInput}
                                />
                              ) : (
                                <span className={styles.value}>
                                  {doctor.aadhar_number}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-sm-6">
                            <div className={styles.detailItem}>
                              <span className={styles.label}>
                                Registered By:
                              </span>
                              <span className={styles.value}>
                                {doctor.registered_by}
                              </span>
                            </div>
                          </div>
                        </div>

                        <h5 className={styles.sectionTitle}>About</h5>
                        <div className={styles.detailItem}>
                          {isEditing ? (
                            <textarea
                              value={editData.about || doctor.about}
                              onChange={(e) =>
                                handleInputChange("about", e.target.value)
                              }
                              className={styles.editTextarea}
                              rows="4"
                            />
                          ) : (
                            <p className={styles.aboutText}>{doctor.about}</p>
                          )}
                        </div>

                        {isEditing && (
                          <div className={styles.actionButtons}>
                            <button
                              className={`btn ${styles.cancelButton}`}
                              onClick={handleCancel}
                            >
                              Cancel
                            </button>
                            <button
                              className={`btn ${styles.saveButton}`}
                              onClick={handleSubmit}
                            >
                              Save Changes
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {popup.show && (
        <Popup type={popup.type} message={popup.message} onClose={closePopup} />
      )}
      {showResetDialog && (
        <div className={styles.dialogOverlay}>
          <div className={styles.resetDialog}>
            <div className={styles.dialogHeader}>
              <h4 className={styles.dialogTitle}>Reset Password</h4>
            </div>
            <div className={styles.dialogBody}>
              <p className={styles.dialogMessage}>
                Are you sure you want to reset the password for{" "}
                <strong>{doctor?.name}</strong>?
              </p>
              <p className={styles.dialogSubMessage}>
                A new password will be generated and sent to the doctor`&apos;`s
                email address.
              </p>
            </div>
            <div className={styles.dialogActions}>
              <button
                className={`btn ${styles.dialogCancelButton}`}
                onClick={cancelResetPassword}
                disabled={resetLoading}
              >
                Cancel
              </button>
              <button
                className={`btn ${styles.dialogConfirmButton}`}
                onClick={confirmResetPassword}
                disabled={resetLoading}
              >
                {resetLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
