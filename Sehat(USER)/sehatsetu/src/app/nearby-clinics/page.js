'use client';

import { useState, useEffect } from 'react';
import styles from './nearby-clinics.module.css';

// Sample clinic data with coordinates
const clinicsData = [
  {
    id: 1,
    name: "City General Hospital",
    location: "123 Main Street, Downtown",
    latitude: 28.6139,
    longitude: 77.2090,
    phone: "+91-11-2345-6789",
    specialties: ["General Medicine", "Emergency Care", "Cardiology"]
  },
  {
    id: 2,
    name: "Metro Health Center",
    location: "456 Park Avenue, Midtown",
    latitude: 28.6141,
    longitude: 77.2092,
    phone: "+91-11-2345-6790",
    specialties: ["Pediatrics", "Dermatology", "Orthopedics"]
  },
  {
    id: 3,
    name: "Sunrise Medical Clinic",
    location: "789 Garden Road, Uptown",
    latitude: 28.6143,
    longitude: 77.2094,
    phone: "+91-11-2345-6791",
    specialties: ["Family Medicine", "Gynecology", "Psychiatry"]
  },
  {
    id: 4,
    name: "Green Valley Hospital",
    location: "321 Lake Street, Suburb",
    latitude: 28.6145,
    longitude: 77.2096,
    phone: "+91-11-2345-6792",
    specialties: ["Neurology", "Oncology", "Radiology"]
  },
  {
    id: 5,
    name: "Central Medical Center",
    location: "654 Hill Avenue, Central",
    latitude: 28.6147,
    longitude: 77.2098,
    phone: "+91-11-2345-6793",
    specialties: ["Emergency Care", "Surgery", "ICU"]
  }
];

// Function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

// Function to get user's current location
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

// Function to open Google Maps with navigation
function openGoogleMaps(latitude, longitude, clinicName) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
  window.open(url, '_blank');
}

export default function NearbyClinics() {
  const [userLocation, setUserLocation] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
        
        // Calculate distances for all clinics
        const clinicsWithDistance = clinicsData.map(clinic => ({
          ...clinic,
          distance: calculateDistance(
            location.latitude,
            location.longitude,
            clinic.latitude,
            clinic.longitude
          )
        }));

        // Sort by distance
        clinicsWithDistance.sort((a, b) => a.distance - b.distance);
        setClinics(clinicsWithDistance);
        setLoading(false);
      } catch (err) {
        setError('Unable to get your location. Please enable location services.');
        // If location fails, show clinics without distance
        setClinics(clinicsData);
        setLoading(false);
      }
    };

    fetchUserLocation();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Getting your location and finding nearby clinics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Nearby Clinics</h1>
        <p className={styles.subtitle}>
          Find healthcare facilities near your location
        </p>
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className={styles.clinicsGrid}>
        {clinics.map((clinic) => (
          <div key={clinic.id} className={styles.clinicCard}>
            <div className={styles.clinicHeader}>
              <h3 className={styles.clinicName}>{clinic.name}</h3>
              {userLocation && (
                <span className={styles.distance}>
                  {clinic.distance.toFixed(1)} km away
                </span>
              )}
            </div>
            
            <div className={styles.clinicDetails}>
              <div className={styles.detailItem}>
                <span className={styles.label}>📍 Location:</span>
                <span className={styles.value}>{clinic.location}</span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.label}>📞 Phone:</span>
                <span className={styles.value}>{clinic.phone}</span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.label}>🏥 Specialties:</span>
                <div className={styles.specialties}>
                  {clinic.specialties.map((specialty, index) => (
                    <span key={index} className={styles.specialty}>
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className={styles.clinicActions}>
              <button
                className={styles.navigateButton}
                onClick={() => openGoogleMaps(clinic.latitude, clinic.longitude, clinic.name)}
              >
                🗺️ Navigate with Google Maps
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
