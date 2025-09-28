"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./health-history.module.css";

export default function HealthHistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealthRecords = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/user/health-records');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRecords(data.records);
console.log(data.records);

      } catch (error) {
        console.error('Failed to fetch health records:', error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHealthRecords();
  }, []);

  return (
    <div className={`container ${styles.wrapper}`}>
      <header className={`pt-3 pb-2 ${styles.header}`}>
        <div className="d-flex align-items-center gap-2">
          <span className={styles.flagBand} aria-hidden="true"></span>
          <h1 className="h4 m-0">Health History</h1>
        </div>
        <p className="text-muted small m-0">Your past consultations and diagnoses</p>
      </header>

      {loading ? (
        <div className="py-4 text-center">
          <div className="spinner-border text-primary" role="status" aria-label="Loading" />
        </div>
      ) : (
        <main className="container px-0 px-md-2">
          <div className="row gy-3 gx-3">
            {records.map((rec) => (
              <div key={rec.id} className="col-12 col-md-6 col-lg-4">
                <Link href={`/healthHistory/${rec.id}`} className="text-decoration-none">
                  <article className={`card shadow-sm ${styles.recordCard}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`${rec.disease} consulted with ${rec.doctor_name} on ${rec.date}`}>
                    <div className="card-body p-3">
                      <div className="d-flex align-items-start justify-content-between">
                        <div>
                          <h2 className={`h6 mb-1 ${styles.cardTitle}`}>{rec.disease_name}</h2>
                          <p className={`m-0 small ${styles.cardMeta}`}>
                            <span className="me-2" aria-label="Doctor">👨‍⚕️</span>
                            {rec.doctor_name}
                          </p>
                        </div>
                        <span className={`badge ${styles.datePill}`} aria-label="Date">
                          {new Date(rec.consulted).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </div>
            ))}
          </div>

          {records.length === 0 && (
            <div className="alert alert-warning mt-3" role="status">
              No history found.
            </div>
          )}
        </main>
      )}
    </div>
  );
}


