'use client';
import { useState, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './profile.module.css';

// Calculate age from DOB
function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function Profile() {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch('http://localhost:3001/api/user/8950673651');
        if (!response.ok) {
          throw new Error('Failed to fetch patient data');
        }
        const data = await response.json();
        setPatientData(data.user);
        console.log(data);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  if (loading) {
    return (
      <div className={`container ${styles.profileContainer}`}>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`container ${styles.profileContainer}`}>
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>Failed to load profile data: {error}</p>
          <button 
            className="btn btn-outline-danger" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className={`container ${styles.profileContainer}`}>
        <div className="alert alert-warning" role="alert">
          No profile data available.
        </div>
      </div>
    );
  }

  // Format phone numbers for better readability
  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    const phoneStr = phone.toString();
    if (phoneStr.length === 10) {
      return `+91 ${phoneStr.slice(0, 5)} ${phoneStr.slice(5)}`;
    }
    return phoneStr;
  };

  // Format Aadhar number for better readability
  const formatAadharNumber = (aadhar) => {
    if (!aadhar) return 'N/A';
    const aadharStr = aadhar.toString();
    if (aadharStr.length === 12) {
      return `${aadharStr.slice(0, 4)} ${aadharStr.slice(4, 8)} ${aadharStr.slice(8)}`;
    }
    return aadharStr;
  };

  const patientDetails = [
    { icon: 'bi-calendar-date', label: 'Date of Birth', value: patientData.dob },
    { icon: 'bi-hourglass-split', label: 'Age', value: `${patientData.age} years` },
    { icon: 'bi-gender-ambiguous', label: 'Sex', value: patientData.sex },
    { icon: 'bi-droplet', label: 'Blood Group', value: patientData.blood_grp },
    { icon: 'bi-rulers', label: 'Height', value: `${patientData.height} cm` },
    { icon: 'bi-bar-chart', label: 'Weight', value: `${patientData.weight} kg` },
    { icon: 'bi-telephone', label: 'Phone', value: formatPhoneNumber(patientData.phn_number) },
    { icon: 'bi-person-lines-fill', label: 'Emergency Contact', value: formatPhoneNumber(patientData.em_phn_no) },
    { icon: 'bi-credit-card-2-front', label: 'Aadhar Number', value: formatAadharNumber(patientData.aadhar_no) },
    { icon: 'bi-envelope', label: 'Email', value: patientData.email },
  ];

  // Handle health history - it's a simple string in your API response
  const healthHistory = patientData.health_his || 'No health history available';

  return (
    <div className={`container ${styles.profileContainer}`}>
      <div className="row">
        {/* Profile Card */}
        <div className="col-md-4 text-center">
          <div className={styles.profileCard}>
            <div className={styles.profileImageWrapper}>
              <i className={`bi bi-person-circle ${styles.profileIcon}`}></i>
            </div>
            <h4 className={styles.displayName}>{patientData.name}</h4>
            <p className={styles.muted}>Patient ID: {patientData.id}</p>
            <button className={`btn ${styles.accentButton}`}>Update Profile</button>
          </div>
        </div>

        {/* Patient Info */}
        <div className="col-md-8">
          {/* Patient Details */}
          <div className={`card mb-4 ${styles.cardCustom}`}>
            <div className="card-body">
              <h5 className={styles.cardTitle}>Patient Details</h5>
              <div className="row">
                {patientDetails.map((item, idx) => (
                  <div key={idx} className="col-sm-6 mb-3">
                    <div className={styles.detailCard}>
                      <i className={`bi ${item.icon} ${styles.detailIcon}`}></i>
                      <div>
                        <div className={styles.detailLabel}>{item.label}</div>
                        <div className={styles.detailValue}>{item.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Health History */}
          <div className={`card mb-4 ${styles.cardCustom}`}>
            <div className="card-body">
              <h5 className={styles.cardTitle}>Health History</h5>
              <div className={styles.healthHistoryContent}>
                <p className="mb-0">{healthHistory}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
