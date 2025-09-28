"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import styles from "./record-details.module.css";
import { useParams } from 'next/navigation';

export default function HealthRecordDetails() {
  const params = useParams();
  const id = params.id;  
  const postId = id; 
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFull, setShowFull] = useState(false);

  const formattedDate = useMemo(() => {
    if (!record?.consultedDate) return "";
    return new Date(record.consultedDate).toLocaleString();
  }, [record]);

  useEffect(() => {
    const fetchRecordById = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/user/health-records/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setRecord(null);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRecord(data.record);
        console.log(data);
        
      } catch (error) {
        console.error('Failed to fetch health record:', error);
        setRecord(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRecordById();
  }, [id]);

  if (loading) {
    return (
      <div className={`container ${styles.wrapper}`}>
        <header className={`pt-3 pb-2 ${styles.header}`}>
          <div className="d-flex align-items-center gap-2">
            <span className={styles.flagBand} aria-hidden="true"></span>
            <h1 className="h5 m-0">Record Details</h1>
          </div>
        </header>
        <div className="py-4 text-center">
          <div className="spinner-border text-primary" role="status" aria-label="Loading" />
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className={`container ${styles.wrapper}`}>
        <header className={`pt-3 pb-2 ${styles.header}`}>
          <div className="d-flex align-items-center gap-2">
            <span className={styles.flagBand} aria-hidden="true"></span>
            <h1 className="h5 m-0">Record Not Found</h1>
          </div>
        </header>
        <div className="alert alert-warning mt-3">No details found for id: {id}</div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.wrapper}`}>
      <header className={`pt-3 pb-2 ${styles.header}`}>
        <div className="d-flex align-items-center gap-2">
          <span className={styles.flagBand} aria-hidden="true"></span>
          <h1 className="h5 m-0">{record.disease}</h1>
        </div>
        <p className="text-muted small m-0">Consultation details</p>
      </header>

      <main className="container px-0 px-md-2">
        <div className={`card shadow-sm ${styles.detailsCard}`}>
          <div className="card-body p-3">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className={styles.field}><span className={styles.label}>Name:</span> {record.name}</div>
                <div className={styles.field}><span className={styles.label}>Doctor:</span> {record.doctor_name}</div>
                <div className={styles.field}><span className={styles.label}>Consulted:</span> {formattedDate}</div>
                <div className={styles.field}><span className={styles.label}>Duration:</span> {record.duration}</div>
              </div>
              <div className="col-12 col-md-6">
                <div className={styles.field}><span className={styles.label}>Age:</span> {record.age}</div>
                <div className={styles.field}><span className={styles.label}>Height:</span> {record.heightCm} cm</div>
                <div className={styles.field}><span className={styles.label}>Weight:</span> {record.weightKg} kg</div>
              </div>
              <div className="col-12">
                <div className={styles.field}><span className={styles.label}>Symptoms:</span> {record.symptoms}</div>
                <div className={styles.field}><span className={styles.label}>Doctor's note:</span> {record.doctorNote}</div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-3">
          <h2 className="h6 mb-2">Medication</h2>
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <ul className={`list-group ${styles.medList}`}>
                {/* {record.medications.map((m, i) => (
                  <li key={`${m.name}-${i}`} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{m.name}</span>
                    <span className="text-muted small">{m.dose} · {m.frequency}</span>
                  </li>
                ))} */}
              </ul>
            </div>
            <div className="col-12 col-lg-6">
              <div className={`card ${styles.prescriptionCard}`}>
                <div className="card-body p-2">
                  <button type="button" className={`btn ${styles.prescriptionButton}`} onClick={() => setShowFull(true)} aria-label="Open prescription image">
                    <Image src={record.prescriptionImage} alt="Prescription" width={640} height={900} className={styles.prescriptionImage} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showFull && (
        <div className={styles.fullscreenOverlay} role="dialog" aria-modal="true" aria-label="Prescription fullscreen">
          <button className={styles.closeButton} onClick={() => setShowFull(false)} aria-label="Close">
            ✕
          </button>
          <Image src={record.prescriptionImage} alt="Prescription fullscreen" fill style={{ objectFit: "contain" }} />
        </div>
      )}
    </div>
  );
}



