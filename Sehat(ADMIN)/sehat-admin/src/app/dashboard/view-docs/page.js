"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/sidebar';
import styles from './page.module.css';
import layoutStyles from '../../dashboard.module.css';

export default function ViewDocsPage() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('name');
  const [sortBy, setSortBy] = useState('name');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch doctors from API
  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/doctors');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API data to match our component structure
      const transformedDoctors = data.data.map((doctor, index) => ({
        id: doctor._id || doctor.id || index + 1,
        name: doctor.name || 'Dr. Unknown',
        hospital: doctor.hospital || 'Hospital Not Specified',
        qualification: doctor.qualification || 'Qualification Not Specified',
        age: doctor.age || calculateAge(doctor.dob) || 'Unknown',
        dp: doctor.dp || `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face`,
        email: doctor.email,
        phone: doctor.phone,
        aadhar: doctor.aadhar,
        address: doctor.address,
        about: doctor.about
      }));
      
      setDoctors(transformedDoctors);
      setFilteredDoctors(transformedDoctors);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err.message);
      
      // Fallback to sample data if API fails
      const sampleDoctors = [
        {
          id: 1,
          name: "Dr. Sarah Johnson",
          hospital: "City General Hospital",
          qualification: "MD, Cardiology",
          age: 42,
          dp: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
        },
        {
          id: 2,
          name: "Dr. Michael Chen",
          hospital: "Metro Medical Center",
          qualification: "MBBS, Neurology",
          age: 38,
          dp: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face"
        },
        {
          id: 3,
          name: "Dr. Emily Rodriguez",
          hospital: "University Hospital",
          qualification: "MD, Pediatrics",
          age: 35,
          dp: "https://images.unsplash.com/photo-1594824388852-8a0a0b0b0b0b?w=150&h=150&fit=crop&crop=face"
        },
        {
          id: 4,
          name: "Dr. James Wilson",
          hospital: "St. Mary's Hospital",
          qualification: "MBBS, Orthopedics",
          age: 45,
          dp: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face"
        }
      ];
      
      setDoctors(sampleDoctors);
      setFilteredDoctors(sampleDoctors);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = doctors.filter(doctor => {
        const searchValue = searchTerm.toLowerCase();
        switch (filterBy) {
          case 'name':
            return doctor.name.toLowerCase().includes(searchValue);
          case 'hospital':
            return doctor.hospital.toLowerCase().includes(searchValue);
          case 'qualification':
            return doctor.qualification.toLowerCase().includes(searchValue);
          case 'age':
            return doctor.age.toString().includes(searchValue);
          default:
            return doctor.name.toLowerCase().includes(searchValue);
        }
      });
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'hospital':
          return a.hospital.localeCompare(b.hospital);
        case 'qualification':
          return a.qualification.localeCompare(b.qualification);
        case 'age':
          return a.age - b.age;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredDoctors(filtered);
  }, [searchTerm, filterBy, sortBy, doctors]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterBy(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleRefresh = () => {
    fetchDoctors();
  };

  return (
    <div className={layoutStyles.dashboardRoot}>
      <div className={layoutStyles.mainArea}>
        <Sidebar />
        <div className={layoutStyles.content}>
          <div className="container-fluid">
            {/* Header Section */}
            <div className="row mb-4">
              <div className="col-12">
                <div className={styles.pageHeader}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h1 className={styles.pageTitle}>View Doctors</h1>
                      <p className={styles.pageSubtitle}>Manage and view all registered doctors</p>
                    </div>
                    <button 
                      className="btn btn-outline-primary d-flex align-items-center gap-2"
                      onClick={handleRefresh}
                      disabled={isLoading}
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                      {isLoading ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="row mb-4">
                <div className="col-12">
                  <div className="alert alert-warning d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>
                      <strong>API Error:</strong> {error}. Showing sample data instead.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="row">
                <div className="col-12">
                  <div className={`${styles.loadingContainer} appCard text-center`}>
                    <div className={styles.spinner}>
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    <h4 className="mt-3">Loading Doctors...</h4>
                    <p>Please wait while we fetch the latest data.</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Filter and Search Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className={`${styles.filterSection} appCard`}>
                      <div className="row align-items-center">
                        <div className="col-md-4 mb-3 mb-md-0">
                          <label htmlFor="searchInput" className="form-label fw-semibold">
                            Search Doctors
                          </label>
                          <input
                            type="text"
                            id="searchInput"
                            className="form-control"
                            placeholder={`Search by ${filterBy}...`}
                            value={searchTerm}
                            onChange={handleSearchChange}
                          />
                        </div>
                        <div className="col-md-3 mb-3 mb-md-0">
                          <label htmlFor="filterSelect" className="form-label fw-semibold">
                            Filter By
                          </label>
                          <select
                            id="filterSelect"
                            className="form-select"
                            value={filterBy}
                            onChange={handleFilterChange}
                          >
                            <option value="name">Name</option>
                            <option value="hospital">Hospital</option>
                            <option value="qualification">Qualification</option>
                            <option value="age">Age</option>
                          </select>
                        </div>
                        <div className="col-md-3 mb-3 mb-md-0">
                          <label htmlFor="sortSelect" className="form-label fw-semibold">
                            Sort By
                          </label>
                          <select
                            id="sortSelect"
                            className="form-select"
                            value={sortBy}
                            onChange={handleSortChange}
                          >
                            <option value="name">Name</option>
                            <option value="hospital">Hospital</option>
                            <option value="qualification">Qualification</option>
                            <option value="age">Age</option>
                          </select>
                        </div>
                        <div className="col-md-2 mb-3 mb-md-0">
                          <div className={styles.resultsCount}>
                            <span className="badge bg-primary fs-6">
                              {filteredDoctors.length} doctors
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctors Grid */}
                <div className="row">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                      <div key={doctor.id} className="col-lg-4 col-md-6 mb-4">
                        <div className={`${styles.doctorCard} appCard`}>
                          <div className={styles.cardHeader}>
                            <div className={styles.doctorImage}>
                              <img
                                src={doctor.dp}
                                alt={doctor.name}
                                className={styles.profileImage}
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/150x150/2563eb/ffffff?text=DR';
                                }}
                              />
                            </div>
                            <div className={styles.doctorInfo}>
                              <h5 className={styles.doctorName}>{doctor.name}</h5>
                              <p className={styles.doctorAge}>Age: {doctor.age}</p>
                            </div>
                          </div>
                          <div className={styles.cardBody}>
                            <div className={styles.infoRow}>
                              <i className={`${styles.icon} bi bi-hospital`}></i>
                              <div>
                                <span className={styles.label}>Hospital:</span>
                                <span className={styles.value}>{doctor.hospital}</span>
                              </div>
                            </div>
                            <div className={styles.infoRow}>
                              <i className={`${styles.icon} bi bi-mortarboard`}></i>
                              <div>
                                <span className={styles.label}>Qualification:</span>
                                <span className={styles.value}>{doctor.qualification}</span>
                              </div>
                            </div>
                          </div>
                          <div className={styles.cardFooter}>
                            <button 
                              className={`${styles.viewBtn} btn btn-outline-primary btn-sm`}
                              onClick={() => window.location.href = `/dashboard/view-docs/${doctor.aadhar || doctor.id}`}
                            >
                              View Details
                            </button>
                            <button className={`${styles.editBtn} btn btn-primary btn-sm`}>
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <div className={`${styles.noResults} appCard text-center`}>
                        <i className={`${styles.noResultsIcon} bi bi-search`}></i>
                        <h4>No doctors found</h4>
                        <p>Try adjusting your search criteria or filters.</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
