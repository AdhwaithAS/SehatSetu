"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";

const actions = [
  {
    key: "consult",
    title: "Book Consultation",
    description: "Video/audio with verified doctors",
    href: "/nearby-clinics",
    icon: "🩺",
  },
  {
    key: "clinic",
    title: "Nearby Clinics",
    description: "Locate PHC/CHC and telemedicine kiosks",
    href: "/nearby-clinics",
    icon: "📍",
  },
  {
    key: "symptom checker",
    title: "Symptom Checker",
    description: "Ask anything about your symptoms",
    href: "/symptom-checker",
    icon: "📍",
  },
  {
    key: "records",
    title: "Health Records",
    description: "View prescriptions and uploads",
    href: "/healthHistory",
    icon: "📄",
  },
  {
    key: "profile",
    title: "Profile",
    description: "Click to edit or view the profile",
    href: "/profile",
    icon: "🏛️",
  },
  {
    key: "emergency",
    title: "Emergency 112",
    description: "Quick call for help",
    href: "tel:112",
    icon: "🚑",
  },
  {
    key: "languages",
    title: "Language",
    description: "Choose your language",
    href: "#lang",
    icon: "🗣️",
  },
];

export default function DashboardPage() {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  const handleEmergencyClick = (e) => {
    e.preventDefault();
    setShowEmergencyModal(true);
    setIsCountingDown(true);
    setCountdown(10);
  };

  const handleCancelEmergency = () => {
    setShowEmergencyModal(false);
    setIsCountingDown(false);
    setCountdown(10);
  };

  const handleConfirmEmergency = () => {
    window.location.href = "tel:112";
    setShowEmergencyModal(false);
    setIsCountingDown(false);
  };

  const handleConsultationClick = (e) => {
    e.preventDefault();
    setShowConsultationModal(true);
  };

  const handleCloseConsultationModal = () => {
    setShowConsultationModal(false);
  };

  const handleUrgencySelect = (urgency) => {
    window.location.href = `/consultation?urgency=${urgency}`;
  };

  useEffect(() => {
    let timer;
    if (isCountingDown && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      // Auto-dial after countdown
      window.location.href = "tel:112";
      setShowEmergencyModal(false);
      setIsCountingDown(false);
    }
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown]);

  return (
    <div className={`container-fluid ${styles.wrapper}`}>
      <header className={`pt-3 pb-2 ${styles.header}`}>
        <div className="d-flex align-items-center gap-2">
          <h1 className="h4 m-0">SehatSetu</h1>
        </div>
        <p className="text-muted small m-0">Accessible telemedicine for every village</p>
      </header>

      <main className="container px-3">
        <div className="row gy-3 gx-3">
          {actions.map((item) => (
            <div key={item.key} className="col-6 col-md-4">
              {item.key === "emergency" ? (
                <div className={`text-decoration-none ${styles.cardLink}`}>
                  <div 
                    className={`card shadow-sm ${styles.cardButton}`} 
                    role="button" 
                    tabIndex={0}
                    onClick={handleEmergencyClick}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body p-3 d-flex flex-column align-items-start">
                      <div className={styles.icon} aria-hidden>
                        {item.icon}
                      </div>
                      <div className="mt-1">
                        <h2 className={`h6 mb-1 ${styles.cardTitle}`}>{item.title}</h2>
                        <p className={`m-0 small ${styles.cardDesc}`}>{item.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : item.key === "consult" ? (
                <div className={`text-decoration-none ${styles.cardLink}`}>
                  <div 
                    className={`card shadow-sm ${styles.cardButton}`} 
                    role="button" 
                    tabIndex={0}
                    onClick={handleConsultationClick}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body p-3 d-flex flex-column align-items-start">
                      <div className={styles.icon} aria-hidden>
                        {item.icon}
                      </div>
                      <div className="mt-1">
                        <h2 className={`h6 mb-1 ${styles.cardTitle}`}>{item.title}</h2>
                        <p className={`m-0 small ${styles.cardDesc}`}>{item.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href={item.href} className={`text-decoration-none ${styles.cardLink}`}>
                  <div className={`card shadow-sm ${styles.cardButton}`} role="button" tabIndex={0}>
                    <div className="card-body p-3 d-flex flex-column align-items-start">
                      <div className={styles.icon} aria-hidden>
                        {item.icon}
                      </div>
                      <div className="mt-1">
                        <h2 className={`h6 mb-1 ${styles.cardTitle}`}>{item.title}</h2>
                        <p className={`m-0 small ${styles.cardDesc}`}>{item.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>

        <section className={`mt-4 ${styles.notice}`}>
          <div className="alert alert-info py-2 px-3 m-0">
            For emergencies, use the Emergency 112 card above.
          </div>
        </section>
      </main>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className={`${styles.emergencyModal}`}>
          <div className={styles.modalContent}>
            <div className="text-center">
              <div className={`${styles.emergencyIcon}`}>🚑</div>
              <h3 className="h4 mb-3">Emergency Call</h3>
              <p className="mb-3">Are you sure you want to call Emergency 112?</p>
              {isCountingDown && (
                <div className={`${styles.countdown}`}>
                  <p className="mb-2">Auto-calling in:</p>
                  <div className={`${styles.countdownNumber}`}>{countdown}</div>
                </div>
              )}
              <div className="d-flex gap-2 justify-content-center">
                <button 
                  className="btn btn-outline-danger"
                  onClick={handleCancelEmergency}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleConfirmEmergency}
                >
                  Call Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Modal */}
      {showConsultationModal && (
        <div className={`${styles.emergencyModal}`}>
          <div className={styles.modalContent}>
            <div className="text-center">
              <div className={`${styles.emergencyIcon}`}>🩺</div>
              <h3 className="h4 mb-3">Book Consultation</h3>
              <p className="mb-4">Please select the urgency level for your consultation:</p>
              
              <div className="d-grid gap-3 mb-4">
                <button 
                  className="btn btn-outline-danger btn-lg"
                  onClick={() => handleUrgencySelect('emergency')}
                >
                  🚨 Emergency
                </button>
                <button 
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => handleUrgencySelect('checkup')}
                >
                  🩺 Regular Checkup
                </button>
                <button 
                  className="btn btn-outline-info btn-lg"
                  onClick={() => handleUrgencySelect('query')}
                >
                  💬 General Query
                </button>
              </div>
              
              <button 
                className="btn btn-outline-secondary"
                onClick={handleCloseConsultationModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

